---
layout: post
title: Боремся с «Translet class loaded, but unable to create translet instance.»
---

При работе с XSLT преобразованиями на сервере приложений WildFly возникает такой Exception

```
Caused by: javax.xml.transform.TransformerConfigurationException:
  Translet class loaded, but unable to create translet instance.
```

Судя по всему, пока в WildFly эту проблему не поправили, существует такой Workaround:

``` xml
<!-- Workaround for: "Translet class loaded, but unable to create translet instance." -->
<dependency>
	<groupid>xalan</groupid>
	<artifactid>xalan</artifactid>
	<version>2.7.2</version>
	<exclusions>
		<exclusion>
			<groupid>xml-apis</groupid>
			<artifactid>xml-apis</artifactid>
		</exclusion>
	</exclusions>
</dependency>
```
