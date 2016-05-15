---
layout: post
title: Как выковырять из Visual Studio компилятор
---

Предположим вам понадобился компилятор Visual C++, но по каким-то причинам вам не нужна сама студия. Просто так компилятор не скачать, Micrоsоft не предоставлять такой опции. Поэтому попытаемся получить его самостоятельно, чисто в исследовательских интересах.

Нам понадобится дистрибутив какой-нибудь студии. Пусть это будет Express, т.к. ее можно для личных целей скачать с официального сайта.

Далее нам потребуются следующие msi из дистрибутива

 * vc_compilerCore86.msi – инструментарий MSVC
 * vc_compilerCore86res.msi – MUI ресурсы инструментария MSVC
 * vc_librarycore86.msi – библиотеки MSVC
 * vc_LibraryDesktopX86.msi – дополнение к библиотекам MSVC
 * Windows Software Development Kit-x86_en-us.msi – разное из Windows SDK (например, WinSock2.h, WS2_32.lib, может быть что-то еще).

Далее это все распаковываем в отдельную папку (собственно это и будет пакет инструментария) следующей командой:

``` bash
$ msiexec /a *.msi TARGETDIR=C:\compiler\...
```