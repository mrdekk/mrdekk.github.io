---
layout: post
title: Решение проблемы с PowerShell
tags:
 - windows
---

Возникла проблема PowerShell «не удается загрузить файл так как выполнение скриптов запрещено для данной системы»

Решается выключением нафиг этой защиты

``` conf
Set-ExecutionPolicy Unrestricted
```
