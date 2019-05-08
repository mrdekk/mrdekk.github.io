---
layout: post
title: Разрабатываем и отлаживаем С++ в Docker с помощью VSCode (2019 edition - clang8 lldb)
tags:
 - c++
 - linux
 - ubuntu
 - gcc
 - vscode
 - clang
 - lldb
---

Какое-то время назад я написал статью [Разрабатываем и отлаживаем С++ в Docker с помощью VSCode]({% post_url 2018-01-06-vscode-cpp-docker-debugging %}) в котором для сборки использовался gcc и для отладки gdbserver. В этом обновленном посте хочу затронуть такой же вопрос, но уже на базе clang 8 и lldb-server.

Также в отличии от предыдущей статьи мы не будем каждый раз пересоздавать контейнер, а запустим его один раз и будет с ним работать через ```docker exec```.

Итак, начнем, Dockerfile

```
FROM ubuntu:18.04

RUN apt-get update 
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y build-essential xz-utils curl cmake
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y lldb

RUN curl -SL http://releases.llvm.org/8.0.0/clang+llvm-8.0.0-x86_64-linux-gnu-ubuntu-18.04.tar.xz | tar -xJC . && \
    mv clang+llvm-8.0.0-x86_64-linux-gnu-ubuntu-18.04 clang_8.0.0 && \
    mv clang_8.0.0 /usr/local

ENV PATH="/usr/local/clang_8.0.0/bin:${PATH}"
ENV LD_LIBRARY_PATH="/usr/local/clang_8.0.0/lib:${LD_LIBRARY_PATH}"

WORKDIR /opt/build
VOLUME ["/opt"]

```

lldb (для lldb-server) используем поставляемый в пакетах (на момент написания статьи для 18.04 это был LLDB 6). Также из пакетов ставим cmake (вроде ничего специфичного пока не надо). clang ставим руками, но уже собранный.

Дальше нам нужен скрипт сборки контейнера (/scripts/docker_build.sh)

```
#!/bin/bash

cwd=$(pwd)

docker build \
    -t something/cmaker \
    .
```

И таска для vscode

```
{
    "label": "build docker container",
    "command": "${workspaceFolder}/scripts/docker_build.sh"
}
```

после этого нам понадобится запустить контейнер для последующего использования, для этого нам нужен скрипт (/scripts/docker_run.sh). Тут попутно запускается lldb-server, о нем позже:

```
#!/bin/bash

cwd=$(pwd)

docker stop сmaker
docker rm сmaker
docker run \
    -dt \
    --name сmaker \
    -p 7000:7000 \
    -p 7001:7001 \
    -p 7002:7002 \
    -p 7003:7003 \
    -v ${cwd}:/opt \
    --privileged \
    something/cmaker \
    "${@}"

```

и таска для vscode

```
{
    "label": "run container for future builds",
    "command": "${workspaceFolder}/scripts/docker_run.sh",
    "args": [
        "lldb-server", "platform", "--server", "--listen=0.0.0.0:7000", "-m", "7001", "-M", "7003"
    ],
    "options": {
        "cwd": "${workspaceFolder}"
    }
}
```

После этого можем приступать к сборке проекта. Структуру проекта сразу предусмотрел для многомодульного проекта

```
include
scripts
  docker_build.sh
  docker_run.sh
hword
  include
  CMakeLists.txt
  main.cpp
CMakeLists.txt
Dockerfile
```

Корневой CMakeLists.txt выглядит так

```
cmake_minimum_required(VERSION 3.0)
project(something)

set(CMAKE_BINARY_DIR ${CMAKE_SOURCE_DIR}/build)

set(EXECUTABLE_OUTPUT_PATH ${CMAKE_BINARY_DIR})
set(LIBRARY_OUTPUT_PATH ${CMAKE_BINARY_DIR})

set(PROJECT_INCLUDE_DIR ${PROJECT_SOURCE_DIR}/include)

include_directories("${PROJECT_INCLUDE_DIR}")
include_directories("${PROJECT_SOURCE_DIR}")

add_subdirectory(hword)
```

