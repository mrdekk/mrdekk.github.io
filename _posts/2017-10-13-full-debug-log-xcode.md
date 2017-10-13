---
layout: post
title: Полный Debug log сборки в Xcode
tags:
 - xcode
 - ios
 - objc
 - swift
---

Иногда прям очень надо посмотреть что было не так во время сборки проекта Xcode'ом, оказывается есть полный debug log в DerivedData, достать можно так:

путь: ```~/Library/Developer/Xcode/DerivedData/<YOURAPP>/Logs/Debug/```

Вообще файлы .xcactivitylog - это просто gzip архивы, можно распаковать их так:

``` bash
cd ~/Library/Developer/Xcode/DerivedData/<YOURAPP>/Logs/Debug/
EXT=".xcactivitylog"
for LOG in *.xcactivitylog; do
    NAME=`basename $LOG $EXT`
    gunzip -c -S $EXT "${NAME}${EXT}" > "${NAME}.log"
done
```

Кроме собственно Debug логов там есть и Build логи