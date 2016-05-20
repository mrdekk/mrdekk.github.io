---
layout: post
title: Устанавливаем C++ драйвер для MongoDB на Mac OS X Mountain Lion
tags:
 - c++
 - osx
 - mongodb
---

Потребовался мне вдруг С++ драйвер для MongoDB на Mac OS X, так как писать для FreeBSD софт на С++ лучше всего под Mac OS X в xCode, вот такой уж винегрет.

Поэтому, первое что делаем, качаем вот [отсюдова вот](http://dl.mongodb.org/dl/cxx-driver) файлик с названием cxx-driver/mongodb-linux-x86_64-latest.tgz пофигу что linux – скомпиляем и так, ведь для Mac OS X специально нету :( а жаль.

Распаковываем, и идем в распакованную папку, пытаемся сделать

``` bash
$ scons
```

Но вот блин, scons’а нет на маке, увы :(

Ладно, качаем его [отсюдова вот](http://prdownloads.sourceforge.net/scons/scons-2.3.0.tar.gz)

и дальше

``` bash
$ python setup.py install
```

Возвращаемся в папку с распакованным драйвером MongoDB, и пытаемся снова сделать

``` bash
$ scons
```

Веселье продолжается – на маке не установлен Boost, отлично идем и качаем исходники [отсюдова вот](http://www.boost.org/users/download/)

Как скачалось распаковываем и идем в распакованную папку и делаем

``` bash
$ ./bootstrap.sh
$ ./b2
$ sudo ./b2 install
```

Алилуйя! Возвращаемся в папку с распакованным драйвером и снова делаем

``` bash
$ scons
$ sudo scons install
```

И вуаля – теперь у нас есть MongoDB C++ драйвер для Mac OS X Mountain Lion

### Комментарии со старой версии блога

 > Артем:
 > 18.07.2013 в 20:33
 > Спасибо большое. Установить получилось ) но tutorial.cpp так и не получилось запустить. Выдает:

```
tutorial.cpp:3:35: error: mongo/client/dbclient.h: No such file or directory
```

 > Может подскажете, почему такое получается ?

---

 > MrDekk:
 > 18.07.2013 в 20:37
 > Добрый день!
 > Попробую подсказать. Компилируете чем? Если xcode, то надо в настройках проекта установить Header Search Paths туда где у вас стоит mongo (у меня например такой путь получился – /usr/local/include). Также не забудьте прописать в Other Linker Flags параметр -lmongoclient чтобы после компиляции у Вас все слинковалось.
 >
 > Ежели компиляете руками (make, gmake и иже с ними), то -I/usr/local/include -lmongoclient
 >
 > Ежели не получится – отпишитесь по симптомам.

---

 > Артем:
 > 18.07.2013 в 21:11
 > Решил переустановить драйвер. При запуске:

``` bash
$ scons
```

 > в конце получил вот такое:

```
In file included from src/mongo/logger/ramlog.cpp:20:
src/mongo/logger/ramlog.h:154: error: ISO C++ forbids declaration of ‘lock_guard’ with no type
src/mongo/logger/ramlog.h:154: error: invalid use of ‘::’
src/mongo/logger/ramlog.h:154: error: expected ‘;’ before » token
src/mongo/logger/ramlog.cpp:49: error: ‘lk’ was not declared in this scope
src/mongo/logger/ramlog.cpp: In constructor ‘mongo::RamLog::LineIterator::LineIterator(mongo::RamLog*)’:
src/mongo/logger/ramlog.cpp:174: error: class ‘mongo::RamLog::LineIterator’ does not have any field named ‘_lock’
scons: *** [build/mongo/logger/ramlog.o] Error 1
scons: building terminated because of errors.
```

 > p.s. В /usr/local/include пусто (

---

 > Артем:
 > 18.07.2013 в 21:39
 > Нашел mongo в /opt/local/include/
 > Подключил так как вы описали. Теперь получаю вот такое:

```
/opt/local/include/mongo/pch.h:48:10: ‘boost/shared_ptr.hpp’ file not found
```

 > этот путь тоже нужно подключить так ?

---

 > MrDekk:
 > 18.07.2013 в 22:26
 > ну boost тоже надо подключать, тем же способом

---

 > Артем:
 > 19.07.2013 в 14:01
 > Добавил вот такое:

```
/opt/local/include/** /usr/local/include/boost/** /usr/local/include/boost/tr1/detail/**
```

 > Но по прежнему ругается на

```
/usr/local/include/boost/tr1/tr1/iostream:16:12: ‘boost/tr1/detail/config_all.hpp’ file not found
```

---

 > MrDekk:
 > 21.07.2013 в 13:43
 > А можно iostream этот в студию?
 > Может быть вместо

```
/usr/local/include/boost/tr1/detail
```

 > надо указать

```
/usr/local/include/boost/tr1
```
