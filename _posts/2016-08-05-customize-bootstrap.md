---
layout: post
title: Собираем свою версию bootstrap'а с кастомизацией
tags:
 - boostrap
 - less
---

В этой статье опишу рецепт, как сделать свою кастомизацию базовых стилей фреймворка twitter bootstrap. Для начала нам понадобяться собственно исходники бутстрапа:

``` bash
git clone https://github.com/twbs/bootstrap.git
```

И опционально переключаемся на нужный тэг:

``` bash
git checkout tags/v3.3.7
```

Далее нам потребуется LESS для сборки css файлов bootstrap'а

``` bash
sudo npm i less -g
```

теперь попытаемся собрать CSS:

``` bash
lessc bootstrap/less/bootstrap.less > boostrap.css
```

Или минифицированную версию

``` bash
lessc --compress bootstrap/less/bootstrap.less > boostrap.css
```

Теперь для создания своей конфигурации boostrap вы можете править файл bootstrap.less или его зависимости. Однако здесь таится одна небольшая проблема. Мы выше забрали исходники через гит. При выходе очередной версии вы наверняка захотите обновиться. Но в этом вам будут мешать сделанные изменения, которые надо будет куда-то деть. Да, конечно можно форкнуть репозиторий, сделать свою ветку и потом просто rebase'иться. Однако есть вариант лучше. Наши измения мы просто вынесем в отдельную папку, и они просто будут ссылаться на исходники boostrap'а. В таком случае обновление будет сводиться просто к ``` git checkout tags/... ``` и изредка правкой вашей кастомизации.

Чтож, приступим.

 1. Создаем папку

	``` bash
	mkdir customization
	```

 2. Создаем свои файлы в которые будем помещать кастомизацию

	``` bash
	cp bootstrap/less/variables.less customization/custom-variables.less
	echo "" > customization/custom-other.less
	```

 3. Далее создаем наш кастомизированный центральный файл customization/custom-boostrap.less со следующим содержимым:

	``` css
	@import "../bootstrap/less/bootstrap.less";
	@import "custom-variables.less";
	@import "custom-other.less";
	@import "../bootstrap/less/utilities.less";
	```

 4. Сделаем пробную сборку кастомизированного (на самом деле пока еще нет) bootstrap'а

	``` bash
	lessc customization/custom-bootstrap.less > bootstrap.css
	```

После этого можно править custom-variables.less, перегенрировать и радоваться. Однако надо где-то смотреть. Есть вот такой хороший проект где все компоненты на одной странице https://github.com/mrdekk/bootstrap-tldr

``` bash
git clone https://github.com/mrdekk/bootstrap-tldr
npm install
sudo npm i bower -g
bower install
sudo npm i grunt -g
lessc customization/custom-bootstrap.less bootstrap-tldr/app/styles/bootstrap.css
grunt serve
```

После этого http://localhost:9000 вы сможете лицезреть страничку со всеми элементами bootstrap
