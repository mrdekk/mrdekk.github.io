---
layout: post
title: Преобразование кривой Безье в набор дуг окружности
tags:
 - graphics
 - c++
 - ige
---

Для реализации визуализации шрифтов на шейдерах в движке потребовалось преобразование кривой Безье (кубической, квадратичной) в набор дуг окружности. Долго штудировал математику, просмотрел даже некоторые забугорные whitepaper’s, но красивого решения не нашел.

Исходные данные, кубические кривые:

B = { ( 0, 0 ), ( 0.25, 0.25 ), ( 0.75, 0.75 ), ( 1, 0 ) }

![b3_1](/media/images/b3_1.jpg)

B = { ( 0, 0 ), ( 0.25, 0.75 ), ( 0.75, 0.25 ), ( 1, 1 ) }

![b3_2](/media/images/b3_2.jpg)

B = { ( 0.25, 0.25 ), ( 0.75, 0.75 ), ( 0.25, 0.5 ), ( 0.75, 0.25 ) }

![b3_3](/media/images/b3_3.jpg)

Квадратичные кривые:

B = { ( 0, 0 ), ( 0.75, 0.75 ), ( 1, 0 ) }

![b2_1](/media/images/b2_1.jpg)

B = { ( 0, 0 ), ( 0, 1 ), ( 1, 1 ) }

![b2_2](/media/images/b2_2.jpg)

B = { ( 0.25, 0.25 ), ( 0.75, 0.75 ), ( 0.45, 1 ) }

![b2_3](/media/images/b2_3.jpg)

В итоге был найден достаточно простой рекурсивный алгоритм, которые аппроксимирует кривые. В результате получены следующие картинки.

Кубические кривые (в порядке предоставления входных данных):

![b3_1_r](/media/images/b3_1_r.jpg)

![b3_2_r](/media/images/b3_2_r.jpg)

![b3_3_r](/media/images/b3_3_r.jpg)

Квадратичные кривая (в порядке представления входных данных):

![b2_1_r](/media/images/b2_1_r.jpg)

![b2_2_r](/media/images/b2_2_r.jpg)

![b2_3_r](/media/images/b2_3_r.jpg)

На каждую кривую получается в среднем 5-10 дуг окружностей. Вполне допустимо.