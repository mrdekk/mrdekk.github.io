---
layout: post
title: SimCtl handbook
tags:
 - xcode
 - ios
 - objc
 - swift
 - simctl
---

Небольшой сборничек команд управления симулятором iOS.

**Важно:** еще пока не проверял на Xcode 9, может что-нибудь поменяться. Поэтому не лишним будет проверить, что используется Xcode 8.3.3:

Смотрим:

``` bash
# xcode-select -p
```

Если вы пользуетесь Xcode'ом из AppStore, то у вас наверняка будет только Xcode и вы увидите что-то вроде:

```
/Applications/Xcode.app/Contents/Developer
```

Тогда надо зайти в этот Xcode и посмотреть какой он версии. Если же вы нумеруете Xcode по версиям, то должны увидеть что-то вроде:

```
/Applications/Xcode8.3.3.app/Contents/Developer
```

Если там Xcode9 то надо выбрать Xcode8.3.3 примерно так

``` bash
# sudo xcode-select -s /Applications/Xcode8.3.3.app/Contents/Developer
```


### Просмотр списка симулятором

``` bash
# xcrun simctl list
```

Выведет большой список, в котором будет примерно такое:

```
iPhone 5 (D1F67F00-FA3D-42B7-9E2F-FEF23809D4A0) (Booted)
```

Который в данный момент запущен. Вместо "booted" в командах можно использовать UUID.

### Снимаем видео

``` bash
# xcrun simctl io booted recordVideo <filename>.<extension>
```

Пока скрипт запущен, будет записываться видео всего, что попадаем во framebuffer. Чтобы закончить запись, просто нажмите Ctrl+C. Формат может быть одним из - .mov, .h264, .mp4, .fmp4.

### Скриншотим

``` bash
# xcrun simctl io booted screenshot <filename>.<extension>
```

Форматы: .png, .tiff, .bmp, .gif, .jpg

### Открыть url

``` bash
# xcrun simctl openurl booted https://yandex.ru
```

Можно например отправить sms'ку, если вы знаете app url схему:

``` bash
# xcrun simctl openurl booted sms: #Open Messages
```

### Загружаем картинку в фотогалерею

``` bash
# xcrun simctl addmedia booted <path to file(s)>
```

### Выводим переменные окружения

``` bash
# xcrun simctl getenv booted <variable name>
```

### Триггерим синхронизацию с iCloud

``` bash
# xcrun simctl icloud_sync booted
```

### Стираем устройство

``` bash
# xcrun simctl erase booted
```

### Устанавливаем приложение

``` bash
# xcrun simctl install booted <The path to the app>
```

### Запускаем приложение (по bundle-id)

``` bash
# xcrun simctl launch booted <bundle-id> <arguments>
```

### Получить путь до контейнера приложения (по bundle-id)

``` bash
# xcrun simctl get_app_container booted <bundle-id>
```

Или даже сразу открыть в Finder

``` bash
# open `xcrun simctl get_app_container booted <bundle-id>` -a Finder
```

### Получить информацию о приложении (по bundle-id)

``` bash
# xcrun simctl appinfo booted <bundle-id>
```
