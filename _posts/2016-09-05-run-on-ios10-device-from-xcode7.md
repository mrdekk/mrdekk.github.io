---
layout: post
title: Как отлаживать приложение для iOS 10 в xCode 7.3.1
tags:
 - ios
 - objc
 - swift
 - xcode
---

Случилась такая задача - отладить приложение собираемое с iOS 9 SDK на телефоне с iOS 10. Для этого собирать его надо естественно в xCode 7, но xCode 7 не видит устройства с iOS 10. Проблема относительно просто решается вот такой вот магией:

``` bash
sudo ln -s /Applications/Xcode8beta4.app/Contents/Developer/Platforms/iPhoneOS.platform/DeviceSupport/10.0\ \(14A5322e\) /Applications/Xcode7.3.1.app/Contents/Developer/Platforms/iPhoneOS.platform/DeviceSupport/
```

После этого можно отлаживаться в обычном режиме.
