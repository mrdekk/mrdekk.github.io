---
layout: post
title: Сравнение Swift vs Kotlin 
tags:
 - swift
 - ios
 - kotlin
 - android
---

Небольшая табличка сравнения кода на Swift и кода на Kotlin для справки. Этакий cheet sheet.

### Переменные и константы

Swift

```swift
let a: Int = 10
var b: Int = 20
```

Kotlin

```kotlin
val a: Int = 10
var b: Int = 20
```

#### Optionals

Swift

```swift
let some: Something? = nil
var some: Something? = Something(text: "Hello")

// optional chaining
let greeting = some?.greet()

// elvis
let value = some?.value ?? 30

// optional unwraping
if let some = some {
    print(some) // some is not optional
}

// force unwraping
let forced = some!
```

Kotlin

```kotlin
val some: Something? = nil
var some: Something? = Something("Hello")

// optional chaining
val greeting = some?.greet()

// elvis
val value = some?.value ?: 30

// optional unwraping
some?.let { some -> // it if name is not provided
    print(some) // some is not optional
}
if (some != null) {
    print(some) // some is smart casted and not optional
}

// force unwraping
val forced = some!!
```

### Форматирование кода

#### Скобки (круглые и фигурные)

Swift

* Круглые - не обязательны
* Фигурные - обязательны

```swift
let str = "Hello, Swift"

func increse(_ value: Int) -> Int {
    return value + 1
}

func statements() {
    var i = 0
    while i < 10 {
        i = increase(i)
        if str == "something" {
            print(str)
        }
    }
}
```

Kotlin

* Круглые - обязательны
* Фигурные - не обязательны

```kotlin
val str = "Hello, Kotlin"

fun increase(value: Int): Int = value + 1

fun statements() {
    var i = 0
    while (i < 10) i = increase(i)
    if (str == "something") print(str)
}
```

### Управляющие конструкции

#### Pattern Matching

Swift

```swift
let number = 42
switch number {
    case 0...7, 8, 9: print("1 digit")
    case 10: print("2 digits")
    case 11...99: print("2 digits")
    case 100...999: print("3 digits")
    default: print("4 or more digits")
}
```

Kotlin

```kotlin
val number = 42
when (number) {
    in 0..7, 8, 9 -> println("1 digit")
    10 -> println("2 digits")
    in 11..99 -> println("2 digits")
    in 100..999 -> println("3 digits")
    else -> println("4 or more digits")
}
```

#### if, when = expressions, not statements (!)

Swift

* Не применимо

Kotlin

```kotlin
val test = if (true) "Test" else "False"

val state = State.Off
fun decide() = when(state) {
    State.Off -> "Off"
    State.On -> "On"
}
val decision = decide()
```

### Типы

#### Любой тип

Swift

```swift
let a: Any = "Hello"
let b: AnyObject = SomeClass()
```

Kotlin

```kotlin
val a: Any = "Hello"
// no AnyObject yet
```

#### Строковая интерполяция

Swift

```swift
let str = "Hello \(nickname)"
let str2 = "Hello \(user.nickname)"
```

Kotlin

```kotlin
val str = "Hello $nickname"
val str2 = "Hello ${user.nickname}"
```

#### Интервалы (Ranges)

Swift

```swift
let rng1 = 0...10
let rng2 = 0..<10
```

Kotlin

```kotlin
val rng1 = 0..10
// no rng2
```

#### Коллекции

Swift

```swift
let stringArray = [String]()
// no stringList
let stringFloatMap = [String: Float]()
let stringSet = Set<String>()

var countries: [String] = ["Switzerland", "France", "Germany"]
countries.append("Italy")
countries.remove("France")

var jobs: [String: String] = [
    "Roger": "CEO",
    "Martin": "CTO"
]
jobs["Adrian"] = "Writer"
```

Kotlin

* Нельзя использовать [] для инициализации массива, используется arrayOf
* в arrayOf добавлять и удалять элементы нельзя, можно только их менять

```kotlin
val stringArray = arrayOf<String>()
val stringList = listOf<String>()
val stringFloatMap = mapOf<String, Float>()
val stringSet = setOf<String>()

val countries = mutableListOf<String>("Switzerland", "France", "Germany")
countries.add("Italy")
countries.remove("France")

val jobs = mutableMapOf(
    "Roger" to "CEO",
    "Martin" to "CTO"
)
jobs["Adrian"] = "Writer"
```

#### Итерирование коллекций

Swift

```swift
for str in stringArray {}
for (index, str) in stringArray.enumerated() {}
// no for str in stringList
for (str, num) in stringFloatMap {}
for str in stringSet {}
```

Kotlin

