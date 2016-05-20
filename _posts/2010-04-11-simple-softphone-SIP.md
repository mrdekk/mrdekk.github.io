---
layout: post
title: Простой софтфон на SIP
tags:
 - c#
 - sip
 - softphone
 - sipek
 - sdk
---

Попалась мне тут намендни сложная задачка. Надо к разрабатываемой программе прикрутить программный софтфон для SIP (VOIP). Несколько дней с гуглом ничего толком не дали, пока однажды не наткнулся (хвала опять же гуглу :) ) на один проект, который хостится опять же на гугле :) . Названием ему SipekSdk. О нем то и пойдет сегодня речь. Сегодня я покажу как написать свой софтфон.

Для разработки будем ипользовать Visual Studio 2008 Express Edition. Почему именно EE – потому что он легальный. Впрочем Вы можете пользоваться той редакцией и версией студии, которая Вам по душе.

Для начала создадим новый проект.

 1. Откройте Visual Studio и выполните File/New/Project
 2. Выберите тип проекта Visual C#/Windows Application
 3. В поле имени введите какое-нибудь имя, например SoftPhone
 4. Выберите место на диске где он у Вас будет сохранен
 5. Нажмите ОК

Проект создаться и Вы должны увидеть дизайнер окна Form1. Это хорошо. Если что-то не получилось – ищите ошибку или почитайте документацию по студии.

Далее накидаем несколько компонентов на нашу форму. Нам потребуются

 1. TextBox с именем cs_Phone для ввода номера телефона
 2. TextBox с именем cs_RegState для вывода информации о регистрации
 3. TextBox с именем cs_CallState для вывода информации о звонке
 4. Две Label к cs_RegState и cs_CallState для пояснения
 5. Кнопка MakeCall с именем cs_MakeCall для совершения звонка
 6. Кнопка Release с именем cs_Release для того чтобы иметь возможность «Ложить трубку»

Получилось что-то подобное

![Экран софтфона](/media/images/softphone01.jpg)

