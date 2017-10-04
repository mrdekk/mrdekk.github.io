---
layout: post
title: Разбираемся со Spotlight
tags:
 - osx
 - macos
 - spotlight
---

Начал тут у меня тормозить хакинтош. Пошел разбираться в чем проблема, оказалось что львиную долю ресурсов жрет Spotlight (процессы mds, mds_store, mdworker). Так как Spotlight'ом пользуюсь в основном для того, чтобы открыть Xcode (что можно сделать и другими способами), решено было как-то умерить его аппетиты.

Первое что можно попробовать - это просто выключить у него все индексирование, так

``` bash
sudo mdutil -a -i off
```

Эта команда отключить индексирование на всех разделах, которые у вас есть. Можно отключать частями так

``` bash
sudo mdutil -i off /Volume/Your_Volume_Name_Here
```

Кроме этого можно удалить имеющийся индекс так

``` bash
sudo mdutil -E /Volume/Your_Volume_Name_Here
```

И снести данные Spotlight

``` bash
cd /
sudo rm -fr .Spotlight-V100
```