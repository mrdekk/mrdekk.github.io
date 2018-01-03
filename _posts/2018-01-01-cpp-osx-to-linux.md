---
layout: post
title: Собираем toolchain для С++ разработки под Linux (Ubuntu) на OSX
tags:
 - c++
 - osx
 - linux
 - ubuntu
 - gcc
 - clang
---

Теги еще надо поменять !!!

# Crosstool-NG

Для начала нам необходимо crosstool-ng для сборки toolchain'а для компиляции под Linux на базе OSX.

## Case Sensitive Volume

Для установки crosstool-ng и для сборки правильного toolchain'а необходим Case-Sensitive Volume. Для этого воспользуемся [замечательным скриптом](https://gist.github.com/scottsb/479bebe8b4b86bf17e2d/). Опционально надо поправить в нем ${HOME} на то, куда вы реально хотите сохранять образ - у меня например второй большой диск (HDD против SSD) для всякого такого, поэтому пришлось поправить это дело.

Заодно сделаем его, воспользовавшись скриптом

```bash
./casesafe.sh create
./casesafe.sh mount
```

После того как станет ненужным, не забудте сделать 

```bash
./casesafe.sh unmount
```

## Установка требуемых зависимостей через HomeBrew

```bash
brew install autoconf
brew install binutils
brew install gawk
brew install gmp
brew install gnu-sed
brew install help2man
brew install mpfr
brew install openssl
brew install pcre
brew install readline
brew install wget
brew install xz
```

Иногда brew может сказать что зависимость уже стоит, но устарела, тогда опционально можно сделать brew update ...

Еще опционально просят поставить dupes/grep ввиду того, что libc результирующего toolchain'а будет неправильно сконфигурирована, ввиду отличия макового BSD grep от GNU grep. --with-default-names необходимо чтобы системный grep заменился новым, так как без этого параметры brew'шный grep поставиться как ggrep.

```bash
brew install grep --with-default-names
```

## Установка собственно crosstool-ng

Я решил пойти по Hacker's way и сделать все через исходники, а не через release tarballs. Поэтому первое что делаем - клонируем репу, нужен гит:

```bash
git clone https://github.com/crosstool-ng/crosstool-ng
```

Далее нам требуется выбрать конкретный релиз, релизы обозначены тегами, поэтому выгребем теги и зачекаутим нужный:

```bash
git fetch --all --tags --prune
git checkout tags/crosstool-ng-1.23.0 -b r1.23.0
```

Далее начинаем работу по сборке. Так как мы решили пойти Hacker's Way, то будем запускать это дело из исходников (поэтому ./configure --enable-local).

```bash
./bootstrap
./configure --enable-local
make
```

Для проверки успешности сборки в текущей директории надо сделать 

```bash
./ct-ng help
```

Должна вывестись инструкция.

## Конфигурируем

```bash
./ct-ng menuconfig
```

Говорят, тем кто собирал линуксовые ядра все должно быть понятно, я просмотрел все опции и потыкал то, что мне надо.

А вообще можно сделать так

```bash
./ct-ng list-samples
```

И выбрать что-то из уже готовых настроек. И затем посмотреть конфигурацию так

```bash
./ct-ng show-x86_64-ubuntu16.04-linux-gnu
```

Выбираем preset

```bash
./ct-ng x86_64-ubuntu16.04-linux-gnu
```

И можно оттюнить с помощью menuconfig

## Проблемы

Может случится так, что вы получите такую ошибку

```
/Volumes/OSXElCapitan/Users/mrdekk/casesafe/.build/src/gdb-7.12.1/gdb/doublest.c:258:19: error: use of undeclared identifier 'min'; did you mean 'fmin'?
[ERROR]    /Volumes/OSXElCapitan/Users/mrdekk/casesafe/.build/src/gdb-7.12.1/gdb/doublest.c:568:19: error: use of undeclared identifier 'min'; did you mean 'fmin'?
[ERROR]    /Volumes/OSXElCapitan/Users/mrdekk/casesafe/.build/src/gdb-7.12.1/gdb/doublest.c:912:25: error: use of undeclared identifier 'min'; did you mean 'fmin'?
[ERROR]    make[3]: *** [doublest.o] Error 1
[ERROR]    make[3]: *** Waiting for unfinished jobs....
[ERROR]    make[2]: *** [all-gdb] Error 2
[ERROR]    make[1]: *** [all] Error 2
```

Надо попробовать ветку master в crosstool-ng. Однако bash на OSX слишком старый для bootstrap, поэтому придется поставить bash из brew и поправить shell в bootstrap.

После однако начинаются проблемы с sha512sum, такие

```
/Volumes/OSXElCapitan/Users/mrdekk/Documents/Utils/crosstool-ng/scripts/functions: line 786: sha512sum: command not found
```

Для этого делаем так

```bash
brew install coreutils
ln -s /usr/local/bin/gsha512sum /usr/local/bin/sha512sum
```

