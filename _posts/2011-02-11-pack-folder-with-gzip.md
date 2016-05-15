---
layout: post
title: Запаковать папку с помощью GZip
---

Понадобилось вот запаковать папку именно с помощью gzip. Обычно использовал tar со стандартными ключами, вроде

``` bash
$ tar -cvf archive.tar folder
```

А для того, чтобы применять сжатие gzip надо делать так

``` bash
$ tar -cvzf archive.tgz folder
```
