---
layout: post
title: Swift Pattern Matching
tags:
 - swift
 - ios
 - recipe
---

*Статья перевод, оригинал [тут](https://appventure.me/2015/08/20/swift-pattern-matching-in-detail/). Далее повествование идет от лица автора, я лишь в меру своих сил попытался литературно перевести на русский. Также автор судя по всему использует Swift 2, по мере возможности я адаптировал примеры для Swift 3.*

Среди всех новых конструкций языка Swift по отношению к Objective-C выделяется конструкция switch. Которая, в отличии от языка Objective-C не просто альтернатива набору последовательных операций if-elseif-else, но предоставляет расширенный набор вариантов выбора.

Конструкция switch в swift позволяет делать гораздо больше. И в этой статье я попытаюсь рассказать про эти новые возможности более подробно. Я буду игнорировать те аспекты, которые не несут ничего нового по отношению к Objective-C. Базовые идеи для этой статьи появились в Июле 2014, но большинство вариантов приводило к падению компилятора, поэтому я откладывал написание этой статьи.

## Погружаемся

Основная функция оператора switch конечно pattern matching (*устоявшийся термин, переводить не стал, прим. переводчика*), способность классифицировать значения и сопоставлять их вариантам выбора.

``` swift
// Пример наихудшего конвертера binary -> decimal в истории
let bool1 = 1
let bool2 = 0
switch (bool1, bool2) {
   case (0, 0): print("0")
   case (0, 1): print("1")
   case (1, 0): print("2")
   case (1, 1): print("3")
}
```

Pattern matching (PM) давно существует в таких языках программирования, как Haskell, Erlang, Scala или Prolog. Это замечательно, так как позволяет нам увидеть, как PM используется в этих языках для решения практических проблем, и перенять хорошие для решения собственных задач.

## Торговый движок

К вам обратились дельцы с Wall Street (ну или хотя бы с ММВБ), им нужна торговая платформа на iOS устройствах. Так как это торгвая платформа, вы определяете перечисление для сделок.

### Первый черновик

``` swift
enum Trades {
    case buy(stock: String, amount: Int, stockPrice: Float)
    case sell(stock: String, amount: Int, stockPrice: Float)
}
```

Кроме того, нам доступно следующее API для совершения сделок. **Обратите внимание, что приказы на продажу такие же приказы, только с отрицательным объемом.** Кроме того, сказано, что рыночные цены не так важны, движок возмет внутренню цену в любом случае.

``` swift
/**
 - parameter stock: The stock name
 - parameter amount: The amount, negative number = sell, positive = buy
*/
func process(stock: String, _ amount: Int) {
    print ("\(amount) of \(stock)")
}
```

Следующий шаг - обработать приказы. И тут виден потенциал для применения pattern matching, поэтому напишем так:

``` swift
let trade = Trades.buy(stock: "APPL", amount: 200, stockPrice: 115.5)

switch trade {
case .buy(let stock, let amount, _):
    process(stock, amount)
case .sell(let stock, let amount, _):
    process(stock, amount * -1)
}

// Prints "buy 200 of APPL"
```

Swift позволяет нам извлекать информацию из элементов перечисления в том виде, как нам это необходимо. Поэтому в данном примере, мы используем только идентификатор акции и количество.

Отлично, оправляемся на Wall Street для того, чтобы продемонстрировать нашу замечательную торговую платформу. Однако как обычно, на практике все не так, как в теории. Сделка не так проста, как вам рассказывают.

 * Необходимо рассчитать комиссию, которая отличается в зависимости от типа трейдера.
 * Чем меньше игрок, тем больше комиссия
 * Большие компании имеют больший приоритет

Поэтому было решено выдать новый API для решения этих проблем:

``` swift
func processSlow(_ stock: String, _ amount: Int, _ fee: Float) { print("slow") }
func processFast(_ stock: String, _ amount: Int, _ fee: Float) { print("fast") }
```

### Типы трейдоров

Поэтому возвращаемся и добавляем еще одно перечисление. Тип трейдера будет частью всех сделок.

``` swift
enum TraderType {
case person
case company
}

enum Trades {
    case buy(stock: String, amount: Int, stockPrice: Float, type: TraderType)
    case sell(stock: String, amount: Int, stockPrice: Float, type: TraderType)
}
```

Чтож, как лучше всего имплементировать это новое ограничение? Можно просто добавить каскадную конструкцию if-else для .buy и для .sell, но это приведет к каскадному коду, и неминуемо потеряет выразительность, и кто знает, что акулы с Wall Street придумают для нас завтра. Поэтому реализуем эти новые ограничения с применением pattern matching:

``` swift
let trade = Trades.sell(stock: "GOOG", amount: 100, stockPrice: 666.0, type: TraderType.company)

switch trade {
case let .buy(stock, amount, _, TraderType.person):
    processSlow(stock, amount, 5.0)
case let .sell(stock, amount, _, TraderType.person):
    processSlow(stock, -1 * amount, 5.0)
case let .buy(stock, amount, _, TraderType.company):
    processFast(stock, amount, 2.0)
case let .sell(stock, amount, _, TraderType.company):
    processFast(stock, -1 * amount, 2.0)
}
```

Достаточно выразительно, не так ли? Кроме того, для краткости мы изменили .buy(let stock, let amount) на let .buy(stock, amount). Суть та же, букв меньше.

### Охрана! Охрана!

*Тут видимо имелось ввиду игра слов, синтаксическая конструкция guard также означает и охрану, прим. переводчика*

Вы снова презентуете ваше творение дельцам с Wall Street, и снова появляется новая хотелка (вам все-таки стоило изначально попросить более детальное ТЗ).

 * Приказы на продажу общим объемом более $ 1 000 000 всегда обрабатываются быстрым процессингом, даже если этот приказ поступил от частного лица
 * Приказы на покупку объемом менее $ 1 000 всегда обрабатываются медленным процессингом.

Это стало бы адом (и лапшой наверное), если бы мы попытались реализовать это через традиционное дерево if'ов. Но у нас есть Swift и конструкция switch. Swift предоставляет дополнительные конструкции для ограничения диапазонов действия переменных.

Поэтому наш код нужно поправить всего чуть-чуть для отражения новых требований.

``` swift
let trade = Trades.buy(stock: "GOOG", amount: 1000, stockPrice: 666.0, type: TraderType.person)

switch trade {
case let .buy(stock, amount, _, TraderType.person):
    processSlow(stock, amount, 5.0)

case let .sell(stock, amount, price, TraderType.person)
    where price * Float(amount) > 1000000:
    processFast(stock, -1 * amount, 5.0)

case let .sell(stock, amount, _, TraderType.person):
    processSlow(stock, -1 * amount, 5.0)

case let .buy(stock, amount, price, TraderType.company)
    where price * Float(amount) < 1000:
    processSlow(stock, amount, 2.0)

case let .buy(stock, amount, _, TraderType.company):
    processFast(stock, amount, 2.0)

case let .sell(stock, amount, _, TraderType.company):
    processFast(stock, -1 * amount, 2.0)
}
```

Этот код по прежнему остается как достаточно простым для понимания, так и открытым к новым изменениям.

Ура-ура, мы успешно реализовали нашу торговую платформу. Однако, полученное решение все-таки содержит небольшое количество повторяющегося кода. Но может быть есть еще какие-то магические заклинания, которые помогут нам его уменьшить еще? Давайте смотреть дальше.

## Продвинутый Pattern Matching

Мы уже попробовали несколько шаблонов в действии. Существуют ли другие варианты? Swift различает 7 типов шаблонов. Давайте посмотрим на все.

Все рассмотренные далее паттерны могут быть использованы не только в конструкции switch, но и с if, guard и даже циклом for.

### 1. Шаблонный паттерн

Шаблонный паттерн игнорирует значение, к которому сопоставляется. В этом случае допустимо любое значение. Вы его уже встречали, это тоже самое что и, например, ``` let _ = fnt() ```, где символ "_" означает, что вам безразлично что будет возвращено из функции. Самое интересное, что будет сопоставлено не только значение, но и его отстутствие (nil). Можно даже сопоставлять Optional, достаточно лишь добавить "?".

``` swift
let p: String? = nil
switch p {
case _?: print ("Has String")
case nil: print ("No String")
}
```

И как мы уже успели заметить, когда реализовывали торговую платформу, этот паттерн позволяет нам опускать данные, которые в данном сопоставлении не используются:

``` swift
switch (15, "example", 3.14) {
    case (_, _, let pi): print ("pi: \(pi)")
}
```

### 2. Паттер по идентификатору

Сопоставляет конкретное значение. Это стандартный механизм того, как работает switch в реализации Objective-C:

``` swift
switch 5 {
  case 5: print("5")
}
```

### 3. Паттерн с присвоением значения

Аналогичен с присвоением значения переменным через let или var, но только внутри конструкции switch. Мы уже чуть выше встречались с этим видом:

``` swift
switch (4, 5) {
  case let (x, y): print("\(x) \(y)")
}
```

### 4. Паттерн кортеж

Можно написать отдельную статью про кортежи, здесь ограничимся лишь простым примером:

``` swift
let age = 23
let job: String? = "Operator"
let payload: AnyObject = NSDictionary()

switch (age, job, payload) {
  case (let age, _?, _ as NSDictionary):
  print(age)
  default: ()
}
```

В этом примере мы объединяем три значения в кортеж (например, мы их получили из нескольких разных запросов к API) и сопоставляем их. Важно, что здесь мы выполнили три задачи:

 1. Извлекли возраст (age)
 2. Убедились, что есть работа (job), даже несмотря на то, что она нам в общем не нужна
 3. Убедились что привязанные данные (payload) являются наследником класса NSDictionary, даже не смотря на то, что они нам в общем также не нужны.

### 5. Паттерн выбора из перечисления

Как уже было замечено выше в примере торговой платформы, pattern matching замечательно работает в паре с перечислениями Swift. Это потому, что перечисления в Swift это закрытые, иммутабельные объекты пригодные для разбора. Также как и с кортежом, вы можете извлекать нужные значения в каждом из вариантов выбора, и только те значения, которые вам необходимы.

Предположим, что мы разрабатываем игру, и у нас имеется несколько видов сущностей. Можно использовать структуры, но так как состояния у нас не много, можно обойтись перечислениями.

``` swift
enum Entities {
    case soldier(x: Int, y: Int)
    case tank(x: Int, y: Int)
    case player(x: Int, y: Int)
}
```

Теперь нам необходимо реализовать цикл отрисовки. Тут нам необходимы только координаты (X и Y).

``` swift
for e in entities() {
    switch e {
    case let .soldier(x, y):
        drawImage("soldier.png", x, y)
    case let .tank(x, y):
        drawImage("tank.png", x, y)
    case let .player(x, y):
        drawImage("player.png", x, y)
    }
}
```

### 6. Паттерн преобразования типов

Название говорит само за себя, этот паттерн умеет преобразовывать или просто сопоставлять типы. Имеется два типа выражений:

 * ```is``` **type**: Сопоставляет тип (или его потомка) с правой частью выражения. Преобразование типа проводиться, но результат отбрасывается. Поэтому выражение выбора не будет знать про получившейся тип.
 * выражение ```as``` **type**: Производит тоже сопоставление что и is, но в случае успешного приведения возвращает полученно значение конкретного типа.

Далее пример обоих выражений

``` swift
let a: Any = 5
switch a {
    // this fails because a is still anyobject
    // error: binary operator '+' cannot be applied to operands of type 'Any' and 'Int'
    case is Int: print (a + 1)

    // This works and returns '6'
    case let n as Int: print (n + 1)

    default: ()
}
```

Важно, что перед is нет выражения, сопоставляется переменная выбора (а) напрямую.

### 7. Паттерн - выражение

Паттер-выражение очень мощный. Он сопоставляет значение в конструкции switch с выражением, реализующим оператор ~=. Для этого оператора существуют реализации по-умолчанию, например, для интервалов, можно сделать так:

``` swift
switch 5 {
    case 0..<10: print("In range 0-10")
    default: break
}
```

Интереснее, однако, ситуация, когда этот оператор перегружен для ваших объектов. Предположим, мы решили таки переписать нашу игру про солдатов на структуры.

``` swift
struct Soldier {
    let hp: Int
    let x: Int
    let y: Int
}
```

Теперь мы хотим сопоставлять все объекты с жизнью в 0. Можно просто переопределить оператор ~= так:

``` swift
func ~= (pattern: Int, value: Soldier) -> Bool {
    return pattern == value.hp
}
```

Теперь можно сопоставлять:

``` swift
let soldier = Soldier(hp: 99, x: 10, y: 10)
switch soldier {
    case 0: print("dead soldier")
    default: ()
}
```

Можно сопоставлять кортежи, так:

``` swift
func ~= (pattern: (hp: Int, x: Int, y: Int), value: Soldier) -> Bool {
   let (hp, x, y) = pattern
   return hp == value.hp && x == value.x && y == value.y
}
```

Оператор ~= может работать с протоколами:

``` swift
protocol Entity {
    var value: Int {get}
}

struct Tank: Entity {
    var value: Int
    init(_ value: Int) { self.value = value }
}

struct Peasant: Entity {
    var value: Int
    init(_ value: Int) { self.value = value }
}

func ~=(pattern: Entity, x: Entity) -> Bool {
    return pattern.value == x.value
}

switch Tank(42) {
    case Peasant(42): print("Matched") // Does match
    default: ()
}
```

Есть еще много интересных вещей, которые можно сделать через паттерн-выражение. Для более детального описания, можете обратится к [статье Austin Zheng](http://austinzheng.com/2014/12/17/custom-pattern-matching/), правда она на английском.

Мы рассмотрели все возможные варианты, однако перед тем, как мы продолжим, есть еще одна важная вещь для рассмотрения.

### Fallthrough, Break, и метки

Этот раздел напрямую к pattern matching'у не относится, но затрагивает то, как работает конструкция switch, поэтому вкратце рассмотрим. По-умолчанию, и в отличии от C/C++/Objective-C, конструкция switch не обрабатывает последующии конструкции выбора (case), поэтому нет необходимости в каждом из вариантов писать break. Однако, привычное поведение можно вернуть с помощью оператора fallthrough.

``` swift
switch 5 {
case 5:
    print("Is 5")
    fallthrough
default:
    print("Is a number")
}
// Will print: "Is 5" "Is a number"
```

Если вам необходимо досрочно выйти, то оператором break можно воспользовать. Зачем это надо, если нет обработки следующих конструкций по-умолчанию, спросите вы? Ну, например, внутри конструкции case вы можете определить, что условие не вполне удовлетворяется, и не стоит выполнять следующие операции:

``` swift
let userType = "system"
let userID = 10
switch (userType, userID)  {
case ("system", _):
    guard let userData = getSystemUser(userID) else { break }
    print("user info: \(userData)")
    insertIntoRemoteDB(userData)
default: ()
}
// ... more code that needs to be executed
```

В примере, мы не вызываем функцию insertIntoRemoteData, если функция getSystemUser вернула nil. Конечно, здесь можно использовать конструкцию if let, но если их будет несколько, код станет выглядеть ужасно.

Но что если вы поместили ваш switch внутри, например, цикла while, и вам надо выйти из цикла, а не из switch? Для таких случаев Swift предоставляет возможность определять метки, для которых будут работать операции break и continue:

``` swift
gameLoop: while true {
  switch state() {
     case .waiting: continue gameLoop
     case .done: calculateNextState()
     case .gameOver: break gameLoop
  }
}
```

На этом мы рассмотрели весь синтаксис и детали реализации конструкции switch и pattern matching'а. Теперь давайте рассмотрим несколько интересных примеров из реальной жизни.

## Примеры из реальной жизни

### Optionals

Существует огромное количество способов разворачивания Optional, и pattern matching - один из них. Наверняка вы этим часто пользуетесь, но пример все же вот:

``` swift
let result: String? = secretMethod()
switch result {
case nil:
    print("is nothing")
case let a?:
    print("\(a) is a value")
}
```

Как можно заметить, result может быть строкой, а может быть и nil - это Optional. Можно поиграться с возвращаемым значением secretMethod() и посмотреть на результат. Кроме того, если в result есть значение, то его можно привязать к переменной (в нашем случае - a). С помощью такого кода - мы явно разделяем два случая - когда там нет значения и когда какое-то есть.

## Сопоставление типов

Благодаря строгой типизации в Swift, необходимость в runtime проверке типов возникает редко, реже, нежели в Objective-C. Однако, такие случаи иногда встречаются, особенно если вы работаете с наследием Objective-C (особенно, если кодовая база не была обновлена для работы с generic'ами). В таком случае вам нужна проверка типов. Предположим, у нас есть массив NSString'ов и NSNumber'ов:

``` swift
let u = NSArray(array: [NSString(string: "String1"), NSNumber(value: 20), NSNumber(value: 40)])
```

Когда мы будем итерироваться по этому NSArray, мы не знаем точно, объект какого типа мы получаем. В этом случае нам поможет конструкция switch:

``` swift
for x in u {
    switch x {
    case _ as NSString:
        print("string")
    case _ as NSNumber:
        print("number")
    default:
        print("Unknown types")
    }
}
```

### Сопоставляем баллы с оценками

Предположим вы подрядились написать iOS приложение для учителей в американских школах. Там учитель желает быстро уметь конвертировать некоторое количество баллов (от 0 до 100) в оценку (A - F). И тут pattern matching нам поможет:

``` swift
let aGrade = 84

switch aGrade {
case 90...100: print("A")
case 80...90: print("B")
case 70...80: print("C")
case 60...70: print("D")
case 0...60: print("F")
default:
    print("Incorrect Grade")
}
```

### Частота слов

У нас есть набор пар, каждая из которых представляет собой слово и его частоту в некотором тексте. Наша задача - сделать пороговый фильтр - отфильтровать те слова, частота которых больше некоторого порогового значения и вывести их, без частот.

Вот наши слова:

``` swift
let wordFreqs = [("k", 5), ("a", 7), ("b", 3)]
```

Простое решение через map и filter:

``` swift
let res = wordFreqs.filter({ (e) -> Bool in
    if e.1 > 3 {
        return true
    } else {
        return false
    }
}).map { $0.0 }
print(res)
```

Однако, с помощью flatmap (map которая возвращает только не nil элементы), можно улучшить и это решение. Первое и самое важное, мы можем избавиться от e.1 и иметь правильное разложение с использованием кортежей. И нам потребуется только один вызов flatmap, вместо filter и map, которые ухудшают производительность.

``` swift
let res = wordFreqs.flatMap { (e) -> String? in
    switch e {
    case let (s, t) where t > 3: return s
    default: return nil
    }
}
print(res)
```

### Обход дерева каталогов

Предположим, что мы хотим обойти дерево файлов и найти:

 * Все "psd" файлы от customer1 и customer2
 * Все "blend" файлы от customer2
 * Все "jpeg" файлы от всех клиентов

``` swift
guard let enumerator = FileManager.default.enumerator(atPath: "/customers/2014")
    else { return }

for case let url as URL in enumerator {
    switch (url.pathComponents, url.pathExtension) {

    // psd files from customer1, customer2
    case (let f, "psd")
        where f.contains("customer1") ||
            f.contains("customer2"): print(url)

    // blend files from customer2
    case (let f, "blend")
        where f.contains("customer2"): print(url)

    // all jpg files
    case (_, "jpg"):
        print(url)

    default: ()
    }
}
```

### Фибоначчи

Теперь "черная магия", считаем числа Фибоначчи с помощью pattern matching'а:

``` swift
func fibonacci(_ i: Int) -> Int {
    switch(i) {
    case let n where n <= 0: return 0
    case 0, 1: return 1
    case let n: return fibonacci(n - 1) + fibonacci(n - 2)
    }
}

print(fibonacci(8))
```

Не запускайте на больших числах :) - получите переполнение стэка.

### Унаследованнное API и извлечение значений

Частно, когда вы получаете данные из внешнего источника (библиотеки, API и т.д.), перед обработкой хорошей практикой считается их проверить на корректность. Необходимо убедиться что все необходимые ключи присутствуют, данные имеют корректный тип или, например, массив нужной длины. Отсутствие такой проверки может вести от некорректного поведения (нет ключа) до падения приложения (индекс за границей массива). Классический вариант такой проверки - вложенные if'ы.

Предположим, что у нас есть API, которое возвращает пользователя. Однако, существуют два типа пользователей: привелигированные пользователи (такие как администратор) и обычные (John B, Bill Gates и т.д.). Учитывая нюансы развития системы, имеем некоторые особенности такого API:

 * ```system``` (привелигированные) и ```local``` (обычные) пользователи получаются с помощью одного и того же вызова API
 * Ключ ```department``` (подразделение) может отсутствовать, так как первые версии базы данных не содержали такого ключа и поэтому для ранних пользователей он необязателен к заполнению.
 * Массив ```name``` (имя) может содержать либо 4 значения (логин, фамилия, имя, отчество) или 2 значения (логин и полное имя). Количество значений зависит от того, как давно был создан пользователь.
 * Поле ```age``` (возраст) - целое число указывающее количество полных лет

От нашей системы требуется создавать пользовательские аккаунты для всех привелигированных пользователей со следующей информацией: логин (```username```), подразделение (```department```). Нам необходимы только пользователи с датой рождения после 1980 года. Если подразделение не задано, то по-умолчанию считаем "Corp".

``` swift
func legacyAPI(id: Int) -> [String: Any] {
    return [
        "type": "system",
        "department": "Dark Arts",
        "age": 57,
        "name": ["voldemort", "Tom", "Marvolo", "Riddle"]
    ]
}
```

Учитывая вышеназванные ограничения, давайте воспользуемся pattern matching'ом:

``` swift
let item = legacyAPI(id: 4)
switch (item["type"], item["department"], item["age"], item["name"]) {
case let (sys as String, dep as String, age as Int, name as [String])
    where age < 1980 && sys == "system":
    createSystemUser(name.count == 2 ? name.last! : name.first!, dep: dep.characters.count > 0 ? dep : "Corp")
default:()
}
// returns ("voldemort", "Dark Arts")
```

Обратите внимание, что приведенный выше код делает одно опасное предположение, которое заключается в том, что если массив ```name``` имеет не 2 значения, то он обязан иметь 4. Если это предположение не выполнится, мы получим крэш.

Во всем остальном - это удачные пример того, как pattern matching может помочь вам писать элегантный код и упростить извлечение значений.

И обратите внимание на то, что мы записали let только перед кортежом, дабы не повторять его для каждой из переменных.

## Паттерны с другими конструкциями

Как указывает документация на swift, все обозначенные выше паттерны могут быть использованы также с конструкциями if, for и guard.

Небольшой пример, связывание значений (value binding), кортеж и приведение типов в одном примере для всех трех конструкций:

``` swift
// This is just a collection of keywords that compiles. This code makes no sense
func valueTupleType(_ a: (Int, Any)) -> Bool {
    // guard case Example
    guard case let (x, _ as String) = a else { return false}
    print(x)

    // for case example
    for case let (a, _ as String) in [a] {
        print(a)
    }

    // if case example
    if case let (x, _ as String) = a {
        print("if", x)
    }

    // switch case example
    switch a {
    case let (a, _ as String):
        print(a)
        return true
    default: return false
    }
}
let u: Any = "a"
let b: Any = 5
print(valueTupleType((5, u)))
print(valueTupleType((5, b)))
// 5, 5, "if 5", 5, true, false
```

Теперь давайте немножко рассмотрим каждую из конструкций более подробно.

### Используем for case

Pattern matching в swift стал настолько важен, что возможности конструкции switch распространили и на другие. Для примера, давайте напишем функцию обработки массива, которая возвращает все существующие (non-nil) элементы:

``` swift
func nonnil<T>(_ array: [T?]) -> [T] {
    var result: [T] = []
    for case let x? in array {
        result.append(x)
    }
    return result
}

print(nonnil(["a", nil, "b", "c", nil]))
```

Ключевое слово case может быть использовано в циклах for аналогично конструкции switch. Другой пример, помните игру, которую мы рассматривали ранее? Хорошо, после первого рефакторинга она выглядела так:

``` swift
enum Entity {
    enum EntityType {
        case soldier
        case player
    }
    case Entry(type: EntityType, x: Int, y: Int, hp: Int)
}
```

Теперь, мы можем нарисовать все элементы с меньшим количеством кода:

``` swift
for case let Entity.Entry(t, x, y, _) in gameEntities()
    where x > 0 && y > 0 {
        drawEntity(t, x, y)
}
```

Одной строчкой извлекаем все необходимые свойства, убеждаемся что не рисуем ниже и левее 0 и в конце-концов таки вызываем функцию рисования.

Для того, чтобы убедиться что игрок выиграл игру, нам необходимо знать, остался ли в живых хотя бы один солдат (health > 0).

``` swift
func gameOver() -> Bool {
    for case Entity.Entry(.soldier, _, _, let hp) in gameEntities()
        where hp > 0 {return false}
    return true
}
print(gameOver())
```

Хорошо то, что сопоставление с .soldier является частью запроса. Это больше напоминает SQL нежели императивный цикл. Кроме того, такая запись делает нашу задумку более явной для компилятора и открывает возможности для оптимизаций. И нам нет необходимости раскрывать полное имя типа (Entity.EntityType.soldier).

### Используем guard case

Другое ключевое слово, которое поддерживает pattern matching - это новая конструкция guard. Вы наверняка уже использовали ее для привязки optional'ов к локальному scope без каскадный конструкций так:

``` swift
func example(_ a: String?) {
    guard let a = a else { return }
    print(a)
}
example("yes")
```

guard let case позволяет использовать всю мощь pattern matching'а. Давайте снова взглянем на наших солдатиков. Нам необходимо посчитать требуемую HP до того, как игрок будет полностью здоров. Солдаты не могут восстанавливать HP, поэтому нам необходимо для них всегда возвращать 0.

``` swift
let MAX_HP = 100

func healthHP(_ entity: Entity) -> Int {
    guard case let Entity.Entry(.player, _, _, hp) = entity, hp < MAX_HP
        else { return 0 }
    return MAX_HP - hp
}

print("Soldier", healthHP(Entity.Entry(type: .soldier, x: 10, y: 10, hp: 79)))
print("Player", healthHP(Entity.Entry(type: .player, x: 10, y: 10, hp: 57)))

// Prints:
"Soldier 0"
"Player 43"
```

Замечательный пример рассмотренных нами возможностей.

* Он просто и понятен, без каскадных конструкций
* Логика и инициализация состояния обрабатывается в начале функции, что повышает читаемость
* Лаконичный

Можно совмещать с конструкций switch для совмещения сложных логических конструкций в легкую для прочтения форму. Конечно, сама логика от этого не станет легче в восприятии, но как минимум, она будет лаконичнее и короче. Особенно при использовании перечислений.

### Используем if case

if case можно испоьзовать в противовес guard case. Это замечательный способ извлечения и сопоставления данных в конкретной ветви условия. Продолжаем с нашими солдатиками - нам необходима функция перемещения. Так как наши сущности - это перечисления, нам необходимо вернуть измененную сущность.

``` swift
func move(_ entity: Entity, xd: Int, yd: Int) -> Entity {
    if case Entity.Entry(let t, let x, let y, let hp) = entity,
        (x + xd) < 1000 && (y + yd) < 1000 {
        return Entity.Entry(type: t, x: (x + xd), y: (y + yd), hp: hp)
    }
    return entity
}
print(move(Entity.Entry(type: .soldier, x: 10, y: 10, hp: 79), xd: 30, yd: 500))
// prints: Entry(main.Entity.EntityType.soldier, 40, 510, 79)
```
