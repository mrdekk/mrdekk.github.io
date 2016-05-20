---
layout: post
title: Создание новых веток в SVN при работе с GIT-SVN
tags:
 - git
 - svn
---

Если вам требуется создать ветку в SVN, но при этом вы работаете в GIT, то ситуация сначала может показаться странной, ведь если вы создали ветку от svn/trunk то svn dcommit будет отправлять изменения в svn/trunk а не в вашу ветку. Проблема решается достаточно просто, вот рецепт:

``` bash
$ git svn branch foo
$ git checkout -b foo -t svn/foo
$ ...
$ git commit
$ git svn dcommit
```
