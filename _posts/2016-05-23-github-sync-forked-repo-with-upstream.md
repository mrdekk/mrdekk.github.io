---
layout: post
title: GitHub - синхронизируем forked репозиторий с upstream
tags:
 - git
 - github
---

Задача: синхронизировать форкнутый репозиторий с тем, от которого он был форкнут и забрать оттуда новые изменения.

``` bash

# Добавляем новый удаленный репозиторий
$ git remote add upstream https://github.com/whoever/whatever.git

# Загружаем все ветки для отслеживания
$ git fetch upstream

# Убеждаемся, что мы на своем master'е
$ git checkout master

# Перезаписываем нашу ветку master чтобы те наши коммиты, которые не входят в удаленный мастер
# оказали на нем:
$ git rebase upstream/master

# Force push необходим для перезаписи истории ветки на вашем репозитории
$ git push -f origin master
```
