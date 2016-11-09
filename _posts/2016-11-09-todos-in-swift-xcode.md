---
layout: post
title: TODO в swift в Xcode
tags:
 - swift
 - ios
 - xcode
---

Очень часто в процессе разработки бывает, когда вместо некоторого кода пишется временная заглушка или некий временный код, или даже просто участок кода к которому необходимо вернуться чуть позже, например:

``` swift
// TODO: we need to convert to float math for better precision
let sum = 1 + 2
let avg = sum / 2
```

И хотелось бы, чтобы Xcode каким-либо образом это подсвечивал, например как это было в старом добром Objective-C

``` objc
#warning we need to convert to float math for better precision
int sum = 1 + 2;
int avg = sum / 2;
```

Но в Xcode "из коробки" увы нет такой поддержки для Swift. Быть может она появится в будущем, сейчас же предлагаю применить черную магию и написать скрипт. Для этого идем в Build Phases и создаем "Run Script", поместить его можно в конце. Содержание скрипта такое:

``` bash
TAGS="TODO:|FIXME:"
find "${SRCROOT}" \( -name "*.h" -or -name "*.m" -or -name "*.swift" \) -print0 | xargs -0 egrep --with-filename --line-number --only-matching "($TAGS).*\$" | perl -p -e "s/($TAGS)/ warning: \$1/"
```

Xcode после сборки начнет подсвечивать ваши TODO'шки так

![highlight todos](/media/images/xcode_todos_1.png)

Если вы хотите подсвечивать еще например // ERROR: как ошибки, можно скрипт сделать таким

``` bash
TAGS="TODO:|FIXME:"
ERRORTAG="ERROR:"
find "${SRCROOT}" \( -name "*.h" -or -name "*.m" -or -name "*.swift" \) -print0 | xargs -0 egrep --with-filename --line-number --only-matching "($TAGS).*\$|($ERRORTAG).*\$" | perl -p -e "s/($TAGS)/ warning: \$1/" | perl -p -e "s/($ERRORTAG)/ error: \$1/"
```

Xcode сделает так

![highlight errors](/media/images/xcode_todos_2.png)

Придумал не сам, нашел [тут](http://krakendev.io/blog/generating-warnings-in-xcode) и перевел.
