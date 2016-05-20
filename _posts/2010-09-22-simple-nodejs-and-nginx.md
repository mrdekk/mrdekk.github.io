---
layout: post
title: "node.js+nginx на freebsd"
tags:
 - freebsd
 - js
 - nodejs
---

Доброго всем дня!

Решил вот тут попробовать такого зверя как node.js. Говорят на нем хорошо писать веб-пауков, особенно если прикрутить jQuery – то это становится просто удовольствием. От слов к делу. Для начала поставим nginx.

``` bash
$ cd /usr/ports/www/nginx
$ make install clean
```

пропишем автозапуск

``` bash
$ mcedit /etc/rc.conf
```

``` ini
# nginx
nginx_enable="YES"
```

отредактируем файл настроек nginx’а

``` nginx
user www;
worker_processes 1;

pid /var/run/nginx.pid;

events
{
  worker_connections 1024;
}

http
{
  include mime.types;
  default_type application/octet-stream;
  log_format main '$remote_addr - $remote_user [$time_local] $request'
                        '"$status" $body_bytes_sent "$http_referer" '
                        '"$http_user_agent" "$http_x_forwarded_for"';
  access_log off;
  sendfile on;
  keepalive_timeout 65;
  gzip on;

  server
  {
    listen *:80;
    server_name localhost;

    location /
    {
    }
}
```

и запускаем nginx

``` bash
$ /usr/local/etc/rc.d/nginx start
```

Теперь приступим к установке node.js. Для начала удостоверимся что у нас в системе стоит libexecinfo. Для этого выполним команду

``` bash
$ pkg_add -r libexecinfo
```

После этого устанавливаем собственно ноду

``` bash
$ mkdir /usr/tmp
$ cd /usr/tmp
$ fetch 'http://s3.amazonaws.com/four.livejournal/20100120/node-v0.1.26.tar.gz'
$ tar -xzvf node-v0.1.26.tar.gz
$ cd node-v0.1.26
$ ./configure --prefix=/usr/local
$ make
$ make install
$ rehash
```

Для проверки правильности компиляции и установки ноды создадим простой скрипт

``` js
var sys = require('sys');
sys.puts('Hello, World!');
```

и проверим его

``` bash
$ node example.js
```

Должны увидеть Hello, World. Теперь интегрируем все это безобразие с Nginx. Для этого добавим в секцию Server конфига nginx’а следующее:

``` nginx
...
location /nodejs/ {
    proxy_pass http://127.0.0.1:8081/;
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
...
```

Создадим простой серверный скрипт:

``` js
var sys = require('sys');
var http = require('http');

http.createServer(function (req, res) {
    res.sendHeader(200, {'Content-Type': 'text/plain'});
    res.sendBody('Hello, World!', 'utf8');
    res.finish();
}).listen(8081);

sys.puts('Server running at port 8081');
```

Запускаем тестовый сервер

``` bash
$ node server.js
```

если теперь зайти сюда http://<ваш ip>/nodejs то вы должны увидеть приветствие