CMakeLists.txt для hword выглядит так

```
cmake_minimum_required(VERSION 3.0)
project(hword)

set(PROJECT_INCLUDE_DIR ${PROJECT_SOURCE_DIR}/include)
set(HWORD_VERSION_MAJOR 1)
set(HWORD_VERSION_MINOR 0)

set(PROJECT_HWORD_SRCS
${PROJECT_SOURCE_DIR}/main.cpp
)

include_directories("${PROJECT_BINARY_DIR}")
add_executable(${PROJECT_NAME}_r ${PROJECT_HWORD_SRCS})
include_directories("${PROJECT_INCLUDE_DIR}")
```

Обратите внимание что к имени проекта добавлен постфикс ```_r```

Для примера содержимое main.cpp

```
#include <unistd.h>
#include <limits.h>

#include <iostream>

using namespace std;

static const int HNAME_MAX = 512;
static const int LNAME_MAX = 512;

int main()
{
    char hostname[HNAME_MAX];
    char username[LNAME_MAX];
    gethostname(hostname, HNAME_MAX);
    getlogin_r(username, LNAME_MAX);

    cout << "hostname: " << hostname << ", username: " << username << endl;
    return 0;
}
```

Теперь соберем все это дело, запустим и отладим

Нам понадобится скрипт для ```docker exec```

```
#!/bin/bash

cwd=$(pwd)

docker exec \
    -it \
    cmaker \
    "${@}"

```

Таска для cmake

```
{
    "label": "cmake initialize scripts (Makefile, Debug)",
    "command": "${workspaceFolder}/scripts/docker_exec.sh",
    "args": [                
        "cmake", "-G", "Unix Makefiles", 
        "-DCMAKE_BUILD_TYPE=Debug", 
        "-DCMAKE_C_COMPILER=/usr/local/clang_8.0.0/bin/clang",
        "-DCMAKE_CXX_COMPILER=/usr/local/clang_8.0.0/bin/clang++",
        "/opt"
    ],
    "options": {
        "cwd": "${workspaceFolder}"
    }
}
```

Обратите внимание, что тут явным образом указаны пути до компиляторов, это очень важно.

Далее таска для сборки всего проекта и для сборки конкретного

```
{
    "label": "make full project",
    "command": "${workspaceFolder}/scripts/docker_exec.sh",
    "args": [
        "make", "-j", "8"
    ],
    "options": {
        "cwd": "${workspaceFolder}"
    }
}
```

```
{
    "label": "make (hword) project",
    "command": "${workspaceFolder}/scripts/docker_exec.sh",
    "args": [
        "make", "-j", "8", "hword_r"
    ],
    "options": {
        "cwd": "${workspaceFolder}"
    }
}
```

И для простого запуска

```
{
    "label": "run (hword) project",
    "command": "${workspaceFolder}/scripts/docker_exec.sh",
    "args": [
        "/opt/build/hword_r"
    ]
}
```

С отладкой есть несколько проблем. Во-первых, кроме порта на котором слушает lldb-server надо пробросить еще несколько, на которых будет работать собственно соединение (для этого при запуске контейнера несколько опций ```-p```). Во-вторых, lldb-server'у этот диапазон портов надо явно задать. И в третьих, надо правильно написать launch.json, выглядит он так:

```
{
    "name": "debug: hword",
    "type": "lldb",
    "request": "launch",
    "program": "/opt/build/hword_r",
    "initCommands": [
        "platform select remote-linux",
        "platform connect connect://127.0.0.1:7000"
    ],
    "cwd": "/opt",
    "sourceMap": { 
        "/opt" : "${workspaceFolder}" 
    }
}
```

Жмем F5 и выуля - мы в отладке. Надеюсь это поможет :)