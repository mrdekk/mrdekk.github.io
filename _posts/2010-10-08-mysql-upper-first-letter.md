---
layout: post
title: Одна проблемка и ее решение
tags:
 - mysql
 - sql
 - query
---

Задача простая – есть поле в базе данных MySql. Требуется сделать чтобы значение этого поля начиналось с большой буквы, весь остальной текст остался таким каков есть.

запрос такой

``` sql
SELECT
 concat(upper(LEFT(description_short,1)),substring(description_short,2,char_length(description_short)-1)) AS x
 FROM am_product_lang
 WHERE description_short > ''
 LIMIT 10;
```

По мотивам этого запроса можно написать любой нужный update.
