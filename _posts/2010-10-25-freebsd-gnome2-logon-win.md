---
layout: post
title: FreeBSD gnome2 Logon Window
tags:
 - freebsd
 - gnome
---

Если после установки гнома в бзде не появляется поле ввода логина пароля, а видна только тоненькая строчка и все, то надо проделать следующие пассы руками.

``` bash
$ ee /etc/fstab
```

и написать туды

```
proc /proc procfs rw 0 0
```

UPD: для заметки, гномий листик при старте хранится тут:

```
/usr/local/share/pixmaps/backgrounds/gnome/background-default.jpg
```
