---
layout: post
title: Eclipse RCP (4.3) приложение с использованием maven. Часть 3. Сайт обновлений
tags:
 - eclipse
 - rcp
 - maven
 - java
---

Продолжаю повествование о том, как собрать Eclipse RCP проект с помощью maven’а. Сегодня поговорим о том, как сделать Update Site для нашего проекта. Update Site нужен для распространения компонентов Eclipse RCP и готовых приложений. Когда Вы устанавливаете что-то себе в Eclipse вы пользуетесь одним или несколькими Update Site’ами.

Итак, открываем наш проект.

Для начала создадим проект Update Site’а через стандартные функции Eclipse, для этого File > New > Other ... > Plug-In Development > Update Site Project:

![new update site project](/media/images/ercp3_1.png)

![new update site project](/media/images/ercp3_2.png)

Eclipse создаст нам проект. Далее необходимо site.xml переименовать в category.xml. Для этого нужно кликнуть правой кнопкой мыши на этом файле и выбрать Refactor > Rename:

![rename](/media/images/ercp3_3.png)

Далее необходимо открыть полученный файл в Manifest Editor. В Eclipse есть бага, которая не позволяет сделать это простым двойным щелчком, поэтому нужно по правой кнопке выбрать Open With > Category Manifest Editor.

Далее создадим и отредактируем некоторые параметры в нашей категории:

![add and edit params](/media/images/ercp3_4.png)

Добавим ссылку на новую фичу (надо нажать на кнопку Add Feature). Выберем нашу фичу:

![add feature](/media/images/ercp3_5.png)

![add feature](/media/images/ercp3_6.png)

После этого, как обычно преобразуем полученный проект в проект maven. Для этого по правой кнопке Configure > Convert to Maven Project. Не забываем о том, что в настройках maven’а необходимо повторять те же идентификаторы. Тип проекта – eclipse-repository

![convert to maven](/media/images/ercp3_7.png)

После преобразования проекта в проект maven’а необходимо в pom.xml указать ссылку на родительский проект, после чего полученный pom.xml примет примерно следующий вид:

``` xml
<project
        xmlns="http://maven.apache.org/POM/4.0.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                            http://maven.apache.org/xsd/maven-4.0.0.xsd" >

    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>ru.mrdekk.ercp</groupId>
        <artifactId>ru.mrdekk.ercp.parent</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <relativePath>..</relativePath>
    </parent>

    <artifactId>ru.mrdekk.ercp.repository</artifactId>
    <packaging>eclipse-repository</packaging>

    <name>mrdekk.ru eclipse rcp demo - update site</name>

</project>
```

И добавим полученный проект в качестве модуля в родительский pom.xml. Секция modules будет выглядеть следующим образом:

``` xml
    <modules>
        <module>gui</module>
        <module>feature</module>
        <module>repository</module>
    </modules>
```

После чего все это дело надо сохранить и попробовать собрать через родительский проект maven’ом. Должно получится примерно следующее:

```
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary:
[INFO]
[INFO] mrdekk.ru eclipse rcp demo - parent ............... SUCCESS [0.094s]
[INFO] mrdekk.ru eclipse rcp demo - gui .................. SUCCESS [2.984s]
[INFO] mrdekk.ru eclipse rcp demo - feature .............. SUCCESS [0.109s]
[INFO] mrdekk.ru eclipse rcp demo - update site .......... SUCCESS [1.157s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 12.266s
[INFO] Finished at: Fri Sep 27 10:38:27 NOVST 2013
[INFO] Final Memory: 15M/37M
[INFO] ------------------------------------------------------------------------
```

Теперь протестируем полученный репозиторий, для этого надо через правую кнопку мыши зайти в свойства проекта папки target/repository проекта repository (Properties).

![test repo](/media/images/ercp3_8.1.png)

Затем выделить и сохранить в буфер обмена путь к полученному репозиторию:

![save path](/media/images/ercp3_9.1.png)

Теперь выберем в главном меню Help > Install New Software ... Добавим новый Update Site (надо нажать кнопку Add):

![add new site](/media/images/ercp3_9.2.png)

Мы должны увидеть содержимое этого репозитория, т.е. нашу фичу:

![our repo](/media/images/ercp3_10.png)

Нажмите Cancel, ведь мы пока не собираемся устанавливать нашу фичу в Eclipse. Как обычно исходники доступны на github [тут](https://github.com/mrdekk/ercp)
