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

Важное отступление. Наверняка возникает вопрос, почему нельзя сделать так:

``` objc
if (UIDevice.currentDevice.systemVersion.floatValue >= 9.3) {
    // do something for iOS greater or equal 9.3
}
```

Отвечаю. Пункт первый - а что если вам надо >= 9.3.1 именно с 1 обновления, а не для всей 9.3? Float сравнение уже не позволит написать такое условие, в то же время приведенный мной код строкового сравнения позволяет сделать это. Пункт второй, более важный - сравнение чисел с плавающей точкой. Пример, для вот такого кода

``` objc
NSString* systemVersion = @"9.3.2";
float sysVer = systemVersion.floatValue;
```

в sysVer будет 9.30000019 и простое сравнение sysVer == 9.3 не сработает. В таком случае надо бы делать fabs(sysVer - 9.3) <= 0.01 что уже как проигрывает по выразительности, так и ставит вопросы - а каков эпсилон версий операционки?

Со swift'ом в общем таких проблем нет.
