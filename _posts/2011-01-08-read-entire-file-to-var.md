---
layout: post
title: Чтение текстового файла целиком в переменную
---

Бывает полезная функция, однако в интернете редко можно найти сниппет, поэтому предлагаю его здесь. Надеюсь будет полезен.

``` cpp
int length = 0;
char* buffer = null;

std::ifstream is;
is.open( "config.xml", std::ios::binary );

is.seekg( 0, std::ios::end );
length = is.tellg( );
is.seekg( 0, std::ios::beg );

buffer = new char[ length + 1 ];
buffer[ length ] = '\0';

is.read( buffer, length );
is.close( );
```
