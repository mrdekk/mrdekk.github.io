---
layout: post
title: Eclipse RCP (4.3) приложение с использованием maven
tags:
 - eclipse
 - rcp
 - maven
 - java
---

Итак. Намедни потребовалось создать eclipse rcp приложение на платформе Kepler. Положение осложнялось тем, что сборку надо было проводить с использованием maven’а. Ввиду того, что платформа kepler (4.3) достаточно новая и в ней было много всего переделано, информации по ней – кот наплакал. Поэтому пришлось подключать лом и чью-то матерь. Но в итоге все получилось. Методику этого получилось я и постараюсь описать тут.

Начнем с того, что у Вас должен быть установлен eclipse последней версии, в нем должен быть настроен maven и инструменты для разработки eclipse rcp. Я использовал для этого Spring ToolSuite, в котором мавен уже есть из коробки, а eclipse rcp tools легко ставятся через Install New Software. Методику этого всего я тут описывать не буду – материала навалом даже на русском языке.

Для начала создадим родительский проект для мавена – File > New > Maven Project.

![file new maven project](/media/images/ercp1_1.png)

Затем настроим основные вещи

![basic setup](/media/images/ercp1_2.png)

pom.xml будет выглядеть следующим образом

``` xml
<project
    xmlns="http://maven.apache.org/POM/4.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                        http://maven.apache.org/xsd/maven-4.0.0.xsd" >

    <modelVersion>4.0.0</modelVersion>
    <groupId>ru.mrdekk.ercp</groupId>
    <artifactId>ru.mrdekk.ercp.parent</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    <name>mrdekk.ru eclipse rcp demo - parent</name>

</project>
```

Для дальнейшего прогресса необходимо добавить некоторые вещи. Для начала – настройки, пока только версия tycho – инструмента для сборки rcp проектов maven’ом. Все это добавляем в pom.xml:

``` xml
    <properties>
        <tycho-version>0.18.1</tycho-version>
    </properties>
```

Теперь добавим репозиторий eclipse rcp который нужен будет maven’у и tycho для получения артефактов:

``` xml
     <repositories>
        <repository>
            <id>eclipse-platform</id>
            <layout>p2</layout>
            <url>http://download.eclipse.org/eclipse/updates/4.3/R-4.3-201306052000</url>
        </repository>
    </repositories>
```

Добавляем maven’овский плагин tycho в сборку:

``` xml
     <build>
        <plugins>

            <plugin>
                <groupId>org.eclipse.tycho</groupId>
                <artifactId>tycho-maven-plugin</artifactId>
                <version>${tycho-version}</version>
                <extensions>true</extensions>
            </plugin>

        </plugins>
    </build>
```

C родительским проектом пока все, теперь создаем непосредственно проект eclipse rcp – File > New > Project … > Eclipse 4 > Eclipse 4 Application Project:

![new eclipse rcp project](/media/images/ercp1_3.png)

![new eclipse rcp project](/media/images/ercp1_4.png)

![new eclipse rcp project](/media/images/ercp1_5.png)

![new eclipse rcp project](/media/images/ercp1_6.png)

Запустим приложение для проверки работоспособности, для этого:

 1. Открываем файл определения продукта – ru.mrdekk.ercp.gui.product
 2. На вкладке «Overview» нажмите «Launch an Eclipse application».

Вы должны увидеть примерно следующее:

![rcp sample launch](/media/images/ercp1_7.png)

Теперь преобразуем проект в maven’овский проект. Для этого нажимаем правой кнопкой мыши на проекте и выбираем Configure > Convert to Maven Project. Появится следующее окошко, в нем вбиваем нужные данные. Внимание! Важно чтобы эти данные совпадали с тем, что Вы ввели когда создавали проект, т.е.

```
MANIFEST/Bundle-SymbolicName == POM/artifactId
```

и

```
MANIFEST/.qualifier == POM/-SNAPSHOT!
```

![convert to maven](/media/images/ercp1_8.png)

Eclipse будет ругаться на полученный pom, т.к. он не увидит tycho. Чтобы все получилось, необходимо указать ссылку на созданный нами родительский проект, Ваш pom.xml должен выглядеть примерно следующим образом:

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

    <artifactId>ru.mrdekk.ercp.gui</artifactId>

    <packaging>eclipse-plugin</packaging>
    <name>mrdekk.ru eclipse rcp demo - gui</name>

</project>
```

Дальше на проекте ru.mrdekk.ercp.gui нажимаем правой кнопкой и Maven > Update Project ...

Надо кроме того добавить проект ru.mrdekk.ercp.gui как модуль основного (родительского проекта), для этого в pom.xml родительского проекта добавляем:

``` xml
    <modules>
        <module>gui</module>
    </modules>
```

Далее на проекте ru.mrdekk.ercp.parent нажимаем правой кнопкой и Run As > Maven build ... Указываем цели «clean package» и нажимаем Apply, затем Run.

![rcp launch configuration](/media/images/ercp1_9.png)

Все должно нормально собраться:

```
[INFO] Reactor Summary:
[INFO]
[INFO] mrdekk.ru eclipse rcp demo - parent ............... SUCCESS [0.109s]
[INFO] mrdekk.ru eclipse rcp demo - gui .................. SUCCESS [2.860s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 9.797s
[INFO] Finished at: Mon Sep 23 11:02:05 NOVST 2013
[INFO] Final Memory: 14M/34M
[INFO] ------------------------------------------------------------------------
```

В следующих статьях расскажу что делать дальше. Мы соберем feature и update site, что позволит нам публиковать приложения для установки в eclipse и распространять бинарные билды.

Для референсов исходники проекта доступны на github’е [вот тут](https://github.com/mrdekk/ercp).
