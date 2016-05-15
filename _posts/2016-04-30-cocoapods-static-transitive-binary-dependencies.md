---
layout: post
title: Боремся с The ‘Pods...’ target has transitive dependencies that include static binaries
---

Суть проблемы следующаяя

 1. Используем CocoaPods (про Carthage знаю, по некоторым причинам не хочу использовать)
 2. Проект на Swift
 3. Имеет swift’овые зависимости, поэтому use_frameworks!
 4. Имеет старые Objective-C’шные зависимости, в которых есть транзитивные зависимости в которых есть статические либы (something.a, можно в vendored_libraries)

При попытке сделать pod install получаем

```
The ‘Pods-...’ target has transitive dependencies that include static binaries
```

Сие подробно дискутируется [тут](https://github.com/CocoaPods/CocoaPods/issues/2926) и [тут](https://github.com/CocoaPods/CocoaPods/issues/3289)

Внятного решения даже разработчики cocoapods судя по всему пока придумать не могут, но зато предлагают такой вот хак

``` ruby
pre_install do |installer|
    def installer.verify_no_static_framework_transitive_dependencies; end
end
```

Который просто напросто отключает проверку.

P.S. Правда сий хак не всегда помогает :( и вы можете получить unresolved symbols

P.P.S. Если же вы все-таки хотите transitive static binaries и use_frameworks! то решение существует - необходимо этот transitive static binary обернуть руками в framework а в под зашить vendored_frameworks примерно следующим образом

Нам нужен скрипт создания фреймворка (будем показывать на примере OpenSSL for iPhone)

```
create-openssl-framework.sh
```

``` bash
#!/bin/sh

FWNAME=openssl

if [ ! -d lib ]; then
    echo "Please run build-libssl.sh first!"
    exit 1
fi

if [ -d $FWNAME.framework ]; then
    echo "Removing previous $FWNAME.framework copy"
    rm -rf $FWNAME.framework
fi

if [ "$1" == "dynamic" ]; then
    LIBTOOL_FLAGS="-dynamic -undefined dynamic_lookup"
else
    LIBTOOL_FLAGS="-static"
fi

echo "Creating $FWNAME.framework"
mkdir -p $FWNAME.framework/Headers
libtool -no_warning_for_no_symbols $LIBTOOL_FLAGS -o $FWNAME.framework/$FWNAME lib/libcrypto.a lib/libssl.a
cp -r include/$FWNAME/* $FWNAME.framework/Headers/
echo "Created $FWNAME.framework"
```

Сам же podspec файл будет выглядеть примерно следующим образом

``` js
{
  "name": "OpenSSL-for-iOS",
  ...
  "prepare_command": "./build-libssl.sh\n./create-openssl-framework.sh\n",
  "ios": {
    "vendored_frameworks": "openssl.framework"
  },
  ...
}
```

И далее цепляете под себе в Podfile обычным образом

``` ruby
pod 'OpenSSL-for-iOS'
```

С включенным use_frameworks!
