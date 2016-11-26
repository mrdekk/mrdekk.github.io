---
layout: post
title: Поваренная книга ARC
tags:
 - arc
 - ios
 - objc
---

* Про ARC можно почитать тут: [Transitioning to ARC Release Notes](http://developer.apple.com/library/ios/#releasenotes/ObjectiveC/RN-TransitioningToARC/_index.html)
* Майк Эш (Mike Ash) написал хорошую статью в его Friday [Q&As](http://www.mikeash.com/pyblog/friday-qa-2011-09-30-automatic-reference-counting.html)
* Детальная техническая документация доступна на [сайте CLANG'а](http://clang.llvm.org/docs/AutomaticReferenceCounting.html) проекта LLVM.

Описанные в этой статье рецепты подразумевают использование iOS 5 и выше. В iOS 4 не доступны weak ссылки, которые являются очень важной вещью. Я понимаю, что в конце 2016 года уже даже iOS 7 официально не поддерживается, но вдруг найдутся такие читатели, которые вынуждены поддерживать очень старый код.

В статье в примерах используется Objective-C. Примеры на Swift'е не привожу - так как там это во-первых все несколько проще, во-вторых, кажется не составит труда отобразить эти правила на Swift, если это необходимо.

## Общее

* скалярные ivar свойства должны использовать **assign**

``` objc
@property (nonatomic, assign) int scalarInt;
@property (nonatomic, assign) CGFloat scalarFloat;
@property (nonatomic, assign) CGPoint scalarStruct;
```

* ссылочные ivar свойства, на которые необходимо иметь сильную ссылку или это дочерние свойства ("вниз" по иерархии) должны использовать **strong**

``` objc
@property (nonatomic, strong) id childObject;
```

* ссылочные ivar свойства на родителя ("вверх" по иерархии) должны использовать **weak**. Кроме того, при ссылках "вне" иерархии (например, делегаты) лучше использовать **weak** как наиболее безопасный.

``` objc
@property (nonatomic, weak) id parentObject;
@property (nonatomic, weak) NSObject <SomeDelegate> *delegate;
```

* в блоках лучше использовать **copy**

``` objc
@property (nonatomic, copy) SomeBlockType someBlock;
```

* В dealloc
  * удаляем обсерверы (observers)
  * отписываемся от уведомлений
  * для всех не weak свойств устанавливаем nil
  * инвалидируем все таймеры

* IBOutlet'ы должны быть **weak** за исключением корневых, которые должны быть **strong**.

## Bridging

Из документации

``` objc
id myId;
CFStringRef myCFRef;
NSString   *a = (__bridge NSString  *)myCFRef;          // тривиальное преобразование (noop)
CFStringRef b = (__bridge CFStringRef)myId;             // тривиальное преобразование (noop)
NSString   *c = (__bridge_transfer NSString  *)myCFRef; // -1 на CFRef
CFStringRef d = (__bridge_retained CFStringRef)myId;    // возвращает CFRef +1
```

Если переводить с непонятного на русский, то:

* **__bridge** - тривиальное преобразование (по отношению к управлению памятью) (noop)
* **__bridge_transfer** - необходимо для преобразования CF ссылок в объекты Objective-C. ARC уменьшит счетчик ссылок объекта CF, поэтому убедитесь, что CFRef имеет +1.
* **__bridge_retained** - необходимо для преобразования объектов Objective-C в CF ссылки. Эта операция даст вым CF ссылку с +1. Далее вы будете ответственны за вызов CFRelease у полученной CFRef ссылки где-нибудь в будущем.

## NSError

Вездесущий NSError с точки зрения ARC непростой. Типовое соглашение Cocoa гласит, что ошибки обычно передаются как out-параметры (косвенные указатели).

В ARC out-параметры по-умолчанию **__autoreleasing** и должны реализовываться так:

``` objc
- (BOOL)performWithError:(__autoreleasing NSError **)error
{
    // ... случилась ошибка ...
    if (error)
    {
        // записываем ее в out-параметр. ARC автоматически autorelease'ит
        *error = [[NSError alloc] initWithDomain:@""
                                            code:-1
                                        userInfo:nil];
        return NO;
    }
    else
    {
        return YES;
    }
}
```

При использовании out-параметров, вы как правило будет использовать __autoreleasing на ваших *error объектах примерно таким образом:

``` objc
NSError __autoreleasing *error = error;
BOOL OK = [myObject performOperationWithError:&error];
if (!OK)
{
    // обрабатываем ошибку.
}
```

Если __autoreleasing не указать, компилятор автоматически добавит для вас временный autoreleasing объект. Такое решение необходимо как компромисс для обеспечения обратной совместимости. В далекие времена iOS 5 существовали такие настройки компилятора, которые не добавляли автоматически __autoreleasing.

## @autoreleasepool

Используйте @autoreleasepool внутри циклов, когда:

* в нем очень много итераций
* в одной итерации создается большое количество временных объектов

``` objc
// если someArray большой
for (id obj in someArray)
{
    @autoreleasepool
    {
        // или вы создаете много
        // временных объектов тут
    }
}
```

Создание и уничтожение autorelease пулов через @autoreleasepool дешевле чем даром. Не волнуйтесь использовать их внутри цикла. Если же этих заверений недостаточно, можете воспользоваться профайлером.

## Blocks

В общем, блоки просто работают, однако есть несколько исключений.

Перед тем как добавлять блоки в коллекцию, необходимо предварительно их скопировать (copy).

``` objc
someBlockType someBlock = ^{NSLog(@"hi");};
[someArray addObject:[someBlock copy]];
```

retain-циклы особенно опасны в блоках. Вы могли видеть такой warning:

```
warning: capturing 'self' strongly in this
block is likely to lead to a retain cycle
[-Warc-retain-cycles,4]
```

``` objc
SomeBlockType someBlock = ^{
    [self someMethod];
};
```

Идея здесь такая. self имеет сильную ссылку на someBlock, someBlock "захватывает" и держит сильную ссылку на self. В следующем примере мы имеем дело с тем же retain циклом, но он уже менее очевиден:

``` objc
// блок захватит self сильной ссылкой
SomeBlockType someBlock = ^{
    BOOL isDone = _isDone;  // _isDone - это ivar в self
};
```

Более безопасно (правда малость многословно) это можно сделать с использованием weakSelf:

``` objc
__weak SomeObjectClass *weakSelf = self;

SomeBlockType someBlock = ^{
    SomeObjectClass *strongSelf = weakSelf;
    if (strongSelf == nil)
    {
        // Оригинальный self здесь не существует.
        // Игнорируйте, уведомите о или каким-то еще способ обработайте этот случай.
    }
    else
    {
        [strongSelf someMethod];
    }
};
```

Иногда, необходимо отдельно позаботиться о конкретных объектах, чтобы избежать retain-циклов: если someObject будет захвачен сильной ссылок в блоке, который использует someObject, вам потребуется weakSomeObject для решения проблемы.

```
SomeObjectClass *someObject = ...
__weak SomeObjectClass *weakSomeObject = someObject;

someObject.completionHandler = ^{
    SomeObjectClass *strongSomeObject = weakSomeObject;
    if (strongSomeObject == nil)
    {
        // Оригинальный someObject здесь не существует.
        // Игнорируйте, уведомите о или каким-то еще способ обработайте этот случай.
    }
    else
    {
        // отлично, ТЕПЕРЬ мы можем что-нибудь сделать с someObject
        [strongSomeObject someMethod];
    }
};
```

## Использование CG из NS или UI

``` objc
UIColor *redColor = [UIColor redColor];
CGColorRef redRef = redColor.CGColor;
// делаем что-нибудь с redRef.
```

Этот примерн имеет несколько малозаметных проблем. Когда вы создаете redRef, если redColor более нигде не используется, то он удаляется сразу после комментария.

Проблема здесь в том, что redColor "владеет" redRef, и когда redRef используется, redColor'а уже может не быть. Кроме того, такие проблемы редко проявляют себя в симуляторе. Более вероятно, что эта проблема "выстрелит" где-нибудь на устройстве, у которого осталось мало свободной памяти.

Существует несколько workaround'ов. Обычно, необходимо лишь убедиться, что redColor существует все время, пока вы используете redRef.

Самый простой способ добиться этого - использовать __autoreleasing.

``` objc
UIColor * __autoreleasing redColor = [UIColor redColor];
CGColorRef redRef = redColor.CGColor;
```

Теперь, redColor не будет уничтожен до тех пор в будущем, пока метод не вернет управление. Поэтому мы можем спокойно использовать redRef в рамках нашего метода.

Другой путь - получить +1 на redRef:

``` objc
UIColor *redColor = [UIColor redColor];
CGColorRef redRef = CFRetain(redColor.CGColor);
// используем redRef и когда закончим - удаляем его:
CFRelease(redRef)
```

Важно, что необходимо вызывать CFRetain() в той же строке, в которой вы получаете redColor.CGColor. redColor будет уничтожен сразу после последнего использования, следующий код работать **НЕ** будет:

``` objc
UIColor *redColor = [UIColor redColor];
CGColorRef redRef = redColor.CGColor; // redColor будет удален сразу после этого ...
CFRetain(redRef);  // Тут будет крэш ...
...
```

Есть еще один интересный момент относительно строки "Тут будет крэш". Как правило, крэш в этой строке в симуляторе не случится, но обязательно произойдет на реальном устройстве.

## Singletons

Связаны с ARC только косвенно. Существует огромное количество реализаций singleton'ов "на коленке" (некоторые из них даже переопределяют retain и release).

Вот правильная реализация singleton'а которую стоит использовать:

```
+ (MyClass *)singleton
{
    static MyClass *sharedMyClass = nil;
    static dispatch_once_t once = 0;
    dispatch_once(&once, ^{
        sharedMyClass = [[self alloc] init];
    });
    return sharedMyClass;
}
```

Теперь нам необходимо иметь возможность уничтожить такой singleton. Кроме того, если это UnitTest'ы, то лучше не использовать singleton'ы.

``` objc
// определяем статическую переменную вне метода singleton'а
static MyClass *__sharedMyClass = nil;

+ (MyClass *)singleton
{
    static dispatch_once_t once = 0;
    dispatch_once(&once, ^{
        __sharedMyClass = [[self alloc] init];
    });
    return __sharedMyClass;
}

// Только для использования библиотекой тестирования!!!
- (void)destroyAndRecreateSingleton
{
    __sharedMyClass = [[self alloc] init];
}
```
