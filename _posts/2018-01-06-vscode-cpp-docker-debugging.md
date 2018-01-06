---
layout: post
title: Разрабатываем и отлаживаем С++ в Docker с помощью VSCode
tags:
 - c++
 - linux
 - ubuntu
 - gcc
 - vscode
---

Продолжаем цикл статей "Как кодить на С++ под OSX для Ubuntu". После сборки cross-toolchain'ов стояла задача научиться собирать, запускать и отлаживать С++ под OSX для Linux (Ubuntu в данном случае). Как оказалось cross-toolchain был не нужен :(. Но об этом позже. 

Для начала нужна была IDE, в которой можно было бы комфортно редактировать код и отлаживаться. Претенденты были такие: Xcode, Eclipse (CDT), CLion, чуть позже к ним добавился VSCode и впоследствии выиграл соревнование.

Постановка задачи была такая: C++, CMake, Linux, при этом редактирование кода и отладка должна работать под OSX.

Xcode поэтому выпал из этой гонки сразу, он есть очень удобная IDE для C++, но в целом в основном для OSX. CMake наверное завести можно, но это будет большое количество сторонних средств.

CLion выпал из этой же гонки примерно по тем же причинам (хотя он вроде умеет в CMake). Плюс я не смог в нем нормально подружиться с Docker.

Остался Eclipse CDT, в нем получилось практически все что требовалось (с cross-toolchain), завелась даже отладка через cross-gdb, однако были странные махинации чтобы нормально работать с CMake и контейнером он управлял относительно сам (не совсем прозрачно), хотя надо отметить что поддержка Docker в Eclipse плюс-минус хорошая.

После этого я пошел посерфить интеренет в поисках каких-нибудь идей, как нормально подружить Eclipse и CMake, и тут я наткнулся на VSCode. Которые не позиционирует себя как IDE, но умеет в дебаг и всякие user-defined task'и. Несмотря на мое некоторое отношение к продуктам Microsoft, я решил дать этому редактору шанс и попробовал его... и надо признать, это очень хороший инструмент.

Теперь же собственно, как завести, чтобы все работало.

Для начала нам понадобится собственно VSCode, настроенный так, как вам наиболее удобно. Можно сразу поставить расширения для работы с C++ (C/C++, Native Debug), CMake (CMake, CMake Tools), Docker.

Далее нам потребуется такая структура проекта (в принципе вы можете выбрать такую структуру, какая вам больше нравится, это скажем так рабочий пример):

```
.vscode
  tasks.json
  launch.json
build
CMakeLists.txt
dbuild.sh
ddebugger.sh
dmaker.sh
Dockerfile
main.cpp
```

Начнем с С++, пример простой, однако чтобы понять что мы действительно работаем для Linux я добавил несколько linux'овых вещей.

```cpp
#include <unistd.h>
#include <limits.h>

#include <iostream>

using namespace std;

int main() {
	char hostname[HOST_NAME_MAX];
	char username[LOGIN_NAME_MAX];
	gethostname(hostname, HOST_NAME_MAX);
	getlogin_r(username, LOGIN_NAME_MAX);

	cout << "hostname: " << hostname << ", login: " << username << endl; // prints Hello World!
	return 0;
}
```

Этот код мы будем собирать, запускать и отлаживать.

Далее CMakeLists.txt, который тоже простой и относительно шаблонный:

```cmake
cmake_minimum_required(VERSION 3.5)

project(HWord)

set(HWORD_VERSION_MAJOR 1)
set(HWORD_VERSION_MINOR 0)

set(SOURCE ${PROJECT_SOURCE_DIR}/main.cpp)

add_executable(${PROJECT_NAME} ${SOURCE})
```

## Собираем

Как я уже выше писал сначала я пытался собрать все это безобразие под OSX с помощью cross-toolchain. Это плюс-минус работало, но часто приходилось пересобирать toolchain с еще каким-нибудь волшебным флагом, а на моем машине это делается примерно 3 часа. В одну из таких пересборок мне пришла мысль, а почему бы не собирать docker'ом, т.е. gcc который в контейнере и в требуемой системе (linux). 

Таким образом собираем такой контейнер:

Dockerfile

```
FROM ubuntu:16.04

RUN apt-get update 
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y gcc g++ gdb cmake

WORKDIR /opt/build
VOLUME ["/opt"]
```

Для упрощения работы с командной строкой docker'а заведем пару скриптов:

**Скрипт сборки образа:**

dbuild.sh

```bash
#!/bin/bash

cwd=$(pwd)

docker build \
    -t mrdekk/maker \
    .
```

Ничего сверхординарного, но возможно вам лучше поставить свой тег, вместо ```mrdekk/maker``` сделать ```%username%/maker```

**Скрипт запуска сборок:**

dmaker.sh

```bash
#!/bin/bash

cwd=$(pwd)

docker stop maker
docker rm maker
docker run \
	-it \
	--name maker \
	-p 6666:6666 \
	-v ${cwd}:/opt \
	--privileged \
	mrdekk/maker \
    "${@}" 
```

**Скрипт запуска контейнера для отладки:**

ddebugger.sh

