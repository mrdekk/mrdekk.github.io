---
layout: post
title: GIT cookbook
tags:
 - git
 - handbook
---

Разное полезное для гита

## Забрать к себе все ветки с remote

``` bash
git branch -r | grep -v '\->' | while read remote; do git branch --track "${remote#origin/}" "$remote"; done
git fetch --all
git pull --all
```

## Отправить все локальные бранчи в новый remote

``` bash
git push REMOTE --all
# or git push REMOTE '*:*'

git push REMOTE --tags
```