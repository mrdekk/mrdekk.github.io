---
layout: post
title: docker в Ubuntu через прокси
---

Чтобы в свою очередь docker мог в ubuntu работать через proxy редактируем файл /etc/default/docker в самый конец добавляем

``` conf
export http_proxy="http://login:password@host:port"
export https_proxy="http://login:password@host:port"
```

и перезапускаем службу docker

``` bash
$ sudo service docker restart
```

После этого можно проверить hello-world

``` bash
$  sudo docker run hello-world
```
