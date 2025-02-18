---
layout: post
title: О сущностях больших и маленьких
tags:
 - architecture
 - api
 - patterns
 - SOLID
 - ISP
---

Сегодня поговорим о том, почему сущности вырастают. Вроде бы маленькие и понятные, через какое-то время они становятся большими и непонятными. Напоминает ситуацию, как будто вы приручили маленького котенка, а он потом вырос в саблезубого тигра. Почему так происходит и что делать? Постараюсь на простых примерах поразмышлять над этим.

## Почему?

Но начнем чуть издалека, рассмотрим такой пример. Нам надо включать лампочку. Оставим за скобками вечный вопрос сколько программистов для этого надо, и просто напишем код. 

```swift
class Lamp {
    private(set) var isOn: Bool = false

    func switchOn() {
        isOn = true
        // do the actual switch
    }

    func switchOff() {
        isOn = false
        // do the actual switch
    }
}
```

Вроде бы все отлично и все понятно (я намеренно опустил логику переключения, она тут вторична). Эта лампочка уходит в релиз и все работает, все довольны. 

Но это не конец истории, через, скажем, месяц, приходит продакт и говорит, а теперь нам нужны диммируемые лампочки (это такие у которых яркость можно измерять, очень полезно). И вроде бы отлично, диммируемые лампочки - это хороший продукт. Мы засучиваем рукава и смело в бой. Модифицируем наш класс

```swift
class Lamp {
    let isDimmable: Bool

    private(set) var isOn: Bool
    private(set) var dimValue: Double

    init(isDimmable: Bool, isOn: Bool = false, dimValue: Double = 0.0) {
        self.isDimmable = isDimmable
        self.isOn = isOn
        self.dimValue = dimValue
    }

    func switchOn() {
        isOn = true
        // do the actual switch
    }

    func switchOff() {
        isOn = false
        // do the actual switch
    }

    func dim(value: Double) {
        if (value > 0) {
            switchOn()
        }
        dimValue = value
        // do the actual dim
    }
}
```

и такой код даже будет работать. И вы даже быстро его напишите, и даже релиз случится. Но как мы видим, уже тут есть проблемы:

1. комбинаторика состояний isOn и dimValue. Я добавил некоторую проверку в функции dim(value:) но легко мог ее забыть. И тогда лампочка начала бы вести себя странно.
2. любая простая лампочка начинает знать про dimValue даже если она не dimmable.

прежде чем это все начинать фиксить, давайте еще усложним проблему. Продакты добавляют линейку устройств реле. Реле позволяет управлять не только светом, а например, чайником. Или светом но в выключателе. Или любым другим устройством которое можно включить в розетку. Отлично! Давайте чуть перепишем наш класс.

```swift
class SomethingSwitchable {
    let isDimmable: Bool
    let isRelay: Bool
    let switchCallback: ((_ isOn: Bool) -> Void)?

    private(set) var isOn: Bool
    private(set) var dimValue: Double

    init(isDimmable: Bool, isRelay: Bool, isOn: Bool = false, dimValue: Double = 0.0, switchCallback: ((_ isOn: Bool) -> Void)?) {
        self.isDimmable = isDimmable
        self.isRelay = isRelay
        self.switchCallback = switchCallback
        self.isOn = isOn
        self.dimValue = dimValue
    }

    func switchOn() {
        isOn = true
        // do the actual switch
        switchCallback?(isOn)
    }

    func switchOff() {
        isOn = false
        // do the actual switch
        switchCallback?(isOn)
    }

    func dim(value: Double) {
        if (value > 0) {
            switchOn()
        }
        dimValue = value
        // do the actual dim
    }
}

class Lamp: SomethingSwitchable {
    init(isDimmable: Bool, isOn: Bool = false, dimValue: Double = 0.0) {
        super.init(isDimmable: isDimmable, isRelay: false, isOn: isOn, dimValue: 0.0) { isOn in
            switch isOn {
            case false: // do the actual switch off
            case true: // do the actual swift on
            }
        }
    }
}

class Relay: SomethingSwitchable {
    init(isOn: Bool = false, switchCallback: ((Bool) -> Void)?) {
        super.init(isDimmable: false, isRelay: true, isOn: isOn, dimValue: 0.0, switchCallback: switchCallback)
    }
}
```

