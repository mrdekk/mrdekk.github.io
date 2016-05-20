---
layout: post
title: Git Orphan Branch
tags:
 - git
---

Иногда необходимо в GIT создать ветку, не имеющую ничего общего с уже существующими (orphan branch). Как правило, такая необходимость возникает при размещении в одном репозитории нескольких проектов.

Делается это так

``` bash
$ git checkout --orphan newbranch
$ git rm -rf .
# do work
$ git add your files
$ git commit -m 'Initial commit'
```
