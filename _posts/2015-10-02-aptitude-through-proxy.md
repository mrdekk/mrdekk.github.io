---
layout: post
title: Работа apt-get в Ubuntu через прокси
tags:
 - ubuntu
---

Чтобы apt-get в Ubuntu заработал через прокси, необходимо создать или добавить в файл

```
/etc/apt/apt.conf.d/proxy
```

Следующие строчки:

``` conf
Acquire::http::Proxy "http://login:password@host:port";
Acquire::ftp::Proxy "http://login:password@host:port";
Acquire::::Proxy "true";
```

И все заработает
