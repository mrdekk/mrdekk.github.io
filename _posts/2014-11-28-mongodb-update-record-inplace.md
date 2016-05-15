---
layout: post
title: MongoDB, обновить запись на основе её же полей
---

Случилась тут необходимость, обновить в mongodb некоторые записи, на основе их же полей – фактически разбить одно поле на два. StackOverflow дал одну идею, которую я решил законспектировать на будущее

``` js
db.person.find().forEach( function ( elem )
{
    db.person.update(
    {
        _id: elem._id
    },
    {
        $set:
        {
            name: elem.firstname + ' ' + elem.lastname
        }
    } );
} );
```
