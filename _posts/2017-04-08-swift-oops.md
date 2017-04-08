---
layout: post
title: Неожиданные проблемы при написании iOS приложений на Swift
tags:
 - swift
 - ios
 - problems
---

Как оказалось, не все так просто в ObjC-Swift Interoperability. Иногда возникают проблемы, которые очень сложно диагностировать, и поэтому сложно починить, но которые при этом оказываются достаточно простыми. В этой статье такие проблемы опишу, список пополняется и вы можете в этом поучаствовать.

### Swift и CABasicAnimation

Если коротко - CABasicAnimation не работает на Swift'овых классах, например, если хочется сделать примерно такое

``` swift
class SomeLayer: CALayer {
    var rotate: CGFloat

    func setupRotation() {
        let anim = CABasicAnimation(keyPath: #keyPath(rotate))
        anim.fromValue = NS
        anim.fromValue = NSNumber(value: 0.0)
        anim.toValue = NSNumber(value: 2.0 * M_PI)
        anim.duration = 0.3
        anim.fillMode = kCAFillModeBoth

        removeAnimation(forKey: #keyPath(rotate))
        add(anim, forKey: #keyPath(rotate))
    }
}
```

работать не будет, даже если вы не забудете про

```
+ (BOOL)needsDisplayForKey:(NSString*)key
```

Потому что Swift dynamic свойства это не то же самое что ObjC @dynamic.

Единственный выход, который я нашел на данный момент, - в таких случаях писать такие классы на ObjC.