Далее необходимо подключить SipekSdk, для этого необходимо проделать следующие действия:

 1. Скопируйте библиотеку SipekSdk.dll в папку проекта. Ее можно взять тут [SipekSdk.dll](http://sipeksdk.googlecode.com/svn/trunk/SipekSdk/Lib)
 2. В SolutionExplorer студии выберите Add Reference...
 3. В диалоге выберите закладку Browse, а в ней выберите файл SipekSdk.dll
 4. Жмите ОК.

Аналогичные действия надо проделать с библиотекой pjsipDll.dll, взять ее можно отсюдова [pjsipDll.dll](http://sipeksdk.googlecode.com/svn/trunk/pjsipdll/Lib).

Кроме того, Вы можете собрать их самостоятельно.

Теперь нам нужно сконфигурировать эти библиотеки. Вообще SipekSdk содержит в себе только интерфейсы, которые мы должны имплементировать. Нас в данном случае будут интересовать два интерфейса:

 1. IConfigurationInterface. Насколько я понял – основной конфигурационный интерфейс.
 2. IAccount. Настройки конкретного аккаунта.

Итак

 1. Создаем новый класс. Правый клик в SolutionExplorer/Add/New item…
 2. Выберите Class и введите имя, например rc_PhoneCfg
 3. Откроется новый файл. Вы можете удалить его содержание, если там оно присутствует и Вы этого хотите.
 4. Добавьте включение

	``` csharp
	using Sipek.Common;
	```

 5. Теперь определите интерфейс

	``` csharp
	internal class rc_PhoneCfg : IConfigurationInterface
	```

 6. Имплементируйте стандартные методы. Студия Вам в этом поможет.
 7. Студия добавит Вам везде

	``` csharp
	throw new Exception("The method or operation is not implemented.");
	```

 8. Пока оставьте, исправим позже
 9. Теперь аналогичным образом имплементируйте интерфейс IAccount, пусть класс будет rc\_AccountCfg
 10. Попробуйте скомпилировать. Должно быть все ОК.


Теперь добавим кой чего полезного


 1. Добавьте список аккаунтов в rc_PhoneCfg

	``` csharp
	List< IAccount > v_slAccList = new List< IAccount>( );
	internal rc_PhoneCfg( )
	{
		v_slAccList.Add( new rc_AccountCfg( ) );
	}
	```

 2. Определите свойство Accounts

	``` csharp
	public List< IAccount> Accounts
	{
		get
		{
			return v_slAccList;
		}
	}
	```

 3. Остальные свойства определите следующим образом (свойства set везде пусть будут set { } )

	``` csharp
	CFBFlag = false;
	CFBNumber = "";
	CFNRFlag = false;
	CFNRNumber = "";
	CFUFlag = false;
	CFUNumber = "";

	public List< String > CodecList
	{
		get
		{
			List< String > slCodecs = new List< String >( );
			slCodecs.Add( "PCMA" );
			return slCodecs;
		}
		set {}
	}

	DNDFlag = false;
	DefaultAccountIndex = 0;
	IsNull = false;
	PublishEnabled = false;
	SIPPort = 5060;
	```

	То же самое сделайте в классе rc_AccountCfg. Введите правильные настройки.

	``` csharp
	AccountName = "3000";
	DisplayName = "3000";
	DomainName = "*";
	Enabled = true;
	HostName = "10.91.25.22";
	Id = "3000";
	Index = 0;
	Password = "admin";
	ProxyAddress = "";
	RegState = 0;
	TransportMode = ETransportMode.TM_UDP;
	UserName = "3000";
	```

Теперь займемся главной формой. Дальше весь код пишется в главной форме Form1, имейте ввиду.

Добавляем импорты

``` csharp
using Sipek.Common;
using Sipek.Common.CallControl;
using Sipek.Sip;
```

Реализуем несколько свойств

``` csharp
#region properties
CCallManager CallManager
{
	get
	{
		return CCallManager.Instance;
	}
}

private rc_PhoneCfg v_hPhoneCfg = new rc_PhoneCfg( );
internal rc_PhoneCfg Config
{
	get
	{
		return v_hPhoneCfg;
	}
}

private IStateMachine v_hCall = null;
#endregion
```

Теперь мы готовы зарегистрировать функции обратного вызова. Делаем в конструкторе

``` csharp
CallManager.CallStateRefresh += new DCallStateRefresh( CallManager_CallStateRefresh );
pjsipRegistrar.Instance.AccountStateChanged += new DAccountStateChanged( Instance_AccountStateChanged );
```

Обработчики реализуем попозже

Теперь мы готовы инициализировать систему Sipek. Для этого делаем следующие шаги

 1. Присваиваем

	``` csharp
	CallManager.StackProxy = pjsipStackProxy.Instance;
	```

 2. Отправляем настройки в систему

	``` csharp
	CallManager.Config = Config;
	pjsipStackProxy.Instance.Config = Config;
	pjsipRegistrar.Instance.Config = Config;
	```

 3. Инициализируем

	``` csharp
	CallManager.Initialize( );
	```

 4. И пытаемся зарегистрироваться на сервере

	``` csharp
	pjsipRegistrar.Instance.registerAccounts( );
	```

Теперь реализуем обработчики. Чтобы избежать проблему синхронизации потоков, будем использовать Invoke.

``` csharp
#region callbacks
void Instance_AccountStateChanged( Int32 iAccountId, Int32 iAccState )
{
	if ( InvokeRequired )
		this.BeginInvoke( new DAccountStateChanged( OnRegistrationUpdate ), new Object[ ] { iAccountId, iAccState } );
	else
		OnRegistrationUpdate( iAccountId, iAccState );
}

void CallManager_CallStateRefresh( Int32 iSessionId )
{
	if ( InvokeRequired )
		this.BeginInvoke( new DCallStateRefresh( OnStateUpdate ), new Object[ ] { iSessionId } );
	else
		OnStateUpdate( iSessionId );
}
#endregion
```

И синхронизированные обработчики

``` csharp
#region synchronized callbacks
private void OnRegistrationUpdate( Int32 iAccountId, Int32 iAccState )
{
	cs_RegState.Text = iAccState.ToString( );
}

private void OnStateUpdate( Int32 iSessionId )
{
	cs_CallState.Text = CallManager.getCall( iSessionId ).StateId.ToString( );
}
#endregion
```

И обработчики нажатия кнопок

``` csharp
private void cs_MakeCall_Click( Object hSender, EventArgs hArgs )
{
	v_hCall = CallManager.createOutboundCall( cs_Phone.Text );
}

private void cs_Release_Click( Object hSender, EventArgs hArgs )
{
	cs_Phone.Clear( );
	CallManager.onUserRelease( v_hCall.Session );
}
```

Теперь если Вы правильно ввели HostName, UserName и Password в rc_AccountCfg, ваш (или не Ваш) SIP сервер запущен и работает, то в поле RegState вы должны увидеть 200, что означает что ваш софтфон успешно зарегистрировался на SIP сервере.

Набирайте в cs_Phone номер и нажимайте MakeCall. Удачных телефонных переговоров.

### Комментарии со старой версии блога

 > Nevin:
 > 03.11.2010 в 00:55
 > Спасибо за статью. единственное замечание: IConfigurationInterface в сегодняшней версии библиотеки называется IConfiguratorInterface

----

 > Alex:
 > 17.11.2010 в 22:33
 > Спасибо! Отличное руководство =)
 > На этапе «Теперь мы готовы зарегистрировать функции обратного вызова.» не понятно где делать в конструкторе (где этот констркутор?):

``` csharp
allManager.CallStateRefresh += new DCallStateRefresh( CallManager_CallStateRefresh );
pjsipRegistrar.Instance.AccountStateChanged += new DAccountStateChanged( Instance_AccountStateChanged );
```

 > Прокомментируйте поподробней пожалуйста.
 > С Уважением, Alex

----

 > MrDekk:
 > 17.11.2010 в 22:49
 > Я имел в виду конструктора формы. Можете скачать исходники моих экспериментов вот тут [вот](/media/files/freesoftphone.rar) Надеюсь это Вам поможет в Ваших изысканиях.
 > Всегда рад помочь

----

 > MrDekk:
 > 17.11.2010 в 22:50
 > И да – пост про IConfiguratorInterface очень верный. Теперь он действительно так называется.

----

 > Koks:
 > 21.11.2010 в 08:08
 > Вроде получилось, регистрируется и звонит, но никак не реагирует на входящий вызов( в чем может быть проблема? Исходники скачал те что выложил автор.

----

 > MrDekk:
 > 21.11.2010 в 13:53
 > Честно говоря я сам не до конца понял как реагировать на входящий вызов. Глубокий дебаг библиотеки показал, что она реагирует на входящий вызов, но делегат почему-то не вызывает.
 > Проблема видимо в настройках каких-то, которые мы не учли, либо в недрах библиотеки.

----

 > Koks:
 > 21.11.2010 в 21:02
 > Самое интересное что и sipek2 вроде бы законченный телефон тоже не реагирует.

----

 > Koks:
 > 21.11.2010 в 21:23
 > А нельзя соорудить какой нибудь костыль что бы получать входящие? Просто очень надо =)
 > Сейчас скачаю сырцы библиотеки посмотреть.

----

 > MrDekk:
 > 21.11.2010 в 23:44
 > sipek2 на основе этой же библиотеки написан. Я не рылся в этом направлении – для моей задачи были нужны только исходящие звонки.
 > С входящими пробовал – но так ничего и не добился.
 > Если найдете что-то интересное – дайте знать пожалуйста.

----

 > Koks:
 > 23.11.2010 в 04:13
 > Только что починил, пересоздав свой евент.
 > В классе CallManager добавил

``` csharp
Form OnForm = null;
public delegate void IncCallHandler(int SessionId, string Number,string Info);

delegate void IncDelegate(int SessionId, string Number, string Info);

private void IncEvent(int SessionId, string Number, string Info)
{
	if (OnForm.InvokeRequired)
	{
		IncDelegate Invoker = new IncDelegate(IncEvent);
		OnForm.Invoke(Invoker, new object[] { SessionId, Number,Info });
	}
	else
	{
		IncCall(SessionId,Number,Info);
	}
}

public void On_Form(Form ParentForm)
{
	OnForm = ParentForm;
}

public event IncCallHandler IncCall;
```

 > Дальше изменил там же

``` csharp
private void OnIncomingCall(int sessionId, string number, string info)
{
	IStateMachine call = this[sessionId];

	//if (call.IsNull) return;

	// inform automaton for incoming call
	call.State.incomingCall(number, info);

	// call callback
	IncEvent(sessionId, number, info);
}
```

 > Теперь когда создаем класс
 > Делаем еще вот так

``` csharp
CallManager.On_Form(this);
CallManager.IncCall += new CCallManager.IncCallHandler(IncCaller);
```

 > И там например

``` csharp
private void IncCaller(int SessionId, string number, string info)
{
	cs_CallState.Text = number;
}
```

 > Все работает.

----

 > Koks:
 > 23.11.2010 в 04:51
 > Не работает еще кнопка ответа, если кто найдет как починить буду благодарен.

----

 > Koks:
 > 23.11.2010 в 05:29
 > Разбираться в дебрях библиотеки было лень, поэтому вот атким костылем можно и отвечать)

