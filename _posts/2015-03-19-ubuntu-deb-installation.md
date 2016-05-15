---
layout: post
title: Инсталляция deb пакетов в Ubuntu
---

Если у вас есть .deb пакет и вы не знаете как его инсталлировать, то вот рецепт

``` bash
$ sudo dpkg -i software.deb
```

Удалить

``` bash
$ sudo dpkg -r software.deb
```
