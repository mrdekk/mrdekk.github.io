---
layout: post
title: Kohana 3.1. Деревья на ORM
tags:
 - php
 - kohana
 - sql
---

Kohana 3 оооочень интересный фреймворк – простой и понятный. Однако, как и во всех новых продуктах в нем иногда отсутствуют вполне логичные вещи. ORM присутствует, однако ему не хватает одной очень важной на мой взгляд вещи – деревьев. Например, мы хотим сделать дерево категорий на ORM... Как мы это должны сделать? Вот это сегодня и рассмотрим.

Задача: мы хотим сделать дерево категорий. С неограниченной вложенностью.

Для начала создадим таблицу в базе данных:

``` sql
CREATE TABLE `categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(10) unsigned NOT NULL,
  `name` varchar(32) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

INSERT INTO `categories` VALUES
('1', '0', 'Colors'), ('2', '1', 'Blue'), ('3', '1', 'Green'),
('4', '1', 'Red'), ('5', '1', 'Yellow'), ('6', '1', 'Purple'),
('7', '0', 'Food'), ('8', '7', 'Steak'), ('9', '7', 'Baked Potato'),
('10', '7', 'Blue Berry Pie'), ('11', '0', 'Movies'),
('12', '11', 'Avatar'), ('13', '11', 'Kung Fu Panda'),
('14', '11', 'The Incredibles'), ('15', '11', 'Meet the Robinsons');
```

Далее создадим класс модели-категории.

``` php
<?php defined('SYSPATH') or die('No direct script access.');

class Model_Category extends ORM
{

	// Relationships
	protected $_belongs_to = array(
	);

	protected $_has_many = array(
	);
}
```

Добавим отношения ко многим, это будут дочерние категории:

``` php
<?php
'children' => array('model' => 'category', 'foreign_key' => 'parent_id'),
```

Ну и конечно добавим отношение к одному - к родительской категории.

``` php
<?php
'parent' => array('model' => 'category', 'foreign_key' => 'parent_id'),
```

в итоге наш класс будет выглядеть примерно следующим образом

``` php
<?php defined('SYSPATH') or die('No direct script access.');

class Model_Category extends ORM
{

	// Relationships
	protected $_belongs_to = array(
		'parent' => array('model' => 'category', 'foreign_key' => 'parent_id'),
	);

	protected $_has_many = array(
		'children' => array('model' => 'category', 'foreign_key' => 'parent_id'),
	);

	public function delete($id = NULL)
	{
		if ($id === NULL)
		{
			// Use the the primary key value
			$id = $this->pk();
		}

		if ( ! empty($id) OR $id === '0')
		{
			foreach ($this->children->find_all() as $child)
			{
				$child->delete();
			}

			parent::delete($id);
		}

		return $this;
	}
}
```

Функция delete определена для того, чтобы правильно удалить дерево категорий, если база данных не поддерживает ON DELETE CASCADE.

Использовать данный класс можно следующим образом:

``` php
<?php
$categories = ORM::factory('category')->where('parent_id', '=', 0)->find_all();
foreach ($categories as $category)
{
	foreach ($category->children->find_all() as $sub_category)
	{
		echo $sub_category->name;
		echo $sub_category->parent->name;
	}

	$category->delete();
}
```

Надеюсь это поможет всем любителям Коханы.

### Комментарии со старой версии блога

 > Новичок:
 > 13.02.2012 в 16:48
 > Подскажите пожалуйста а как в цикле при помощи вашего решения выстроить HTML древо куда нужно расположить теги.

---

 > MrDekk:
 > 15.02.2012 в 21:20
 > Ну для начала создать соответствующую вьюшку. Можно рекурсивную. Из контроллера в нее передаете рут или несколько рутовых категорий, дальше согласно приведенному сниппету рекурсивно строите нужную вложенность. Если будет время в выходные постараюсь набросать Вам пример.

---

 > Павел:
 > 19.10.2012 в 13:47
 > Пример конечно классный! Использовать также удобно. Вроде бы все даже хорошо, но вот представьте, если в базе огромное количество данных, то сколько времени потребуется на обработку рекурсивных запросов?

---

 > MrDekk:
 > 20.10.2012 в 00:10
 > Во-первых, никто не мешает эту самую рекурсию ограничивать.
 > Во-вторых, никто не мешает разворачивать папки с помощью ajax, т.е. только те которые нужно развернуть в данный момент.
 >
 > А так да, комментарий справедлив, если в базе ОООЧЕНЬ много данных, то запрос может длиться вечность. Кроме того, вечность может длится доставка контента пользователю.
