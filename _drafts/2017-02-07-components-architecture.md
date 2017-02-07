---
layout: post
title: Компонентная архитектура
tags:
 - ios
 - objc
 - swift
 - architecture
 - carch
---



Как правило iOS приложения (да и в общем macOS тоже) пишутся с использованием самых новых инструментов разработки (читай последних SDK), но при этом поддерживаются предыдущие версии iOS (macOS). Бывают ситуации, когда по недосмотру используются API из новых версий, которые недоступны на данном minimal deployment target. Если такую ошибку пропустить в прод (зарелизить приложение), то вызов такого метода на версии iOS которая его не поддерживает неминуемо приведет к крэшу. Дабы облегчить себе жизнь можно сделать вот что:

1. Идем в Build Settings нужного проекта в xcode
2. Находим раздел "Apple LLVM 8.0 - Custom Compiler Flags"
3. Находим там пункт "Other Warning Flags"
4. В него для требуемой настройки сборки (например Debug) добавляем такой флаг "-Wpartial-availability"

После этого Xcode начинает отображать такие места как #warning

Для того, чтобы Xcode не писал #warning'и для тех мест где вы делаете это намерянно, можно переопределить (где-нибудь в pre-compile заголовках) такие макро:

``` objc
#define START_IGNORE_PARTIAL _Pragma("clang diagnostic push") _Pragma("clang diagnostic ignored \"-Wpartial-availability\"")
#define END_IGNORE_PARTIAL _Pragma("clang diagnostic pop")
```