``` csharp
Sipek.Sip.pjsipCallProxy.dll_answerCall(0, 200);
```
 > 0 это номер сессии

----

 > Koks:
 > 23.11.2010 в 05:34
 > Теперь еще одна проблема, со звуком он не дружит только у меня?

----

 > Viktor:
 > 15.01.2011 в 21:52
 > А с какими серверами вы работаете? я вот что-то совсем не могу подружить его с 3CX сервером… ни в какую не хочет регистрироваться… Может кто-нить что подскажет?

----

 > MrDekk:
 > 16.01.2011 в 11:32
 > Ну лично я работал с Asterisk. Все работало.

----

 > Viktor:
 > 16.01.2011 в 14:26
 > еще вопрос: что значит regState 171101? нигде не смог найти описания…

----

 > MrDekk:
 > 17.01.2011 в 12:08
 > 171101 я честно говоря не знаю.
 > А по поводу 3СХ сервера, если бы Вы рассказали проблему и ее решение – было бы оочень замечательно.

----

 > elg:
 > 14.02.2011 в 13:31
 > А под вистой/семеркой работает?
 > Почему-то не слышно звука от собеседника. Связано ли с тем, что SipekSdk использует WaveLibMixer, а он не поддерживается в Vista? Можно ли как-то решить эту проблему?