Я даже показал, как можно вынести общую логику в "базовый класс". Но по приведенному коду видно что мы пошли не туда. И наша маленькая приятная лампочка превратилась в страшное нечто.

## Как поправить?

Для начала давайте разберем мелкие правки которые можно было сделать, чтобы чуть спасти ситуацию. Эти техники могут быть полезны в целом взять на вооружение.

Я упоминал комбинаторику состояний isOn и dimValue. Пока опустим то, что лампочка и диммируемая лампочка могут быть разными сущностями, просто попробуем исправить ситуацию.

Для этого, обозначим, что isOn и dimValue не являются полностью независимыми, в данном примере dimValue имеет смысл только тогда, когда isOn = true. И, как гласит принцип "явное лучше неявного", сделаем это явно и перепишем код так:

```swift
class Lamp {
    enum LampState {
        case off
        case on(value: Double)
    }

    let isDimmable: Bool

    private(set) var state: LampState

    init(isDimmable: Bool, state: LampState) {
        self.isDimmable = isDimmable
        self.state = state
    }

    func switchOn() {
        state = .on(value: 1.0)
        // do the actual switch
    }

    func switchOff() {
        state = .off
        // do the actual switch
    }

    func dim(value: Double) {
        state = .on(value: value)
        // do the actual dim
    }
}
```

За счет явного введение LampState мы отразили любому читающему наш код, как работает состояние нашей лампочки. И даже код в dim(value:) стал более понятным - мы явно включим лампочку и включим ее в нужное состояние сразу (она не будем промаргивать через состояние 1.0).

Также можно явно заметить, что тип Double по области значений явно шире, чем нам надо. Явно диммирование управляется через диапазон 0-1. И это тоже можно явно отразить, опять же, явное лучше неявного.

```swift
struct DimValue {
    private static let minimum = 0.0
    private static let maximum = 1.0
    private(set) var value: Double

    init(value: Double) {
        self.value = Self.clamp(value, min: Self.minimum, max: Self.maximum)
    }

    private static func clamp(_ value: Double, min: Double, max: Double) -> Double {
        return Swift.max(min, Swift.min(value, max))
    }

    mutating func setValue(_ newValue: Double) {
        value = Self.clamp(newValue, min: Self.minimum, max: Self.maximum)
    }

    public static let max = DimValue(value: Self.maximum)
}

class Lamp {
    enum LampState {
        case off
        case on(value: DimValue)
    }

    let isDimmable: Bool

    private(set) var state: LampState

    init(isDimmable: Bool, state: LampState) {
        self.isDimmable = isDimmable
        self.state = state
    }

    func switchOn() {
        state = .on(value: .max)
        // do the actual switch
    }

    func switchOff() {
        state = .off
        // do the actual switch
    }

    func dim(value: DimValue) {
        state = .on(value: value)
        // do the actual dim
    }
}
```

Таким образом мы увидим несоответствие кода сразу же, да еще и компилятором проверим. 

Меня можно укорить в том, что я на самом деле увеличил объем кода по сравнению с моей же реализацией диммируемой лампочки. Да, кода стало чуть больше, но он стал более явно выражать то, что он делает, без предположений существующих только в головах.

Теперь давайте рассмотрим более фундаментальную проблему - у нас все лампочки диммируемые. Даже те, которые нет. И на самом деле поле isDimmable не сильно помогает решить проблему, потому что как вы можете заметить, оно устанавливается в конструкторе, но нигде не используется - про него забыли.

И попутно непонятно, а как теперь быть лампочкам недиммируемым? Игнорировать значение диммера?

Давайте начнем приводить код в чувство, попутно учитывая будущее когда у нас появится реле.

Формально - у нас есть три сущности:

- Что-то что может включаться
- Что-то что может диммироваться
- Что-то что может включать других (ака реле)

На самом деле наш код базовой реализации класса SomethingSwitchable дает еще и четвертый вариант, что-то вроде "диммируемого реле", которое на самом деле может быть регулятором скорости/яркости.

