---
layout: post
title: Внедрение зависимостей (dependency injection) в Swift 5.1
tags:
 - swift
 - ios
 - di
 - dependency injection
 - property wrappers
---

Внедрение зависимостей очень горячая тема в любой области разработки, где мы пишем что-то более сложное чем Hello, World. Однако несмотря на казалось бы изученный вдоль и поперек вопрос, вариантов его решения вы можете на просторах интернета найти великое множество. И в каждом месте оно подается как единственно правильное. И как же выбрать? Предлагаю в этой статье немножко рассмотреть подходы, их плюсы и минусы, немножко поиграться со Swift'ом вообще и попробовать его новые фичи в виде @PropertyWrapper's.

Итак, постановка задачи у нас будет такая - у нас есть два класса BooksRenderer, который просто каким-то образом рисует книжки, и BooksProvider, который ему их поставляет. На Swift это будет выглядеть примерно так:

```swift
final class BooksRenderer {
    let provider: BooksProvider = ... /* за это троеточие и будет вестись основная борьба */

    func draw() {
        let books = provider.books
        /* тут каким-то образом рисуются книги из массива books */
    }
}

protocol BooksProvider {
    var books: [Book] { get }
}
```

Будем также считать что есть некая реализация протокола BooksProvider, например такая наивная

```swift
final class NaiveBooksProvider: BooksProvider {
    var books: [Book] {
        return [
            Book(title: "Dune", author: "Frank Herbert"),
            Book(title: "Lord of the Rings", author: "John R.R. Tolkien")
        ]
    }
}
```

Теперь наша задача каким-то образом доставить экземпляр класса NaiveBooksProvider в BooksRenderer. Самый наивный подход такой, создать экземлляр класса прямо на месте:

```swift
final class BooksRenderer {
    let provider: BooksProvider = NaiveBooksProvider()
}
```

Несмотря на то, что этот подход, каким бы наивным он не был, много где применяется, у него есть очевидные недостатки:

1. Мы можем захотеть как-то менять конкретный класс реализации, а он тут "прибит гвоздями"
2. Мы можем захотеть unit-протестировать класс BooksRenderer, и тогда вместо провайдера захотим вставить какой-нибудь мок
и т.д.

Нам надо что-то лучше. И много где предлагают хорошо известный паттер ServiceLocator. Если его применить, то выглядеть это будет примерно так:

```swift
final class ServiceLocator {
    static let booksProvider: BooksProvider = NaiveBooksProvider()
}

final class BooksRenderer {
    let provider: BooksProvider = ServiceLocator.booksProvider
}
```

Уже лучше, ответственность за выбор конкретного класса мы достали из BooksRenderer и наделили этой почетной обязанностью класс ServiceLocator. И мы даже можем сделать разные ServiceLocator'ы для основного приложения и для тестов, которые будут создавать разные BooksProvider'ы, однако:

1. Теперь 90% кода будет знать про класс ServiceLocator
2. Класс ServiceLocator будет огромным (кто там что говорил про Massive View Controller?, у нас тут Massive Service Locator)

Прежде чем пойти дальше, давайте сделаем некоторое лирическое отступление, разберемся в терминологии зависимостей. Вообще внедряемых зависимостей может быть два типа: прости хоспади singleton (но это не то что вы подумали) и prototype. "singleton" зависимости - это такие зависимости, которые сколько бы вы не внедряли в рамках одного конкретного модуля, это всегда будет один экземпляр. "prototype" же - даст на каждую точку внедрения новый экземпляр.

Поэтому если говорить про наш пример с ServiceLocator'ом, то например booksProvider - это singleton зависимость, а bookUpdateOperation - prototype:

```swift
final class ServiceLocator {
    static let booksProvider: BooksProvider = NaiveBooksProvider()

    static func bookUpdateOperation() -> Operation & BookUpdate {
        return NaiveBookUpdateOperation(...)
    }
}
```

