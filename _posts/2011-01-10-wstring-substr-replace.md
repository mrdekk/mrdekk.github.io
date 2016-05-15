---
layout: post
title: "Замена подстроки в std:wstring"
---

Продолжаю публиковать серию сниппетов. На этот раз задача – заменить подстроку в строке wstring другой. Делается это так:

``` cpp
std::wstring strSource = L"this string is XXXX and YYYY";
size_t posn;
std::wstring replaceFrom = L"XXXX";
std::wstring replaceTo = L"SOMETHING";

posn = strSource.find( replaceFrom );
strSource.replace( posn, replaceFrom.length( ), replaceTo );
```

если надо заменить все вхождения, то последние две строки надо заменить на

``` cpp
while ( std::wstring::npos != ( posn = strSource.find( replaceFrom ) ) )
{
  strSource.replace( posn, replaceFrom.length( ), replaceTo );
}
```

Надеюсь будет полезно.
