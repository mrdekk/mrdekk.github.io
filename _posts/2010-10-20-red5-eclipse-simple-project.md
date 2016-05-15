---
layout: post
title: Простой проект red5+eclipse
---

Сегодня займемся создание простого проекта для red5 под eclipse. Будем считать, что red5, eclipse, flashdevelope, flex sdk вы уже поставили, поэтому сразу перейдем к делу.

Запустите eclipse, выберите пункт меню File->New Project, далее Java Project, далее Next, далее наберите «appz» в поле имя проекта, затем нажмите Finish.

Вы создали новый проект и теперь можете видеть его в диспетчере проектов, используется стандартная JRE установленная в вашей системе. Нажмите правой кнопкой на проекте, далее New->Folder, наберите WEB-INF. Создайте подкаталоги classes и src в только что созданной папке WEB-INF.

Нажмите правой кнопкой мыши на каталоге WEB-INF/src -> Build Path -> Use as Source Folder, теперь вы установили WEB-INF/src как корневой каталог для исходных текстов.

Теперь необходимо установить WEB-INF/classes как каталог куда буду складываться объектные файлы после компиляции. Для этого в контекстном меню проекта надо выбрать Properties, Далее пункт Java Build Path, в нем закладка Sources, там внизу Default Output Folder следует нажать Browse и выбрать папку WEB-INF/classes или просто ввести этот путь в поле ввода.

Все почти готово. Нет только нужных конфигурационных файлов. Для этого откройте Ваш любимые файловый менеджер и скопируйте файлы red5-web.properties, red5-web.xml, web.xml из готового проекта в вашу папку WEB-INF.

Теперь переключитесь обратно в eclipse, нажмите правой кнопкой на проекте appz и выберите Refresh, эти файлы появятся в каталоге WEB-INF.

### Базовое серверное приложение

Теперь мы готовы чтобы создать новое серверное приложение. Для этого нажмите правой кнопкой на WEB-INF/src выберите New->Class, введите src для package и Application для имени класса. Затем нажмите Finish.

Это будет наш основной класс, поэтому мы должны реализовать в нем интерфейс ApplicationAdapter. Добавьте red5.jar в библиотеки, для этого выберите в контекстном меню проекта Properties -> Java Build Path -> Libraries -> Add External Jars, выберите red5.jar в корневом каталоге red5. Теперь eclipse может компилировать проект для нас.

Создайте функции appStart и appStop следующим образом:

``` java
package src;

import org.red5.server.adapter.ApplicationAdapter;

public class Application extends ApplicationAdapter
{
    public Boolean appStart ( )
    {

    }
    public void appStop ( )
    {

    }
}
```

Теперь надо импортировать интерфейс для работы с пользовательскими соединениями

``` java
import org.red5.server.api.IConnection;

public boolean appConnect( IConnection conn, Object[] params )
{
    return true;
}

public void appDisconnect( IConnection conn)
{
   super.appDisconnect(conn);
}
```

Для отладки нашего приложения нам нужно журналирование, поэтому для создания журналов воспользуемся библиотекой apache commons logging. Возможно Вам придется скачать ее с официального сайта.

``` java
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
```

Журналируем потихоньку:

``` java
private static final Log log = LogFactory.getLog( Application.class );

public boolean appStart ( )
{
    log.info( "Red5First.appStart" );
    return true;
}

public void appStop ( )
{
    log.info( "Red5First.appStop" );
}

public boolean appConnect( IConnection conn , Object[] params )
{
    log.info( "Red5First.appConnect " + conn.getClient().getId() );
    return true;
}

public void appDisconnect( IConnection conn)
{
    log.info( "Red5First.appDisconnect " + conn.getClient().getId() );
    super.appDisconnect(conn);
}
```

Теперь нам нужно немного тестовой логики, поэтому давайте сделаем так, если клиент передает true в соединении, то мы его принимаем, если false – то нет

