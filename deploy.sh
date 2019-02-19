#!/bin/sh
git checkout master && \
rm .gitignore && \
ng build --prod && \
git add dist/reportit-agent && \
git commit -m dist && \
(git branch -D gh-pages || true) && \
git subtree split --prefix dist/reportit-agent -b gh-pages && \
git push -f origin gh-pages:gh-pages && \
git checkout master && \
git branch -D gh-pages && \
git checkout . && \
git push
