---
layout: post
title: "node.js дополнительная настройка"
tags:
 - freebsd
 - js
 - nodejs
---

Для дальнейшей работы с node.js нам потребуется еще несколько библиотек. Для того чтобы поставить эти библиотеки нам потребуется пакетный менеджер для node.js – npm.

Для выполнения всех действий делаем следующие шаги:

 1. Ставим последнюю версию node.js

	``` bash
	$ fetch 'http://nodejs.org/dist/node-v0.2.2.tar.gz'
	$ tar -xvf node-v0.2.2.tar.gz
	$ cd node-v0.2.2.tar.gz
	$ ./configure
	$ make
	$ make install
	$ rehash
	```

 2. Ставим пакетный менеджер npm

	``` bash
	$ fetch 'http://download.github.com/isaacs-npm-v0.2.2-0-g00adb09.tar.gz'
	$ tar -xvf isaacs-npm-v0.2.2-0-g00adb09.tar.gz
	$ cd isaacs-npm-6acdb76
	$ make
	$ rehash
	```

 3. Ставим библиотеку htmlparser

	``` bash
	$ npm install htmlparser
	```

 4. Ставим библиотеку jsdom

	``` bash
	$ npm install jsdom
	```

 5. Ставим библиотеку http-agent

	``` bash
	$ npm install http-agent
	```

Далее можно подключать jQuery и делать паука. Но об этом в следующих статьях
