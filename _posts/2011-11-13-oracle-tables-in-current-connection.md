---
layout: post
title: Получение списка таблиц в текущем подключении ORACLE
---

Появилась тут одна задача связанная с Oracle и Java. В процессе ее решения потребовались некоторые кусочки кода, которые я и хочу предложить читателям. Вдруг куда понадобятся.

Подключение к Oracle (Java) (Проверка на ошибки и прочая мишура намеренно опущены)

``` java
Class.forName( "oracle.jdbc.driver.OracleDriver" );
String url = "jdbc:oracle:thin:@" + server + ":" + port + ":" sid;
Connection connection = DriverManager.getConnection( url, username, password );
```

Получение таблиц в текущем подключении

``` java
Statement stmt = connection.createStatement( );

ResultSet rs = stmt.executeQuery( "select TABLE_NAME from TABS" );
while ( rs.next( ) )
{
  System.out.println( rs.getString( "TABLE_NAME" ) );
}

rs.close( );
rs = null;

stmt.close( );
stmt = null;
```
