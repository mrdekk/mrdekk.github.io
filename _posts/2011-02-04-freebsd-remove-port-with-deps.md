---
layout: post
title: FreeBSD. Удалить порт с зависимостями
tags:
 - freebsd
---

Иногда бывает необходимо удалить установленный порт со всеми зависимостями. Можно конечно колдовать с pkg_... но это долго и утомительно. На днях обнаружил интересную утилиту: pkg_rmleaves.

Ставим так

``` bash
$ cd /usr/ports/ports-mgmt/pkg_rmleaves/
$ make install clean
$ rehash
$ pkg_rmleaves -d
```

Для информации читаем маны. Надеюсь будет полезно.
