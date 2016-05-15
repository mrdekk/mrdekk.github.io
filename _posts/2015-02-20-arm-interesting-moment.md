---
layout: post
title: Интересный момент
---

Сразу скажу – не моё – взял [тут](https://closedcircles.com/) тут для того, чтоб не забыть.

На ARM (который ARM cannot into integer division) операция

``` cpp
hash = key % array.GetSize( )
```

Лучше сделать размер – степень двойки и заменить код на

``` cpp
hash = key & ( array.GetSize( ) - 1 );
```

Так как из-за того, что ARM cannot into integer division компилятор вставляет интринсик, который делает деление софтварно
