---
layout: post
title: Заметки о Dependency Injection
tags:
 - swift
 - ios
 - kotlin
 - android
 - di
 - dependency injection
---

Тема внедрение зависимостей одна из краеугольных в целом при любой разработке. И, благодаря этому, одна из наиболее дискуссионных, порой доходящаяя до уровня "священных войн" между апологетами разных подходов. В этой статье постараюсь изложить свое видение подходов к решению проблем.

## Преамбула

Для того, чтобы не превращать эту статью в рассказ "от сотворения мира", очень рекомендую посмотреть [это видео](https://www.youtube.com/live/GA1NY-RKkhs?si=HBUhtDkeJZYBgfhX&t=4399) (с указанного таймкода, лекция там в целом про архитектуру, но нас в рамках этой статьи будут интересовать выкладки про DI).

## Постановка проблемы

### Базовая задача

Итак, мы стараемся придумать решение следующей проблемы

{% tabs task %}

{% tab task Swift %}

```swift
protocol SomeBookService { /* ... */ }

class BookProcessor {
    let service: SomeBookService = SomeBookServiceImpl()
}
```

{% endtab %}

{% tab task Kotlin %}

```kotlin
interface SomeBookService { /* ... */ }

class BookProcessor(
    private val service: SomeBookService = SomeBookServiceImpl()
)
```

{% endtab %}

{% endtabs %}

Что мы хотим от хорошего решения?

- **Через протокол/интерфейс.** Использующий зависимость класс не должен знать о конкретной реализации и должен иметь работать с любой реализацией правильно реализующей контракт (объявленный в протоколе/интерфейсе).
- **Узкий контракт.** Реализация, которую мы получаем в виде зависимости должена иметь минимально необходимый контракт. Наша сущность не должна видеть лишнего
- **Необходимость и достаточность.** Поставляемые зафисимости поставляются в необходимом и достаточном объеме, не требуется каких-то специальных приседаний для того, чтобы получить что-то еще (это как правило относится к запрету использовать внутри синглтоны).
- **Реализация DI для логического кода "невидима".** Мы не должны видеть фрагменты порождающего кода где-либо (кроме некоторых исключений).

### Платформенные особенности

Мы рассматриваем мобильные платформы (в целом можно рассматривать и серверные, но там как правило все проще в этом плане).

#### iOS

Как правило, все сущности iOS позволяют нормально реализовать constructor injection паттерн без необходимости построения специальных решений. Иногда требуются специальные действия для создания циклических зависимостей, но они легко решаются способами, описанными ниже.

Единственный объект, который система создает сама - это UIApplication (и applicationDidFinishLaunchingWithOptions) или SwiftUI объект обозначенный как @main. Но эти объекты будем считать точкой входа и растить графы от них.

#### Android

У Android также как и в iOS есть главный объект создаваемый системой - Application, но есть и важное отличие - в Android есть объекты, которые фреймворком могут быть убиты и пересозданы через тривиальный конструктор, такие как Activity, Fragment, View и тд. И есть общепринятая практика использовать для иньекции зависимостей в такие объекты через паттерн Service Locator. Service Locator считаем антипаттерном (как минимум он противоречит принципам хорошего решения, упомянутым выше).

Поэтому для решение проблемы спец сущностей (которые могут быть пересозданы), в Android надо предусмотреть дополнительные средства.

### O Service Locator'е

[Service Locator](https://ru.wikipedia.org/wiki/Локатор_служб) это такой паттерн проектирования, который, упрощенно говоря, предоставляет единую точку, через которую можно запросить разные зависимости. В рамках создания библиотек для DI он обычно соседствует с паттерном [Singleton](https://ru.wikipedia.org/wiki/Одиночка_(шаблон_проектирования)) предоставляя публично известный разделяемый объект, из которого можно запросить практически все что угодно.

Я считаю его антипаттерном в применении к задачам DI (у него есть другая применимость, которая норм).

Но чтобы не быть голословным, давайте рассмотрим поставленные требования к хорошему решению:

- **Через протокол/интерфейс** - эту задачу в целом можно решить, отдавая из публичного singleton'а сервис локатора интерфейсы
- **Узкий контракт** - так как точка эта общеизвестная, то надо отдавать зависимость целиком, что нарушает принцип сужения контракта. Можно из публичного singleton'а отдавать одну реализацию под набором интерфейсов, но тогда у нас будет очень сложно выглядеть общий контракт такого объекта, сложно будет что-то в нем найти.
- **Необходимость и достаточность** - мы показываем всевозмоюжные интерфейсы или даже реализации, что любой клиент может видеть все приложение, что явно нарушает это требование
- **"Невидимость"** - требование явно нарушается, так как из любой точки приложения можно публичный singleton локатора

Таким образом Service Locator использовать не стоит, поэтому будем строить решение на базе концепции контейнера.


### О библиотечных решениях

В мире написано огромное количество библиотек, заявляющих что так или иначе решают проблему внедрения зависимостей. Однако большая часть из них основана на паттерне Service Locator. Справедливости ради стоит сказать, что наиболее популярная библиотека Dagger 2 для Android пытается использовать концепцию контейнера, и в Sevice Locator его чаще всего превращают при использовании.

## Идея решения проблемы

Как уже было сказано выше - будем использовать концепцию контейнера. 

Контейнер - это такая сущность, которыя

- Создает нужные объекты и управляет их временем жизни
- Настраивает связи между ними
- Невидима для самих объектов

Каждая конкретная логическая сущность (кроме самих контейнеров) заявляет необходимость зависимостей (через constructor или property injection) и все. Никоим образом логическая сущность не получает доступа не к типу контейнера, ни к его инстансу (кроме как через Factory интерфейсы там где нужна prototype зависимость).

Отступление про нейминг. Однажды я увидел, как в коде контейнеры называют графами (Graph) и мне эта идея так понравилась, что далее буду называть типы контейнеров графами, можно в рамках этой заметки считать эти термины эквивалентными для задач DI.

Таким образом простейший контейнер может выглядеть так


{% tabs container %}

{% tab container Swift %}

```swift
final class SomeGraph {

    // 'singleton' entities
    private let dep1: Dep1
    private let dep2: Dep2
    private let dep3: Dep3

    // other graphs
    private let subGraph: SomeSubGraph

    init(
        someGraphDependencies: SomeGraphDependencies,
        someSpecificDependency: SomeSpecificDependency,
        configuration: SomeGraphConfiguration,
        ...
    ) {
        self.dep1 = Dep1(
            /* ... */,
            makeSome: {
                return self.makeSomePrototypeDep(val: configuration.val)
            }
        )
        self.dep2 = Dep2(/* ... */, useVal: configuration.useVal)
        self.dep3 = Dep3(dep1: Dep1, dep2: Dep2)
        // ...
        self.subGraph = SomeSubGraph(
            /* ... */
        )
    }

    deinit {
        // тут некоторая логика очистки сущностей, которые того требуют
    }

    // 'prototype' entities
    private func makeSomePrototypeDep(val: Val1) -> Dep4 {
        // ...
        return Dep4(
            val: val
        )
    }
}
```

{% endtab %}

{% tab container Kotlin %}

```kotlin
class SomeGraph(
    someGraphDependencies: SomeGraphDependencies,
    someSpecificDependency: SomeSpecificDependency,
    private val configuration: SomeGraphConfiguration,
    ...
) {

    // 'singleton' entities
    private val dep1: Dep1
    private val dep2: Dep2
    private val dep3: Dep3

    // other graphs
    private val subGraph: SomeSubGraph

    init {
        this.dep1 = Dep1(
            /* ... */,
            makeSome = {
                return makeSomePrototypeDep(val = configuration.val)
            }
        )
        this.dep2 = Dep2(/* ... */, useVal = configuration.useVal)
        this.dep3 = Dep3(dep1 = Dep1, dep2 = Dep2)
        // ...
        this.subGraph = SomeSubGraph(
            /* ... */
        )
    }

    fun cleanup() {
        // в Java/Kotlin нет полноценных деструкторов, поэтому cleanup методы
        // необходимо будет вызывать руками
        // тут некоторая логика очистки сущностей, которые того требуют
    }

    // 'prototype' entities
    private fun makeSomePrototypeDep(val: Val1): Dep4 {
        // ...
        return Dep4(
            val = val
        )
    }
}
```

{% endtab %}

{% endtabs %}

И все - собирайте нужную конструкцию из иерархических графов. Когда какой-то набор сущностей станет ненужным - зануляете граф и все очищается (в Android не забываем звать cleanup). 

PROFIT? не совсем, есть тонкости

### iOS

В iOS как правило все проходит без проблем. Мы создаем корневой граф-контейнер в applicationWill/DidLaunchingWithOptions и передаем его целиком или частями в дальнейшие сущности, или создаем его в корневом объекте помеченном @main и также передаем целиком или частями дальше. Главное не забывать о сужении интерфейсов и принципе достаточной необходимости.

### Android

Для бизнесовых сущностей достаточно также в рамках класса Application создать корневой граф и действовать аналогично iOS, но, как я уже выше упоминал, есть проблемы с андроидными сущностями. Поэтому для них нужно специальное решение.

Заведем пару контрактов

```kotlin
// любая сущность, в которую наш DI сможет что-то инжектить
interface Injectable

// контракт сущности контейнера, который сможет что-то куда-то инжектить
interface Injector {
    fun inject(into: Injectable) // можно опционально return Result
}
```

Чуть выше в разделе про Service Locator я уже говорил, что основная проблема в нем в том, что 

- его shared instance известен публично, и может быть использован скрыто. С этим увы ничего не поделать, андроидные компоненты устроены так, что нам придется пойти на открытие какого-то shared instance. Для activity/fragment есть лазейка, о ней чуть позже, но в общем итоге не поделать ничего.
- из него можно достать что угодно, эту проблему будем решать.

Также важно, что для Android компонентов инъекция будет асинхронной относительно вызова конструктора объектов, поэтому полноценную compile time проверку мы сделать не сможем. Ограничимся сокрытием лишней информации.

Теперь нам нужно предусмотреть сущность, которую мы будем видеть через shared instance, но не моч из нее ничего достать

```kotlin
class SomeGraph private constructor(
    private val dependency: SomeDependnecy,
    // other deps
): Injector {
    override fun inject(target: Injectable) = when (target) {
        is SomeKnownFragment -> {
            target.dependency = dependency
        }
        else -> {
            // report error in some kind
        }
    }

    companion object {
        var sharedInstance: SomeGraph? = null
            private set

        fun setup(
            dependency: SomeDependency
        ) {
            synchronized(this) {
                if (sharedInstance != null) {
                    return
                }
                sharedInstance = SomeGraph(
                    dependency = dependency
                )
            }
        }
    }
}
```

И теперь в условном фрагменте мы можем написать так

```kotlin
class SomeKnownFragment: Fragment(), Injectable {

    lateinit var dependency: Dependency? = null

    override fun onAttach(context: Context) {
        super.onAttach(context)
        SomeGraph.sharedInstance?.inject(this)
    }
```

Как я уже сказал, есть некоторая проблема в том, что связывание будет проверено только в runtime, а правильнее было бы сделать в compile time, но архитектура компонентов Android'а тут этому препятствует.

К слову такой подход хорошо подходит для библиотек, этот SomeGraph может быть объектов библиотеки, которую надо проинициализировать и потом сама библиотека будет ее использовать. Для Activity/Fragment и тд можем сделать лучше, для этого нам потребуется еще немножко сахара (покажу на примере Activity, для фрагментов можно сделать аналогично)

```kotlin
fun Activity.inject() {
    val thisAsInjectable = this as? Injectable ?: throw InjectException("activity not injectable")
    val application = application ?: throw InjectException("application isn't set to activity")
    val injector = application as? Injector ?: throw InjectException("application is not an injector")
    injector.inject(thisAsInjectable)
}
```

теперь надо класс приложения разметить соответствующим образом

```kotlin
class YourApp: Application(), Injector {

    private lateinit var rootGraph: RootGraph

    override fun onCreate() {
        super.onCreate()
        rootGraph = RootGraph(this)
    }

    override fun inject(target: Injectable) {
        if (!this::graph.isInitialized) {
            error("Application isn't properly initialized yet")
        }
        graph.inject(target)
    }
}
```

корневой граф будет выглядеть примерно так

```kotlin
class RootGraph(
    applicationContext: Context
): Injector {

    // private val yourdeps = ...

    init {
        // тут инициализация нужных компонентов
    }

    override fun inject(target: Injectable) {
        when (target) {
            is MainActivity -> {
                target.depepdency = ...
            }
            // можно делегировать что-то субграфам
        }
    }
}
```

И в самой активити будет просто

```kotlin
class MainActivity : Activity(), Injectable {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        inject()

        // остальная инициализация
    }
}
```

Никаких синглетонов и никакого раскрытия лишних зависимостей - PROFIT.

P.S. Если придумаете как решить эту проблему с аналогичными гарантиями да еще и в compile time буду благодарен