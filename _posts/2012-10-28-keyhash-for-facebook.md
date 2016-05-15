---
layout: post
title: Получения хэша ключа для Facebook
---

Для реализации интеграции с Facebook необходим хэш ключа, чтобы его сделать, надо пойти туда, где этот ключ лежит и сделать

``` bash
$ keytool -exportcert -keystore mygame.keystore | openssl sha1 -binary | openssl base64
```
