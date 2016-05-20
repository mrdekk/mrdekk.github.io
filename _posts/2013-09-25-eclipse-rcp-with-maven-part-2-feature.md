---
layout: post
title: Eclipse RCP (4.3) приложение с использованием maven. Часть 2. Фича!
tags:
 - eclipse
 - rcp
 - maven
 - java
---

Добрый день, читатели!

Сегодня продолжил создавать приложение на основе Eclipse RCP. Сегодня сделаем фичу (feature). Фича – это компонент rcp который может быть отдельно установлен в Eclipse, в том числе в тот, под которым вы его разрабатываете. В дальнейшем нам этот компонент понадобится чтобы создать пакет приложения и сайт апдейтов.

Работу будем продолжать в уже созданном нами проекте. Создадим проект фичи, для этого File > New > Other ... > Plug-in Development > Feature Project.

![new feature project](/media/images/ercp2_1.png)

Заполним необходимые поля. Обязательно убедитесь в том, что проект находится в каталоге родительского проекта в отдельной папке, в нашем случае это папка feature. Дальше мы будем использовать имя этой папки кое где.

![new feature project](/media/images/ercp2_2.png)

Выберем созданный нами в предыдущей статье плагин:

![new feature project](/media/images/ercp2_3.png)

Далее преобразуем полученный проект в проект Maven’а. Правой кнопкой мыши на проекте, Configure > Convert to Maven Project. Далее не забываем, что настройки артефакта maven’а должны совпадать с настройками в билде эклипса. Кроме того, обратите внимание на packaging type, он должен быть eclipse-feature.

![convert to maven](/media/images/ercp2_4.png)

pom.xml проекта должен выглядеть примерно следующим образом. Ссылку на родительский проект необходимо вписать руками.

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

    <artifactId>ru.mrdekk.ercp.feature</artifactId>
    <packaging>eclipse-feature</packaging>

    <name>mrdekk.ru eclipse rcp demo - feature</name>
</project>
```

Теперь пропишем в родительском проекте этот проект в качестве модуля для того, чтобы он собирался при сборке всего проекта. Секция modules в родительском проекте должна выглядеть примерно следующим образом:

``` xml
    <modules>
        <module>gui</module>
        <module>feature</module>
    </modules>
```

После этого попробуем собрать проект. Должно получится примерно следующее:

```
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary:
[INFO]
[INFO] mrdekk.ru eclipse rcp demo - parent ............... SUCCESS [0.109s]
[INFO] mrdekk.ru eclipse rcp demo - gui .................. SUCCESS [2.953s]
[INFO] mrdekk.ru eclipse rcp demo - feature .............. SUCCESS [0.109s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 11.171s
[INFO] Finished at: Wed Sep 25 10:47:53 NOVST 2013
[INFO] Final Memory: 14M/35M
[INFO] ------------------------------------------------------------------------
```

В следующий раз настроим сборку продукта и сайта апдейтов.
