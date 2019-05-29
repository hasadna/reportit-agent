#!/bin/sh
git checkout feature/ui && \
rm .gitignore && \
ng build --prod && \
git add dist/reportit-agent && \
git commit -m dist && \
(git branch -D gh-pages || true) && \
git subtree split --prefix dist/reportit-agent -b gh-pages && \
git push -f origin gh-pages:gh-pages && \
git checkout feature/ui && \
git branch -D gh-pages && \
git checkout . && \
git push