Еще там не собирается glibc с binutils-2.29.1, есть [патч](https://git.busybox.net/buildroot/commit/?id=cf821efbd0b24690b52f379d4a9934a16073762e), который позволяет так собираться

```c
char *loc1 __attribute__ ((nocommon));
char *loc2 __attribute__ ((nocommon));
compat_symbol (libc, loc1, loc1, GLIBC_2_0);
compat_symbol (libc, loc2, loc2, GLIBC_2_0);

/* Although we do not support the use we define this variable as well.  */
char *locs __attribute__ ((nocommon));
compat_symbol (libc, locs, locs, GLIBC_2_0);
```

Еще появилась такая проблема

```
[ERROR]      ../sysdeps/ieee754/dbl-64/e_pow.c:469:13: error: '<<' in boolean context, did you mean '<' ? [-Werror=int-in-bool-context]
[ERROR]      ../sysdeps/ieee754/dbl-64/e_pow.c:471:17: error: '<<' in boolean context, did you mean '<' ? [-Werror=int-in-bool-context]
[ERROR]      ../sysdeps/ieee754/dbl-64/e_pow.c:477:9: error: '<<' in boolean context, did you mean '<' ? [-Werror=int-in-bool-context]
[ERROR]      ../sysdeps/ieee754/dbl-64/e_pow.c:479:13: error: '<<' in boolean context, did you mean '<' ? [-Werror=int-in-bool-context]
```

Для ее решения есть такой [патч](https://patchwork.ozlabs.org/patch/680578/)

```c
diff --git a/sysdeps/ieee754/dbl-64/e_pow.c b/sysdeps/ieee754/dbl-64/e_pow.c
index 663fa39..bd758b5 100644
--- a/sysdeps/ieee754/dbl-64/e_pow.c
+++ b/sysdeps/ieee754/dbl-64/e_pow.c
@@ -466,15 +466,15 @@  checkint (double x)
     return (n & 1) ? -1 : 1;	/* odd or even */
   if (k > 20)
     {
-      if (n << (k - 20))
+      if (n << (k - 20) != 0)
 	return 0;		/* if not integer */
-      return (n << (k - 21)) ? -1 : 1;
+      return (n << (k - 21) != 0) ? -1 : 1;
     }
   if (n)
     return 0;			/*if  not integer */
   if (k == 20)
     return (m & 1) ? -1 : 1;
-  if (m << (k + 12))
+  if (m << (k + 12) != 0)
     return 0;
-  return (m << (k + 11)) ? -1 : 1;
+  return (m << (k + 11) != 0) ? -1 : 1;
 }
```

Далее опять проблемы

```
[ALL  ]      rpc_parse.c: In function 'get_prog_declaration':
[ERROR]      rpc_parse.c:543:23: error: '%d' directive writing between 1 and 10 bytes into a region of size 7 [-Werror=format-overflow=]
[ALL  ]           sprintf (name, "%s%d", ARGNAME, num); /* default name of argument */
[ALL  ]                             ^~
[ALL  ]      rpc_parse.c:543:20: note: directive argument in the range [1, 2147483647]
[ALL  ]           sprintf (name, "%s%d", ARGNAME, num); /* default name of argument */
[ALL  ]                          ^~~~~~
[ALL  ]      rpc_parse.c:543:5: note: 'sprintf' output between 5 and 14 bytes into a destination of size 10
[ALL  ]           sprintf (name, "%s%d", ARGNAME, num); /* default name of argument */
[ALL  ]           ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
[ALL  ]      cc1: all warnings being treated as errors
[ERROR]      make[3]: *** [/Volumes/OSXElCapitan/Users/mrdekk/casesafe/.build/x86_64-ubuntu16.04-linux-gnu/build/build-libc-final/multilib/sunrpc/rpc_parse.o] Error 1
[ERROR]      make[3]: *** Waiting for unfinished jobs....
[ERROR]      make[2]: *** [sunrpc/others] Error 2
[ERROR]      make[1]: *** [all] Error 2
```

Решение этой проблемы найти было сложнее, но кажется есть [вот](https://lists.crux.nu/pipermail/crux-commits/2017-October/022800.html)

```c
+--- a/sunrpc/rpc_parse.c
++++ b/sunrpc/rpc_parse.c
+@@ -521,7 +521,7 @@ static void
+ get_prog_declaration (declaration * dec, defkind dkind, int num /* arg number */ )
+ {
+   token tok;
+-  char name[10];		/* argument name */
++  char name[MAXLINESIZE];		/* argument name */
+ 
+   if (dkind == DEF_PROGRAM)
+     {
``` 

Дальше опять проблемы

```
nss_nisplus/nisplus-alias.c:300:12: error: argument 1 null where non-null expected [-Werror=nonnull]
[ERROR]      nss_nisplus/nisplus-alias.c:303:39: error: '%s' directive argument is null [-Werror=format-truncation=]
[ERROR]      make[3]: *** [/Volumes/OSXElCapitan/Users/mrdekk/casesafe/.build/x86_64-ubuntu16.04-linux-gnu/build/build-libc-final/multilib/nis/nisplus-alias.os] Error 1
[ERROR]      make[3]: *** Waiting for unfinished jobs....
[ERROR]      make[2]: *** [nis/others] Error 2
[ERROR]      make[1]: *** [all] Error 2
```

Лечаться [так](https://patches.linaro.org/patch/100439/) 

```c
diff --git a/nis/nss_nisplus/nisplus-alias.c b/nis/nss_nisplus/nisplus-alias.c
index 7f698b4e6d..509ace1f83 100644
--- a/nis/nss_nisplus/nisplus-alias.c
+++ b/nis/nss_nisplus/nisplus-alias.c
@@ -297,10 +297,10 @@  _nss_nisplus_getaliasbyname_r (const char *name, struct aliasent *alias,
       return NSS_STATUS_UNAVAIL;
     }
 
-  char buf[strlen (name) + 9 + tablename_len];
+  char buf[tablename_len + 9];
   int olderr = errno;
 
-  snprintf (buf, sizeof (buf), "[name=%s],%s", name, tablename_val);
+  snprintf (buf, sizeof (buf), "[name=],%s", tablename_val);
 
   nis_result *result = nis_list (buf, FOLLOW_PATH | FOLLOW_LINKS, NULL, NULL);
```

После этого toolchain собрался. После этого я попробовал собрать простой Hello, World с ним и запустить. На macOS не запустилось (zsh: exec format error: ./CrossWorld) - это хорошо. Собираем простейший контейнер на ubuntu 16.04 и запускаем - работает. Отлично!