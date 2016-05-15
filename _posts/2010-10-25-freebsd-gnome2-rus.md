---
layout: post
title: FreeBSD gnome2 русификация
---

Для начала идем в /etc/login.conf и добавляем туда профиль пользователя для UTF-8

``` bash
$ mcedit /etc/login.conf
```

``` conf
#
# Russian User Accounts with UTF-8
#
russian-utf|UTF-8 Russian User Accounts:\
   :charset=UTF-8:\
   :lang=ru_RU.UTF-8:\
   :lc_all=ru_RU.UTF-8:\
   :tc=default:
```

Далее применяем профиль к целевому пользователю

``` bash
$ cap_mkdb /etc/login.conf
$ pw usermod < user > -L russian-utf
$ pw usershow < user >
  < user >:*:1001:1001:russian-utf:0:0:User &:/home/< user >:/bin/sh
```

Устанавливаем язык по умолчанию в gdm

``` bash
$ mcedit /etc/rc.conf
```

``` ini
gdm_lang="ru_RU.UTF-8"
```

### Комментарии со старой версии блога

 > Алекс:
 > 13.07.2013 в 16:44
 > Русский GNOME2 на FreeBSD 8.4 (без gdm):

``` bash
$ mcedit /etc/rc.conf:
```

``` conf
keyrate=»fast»
keymap=»ru.koi8-r.win»
scrnmap=»koi8-r2cp866″
font8x16=»cp866b-8×16″
font8x14=»cp866-8×14″
font8x8=»cp866-8×8″
```

``` bash
$ mcedit /etc/csh.login:
```

``` conf
setenv LANG ru_RU.KOI8-R
setenv MM_CHARSET KOI8-R

setenv LC_TYPE ru_RU.KOI8-R
setenv LC_LANG ru_RU.KOI8-R
setenv LC_MONETARY ru_RU.KOI8-R
setenv LC_TIME ru_RU.KOI8-R
setenv LC_NUMERIC ru_RU.KOI8-R
setenv LC_COLLATE ru_RU.KOI8-R
setenv LC_MESSAGES ru_RU.KOI8-R
setenv LC_ALL ru_RU.KOI8-R
```

``` bash
$ mcedit /root/.xinitrc
```

``` conf
/usr/local/bin/gnome-session
```

 > Запускаем startx

---

 > MrDekk:
 > 18.07.2013 в 20:39
 > Ежели работает – отлично :)
