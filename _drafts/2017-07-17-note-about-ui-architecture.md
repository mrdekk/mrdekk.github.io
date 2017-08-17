---
layout: post
title: Заметки об архитектуре приложений (iOS)
tags:
 - xcode
 - ios
 - architecture
 - swift
---

В последнее время часто стали появляться статьи о том, как же правильно строить архитектуру вашего iOS приложения. Много разного шума о том, что MVC - это не Model View Controller, а Massive View Controller. Стали появляться специализированные сайты, где авторы пытаются подробно разжовывать что и как вы должны делать, чтобы архитектура вашего приложения была правильная и всем было хорошо.

Небольшой реестр того, что заслуживает внимание

 - [Clean Swift, eng](http://clean-swift.com) - тут вам предлагают рецепты (в виде шаблонов xCode), которые помогут вам управлять архитектурой правильно. Основано на VIPER.
 - [Архитектурные паттерны в iOS, рус](https://habrahabr.ru/company/badoo/blog/281162/) - статья на хабре (переводная) где автор разбирает доступные архитектурные паттерны. Полезно почитать для понимания и знания того, что значит MV... (Model View Something)
 - [Clean Architecture, eng](https://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html) - статья Uncle Bob - основоположника Clean Architecture на базе которого вырос VIPER.
 - [Охота на мифический MVC. Обзор, возвращение к первоисточникам и про то, как анализировать и выводить шаблоны самому](https://habrahabr.ru/post/321050/) - статья на хабре, где автор детально по полочкам раскладывает MVC (даже с исторической ретроспективой).

И много еще разного, тут привел что мне самому показалось полезным. Архитектурный паттерн VIPER попытались реализовать и популяризировать. Вот [тут](https://github.com/rambler-ios/Generamba) ребята даже наваяли автогенератор классов-модулей для VIPER для вашего приложения на Swift.

Однако во всем этот шуме хоть и существуют попытки разобраться и что называется "на пальцах" проработать эти вещи, но большая часть из них - маркетинговая, призванная попиарить конкретный подход. Clean Swift заслуживает внимания, но он на английском и там автор все таки пытается продвигать свои xCode шаблоны. Статья Uncle Bob заслуживает внимания, но требует ооооочень вдумчивого прочтения. Я на истину и "бронзу" не претендую, и здесь хочу изложить некоторые моменты, прояснившиеся в ходе "боевого" использования подобных подходов. Итак, приступим.

Ниже следует ряд экспериментов, вольно или невольно поставленных во время "боевой" практики разработки мобильных приложений мной или моими коллегами.

## Эксперимент 1 - Massive View Controller

Приложениями я занимаюсь достаточно давно, и первые подходы не отличались особыми размышлениями про архитектуру приложений. Поэтому их условно можно отнести к Massive View Controller.

При известных проблемах - у этого подхода есть свой плюс - простота первичной работы (пока у вас не случился собственно Massive View Controller). Таким образом, прототипирование и простые приложения можно делать достаточно быстро. Если ваше приложение не планирует быть большим - то это однозначно ваш подход.

Но если это прототип чего-то бОльшего - то рано или поздно, вы столкнетесь с Massive View Controller и будет нехорошо, как минимум - придется потратить время (и возможно деньги) на рефакторинг.

## Эксперимент 2 - Пытаемся приготовить MVC правильно

Можно попытаться (зная о проблеме) приготовить MVC правильно - вооружившись принципом [SRP](https://ru.wikipedia.org/wiki/Принцип_единственной_ответственности), пытаемся дробить большой контроллер на маленькие компоненты.

При определенной сноровке с этим вполне можно жить, главное - вовремя дробить компоненты и понимать что за что отвечает.

Здесь правда есть проблема в том, что не все разработчики в процессе написания кода задумываются о том, как вещи УЖЕ работают. Они ясно и четко понимают про то, как должна работать вещь которую они пишут сейчас. Сам лично наступал на эти грабли, когда в запарке дедлайнов надо быстро что-нибудь накодить, при этом порой даже случайно ломал что-нибудь хитро написанное, даже мной самим, но сильно ранее.

Здесь можно разве что порекомендовать концепцию "компонента" - сущности, которая делает одну отдельно взятую задачу, но при этом хорошо. Имеет некоторые входные данные (или не имеет) и некоторые выходные (или не имеет), с помощью которых компоненты соединяются между собой. Компонентом может быть все что угодно.

## Эксперимент 3 - Observer-driven Architecture

Встречался в моей практике и такой эксперимент, когда все приложение было построено на базе паттерна [наблюдатель](https://ru.wikipedia.org/wiki/Наблюдатель_(шаблон_проектирования)), благо iOS содержит много примеров его использования даже в стандартных библиотеках.

Приложение состояло из набора [singleton](https://ru.wikipedia.org/wiki/Одиночка_(шаблон_проектирования)) менеджеров, у каждого из которых был протокол на который можно повесить обсервер. Когда что-то случалось - сигнал проходил через такие цепочки наблюдателей, пока, сделав свое дело, окончательно не затухал.

За исключением количества разнообразного кода, которое заставляло это работать проблем тут несколько.

Во-первых, связывание обсерверов как правило не строгое и не контроллируется компилятором. Т.е. если вы что-то сломали, то скорее всего об этом вы узнаете от разгневанных пользователей у которых что-то сломалось. Тестирование здесь может сильно помочь, но вероятность что-нибудь проглядеть здесь весьма велика.

Во-вторых, порядок вызова обсерверов никем не контроллируется, таким образом мы создаем в своем приложении гонки в чистом виде. В том приложении с которым довелось работать была попытка победить гонки с использованием флажков. Как правило это были обычные bool флаги, и практически никак не учитывалось, что эти флаги могут быть изменены в разных потоках, тем самым проблема гонок не решалась никак, но вводилась дополнительная сложность с флагами. Да, часть из них ставилась и проверялась только на главной очереди (последовательной), но не все.

Ну и в-третьих, комбинаторный взрыв возможных событий на которые можно подписаться.

## Эксперимент 4 - Promises

С промисами фактически было дело дважды - один раз на базе библиотеки PromiseKit (Obj-C), второй раз на базе библиотеки Bolts (Swift).

Вариант с PromiseKit был относительно удачный, но библиотека PromiseKit весьма витееватая, и код написанный с ее помощью через какое-то время становится слишком сложным, так как у вас в общем есть два варианта - написать цепочку промисов здесь и сейчас или спрятать часть этой цепочки внутри функции. Внутри этой самой спрятанной функции никто не мешает вам также написать цепочку промисов, часть которой будет спрятана также в каких-то функциях. И так далее - we need to go deeper. Таким образом, через какое-то время очень сложно себе представить, где находится та или иная функциональность, даже та, которую сам писал. Очень много времени начинает уходить на то, чтобы найти место, где находится нужный промис.

С библиотекой Bolts наблюдал другую проблему, на проекте, который сам не писал. Человек, писавший этот код вообще не понимал, что есть Bolts Task и что такое промисы. Таким образом, concurrency в этом приложении был настолько ужасный, что несколько человек fulltime пытались с этим разобраться и через какое-то время разводили руки со словами - это можно только переписать... Хотя сама библиотека Bolts на Hello, World'ах выглядит более чем привлекательно.

## Эксперимент 5 - VIPER

Это это могучее хипстерское (да не обидеть бы никого) слово VIPER. Вообще изначально ноги здесь растут от статьи Uncle Bob'а, которую я привел в начале. Некоторые люди, прочитав эту статью, предложили переложить эти идеи на разработку iOS приложений и придумали архитектуру VIP, в которой (если я все правильно понял первоначальные работы) был unidirectional cycle (однонаправленный цикл), между представлением презентером и интерактором. Да кстати, многие любят добавлять дополнительную сущность presenter, откуда она взялась - можете прочитать статью про MVC на хабре, которую я давал выше - там все замечательно описано.

Но вернемся к VIP. Последователям этих первых работ букв в аббревиатуре показалось мало, и слово VIP уже зарезервировано для очень важных персон. Шучу-шучу, были вычлененны дополнительные архитектурные модули (Entity и Router), которые дополнили аббревиатуру и получилось слово VIPER.

VIPER снискал большую популярность, благодаря тому, что его евангелисты "продавали" его направо и налево, как "серебрянную пулю" или панацею от всех архтитектурных бед в мобильной разработке.

И VIPER действительно хорош в плане того, что наконец-таки заставляет задумываться о потоке данных в вашем приложении и компонентах, на которые вы разбиваете логику. Причем всегда, даже при написании костылей. Только теперь у вас будут костыль-VIPER модули.

Чего-же не говорят апологеты VIPER'а, так это то, что количество классов в вашем приложении увеличится катастрофически, и про то, что агрегация (хорошая сама по себе, старается предпочитать ее наследованию), не всегда панацея и наследование придумали не зря. И существует очень большая возможность того, что вы получити Massive Base Presenter, Massive Base Interactor и так далее.

Кроме того, большинство Presenter'ов в вашем приложении будут простыми Proxy объектами, которые будут гонять данные между Interactor'ом и ViewController'ом без какого-либо изменения.

Проблема потоков данных и уменьшения сложности не решается практически никак. Заставляет задумываться - бесспорно.

## Эксперимент 6 - Operations

Есть у Apple такое хороший доклад на [WWDC 2015 - Advanced NSOperations](https://developer.apple.com/videos/play/wwdc2015/226/). Где рассказывают про то, как инженеры Apple построили хорошую архитектуру приложения для WWDC на базе NSOperation.

NSOperation сама по себе хороша для выстраивания цепей выполнения кода и для разбиения этого самого кода на законченные самодостаточные части. Правда есть проблема композиции всего этого, инструменты для которой практически отсутствуют в базовом классе.

Поэтому был невольно поставлен эксперимент по реализации архитектуры на базе концепции "компонента", о которой я говорил выше и в качестве инструмента управления потоком данных с использованием NSOperation.

Но о нем продолжение следует