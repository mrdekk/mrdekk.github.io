---
layout: post
title: "Символификация crash-дампа iOS"
---

Допустим вам надо понять что случилось с приложением и у Вас есть крэш-дамп, однако на телефоне стоит iOS 6.1 которую xCode 7.3.1
принципиально знать не хочет и крэш-дампы с этого устройства не забирает. А смотреть надо. Для этого включаем iTunes и синхронизируем устройство,
тогда по пути

{% highlight bash %}
~/Library/Logs/CrashReporter/MobileDevice/
{% endhighlight %}

вы сможете найти крэш-дампы. После этого идем по пути

{% highlight bash %}
/Applications/Xcode.app/Contents/SharedFrameworks/DTDeviceKitBase.framework/Versions/A/Resources
{% endhighlight %}

где лежит symbolicatecrash. Берем его и копируем вместе с \*.crash файлом и \*.ipa файлом (предварительно выключив опцию Strip Debug Symbols During Copy) после этого выполняем нехитрый скрипт

{% highlight bash %}
$ export DEVELOPER_DIR=/Applications/xCode6.4/Xcode6.4.app/Contents/Developer
$ ./symbolicatecrash -v superapp_2016-05-11-211803_superphone.crash superapp.ipa
{% endhighlight %}
