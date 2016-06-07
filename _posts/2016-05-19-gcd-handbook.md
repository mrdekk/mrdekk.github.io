---
layout: post
title: Поваренная книга GCD
tags:
 - gcd
 - recipe
 - handbook
---

_GCD - Grand Central Dispatch - библиотека от Apple для iOS и OS X для работы с примитивами многозадачности. На просторах интернета наткнулся на [статью](http://khanlou.com/2016/04/the-GCD-handbook/) с некоторыми рецептами по работе с GCD. Статья на английском и очень интересная. Здесь хочу предложить вам ее вольный перевод. Далее повествование ведется от лица автора._

Grand Central Dispatch или GCD - очень мощная штуковина. Она предоставляет в ваше распоряжение низкоуровневые конструкции, такие как очереди и семафоры, которые вы можете комбинировать различными путями для получения многотопоточных эффектов. Однако, основанное на языке С API, на первый взгляд кажется книгой заклинаний и не сразу понятно, как собрать эти низкоуровневые кубики в нечто полезное высокоуровневое. В этой статье я постараюсь описать некоторые полезные конструкции, которые вы сможете использовать в своих приложениях.

## Выполнение задач в фоне

Пожалуй самое просто что может потребоваться - это выполнить некоторую работу в фоновом потоке, а затем вернуть результат в основной поток для отображения, так как такие компоненты как UIKit могут работать исключительно из главного потока.

В этой статье для отображения чего-то, что занимает много времени для выполнения будут использоваться функции вида ```doSomeExpensiveWork()```

И так, чтобы выполнить что-то в фоновом потоке, а затем вернуться в основной надо сделать примерно так:

``` swift
let defaultPriority = DISPATCH_QUEUE_PRIORITY_DEFAULT
let backgroundQueue = dispatch_get_global_queue(defaultPriority, 0)
dispatch_async(backgroundQueue) {
  let result = doSomeExpensiveWork()
  dispatch_async(dispatch_get_main_queue()) {
    // используем как-нибудь `result`
  }
}
```

На практике, очень редко используются другие приоритеты, нежели ```DISPATCH_QUEUE_PRIORITY_DEFAULT```. Функция ```dispatch_get_global_queue``` возвращает очередь, задания из которой могут выполняться на сотнях разных потоков. Если вам требуется, чтобы какие-то тяжелые задачи всегда выполнялись на какой-то определенной фоновой очереди, вы можете создать свою с помощью ```dispatch_queue_create```. Она принимает имя очереди и флаг того, должна быть очередь последовательной (serial) или конкурентной (concurrent).

Важно, чтобы каждый вызов использовал dispatch_**a**sync, а не dispatch_sync. dispatch_async возвращает управление до того момента, как блок будет выополнен. Напротив, dispatch_sync дожидается выполнения блока перед тем как вернуть управление. Внутренний вызов в dispatch_sync может использовать dispatch_sync (так как в общем все равно когда вернется управление), но внешний вызов должен быть dispatch_async, потому что иначе главный поток будет заблокирован.

## Singleton (паттерн одиночка)

С помощью dispatch_once вы можете создавать объекты паттерна "одиночка". В swift это уже не так важно, так как есть более простые способы, однако для информации все же паттерн приводится ниже (ну и для Objective-C это по прежнему важно).

``` objc
+ (instancetype) sharedInstance {  
  static dispatch_once_t onceToken;  
  static id sharedInstance;  
  dispatch_once(&onceToken, ^{  
    sharedInstance = [[self alloc] init];  
  });  
  return sharedInstance;  
}  
```

## Сглаживаем О_О блок обратного вызова

_Сглаживание конечно не совсем верный перевод для термина flatten, который еще можно перевести как выравнивание, но за неимением лучшей альтернативы пока так, можете предложить лучше, если знаете. (прим. переводчика)_

А вот тут уже становится интересно. С помощью семафора, мы можем заблокировать поток на некоторое количество времени, пока не получим сигнал от другого потока. Семафоры, как и другие примитивы GCD, потокобезопасные, поэтому их можно вызывать где угодно.

Семафоры можно использовать тогда, когда вы имеете асинхронное API но хотите сделать синхронный вызов, но API менять по какой-то причине не можете.

``` swift
// на фоновой очереди
dispatch_semaphore_t semaphore = dispatch_semaphore_create(0)
doSomeExpensiveWorkAsynchronously() {
    dispatch_semaphore_signal(semaphore)
}

dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER)
// тяжелая асинхронная обработка закончена
```

С помощью вызова ```dispatch_semaphore_wait``` вы блокируете поток до тех пор, пока где-либо не будет вызван сигнал ```dispatch_semaphore_signal```. Это означает, что сигнал должен быть вызван из другого потока, так как текущий заблокирован. И более, **вы никогда не должны вызывать wait из главного потока, только из фонового**.

Вы можете выбрать любой промежуток времени при вызове ```dispatch_semaphore_wait``` (это будет своего рода таймаут), но обычно передается ```DISPATCH_TIME_FOREVER```.

Может быть не совсем понятно зачем вам делать синхронный вызов из функции, которая **уже** содержит блок обратного вызова, но если вам это потребуется, вы знаете как это сделать. Однако, есть один случай, когда вам это может понадобиться - вам необходимо выполнить ряд асинхронных операций **последовательно**. Для того, чтобы облегчить использование, можно написать простой класс для абстракции - AsyncSerialWorker:

``` swift
typealias DoneBlock = () -> ()
typealias WorkBlock = (DoneBlock) -> ()

class AsyncSerialWorker {
  private let serialQueue = dispatch_queue_create("com.khanlou.serial.queue", DISPATCH_QUEUE_SERIAL)

  func enqueueWork(work: WorkBlock) {
    dispatch_async(serialQueue) {
      let semaphore = dispatch_semaphore_create(0)
      work({
        dispatch_semaphore_signal(semaphore)
      })
      dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER)
    }
  }
}
```

Этот небольшой класс создает последовательную очередь и позволяет вам передать в нее блок на обработку. Объект WorkBlock дает вам DoneBlock для вызова, когда работа будет закончена, который в свою очередь отправит сигнал семафору и очередь отправит на обработку следующий блок.

## Ограничиваем количество одновременно выполняемых блоков

В предыдущем примере, семафор использовался как обычный флаг, но он может быть использован как счетчик для ограниченных ресурсов. Например, вы хотите открыть определенное количество подключений к определенному ресурсу. Вам поможет в этом следующий класс:

``` swift
class LimitedWorker {
  private let concurrentQueue = dispatch_queue_create("com.khanlou.concurrent.queue", DISPATCH_QUEUE_CONCURRENT)
  private let semaphore: dispatch_semaphore_t

  init(limit: Int) {
    semaphore = dispatch_semaphore_create(limit)
  }

  func enqueueWork(work: () -> ()) {
    dispatch_async(concurrentQueue) {
      dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER)
      work()
      dispatch_semaphore_signal(semaphore)
    }
  }
}
```

Этот пример взят из [Apple Concurrency Programming Guide](https://developer.apple.com/library/ios/documentation/General/Conceptual/ConcurrencyProgrammingGuide/OperationQueues/OperationQueues.html#//apple_ref/doc/uid/TP40008091-CH102-SW24). Они могут объяснить что происходит лучше чем я:

 > Когда вы создаете семафор, вы можете задать количество доступных ресурсов. Это значение становится первичным значением счетчика для семафора. Каждый раз когда вы вызываете wait на семафоре, ```dispatch_semaphore_wait``` уменьшает счетчик на единицу. Если полученное значение отрицательно, функция блокирует ваш поток. С другой стороны, вызов функции ```dispatch_semaphore_signal``` увеличивает счетчик на единицу для уведомления о том, что ресурс освобожден. Если есть заблокированные задачи, ожидающие доступ к ресурсу, одна из них разблокируется и начнет выполнение.

Эффект аналогичен установке значения ```maxConcurrentOperationCount``` объекта ```NSOperationQueue```. Если вы используете сырой GCD вместо NSOperationQueue, вы можете использовать семафоры для ограничения количества одновременно выполняемых блоков.

**ВАЖНО!** Здесь присутствует один важный момент. Каждый раз когда вы вызываете enqueueWork и вы достигли ограничения семафора - создается новый поток. Если у вас небольшой лимит и много задач для размещения в очередь, вы таким образом создадите огромное количество заблокированных потоков. Используйте профайлер и избегайте узких мест.

## Ожидаем единого завершения нескольких асинхронных операций

Если у вас есть несколько асинхронно выполняемых блоков и вы хотите дождаться их общего завершения, вы можете использовать группу. ```dispatch_group_async``` позволяет вам добавить задачу в очередь (задача в блоке однако должна быть синхронной), и ведет учет количество добавленных задач. Важно, что одна и та же группу может добавлять задачи в несколько разных очередь и учитывать все из них. Когда все задачи в группе будут выполнены, вызывается блок, переданный в ```dispatch_group_notify``` - это своего рода блок обратного вызова на всю группу.

``` swift
dispatch_group_t group = dispatch_group_create()
for item in someArray {
  dispatch_group_async(group, backgroundQueue) {
    performExpensiveWork(item: item)
  }
}

dispatch_group_notify(group, dispatch_get_main_queue()) {
  // все задачи выполнены
}
```

Это хороший пример сглаживания функции, которая имеет блок обратного вызова. Существует другой, более ручной способ использования групп, особенно, если часть ваших фоновых вычислений уже асинхронная.

``` swift
// этот код должен выполняться на фоновом потоке
dispatch_group_t group = dispatch_group_create()
for item in someArray {
  dispatch_group_enter(group)
  performExpensiveAsyncWork(item: item, completionBlock: {
    dispatch_group_leave(group)
  })
}

dispatch_group_wait(group, DISPATCH_TIME_FOREVER)

// все фоновые задачи в группе выполнены
```

Этот пример сложнее, но если пройтись по нему строка за строкой то все станет понятно. Как и семафор, группа содержит потокобезопасный внутренний счетчик, которым можно манипулировать. С помощью него вы можете гарантировать, что блок обратного вызова будет вызван после завершения всех долготекущий операций. Вызов "enter" увеличивает счетчик, вызов "leave" - уменьшает. ```dispatch_group_async``` скрывает для вас все детали, поэтому предпочтительнее.

Последнее в этом примере - это вызов wait, который блокирует поток и ожидает момента когда счетчик достигнет 0. Важно! Вы моежет использовать ```dispatch_group_notify``` даже если вы используете enter/leave. Обратное также верно - вы можете использовать ```dispatch_group_wait``` даже при использовании ```dispatch_group_async```.

Функция ```dispatch_group_wait``` также как и ```dispatch_semaphore_wait``` принимает в качестве аргумента таймаут. Опять же, редко возникает нужда в чем-то отличном от ```DISPATCH_TIME_FOREVER```. И так же как и в случае ```dispatch_semaphore_wait``` никогда не вызывайте ```dispatch_group_wait``` на главном потоке.

Самое главное отличие между этими двумя подходами в том, что notify можно вызывать непосредственно на главном потоке, а wait необходимо использовать на фоновом (как минимум wait, так как этот вызов блокирует текущую очередь).

## Очереди изоляции

Словарь (и массив) в Swift - типы значений. Когда они изменяются, их ссылка полностью заменяется новой копией структуры. Однако, ввиду того что обновление полей экземпляра (ivar) объектов Swift не является атомарной операцией, она не является потокобезопасной. Два потока могут обновить словарь (например, добавить значение) в одно и то же время, и оба попытаются записать один и тот же блок памяти, что приведет к ее повреждению. Для того, чтобы обеспечить потокобезопасность можно использовать очереди изоляции.

Давайте сформируем коллекцию объектов, которая будет представлять собой словарь, где ключом будет ID объекта, а значением - сам объект.

``` swift
class IdentityMap<T: Identifiable> {
  var dictionary = Dictionary<String, T>()

  func object(forID ID: String) -> T? {
    return dictionary[ID] as T?
  }

  func addObject(object: T) {
    dictionary[object.ID] = object
  }
}
```

Этот объект фактически является оберткой над словарем. Если наша функция addObject будет вызвана из нескольких потоков в одно и то же время, память будет нарушена, так как потоки будут использовать одну и ту же ссылку. Эта известная [задача о читателях-писателях](https://ru.wikipedia.org/wiki/%D0%97%D0%B0%D0%B4%D0%B0%D1%87%D0%B0_%D0%BE_%D1%87%D0%B8%D1%82%D0%B0%D1%82%D0%B5%D0%BB%D1%8F%D1%85-%D0%BF%D0%B8%D1%81%D0%B0%D1%82%D0%B5%D0%BB%D1%8F%D1%85). В кратце, мы можем иметь несколько читателей в одно и то же время, но только одного писателя в каждый конкретный момент времени.

К счастью, GCD дает нам замечательные инструменты для этого случая. Нам доступны следующие инструменты для решения этой задачи:

 - dispatch_sync
 - dispatch_async
 - dispatch_barrier_sync
 - dispatch_barrier_async

Идеальным случаем будет:

 - чтения случаются синхронно и конкурентно
 - записи должны быть асинхронными и должны быть единственной задачей, которая работает с ссылкой

Барьеры GCD делают одну интересную вещь - они ожидают момента, когда очередь будет полностью пуста, перед тем как выполнить блок. С помощью барьеров для наших чтений мы ограничим доступ к словарю и обеспечим гарантию того, что никакая запись не будет проводиться одновременно с чтением или другой записью.

``` swift
class IdentityMap<T: Identifiable> {
  var dictionary = Dictionary<String, T>()
  let accessQueue = dispatch_queue_create("com.khanlou.isolation.queue", DISPATCH_QUEUE_CONCURRENT)

  func object(withID ID: String) -> T? {
    var result: T? = nil
    dispatch_sync(accessQueue) {
      result = dictionary[ID] as T?
    }
    return result
  }

  func addObject(object: T) {
    dispatch_barrier_async(accessQueue) {
      dictionary[object.ID] = object
    }
  }
}
```

Функция ```dispatch_sync``` отправит блок в нашу очередь изоляции и будет дожидаться окончания перед тем как вернуть выполнение. После этого, мы будем иметь результат нашего чтения. Если не делать вызов синхронным, тогда потребуется введение блока обратного вызова. Благодаря тому, что очередь конкурентная, такие синхронные чтения могут выполняться по несколько штук параллельно.

Функция ```dispatch_barrier_async``` отправит блок в очередь изоляции. Async означает что управление будет возвращено до того, как блок фактически выполниться (т.е. выполниться запись). Это хорошо для проиводительности, но имеет и обратную сторону медали - чтение сразу после записи может вернуть старые данные.

Барьерная часть ```dispatch_barrier_async``` означает, что блок не будет выполнен до тех пор, пока каждый блок в очереди не закончит свое выполнение. Другие блоки будут размещены после барьерного и выполняться после того, как выполнится барьерный.

## Post Scriptum

Фреймворк GCD содержит много низкоуровневых примитивов. С их помощью мы смогли построить высокоуровневые конструкции. Если вам известны какие-то другие высокоуровневые конструкции не упомянутые здесь, будут рад их услышать _(вы можете сделать PR тут или отправить напрямую автору. прим. переводчика)_