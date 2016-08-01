---
layout: post
title: Крик души о мапперах API в модель
tags:
 - xcode
 - ios
 - objc
 - swift
 - api
 - architecture
---

В последнее время очень часто приходится сталкиваться вот с каким вопросом. Мобильные приложения должны работать с бэкендом. Как правило, модель данных API бэкенда не совсем сходится с моделью данных на самом приложении, и даже если сходится 1 в 1, библиотеки сетевых запросов возвращают объекты класса словарь (как бы он не назывался - Map<?, ?>, NSDictionary, ...) и возникает необходимость конвертации вида

``` swift
func map(json: [String: AnyObject]) -> SomethingModel {
    var model = SomethingModel()    
    model.some = json["some"]
    model.another = json["another"]
    model.rest = json["rest"]
    ...
    return model
}

func reverse(obj: SomethingModel) -> [String: AnyObject] {
    var res = [String: AnyObject]()
    json["some"] = model.some
    json["another"] = model.another
    json["rest"] = model.rest
    ...
    return model
}
```

Как видно, это большей частью простые императивные преобразования. Иногда конечно возникает необходимость дополнительной проверки (например на nil) или кастомной конвертации (NSDate -> String). Однако для этого можно написать простые хелперы и код будет выглядить как-нибудь так:

``` swift
model.nillable = Conv.nillable(json, "nillable")
model.date = Conv.date(json, "date")
```

Что же есть на практике. А на практике каждый уважающий себя разработчик стремится для ``` model.some = json["some"] ``` написать кастомную обертку, и что особенно важно, декларативно. То есть вместо упомянутой строчки мы получаем нечто вроде:

``` swift

class SomethingModel {
    static func jsonMap() -> [String: AnyObject] {
        let res = [String: AnyObject]()
        res["some"] = StringMapping(path: "some")
        res["another"] = NumberMapping(path: "another", default: -1)
        res["rest"] = DateMapping(path: "rest", NSDate())
        ...
        return res
    }
}

class DeclarativeMapper<ModelClass> {
    func fromJson(json: [String: AnyObject]) -> ModelClass {
        let model = ModelClass()
        let mapping = ModelClass.jsonMap()
        for (field, mapper) in mapping.enumerate() {
            model.setValue(field: field, mapper.map(json, mapper.path))
        }
        return model
    }
}

let json: [String: AnyObject] = ...
let declarativeMapper = DeclarativeMapper()
let model = declarativeMapper.fromJson(json)
```

У меня есть главный вопрос - а зачем все это делается? Ради декларативности - императивный код проще  и сосредоточен в одном месте - в коде запроса, в точке наиболее близкой к точке изменения контракта. Декларативный код размазывает маппинги по нескольким местам и вносит дополнительный код (мапперы), которые могут сломаться. Кроме того, декларативный фреймворки делают некоторые предположения относительно того, как работает бэкенд и если вдруг бэкенд работает не совсем так - у фреймворка возникают проблемы.

Может ли кто-нибудь привести примеры, в которой вся эта декларактивная машинерия оправдана?
