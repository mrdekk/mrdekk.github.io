---
layout: post
title: Скрипт запуска сервера WildFly для FreeBSD
---

После компиляции java с исправлением бага, дошла очередь до установки WildFly. Однако, все встало без проблем вообще и сразу заработало. Оставалась одна проблема – автозапуск сервера при рестарте сервера (пардон за каламбур). Прошерстив мануалы FreeBSD набросал небольшой скрипт, может кому будет полезен:

``` bash
#!/bin/sh

. /etc/rc.subr

name=wildfly
rcvar=wildfly_enable

start_cmd="/usr/local/wildfly/bin/standalone.sh &"
stop_cmd="/usr/local/wildfly/bin/jboss-cli.sh --connect controller=127.0.0.1 command=:shutdown"

load_rc_config $name
run_rc_command "$1"
```
