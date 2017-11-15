---
layout: post
title: Шрифт Consolas в Ubuntu
tags:
 - server
 - ubuntu
---

Найдено [тут](https://slicks.name/ubuntu/ubuntu-consolas-font-install.html), здесь в кратком изложении. 

Задача - установить шрифт consolas (моноширный шрифт для разработки, очень приятный на вид) в Ubuntu, для целей разработки. Он по-умолчанию есть в Windows, но в Ubuntu по понятным причинам его нет.

Делаем так

``` bash
sudo apt-get install font-manager
sudo apt-get install cabextract
```

Далее создаем скрипт, который скачает и распакует шрифты

``` bash 
nano consolas.sh
```

Содержимое

``` bash
#!/bin/sh
set -e
set -x
mkdir temp
cd temp
wget http://download.microsoft.com/download/E/6/7/E675FFFC-2A6D-4AB0-B3EB-27C9F8C8F696/PowerPointViewer.exe
cabextract -L -F ppviewer.cab PowerPointViewer.exe
cabextract ppviewer.cab
```

Выполняем

``` bash
chmod +x consolas.sh
./consolas.sh
```

Устанавливаем шрифт Consolas

``` bash
cd temp
font-manager
```

Шрифт Consolas содержится в таких файлах

* **CONSOLAB.TTF** - Жирный (bold)
* **CONSOLAI.TTF** - Курсив (italic)
* **CONSOLA.TTF** - Обычный (regular)
* **CONSOLAZ.TTF** - Жирный курсив (bold italic)