----

 > MrDekk:
 > 16.02.2011 в 15:31
 > У меня под семеркой работает нормально. Под вистой не пробовал если честно.
 > Могу посоветовать только проверить настройки в панели управления. У меня были проблемы с микрофоном. Но эти проблемы к SipekSdk не имеют вообще никакого отношения.
 > Удачи в делах.

----

 > jasja1:
 > 01.03.2011 в 03:23
 > Запускал на Win7, результат – нулевой, не могу добиться даже регистрации на сервере. Думал дело в ОС, запустил на ВМ WinXP – та же ситуация. Софтфон от 3CX – работает нормально.. перепробовал уже много вариантов.. Буду очень рад, если кто-нибудь даст дельный совет, в чем может быть проблема

----

 > MrDekk:
 > 01.03.2011 в 09:14
 > Ну можно попробовать. Если Вы выполните два условия:
 >
 > 1. Опишите проблему – что конкретно у Вас не получается
 > 2. Выложите проблемный код
 >
 > Тогда будет возможность Вам чем-то помочь.

----

 > jasja1:
 > 01.03.2011 в 19:48
 >
 > 1. не получается зарегистрироваться на сервере – после запуска программы абсолютно ничего не происходит
 > 2. код был полностью взят из [исходника](/media/files/freesoftphone.rar), c настроенным интерфейсом IAccountCfg:

``` csharp
AccountName="100"
DisplayName="100"
DomainName="*""
Enabled=true
HostName="192.168.199.1"
id="100"
Index=0
Password="qwerty"
ProxyAddress=""
RegState=0
TransportMode=ETransportMode.TM_TCP
UserName="100"
```

 > Установлен и настроен сервер 3cx (Sip порт 5060, Публичный IP: 192.168.199.1).
 > Добавлен абонент (Внутренний номер 100 Имя 100 Фамилия 100 ID=100 пароль qwerty)
 >
 > После запуска программы регистрация на сервере не проходит. Лог сервера чист.
 > Соответственно пробовал софтфоны 3cx и X-Lite 4 – с аналогичными настройками все работает..

----

 > jasja1:
 > 01.03.2011 в 20:06
 > Часть лога программы

``` log
17:55:29.607 pjsua_core.c 1 SIP worker threads created
17:55:29.607 pjsua_core.c pjsua version 1.2 for win32 initialized
17:55:29.611 pjsua_core.c SIP UDP socket reachable at 192.168.0.100:5060
17:55:29.611 udp055775A0 SIP UDP transport started, published address is 192.168.0.100:5060
17:55:29.611 pjsua_acc.c Account added with id 0
17:55:29.611 tcplis SIP TCP listener destroyed
17:55:29.611 pjsua_core.c Error creating SIP TCP listener: Address already in use (WSAEADDRINUSE) [status=130048]
```

 > Откуда берется IP 192.168.0.100? + решил для эксперимента поменять порт в интерфейсе IPhoneCfg на 5070, на сервере порт остался прежним.. и регистрация прошла – RegState 200.
 > Не могу понять логику)

----

 > MrDekk:
 > 03.03.2011 в 18:12
 > Address already in use случается тогда, когда вы биндите сокет (socket bind) на порт, который уже занят (уже был бинд от другого приложения). Поэтому у Вас не получалось приконнектится (видимо какой-то софтфон был запущен и он биндил адрес). Когда Вы адрес поменяли, то все работало.

 > Чтобы работало без смены порта можно сделать следующее

``` cpp
int on = 1;
int s = socket( ... )
if ( setsockopt( s, SOL_SOCKET, SO_REUSEADDR, &on, sizeof(on)) < 0)
{
   //  случилась ошибка
}
```

 > Ну или запускать с нестандартным портом…

----

 > Алексей:
 > 22.03.2011 в 00:27
 > Каким вы сервером пользуетесь??? Я запускаю программу и сервер(какой-то нашел сиповский) и никакой реакции, IP указал 127.0.0.1, пробовал и тот что получают от роутера, ничего не даёт. Никакой реакции по нажатию на кнопки. Обьясните что и как тут вообще??? и что вводить в поле имени кому звонить?

----

 > MrDekk:
 > 22.03.2011 в 19:23
 > Я пользовался Asterisk’ом. Ставил на сервер и даже звонил через ТФОП.

----

 > Дмитрий:
 > 28.04.2011 в 19:29
 > Привет, MrDekk.
 > Очень помогла ваша звонилка. Есть одно «НО». pjsipDLL написан на C++ и когда я пытаюсь запустить приложение под вистой или семеркой x64 возникает ошибка «An attempt was made to load a program with an incorrect format» при попытке обращения к pjsipDLL. Быстро решить эту проблему я не смог, поэтому пишу здесь. Если есть идеи, то я был бы очень благодарен.

----

 > Дмитрий:
 > 28.04.2011 в 19:35
 > Забыл написать.
 > Нашел это
 > http://blogs.msdn.com/b/arvindsh/archive/2009/06/21/tip-of-the-day-an-attempt-was-made-to-load-a-program-with-an-incorrect-format-net-p-invoke-issue.aspx
 > Долго втыкал, но самостоятельно разобраться не смог. Возможно в этом тесте есть решение проблемы, ноя настолько пень ,что не могу им воспользоваться. Хелп плз.
 > Заранее большое спасибо.

