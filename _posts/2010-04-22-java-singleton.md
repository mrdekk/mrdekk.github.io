---
layout: post
title: Java singleton
tags:
 - java
 - patterns
 - singleton
---

Возникла у меня тут необходимость в паттерне Singleton для явы. После некоторого общения с гуглом нашел вот такую реализацию, которая мне понравилась, спешу поделиться ею с Вами уважаемые читатели:

``` java
private static volatile NetworkController controller = null;

public static NetworkController getInstance( )
{
  if ( null == controller )
  {
    synchronized( NetworkController.class )
    {
      if ( null == controller )
      {
        controller = new NetworkController( );
      }
    }
  }

  return controller;
}

// only private constructor! because of singleton
private NetworkController( )
{
}
```
