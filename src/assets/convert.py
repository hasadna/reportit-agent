import json
import yaml
import re

cmd_re = re.compile(r'^cmd\.([a-zA-Z_]+)\(([a-z, ]+)\)$')
args_re = re.compile(r'\s*,\s*')

def topo_sort(topic, deps, map, output):
    snippet = map.pop(topic, None)
    if not snippet:
        return
    topic_dependencies = deps.pop(topic, [])
    while len(topic_dependencies) > 0:
        dep = topic_dependencies.pop()
        topo_sort(dep, deps, map, output)
    output.append(snippet)
    

if __name__=='__main__':
    out = []
    scripts = json.load(open('script.json'))
    for script in scripts:
        snippet_map = {}
        snippet_deps = {}
        snippets = []
        oscript = dict(
            name=script['command'],
            description=script['description'],
            snippets=snippets,
        )
        out.append(oscript)
        for snippet in script['script']:
            steps = []
            topic = snippet.get('topic')
            if not topic:
                continue
            osnippet = dict(
                name=topic,
                steps=steps
            )
            action_step = None
            for step in snippet['script']:
                meta = step.get('meta', [])
                collect = step.get('collect')
                key = collect['key'] if collect else None
                command = False
                if 'text' in step:
                    text = step['text'][0]
                    if match := cmd_re.match(text):
                        cmd, args = match.groups()
                        args = args_re.split(args)
                        steps.append(dict(
                            do=dict(
                                cmd=cmd,
                                params=args,
                                **(
                                    dict(variable=key)
                                    if key else {}
                                )
                            )
                        ))
                        command = True
                    else:
                        steps.append(dict(
                            say=text
                        ))
                for item in meta:
                    if item['key'] == 'infocard':
                        steps.append(dict(
                            do=dict(
                                cmd='showInfoCard',
                                params=[item['value']]
                            )
                        ))
                        meta.remove(item)
                if 'quick_replies' in step:
                    options = []
                    for r in step['quick_replies']:
                        quick_steps = []
                        options.append(
                            dict(
                                show=r['title'],
                                value=r['payload'],
                            )
                        )
                        for item in meta:
                            if item['key'] == 'on:' + r['payload']:
                                quick_steps.append(dict(
                                    do=dict(
                                        cmd='addTask',
                                        params=[item['value']]
                                    )
                                ))
                                meta.remove(item)
                        if len(quick_steps) > 0:
                            options[-1]['steps'] = quick_steps
                    steps.append(
                        dict(
                            wait=dict(
                                options=options,
                                **(dict(variable=key) if key else {})
                            )
                        )
                    )

                elif not command and collect:
                    assert key
                    steps.append(dict(
                        wait=dict(                            
                            variable=key,
                            **(
                                dict(long=True) if collect.get('multiple') else {}
                            )
                        )
                    ))
                if collect:
                    assert key
                    ocases = []
                    for case in collect['options']:
                        if case.get('default'):
                            ocase = dict(
                                default=True
                            )
                        elif case.get('type') == 'string':
                            ocase = dict(
                                match=case['pattern']
                            )
                        elif case.get('type') == 'regex':
                            ocase = dict(
                                pattern=case['pattern']
                            )
                        case_steps = []
                        ocase['steps'] = case_steps
                        for item in meta:
                            if item['key'] == 'on:' + case['pattern']:
                                case_steps.append(dict(
                                    do=dict(
                                        cmd='addTask',
                                        params=[item['value']]
                                    )
                                ))
                                meta.remove(item)
                        if case['action'] not in ('next', 'repeat'):
                            case_steps.append(dict(
                                goto=case['action']
                            ))
                            snippet_deps.setdefault(case['action'], set()).add(topic)
                        if len(case_steps) == 0:
                            continue
                        if ocase.get('default'):
                            ocases.insert(0, ocase)
                        else:
                            ocases.append(ocase)
                    if len(ocases) > 0:
                        assert key
                        steps.append(dict(
                            switch=dict(
                                arg=key,
                                cases=ocases
                            )
                        ))
                if 'action' in step:
                    action_step = dict(
                        goto=step['action']
                    )
                    snippet_deps.setdefault(step['action'], set()).add(topic)
                assert len(meta) == 0, repr(meta)
            if action_step is not None:
                steps.append(action_step)
            snippet_map[topic] = osnippet

        for topic in snippet_deps['complete']:
            topo_sort(topic, snippet_deps, snippet_map, snippets)
        

    yaml.dump(out, open('output.yaml', 'w'),
              allow_unicode=True,
              default_flow_style=False)