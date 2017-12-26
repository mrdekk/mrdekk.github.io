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
 - ```-Name:OS_ACTIVITY_MODE disable``` - отключает вывод системного лога в debug окно Xcode 8
 - ```DYLD_PRINT_STATISTICS 1``` - выводит данные о загрузке внешних библиотек (и не только)
 - ```SWIFT_DEBUG_IMPLICIT_OBJC_ENTRYPOINT 1-3``` - выводит лог использования @objc inference

Некоторые полезные флаги компилятора

- ```-Wglobal-constructors``` - показывает использование нетривиальных конструкторов С++ при инициализации глобальных объектов

Разные полезные штуки при работе с LLDB

- Показать историю аллокаций по адресу в памяти, надо в консоли отладчика сделать так

    ```
    (lldb) command script import lldb.macosx.heap
    (lldb) malloc_info --stack-history 0x10010d680
    ```
