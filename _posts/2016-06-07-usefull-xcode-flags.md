---
layout: post
title: Полезные флаги xCode
tags:
 - xcode
 - ios
 - objc
 - swift
---

Некоторые полезные в работе флаги

 - ```-UIViewShowAlignmentRects YES``` - показывает желтыми линиями frame rect'ы, которые удобно использовать для отладки
 - ```-com.apple.CoreData.ConcurrencyDebug 1``` - "стреляет" assert'ами, когда NSManagedObjectContext или другие примитивы CoreData используются в неправильном потоке
 - ```-com.apple.CoreData.SQLDebug 1``` - пишет в лог все sqlite запросы, которые делает CoreData в процессе своей работы