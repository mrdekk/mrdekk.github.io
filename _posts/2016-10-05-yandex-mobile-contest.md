---
layout: post
title: Yandex Mobile Contest
tags:
 - swift
 - objc
 - ios
 - java
 - android
---

``` swift
import Foundation

let ymc = Event("Yandex Mobile Contest", at:"2016-10-17")

let attendee = AnyPerson()
if attendee.haveInterest(in: "Мобильная разработка") {
    attendee.takePart(in: ymc) && attendee.winPrize(of: ymc)
}
```

Проводим в Яндексе соревнование мобильных разработчиков, приглашаем всех желающих.
[Регистрируйтесь тут](https://yandex.ru/ymc?utm_source=mrdekk_blog)