Теперь давайте сделаем еще одно лирическое отступление, подчерпнутое мной когда я еще занимался "кровавым" enterprise и работал с [Srping Framework](http://spring.io). Хороший DI контейнер это такой контейнер, который не видно. Тут можно еще пофилософствовать и вспомнить [ТРИЗ](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=3&cad=rja&uact=8&ved=2ahUKEwjEo_P2mdblAhV8wsQBHaObD_EQFjACegQIDRAG&url=https%3A%2F%2Fru.wikipedia.org%2Fwiki%2F%25D0%25A2%25D0%25B5%25D0%25BE%25D1%2580%25D0%25B8%25D1%258F_%25D1%2580%25D0%25B5%25D1%2588%25D0%25B5%25D0%25BD%25D0%25B8%25D1%258F_%25D0%25B8%25D0%25B7%25D0%25BE%25D0%25B1%25D1%2580%25D0%25B5%25D1%2582%25D0%25B0%25D1%2582%25D0%25B5%25D0%25BB%25D1%258C%25D1%2581%25D0%25BA%25D0%25B8%25D1%2585_%25D0%25B7%25D0%25B0%25D0%25B4%25D0%25B0%25D1%2587&usg=AOvVaw0VcQvVNp9cBvIu5iqYojs9) с ее идеальным конечным результатом, который на наш DI'ный контекст перефразируется так: "хороший DI контейнер - это такой, которого нет, а зависимости внедряются".


Таким образом, можно сделать такой DI на базе initializer injection (оно лучше property injection, потому что компилятор в этом случае не даст вам озорничать, а с property injection легко забыть что-нибудь присвоить и грохнуться в рантайме):

```swift
final class AppContainer {
    let booksProvider: BooksProvider

    init(with appDelegate: AppDelegate) {
        booksProvider = NaiveBooksProvider(...)
        appDelegate.booksRenderer = BooksRenderer(provider: booksProvider)
    }
}

@UIApplicationMain
final class AppDelegate: UIResponder {
    let container: AppContainer
    var booksRenderer: BooksRenderer!

    func applicationDidFinishLauncherWithOptions(...) {
        container = AppContainer(with: self)
    }
}

final class BooksRenderer {
    let provider: BooksProvider

    init(provider: BooksProvider) {
        self.provider = provider
	}
}
```

Причем такой подход будет гарантировать вам проверку компилятором. И при этом про AppContainer будет знать только AppDelegate. Да, корневые зависимости в самом AppDelegate'е будут force unwrapped (что исть не хорошо, но лучше я не придумал), но эта вольность доступна только тут. 

prootype зависимости в таком подходе можно оформить либо в виде фабрики

```swift
final class SomeFactory {
    let superDep: SuperDep

    init(superDep: SuperDep) {
        self.superDep = superDep
    }

    func makeSomeDep(...) -> SomeDep {
        return SomeDep(superDep, ...)
    }
}
```

и потом внедрять это фабрику как singleton зависимость туда где нужно генерить prototype'ные, или в виде замыкания

```swift
typealias SomeFactory = (_ superDep: SuperDep, ...) -> SomeDep { SomeDep(superDep, ...) }
```

и также ее внедрять как singleton зависимость.

Но я обещал немножко Swift 5.1 и @PropertyWrapper, их легко сделать так (пусть будет наш пример с ServiceLocator'ом, хотя его можно легко модифицировать):

```swift
@propertyWrapper
public class Inject<Dep> {
    private let name: String?
    private var kept: Dep?

    public var wrappedValue: Dep {
        kept ?? {
            let dependency: Dep = ServiceLocator.resolve(for: name)
            kept = dependency
            return dependency
        }()
    }

    public convenience init() {
        self.init(nil)
    }
    
    public init(_ name: String?) {
        self.name = name
    }
}

final class ServiceLocator {
    static func register<T>(for name: String, resolver: @escaping () -> T) {
        // register
    }

    static func resolve<T>(for name: String?) -> T {
        // do some magic
    }
}

final class BooksRenderer {
    @Inject private var provider: BooksProvider
}
```

И вуаля! Однако несмотря на всю прелесть такой магии, есть проблема в месте где творится магия ("do some magic"). Если вы вдруг забыли сделать register, то упс, вы получаете рантайм крэш. И сделать это красиво с compile time check непонятно как, так как регистрация динамическая. 

Предлагаю подискутировать, оформляйте issues [тут](https://github.com/mrdekk/mrdekk.github.io)

P.S. 