---
layout: post
title: Проверяем версию iOS
tags:
 - ios
 - objc
 - swift
 - recipe
---

Как проверить версию iOS? Очень просто:

``` objc
NSString* requiredVersion = @"9.3.1";
NSString* currentSystemVersion = [[UIDevice currentDevice] systemVersion];
if ([currSystemVersion compare:requiredVersion options:NSNumericSearch] != NSOrderedAscending) {
    // code that is suitable for iOS >= 9.3.1
} else {
    // code for versions older that 9.3.1
}
```

В Swift'е это сделать несколько проще:

``` swift
if #available(iOS 9.3.1, *) {
    // code that is suitable for iOS >= 9.3.1
} else {
    // code for versions older than 9.3.1
}
```
