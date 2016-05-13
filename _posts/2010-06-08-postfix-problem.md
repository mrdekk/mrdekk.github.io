---
layout: post
title: Проблемка с postfix
---

На настроенной почтовой системе, которая работает уже достаточно давно в логах постоянно наблюдается примерно следующая вещь

``` log
postfix/smtpd[...]: sql_select option missing
postfix/smtpd[...]: auxpropfunc error no mechanism available
```

Поимке багов по логам несколько мешало, недавно нашел способ. Если пойти в папку /usr/local/lib/sasl2

``` bash
$ pwd
 /usr/local/lib/sasl2
$ ls libsql.*
 libsql.a
 libsql.la
 libsql.so
 libsql.so.2
```

Эврика! Делаем бэкап. Дальше выполняем следующую последовательность команд. Учтите, что если Вы используете авторизацию SQL в постфиксе, то для Вас этот метод не сработает.

``` bash
$ pwd
 /usr/local/lib/sasl2
$ mkdir ./deactivated.sql
$ mv libsql.* ./deactivated.sql
$ postfix reload
```

И вуаля – в лог лишнее более не пишется!

P.S. Также если ваш лог одолевает сообщение

``` log
postfix/smtpd[...]: OTP unavailable because can't read/write key database /etc/opiekeys: ...
```

и ОТР как таковой Вам не нужен, то подобные указанным выше действия надо проделать с библиотекой libotp

``` bash
$ pwd
 /usr/local/lib/sasl2
$ mkdir ./deactivated.otp
$ mv libotp.* ./deactivated.otp
$ postfix reload
```