```bash
#!/bin/bash

cwd=$(pwd)

docker stop maker
docker rm maker
docker run \
	-dt \
	--name maker \
	-p 6666:6666 \
	-v ${cwd}:/opt \
	--privileged \
	mrdekk/maker \
    "${@}" 
```

Скрипты запуска сборки и дебаггера в общем отличаются только ключами -it и -dt.

Теперь сделаем несколько задач (tasks) для VSCode

**Задача сборки контейнера:**

Ничего особенного, вызываем скрипт dbuild.sh

```json
{
    "label": "Docker: Build Containers",
    "command": "${workspaceFolder}/dbuild.sh",
},
```

И заодно выполняем ее, после этого можете сделать ```docker images``` и проверить, что образ mrdekk/maker появился

**Задача для CMake:**

Теперь с помощью CMake сгенерим Makefile'ы для сборки проекта. Здесь мы воспользуемся скриптом dmaker.sh, но будем вызывать его с набором ключей:

```json
{
    "label": "CMake: Initialize",
    "command": "${workspaceFolder}/dmaker.sh",
    "args": [
        "cmake", "-G", "'Unix Makefiles'", "-DCMAKE_BUILD_TYPE=Debug", "/opt"
    ],
    "options": {
        "cwd": "${workspaceFolder}"
    }
},
```

```/opt``` это путь до Volume'а в контейнере в который мы будем проецировать текущую папку с исходниками проекта - это в общем часть магии.

После этого в подпапке build вы должны увидеть сгенерированные cmake'ом файлы.

**Задача для сборки бинарника:**

Здесь снова используем скрипт dmaker.sh но с другими ключами

```json
{
    "label": "Make: Build Project",
    "command": "${workspaceFolder}/dmaker.sh",
    "args": [
        "make", "-j", "8"
    ],
    "options": {
        "cwd": "${workspaceFolder}"
    },
    "group": {
        "kind": "build",
        "isDefault": true
    }
},
```

После того, как собереться можете попробовать сделать так ```./build/HWord``` на OSX, и вы должны получить примерно такое:

```
exec format error: ./build/HWord
```

Это правильно, наш бинарник собран для linux и на OSX запускаться не должен. Если же вы увидите вывод программы, это значит что что-то пошло не так (вы собрали OSX'овым компилятором).

## Запускаем без отладки

Теперь у нас есть бинарник, надо проверить что он запускается. Для этого снова воспользуемся скриптом dmaker.sh и такой задачей:

```json
{
    "label": "Docker: Run Containers",
    "command": "${workspaceFolder}/dmaker.sh",
    "args": [
        "/opt/build/HWord"
    ]
},
```

После этого вы должны увидеть в ```docker logs maker``` и терминале VSCode примерно такое

```
hostname: 03a3a4dee13f, login:
```

Это хорошо, наш бинарник на linux работает хорошо.

## Отлаживаемся

С помощью VSCode поставьте breakpoint куда-нибудь в коде. Нам будет необходим запущенный в фоне контейнер, внутри которого мы через ```docker exec``` будем запускать gdb. Увы, завести VSCode так, чтобы он смог нормально в интерактивном режиме (dmaker.sh и -it) запускать debugger у меня не получилось (видимо механизм запуска дебаггера в VSCode как-то так хитро устроен), поэтому я воспользовался pipeTransport и все заработало.

Таким образом задача для предварительного запуска контейнера:

```json
{
    "label": "Docker: Run Debugging Container",
    "command": "${workspaceFolder}/ddebugger.sh",
    "args": [
        "bash"
    ]
}
```

а launch.json выглядит так

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Container Debug",
            "type": "cppdbg",
            "request": "launch",
            "program": "/opt/build/HWord",
            "cwd": "/opt",
            "linux": {
                "MIMode": "gdb",
                "setupCommands": [
                    {
                        "description": "Enable pretty-printing for gdb",
                        "text": "-enable-pretty-printing",
                        "ignoreFailures": true
                    }
                ]
            },
            "osx": {
                "MIMode": "gdb",
                "setupCommands": [
                    {
                        "description": "Enable pretty-printing for gdb",
                        "text": "-enable-pretty-printing",
                        "ignoreFailures": true
                    }
                ]
            },
            // "preLaunchTask": "Docker: Run Debugging Container",
            "pipeTransport": {
                "pipeProgram": "docker",
                "pipeCwd": "${workspaceRoot}",
                "pipeArgs": [
                    "exec", "-i", "maker", "sh", "-c"
                ],
                "quoteArgs": false,
                "debuggerPath": "/usr/bin/gdb"
            },
            "sourceFileMap": {
                "/opt":"${workspaceFolder}"
            },
        }
    ]
}
```

Внимательно ко всем параметрам, они все имеют значение.

После этого жмем F5 (или в меню выбираем Start Debugging) и... отлаживаемся. Дебаггер должен остановить выполнение в установленном вами breakpoint'е.

Примеры кода и исходники к статье лежат тут [mrdekk/viscose-cpp-docker](https://github.com/mrdekk/viscose-cpp-docker). 

P.S. Да, я тоже ненавижу автокомплит, когда он что-то исправляет. В названии репозитория должно было быть vscode-cpp-docker, а получилось viscose-cpp-docker. Но, ладно! Так тому и быть.