Попутно вспомним [Interface Segregation Principle](https://ru.wikipedia.org/wiki/Принцип_разделения_интерфейса) и заведем такие сущности.

Для начала что-то, что может переключаться

```swift
protocol Switchable {
    var isOn: Bool { get }

    func switchOn()
    func switchOff()
}
```

Это может быть лампочка, может быть реле. Далее, что-то что можно диммировать

```swift
protocol Dimmable {
    var dimValue: DimValue { get }

    func dim(value: DimValue)
}
```

И наконец, что-то, что может управлять другими

```swift
protocol Controling {
    func setSwitchCallback(_ switchCallback: @escaping (_ isOn: Bool) -> Void)
}
```

Теперь у нас есть базовые кубики, из которых мы можем строить что-то более сложное.

Простую лампочку сделаем так

```swift
class YablochkovLamp: Switchable {
    private(set) var isOn: Bool = false

    func switchOn() {
        isOn = true
        // do the on logic
    }

    func switchOff() {
        isOn = false
        // do the off logic
    }
}
```

Заметьте, она может включаться/выключаться, ее состояние простое. Оно не искажается состоянием диммируемой лампочки и может использовать простое булево значение (вопросы thread-safety пока опустим).

Диммируемая лампочка будет такой:

```swift
class DimmableLamp {
    private enum State {
        case off
        case on(value: DimValue)
    }

    private var state: State = .off
}

extension DimmableLamp: Switchable {
    var isOn: Bool {
        switch state {
        case .off: return false
        case .on: return true
        }
    }

    func switchOn() {
        state = .on(value: .max)
        // do the logic
    }

    func switchOff() {
        state = .off
        // do the logic
    }
}

extension DimmableLamp: Dimmable {
    var dimValue: DimValue {
        switch state {
        case .off: return .min
        case let .on(value): return value
        }
    }

    func dim(value: DimValue) {
        state = .on(value: value)
        // do the logic
    }
}
```

Тут отметим, что на уровне типов можно явно отметить, что эта лампочка диммируемая, теперь сложно об этом забыть. Кроме того, я показал, что с помощью extension'ов можно расширить логику после создания типа (ретроактивно). И в довесок спрятал от внешнего наблюдателя внутреннее состояние лампочки. 

Ну и теперь реле:

```swift
class Relay {
    private(set) var isOn: Bool = false
    private var switchCallback: ((_ isOn: Bool) -> Void)?
}

extension Relay: Switchable {
    func switchOn() {
        isOn = true
        switchCallback?(isOn)
    }

    func switchOff() {
        isOn = false
        switchCallback?(isOn)
    }
}

extension Relay: Controling {
    func setSwitchCallback(_ switchCallback: @escaping (Bool) -> Void) {
        self.switchCallback = switchCallback
    }
}
```

Как видим состояние реле проще состояние диммируемой лампочки (не надо явно учитывать сайд эффект и понятно), но при этом функциональность реле реализована так, как надо.

Такая детализация позволяет:

- Строить сущности из кубиков (я не упоминул еще о дефолтных реализация в протоколах, что тоже улучшает ситуацию)
- Уменьшать комбинаторный взрыв за счет разделения и в целом упрощать реализацию сущностей
- Заменять конкретные классы в процессе развития кода на другие, удовлетворяющие контракту.

Про третий пункт отдельно. Например, лампочка у нас "уехала" на другой хост в ip сети, и чтобы скрыть от управляющего кода этот факт и не делать его сложнее чем надо, мы можем изобрести такую связку проксей:

```swift
class SwitchableProxyClient: Switchable {
    // private let network: NetworkClient

    var isOn: Bool {
        // network.proxyIsOn
        return false
    }

    func switchOn() {
        // network.proxySwitchOn()
    }

    func switchOff() {
        // network.proxySwitchOff()
    }
}

class SwitchableProxyServer {
    private let switchable: Switchable
    // private let networkServer: NetworkServer

    init(switchable: Switchable) {
        self.switchable = switchable
        // networkServer.switchOn = {
        //   switchable.switchOn()
        // }
        // networkServer.switchOff = {
        //   switchable.switchOff()
        // }
        // networkServer.isOn = {
        //   switchable.isOn
        // }
    }
}
```

и благодаря им, управляющий код не будет знать, что лампочка "уехала", а в проксе можно реализовать гарантии надежности для всех, кто может быть Switchable.

## А мораль?

А мораль в том, что, когда вы пишите или что еще более важно модифицируете какую-то сущность, хорошо бы подумать о том, как ваша модификация сказывается на том, чем сущность является. Не превращаете ли вы ее в франкенштейна и может быть ее стоит подробить на концепции и эти концепции использовать.

В конце концов, то как вы обозначили контракт вашей сущности влияет на то, как ее используют. И как понимают в целом, что это.