----

 > MrDekk:
 > 29.04.2011 в 14:12
 > В настройках компиляции .net проектов вместо ANY CPU поставьте x86 – все должно заработать.

----

 > Дмитрий:
 > 04.05.2011 в 20:48
 > Спасибо. С этим справился.
 > Вообще не звонит на windows 7.
 > После выполнения

``` csharp
CallManager.createOutboundCall(txtPhone.Text);
```

 > событие CallStateRefresh не наступает вообще.
 > В чем может быть беда?

----

 > MrDekk:
 > 04.05.2011 в 21:51
 > Ну, файерволл у Вас есть? Может быть в нем беда. Вообще, мне кажется где-то что-то не дает пройти соединению. Можете попробовать включить native дебаггер и пройтись внутрь sipeksdk.

----

 > Дмитрий:
 > 05.05.2011 в 16:37
 > Буду писать сюда о своих действиях, вдруг у кого-то возникнут идеи как мне помочь. Итак, проблема все та же: не работает наш любимый софтфон под вин 7.
 > Нашел это:
 > http://groups.google.com/group/sipek/browse_thread/thread/ca47464ac4dbdb9f?pli=1
 > Выкачал исходники SipekSDK. В них упомянутой ссылки на WaveLibMixer вообще нет. Добавил в свой проект сборку SipekSDK, чтобы было проще отлаживаться. При отладке наткнулся на следующее.

 > Итак мы жмем на кнопку «позвонить», вызывается

``` csharp
v_hCall = CallManager.createOutboundCall(txtPhone.Text);
```

 > Проследовал по обработке OutboundCall вплоть до следующей строчки во враппере для pjsipDLL:

``` csharp
SessionId = dll_makeCall(Config.Accounts[accountId].Index, sipuri);
```

 > Здесь получаю SessionId = -1, что приводит к окончанию обработки звонка. То есть под висту (7) почему-то не работает dll_makeCall из pjsipDLL. Попробовал погуглить эту беду ,пока безрезультатно. Может быть у кого-то запускается вся эта радость на висте или семерке? приму любую помощь.

----

 > MrDekk:
 > 05.05.2011 в 20:48
 > Вы native-дебаггером в pjsip.dll пробовали заходить?

----

 > Дмитрий:
 > 06.05.2011 в 12:38
 > Debug->Options->Native. Выставил галочки на Load DLL Imports и Enable RPC Debugging.
 > После этого я должен иметь возможность заглянуть дебаггером внутрь pjsipDLL? Может быть у меня урезанная студия (хотя нет – вроде Ultimate), но я пройти внутрь pjsipDLL не могу. Что я делаю не так?

----

 > MrDekk:
 > 06.05.2011 в 13:24
 > В настройках запускаемого шарпового проекта в закладке Debug внизу есть опция Enable Debuggers, там надо поставить галочку напротив Enable unmanaged code debugging. После этого вам нужны исходники pjsip, либо хотя бы pdb файл. Тогда у Вас будет возможность заглянуть внутрь Pjsip.dll

----

 > Дмитрий:
 > 07.06.2011 в 16:02
 > На всякий случай оставляю комментарий, если у кого будут похожие проблемы.
 > Итак беда с Виндоус 7 связана с pjsipDLL, которую мы скачиваем. Я выкачал исходники pjsipDLL и пересобрал библиотеку по указаниям отсюда http://sites.google.com/site/sipekvoip/Home/documentation/pjsipwrapper/pjsipwrapper-for-windows
 > После этого под семеркой нормально зазвонило.

----

 > Богдан:
 > 15.07.2013 в 17:56
 > Ответ на звонки полностью работоспособен!
 > Вы забыли реализовать свойство bool AAFlag.
 > Оно отвечает за автоответ, и проверяется при входящем звонке.
 > Если его реализовать все будет хорошо, и не нужно ничего в либе менять.
