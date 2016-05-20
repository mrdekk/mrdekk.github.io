---
layout: post
title: Сброс состояния репозиториев в Ubuntu
tags:
 - ubuntu
---

Когда бубунта начинает выдавать что-то вроде «software has no installation candidate» сие означает, что у нее что-то не так с репозиториями, чтобы сие поправить делаем так:

``` bash
$ sudo -i
$ apt-get clean
$ cd /var/lib/apt
$ mv lists lists.old
$ mkdir -p lists/partial
$ apt-get clean
$ apt-key update
$ apt-get update
```
