---
layout: post
title: Eclipse RCP (4.3) приложение с использованием maven. Часть 4. Продукт
tags:
 - eclipse
 - rcp
 - maven
 - java
---

Сегодня как и обещал, расскажу про то, как сделать готовый продукт. В следующих статьях, если они будут – расскажу про то, как подключить в Eclipse RCP обычные maven’овские зависимости.

Итак, открываем наши проекты в eclipse и делаем вот что. В проекте ru.mrdekk.ercp.gui есть файлик ru.mrdekk.ercp.gui.product. Так вот – этот файлик надо перенести в проект ru.mrdekk.ercp.repository:

![move file](/media/images/ercp4_1.png)

Необходимо сконфигурировать уровни запуска и параметры автостарта. Открываем файл продукта, который мы только что перенесли. Переходим на вкладку Configuration. В Start Levels ... нажимаем кнопку Add ...

![configurate product](/media/images/ercp4_2.png)

Далее в появившемся окне необходимо выбрать бандлы org.eclipse.equinox.common и org.eclipse.equinox.ds и нажать ОК

![ok](/media/images/ercp4_3.png)

Для обоих бандлов установить start level = 2 и auto start = true, далее таким же способом необходимо добавить бандл org.eclipse.core.runtime:

![config](/media/images/ercp4_4.png)

Для этого бандла необходимо установить только auto start = true. В итоге получим что-то вроде:

![auto start](/media/images/ercp4_5.png)

На вкладке Overview в поле ID введите ru.mrdekk.ercp.product:

![product id](/media/images/ercp4_6.png)

Измените «The product configuration is base on...» на features:

![base on feature](/media/images/ercp4_7.png)

На вкладке Dependencies нажмите кнопку Add ...

![add](/media/images/ercp4_8.png)

И выберите org.eclipse.rcp:

![rcp](/media/images/ercp4_9.png)

Также нажмите кнопку Add Required ... eclipse добавить требуемые зависимости:

![deps](/media/images/ercp4_10.png)

И конечно добавить нашу фичу:

![add feature](/media/images/ercp4_11.png)

Теперь запустим сборку проекта через maven, мы должны получить как обычно успешный результат:

```
[INFO] Reactor Summary:
[INFO]
[INFO] mrdekk.ru eclipse rcp demo - parent ............... SUCCESS [0.109s]
[INFO] mrdekk.ru eclipse rcp demo - gui .................. SUCCESS [2.875s]
[INFO] mrdekk.ru eclipse rcp demo - feature .............. SUCCESS [0.125s]
[INFO] mrdekk.ru eclipse rcp demo - update site .......... SUCCESS [5.531s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 16.734s
[INFO] Finished at: Thu Oct 03 11:12:56 NOVST 2013
[INFO] Final Memory: 16M/38M
[INFO] ------------------------------------------------------------------------
```

В папке target/repository мы должны увидеть метаданные и файлы для продукта:

![see product](/media/images/ercp4_12.png)

Теперь заставим maven собирать для нас пакет инсталляции продукта, и архивный файл. Для этого в pom.xml проекта ru.mrdekk.ercp.repository необходимо написать следующее:

``` xml
     <build>
        <plugins>
            <plugin>
                <groupId>org.eclipse.tycho</groupId>
                <artifactId>tycho-p2-director-plugin</artifactId>
                <version>${tycho-version}</version>
                <executions>
                    <execution>
                        <!-- install the product using the p2 director -->
                        <id>materialize-products</id>
                        <goals>
                            <goal>materialize-products</goal>
                        </goals>
                    </execution>
                    <execution>
                        <!-- create zip file with the installed product -->
                        <id>archive-products</id>
                        <goals>
                            <goal>archive-products</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
```

И запустите сборку снова, вы должны будете увидеть каталог продукта и архивный файл в папке target:

```
[INFO] Reactor Summary:
[INFO]
[INFO] mrdekk.ru eclipse rcp demo - parent ............... SUCCESS [0.094s]
[INFO] mrdekk.ru eclipse rcp demo - gui .................. SUCCESS [2.766s]
[INFO] mrdekk.ru eclipse rcp demo - feature .............. SUCCESS [0.109s]
[INFO] mrdekk.ru eclipse rcp demo - update site .......... SUCCESS [12.953s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 24.250s
[INFO] Finished at: Thu Oct 03 11:17:54 NOVST 2013
[INFO] Final Memory: 17M/42M
[INFO] ------------------------------------------------------------------------
```

![hurray](/media/images/ercp4_13.png)

Вы можете запустить полученный продукт, и увидите примерно следующее:

![see](/media/images/ercp4_14.png)

На этом основные статьи по Eclipse RCP закончены. Вы можете добавить этот проект например в Hudson и автоматически собирать его там. Я постараюсь сделать еще несколько статей, в которых расскажу про то, как подключать в Eclipse RCP проекты обычные maven’овские зависимости.

P.S. Исходники как всегда доступны в [github](http://github.com/mrdekk/ercp)