```kotlin
for (str in stringArray) {}
for (str in stringList) {}
for ((str, num) in stringFloatMap) {}
for (str in stringSet) {}
```

### Процедурное программирование

#### Процедуры и функции

Swift

```swift
func method1(input: String) -> Int {
    return input.count
}

// no method2

func method3<T>(input: T) -> String {
    return String(describing: input)
}
```

Kotlin

```kotlin
fun method1(input: String): Int {
    return input.length
}

fun method2(input: String) = input.length

fun <T>method3(input: T) = input.toString()
```

### ООП

#### Интерфейсы

Swift

```swift
protocol Person {
    var name: String { get set }
    
    func greet() -> String
    
    func showMoreInformation()
}

extension Person {
	func greet() -> String {
	    return "Hello! I am \(self)"
	}
}
```

Kotlin

```kotlin
interface Person {
    
    var name: String
        get set

    
    fun greet() = "Hello! I am $this"

    
    fun showMoreInformation()
}
```

#### Конструкторы

Swift

```swift
class Manager: Person {
    var backingName: String
    var staff: [Person]
    var state: State
    let isActive: Bool
    init(backingName = "": String, staff: [Person] = [], state: State = .off) {
        self.backingName = backingName
        self.staff = staff
        self.state = state
        self.isActive = true
    }
```

Kotlin


```kotlin
class Manager(private var backingName: String = "",
              private var staff: MutableList<Person> = mutableListOf<Person>(),
              var state: State = State.Off) : Person {
    private val isActive: Boolean
    init {
        isActive = true
    }
}
```

#### Data Classes (PONSO/POSS vs POJO)

Swift

```swift
struct Employee {
    let backingName: String
    let age: Int
    init(backingName: String = "", age: Int = 30) {
        self.backingName = backingName
        self.age = age
    }
}
```

Kotlin

```kotlin
data class Employee(private var backingName: String = "",
                    var age: Int = 30) : Person {
```

#### Инстанцирование объектов

Swift

```swift
let person = Employee(
    name: "Olivia", 
    age: 45
)
```

Kotlin

```kotlin
val person1 = Employee("Olivia", 45) 

val person2 = Employee().apply { 
    name = "Thomas"
    age = 56
}
```

#### Расширения классов

Swift

```swift
extension Double {
    var fahrenheit: Double {
	    (self * 9 / 5) + 32
    }
    var celsius: Double {
       (self - 32) * 5 / 9
    }
}

let temperature = Double(32.0)
let fahrenheit = temperature.fahrenheit
let celsius = fahrenheit.celsius
print("\(temperature) degrees Celsius is \(fahrenheit) degrees Fahrenheit")

```

Kotlin

```kotlin
val Double.fahrenheit: Double get() = (this * 9 / 5) + 32
val Double.celsius: Double get() = (this - 32) * 5 / 9

val temperature: Double = 32.0
val fahrenheit = temperature.fahrenheit
val celsius = fahrenheit.celsius
println("$temperature degrees Celsius is $fahrenheit degrees Fahrenheit")
```

#### Простые объекты и Singleton'ы

Swift

```swift
enum Constants {
    static let PI = 3.14
    static let ANSWER = 42
    
    static func name() -> String {
        return "Math constants"
    }
}
```

Kotlin

```kotlin
object Constants {
    val PI = 3.14
    val ANSWER = 42

    fun name() = "Math contstants"
}
```

#### Объекты-компаньоны

Swift

* Просто используйте static (class) члены

Kotlin

* В Kotlin нет статических членов

```kotlin
companion object OptionalName {
    val MAXIMUM_EMPLOYEE_COUNT = 10

    fun managerFactory() = Manager("Maria Hill")
}
```

#### Перегрузка операторов

Swift

* Можно делать свои операторы (например квадратный корень)

```swift
func + (lhs: Person, rhs: Person) -> Team {
    return Team(lhs, rhs)
}

let team = manager + person
```

Kotlin


```kotlin
operator fun plus(person: Person): Team {
    return Team(this, person)
}

val team = manager + person
```

#### Инфиксные методы

Swift

* Не применимо

Kotlin

```kotlin
infix fun addPerson(person: Person) {
    if (staff.count() < MAXIMUM_EMPLOYEE_COUNT) {
        staff.add(person)
    }
    else {
        throw Exception("Cannot add more staff members")
    }
}

manager addPerson person
```

#### Перечисления

Swift

```swift
enum State {
    case on
    case off
    
    var desc: String { ... }
    func notify() { ... }
}
```

Kotlin

```kotlin
enum class State {
    On, Off
    
    var desc: String { ... }
    func notify() = ...
}
```