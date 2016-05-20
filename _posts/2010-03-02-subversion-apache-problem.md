---
layout: post
title: "Проблема Subversion+Apache2"
tags:
 - svn
 - apache
 - http
---

Сегодня появилась необходимость установить Subversion с доступом через Apache2. Установку Apache2 в данной статье рассматривать не буду. Subversion ставим следующим образом:

``` bash
$ сd /usr/ports/devel/subversion
$ make install clean
```

Далее прописываем в настройках виртуального хоста Apache 2.2 следующую конфигурацию

```
<Location /svnpublic>
  DAV svn
  SVNPath /dt/svn/public

  AuthType Basic
  AuthName "iLLi Public SVN repository"
  AuthUserFile "/dt/svn/svn_public.auth"
  AuthzSVNAccessFile "/dt/svn/svn_public.authz"
  Require valid-user
</Location>
```

Перезагружаем Apache 2 и все бы вроде бы ничего не возникает досадная ошибка couldn’t check user. No user file... Не спешите расстраиваться – это все потому, что не подключено пару модулей, как

``` apache
LoadModule authn-file-module libexec/apache22/mod﻿-authn-file.so
LoadModule authz-host-module libexec/apache22/mod-authz-host.so
LoadModule auth-basic-module libexec/apache22/mod-auth-basic.so
```

После перезагрузки Apache2 все работает как надо
