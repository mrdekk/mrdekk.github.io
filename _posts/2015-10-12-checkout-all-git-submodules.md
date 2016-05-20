---
layout: post
title: Зачекаутить все submodules в проекте git
tags:
 - git
---

``` bash
$ git submodule foreach git pull origin master
```

Работает начиная с GIT 1.6.1