``` java
private static final Log log = LogFactory.getLog( Application.class );

public boolean appStart ( )
{
    log.info( "Red5First.appStart" );
    return true;
}

public void appStop ( )
{
    log.info( "Red5First.appStop" );
}

public boolean appConnect( IConnection conn, Object[] params )
{
    log.info( "Red5First.appConnect " + conn.getClient().getId() );

    boolean accept = (Boolean)params[0];

    if ( !accept ) rejectClient( "you passed false..." );

    return true;
}

public void appDisconnect( IConnection conn)
{
    log.info( "Red5First.appDisconnect " + conn.getClient().getId() );
    super.appDisconnect(conn);
}
```

В итоге код выглядит следующим образом

``` java
package src;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import org.red5.server.api.IConnection;
import org.red5.server.adapter.ApplicationAdapter;

public class Application extends ApplicationAdapter
{
    private static final Log log = LogFactory.getLog( Application.class );

    public boolean appStart ( )
    {
        log.info( "Red5First.appStart" );
        return true;
    }

    public void appStop ( )
    {
        log.info( "Red5First.appStop" );
    }

    public boolean appConnect( IConnection conn, Object[] params )
    {
        log.info( "Red5First.appConnect " + conn.getClient().getId() );

        boolean accept = (Boolean)params[0];

        if ( !accept ) rejectClient( "you passed false..." );

        return true;
    }

    public void appDisconnect( IConnection conn)
    {
        log.info( "Red5First.appDisconnect " + conn.getClient().getId() );
       super.appDisconnect(conn);
    }

}
```

Теперь разберемся с кофигами, они должны выглядеть примерно так:

log4j.properties:

```
application-related logging parameters
```

red5-web.properties:

``` ini
webapp.contextPath=/firstapp
webapp.virtualHosts=localhost, 127.0.0.1
```

red5-web.xml:

``` xml
<bean id="web.handler"
        class="com.milgra.Application"
        singleton="true" />
<context-param>
        <param-name>webAppRootKey</param-name>
        <param-value>/firstapp</param-value>
</context-param>
```

После всего скопируйте все содержимое каталога WEB-INF вместе с ним в каталог red5/webapps и перезапустите сервер.

### Создаем клиента на flash

Хорошо, с серверной частью все хорошо. Теперь займемся клиентом. Для этого открываем FlashDevelope и создаем проект (ActionScript 3), называем его например fp

Выглядеть он должен примерно следующим образом

``` actionscript
package fp
{
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.NetStatusEvent;
	import flash.net.NetConnection;
	import flash.net.ObjectEncoding;
	import flash.text.TextField;

	/**
	 * ...
	 * @author MrDekk
	 */
	public class Main extends Sprite
	{
		private var nc : NetConnection;
		private var tf : TextField;

		public function Main():void
		{
			if ( stage )
				init( );
			else
				addEventListener( Event.ADDED_TO_STAGE, init );
		}

		private function init( e : Event = null ) : void
		{
			removeEventListener(Event.ADDED_TO_STAGE, init);
			// entry point

			tf = new TextField( );
			tf.x = 10;
			tf.y = 10;
			tf.width = 300;
			tf.height = 700;
			stage.addChild( tf );

			nc = new NetConnection( );
			nc.objectEncoding = ObjectEncoding.AMF0;
			nc.addEventListener( NetStatusEvent.NET_STATUS, onNetStatus );
			nc.connect( "rtmp://10.0.0.202/appz", false );
		}

		private function onNetStatus( event : NetStatusEvent ) : void
		{
			trace( event.info.code );
			tf.appendText( event.info.code );
			tf.appendText( "\n" );

			if ( event.info.code == "NetConnection.Connect.Rejected" )
			{
				trace( event.info.application );
				tf.appendText( event.info.application );
				tf.appendText( "\n" );
			}
		}

	}

}
```

После этого загоняем его в любимый браузер и запускаем. Если мы передали false, то увидем следующее

```
NetConnection.Connect.Rejected
you passed fals . . .
NetConnection.Connect.Closed
```

Теперь заменим false на true, перекомпиляем проект и посмотрим снова

``` actionscript
nc.connect( "rtmp://localhost/firstapp" , true );
```

```
NetConnection.Connect.Success
```

Все работает! Ура!
