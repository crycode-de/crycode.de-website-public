---
title: Serielle Schnittstelle über Ethernet
date: 2022-01-10 12:00:00
updated: 2025-03-26 13:55:00
author:
  name: Peter Müller
  link: https://crycode.de
categories:
  - [Linux]
  - [Netzwerk]
  - [Software]
tags:
  - Ethernet
  - Linux
  - Netzwerk
  - serial port
  - Serielle Schnittstelle
  - socat
---

In diesem Beitrag beschreibe ich, wie man eine serielle Schnittstelle über Ethernet von einem Rechner auf einen anderen Rechner weiterleiten kann.

Damit ist es beispielsweise möglich eine serielle Schnittstelle von einem Raspberry Pi an den Server der eigenen Heimautomatisierung zu leiten, sodass der Server diese Schnittstelle nutzen kann, als wäre die Hardware direkt bei ihm selbst angeschlossen.  
Ich habe damit beispielsweise bei mir die Schnittstelle meines als [RadioHead Serial-Radio-Gateway](/radiohead-serial-radio-gateway/) fungierenden Arduinos an einem recht zentral im Haus platzierten Raspberry Pi an meinen [HomePi](/kategorie/homepi/) übertragen, welcher dann die eigentliche Kommunikation übernimmt.

<!-- more -->

<!-- toc Inhalt -->

## Vorbereitungen

Die Einrichtung ist recht einfach. Auf Linux-Systemen muss dafür lediglich auf beiden Systemen das Tool `socat` installiert sein.

Sofern `socat` nicht bereits installiert ist, können wir es auf Debian-basierten Systemen ganz einfach per `apt` installieren.
Auf anderen Systemen sollte die Installation über den entsprechenden Paketmanager ähnlich funktionieren.

```sh
sudo apt install socat
```

## Grundlagen

Der Einfachheit halber bezeichne ich im Folgenden das System, welches die Schnittstelle via Ethernet erhalten soll als _Empfänger_ und das System mit der echten angeschlossenen Hardware als _Sender_, auch wenn dies so eigentlich nicht ganz korrekt ist, da es sich ja um eine bidirektionale Verbindung handelt.

### Empfänger-System

Auf dem System, das die Schnittstelle per Ethernet erhalten soll, starten wir `socat` so, dass es einen TCP-Server erstellt und alle Daten zwischen dem TCP-Server und einer Pseudo-Schnittstelle hin und her leitet.

```sh
socat -d -d tcp-l:60001,reuseaddr pty,link=/tmp/ttyV0,b9600,raw,echo=0,mode=770
```

Mittels `-d -d` weisen wir `socat` an ein paar Informationen als Log auszugeben, wodurch wir unter anderem den Verbindungsaufbau sehen können.
Bis zu vier Mal `-d` ist möglich, was dann das Loglevel entsprechend erhöht und mehr Ausgaben erzeugt.

Durch `tcp-l:60001` erstellt `socat` einen TCP-Server auf dem angegebenen Port. Über diesen Port kann sich dann das andere System verbinden.
Die Option `reuseaddr` erlaubt es `socat` eine Adresse mehrfach zu verwenden. Ohne diese Option hat `socat` bei mir den Dienst verweigert.  
Dadurch, dass wir `socat` als erstes den TCP-Server angeben, wartet es auf die Verbindung eines Clients, bevor das nachfolgende Interface angelegt wird.

Über die Option `pty` weiß `socat`, dass ein Pseudo-Terminal unter `/dev/pts/...` erstellt werden soll.
`link=/tmp/ttyV0` erzeugt zudem einen Link auf das eigentliche Device, wodurch wir später die Schnittstelle einfacher ansprechen können, da sich die Nummer des pts-Devices auch durchaus mal ändern kann.  
Wichtig sind hierbei die korrekte Baudrate (hier `b9600`), die später genutzt werden soll, sowie die Optionen `raw` und `echo=0`.
Über `mode=770` wird die Schnittstelle dem Eigentümer und der Gruppe zugänglich gemacht.
Eigentümer und Gruppe sind in diesem Fall davon abhängig, welcher Benutzer der `socat`-Prozess startet.
Soll die Schnittstelle von jedem Nutzer des Systems verwendet werden dürfen, so müsste `mode=777` gesetzt werden.

> [!CAUTION]
> Wenn `socat` nicht unter dem _root_-Nutzer ausgeführt wird (was man aus Sicherheitsgründen auch vermeiden sollte), dann darf der `link` nicht unter `/dev/` angelegt werden, sondern muss in einem Verzeichnis sein, wo der entsprechende Nutzer Schreibrechte hat.

Diverse andere Anleitungen nutzen beim `tcp-l` zudem noch die Option `fork`, was den Server auch bei einem Verbindungsabbruch weiterlaufen lassen würde. Problem hierbei ist jedoch, dass der Link dabei entfernt wird. Ich lasse diese Option deshalb lieber weg und lasse vom SystemD den entsprechenden Service (siehe weiter unten) nach einem Verbindungsabbruch einfach neu starten.

### Sender-System

Auf dem System, an das die echte Hardware angeschlossen ist, starten wir danach `socat` so, dass es eine Verbindung zwischen der echten Schnittstelle und dem TCP-Server des Empfänger-Systems herstellt.

```sh
socat -d -d file:/dev/ttyUSB0,b9600,raw,echo=0 tcp:192.168.1.50:60001
```

Durch die Option `file:/dev/ttyUSB0` weiß `socat`, dass es hier mit der echten Schnittstelle `/dev/ttyUSB0` arbeiten soll.
Baudrate, `raw` und `echo=0` sind wieder wie beim Empfänger.

Über `tcp:192.169.1.50:60001` verbindet sich `socat` mit dem TCP-Server unter der angegebenen Adresse.

### Testen

Nachdem wir nun zuerst `socat` auf dem Empfänger-System und anschließend auf dem Sender-System gestartet haben, sollte auf beiden Seiten im Log der Verbindungsaufbau ersichtlich sein.

```plain socat Log auf dem Empfänger-System
socat[22140] N listening on AF=2 0.0.0.0:60001
socat[22140] N accepting connection from AF=2 192.168.1.51:38450 on AF=2 192.168.1.50:60001
socat[22140] N PTY is /dev/pts/0
socat[22140] N starting data transfer loop with FDs [6,6] and [5,5]
```

```plain socat Log auf dem Sender-System
socat[22480] N opening character device "/dev/ttyUSB0" for reading and writing
socat[22480] N opening connection to AF=2 192.168.1.50:60001
socat[22480] N successfully connected from local address AF=2 192.168.1.51:38450
socat[22480] N starting data transfer loop with FDs [5,5] and [6,6]
```

Nun kann auf dem Empfänger-System die virtuelle Schnittstelle `/tmp/ttyV0` von einem beliebigen Programm verwendet werden, als wäre es die Schnittstelle `/dev/ttyUSB0` am Sender-System.

Sollte das Gerät am Sender-System entfernt werden (zum Beispiel durch Herausziehen des USB-Steckers), oder sollte die Netzwerkverbindung zwischen beiden System gestört sein, so beenden sich beide `socat` Prozesse automatisch. Am Empfänger-System dabei wird zudem die pseudo-Schnittstelle wieder entfernt.

## Einrichtung für den Dauerbetrieb

Möchte man nun, dass die Verbindung dauerhaft besteht, automatisch gestartet und im Fehlerfall auch wieder automatisch neu aufgebaut wird, empfiehlt es sich auf beiden Systemen einen SystemD-Service dafür anzulegen.  
Damit sorgt der SystemD dann dafür, dass der jeweilige `socat`-Prozess beim Systemstart gestartet wird. Zudem startet der SystemD den Prozess automatisch nach einem unerwarteten Beenden (z.B. in Folge einer Netzwerkstörung) neu.

### SystemD-Service auf dem Empfänger-System

Auf dem Empfänger-System erstellen wir mit root-Rechten eine service-Datei mit folgendem Inhalt:

```properties /etc/systemd/system/socat-ttyV0.service
[Unit]
Description=Socat for ttyV0
After=network.target

[Service]
ExecStart=/usr/bin/socat -d -d tcp-l:60001,reuseaddr pty,link=/tmp/ttyV0,b9600,raw,echo=0,mode=770
Restart=always
RestartSec=3s
User=iobroker
Group=iobroker

[Install]
WantedBy=multi-user.target
```

Adresse, Baudrate etc. müssen natürlich entsprechend den eigenen Bedürfnissen angepasst werden.

Über `User=iobroker` und `Group=iobroker` wird der `socat`-Prozess unter dem angegeben Benutzer (hier _iobroker_) gestartet.
Hier sollte zur Sicherheit immer ein Benutzer mit eingeschränkten Rechten verwendet werden und nicht _root_!  
In Kombination mit der Option `mode=770` können dann nur der Benutzer `iobroker`, sowie Mitglieder der Gruppe `iobroker` auf die virtuelle Schnittstelle zugreifen.

Durch `Restart=always` und `RestartSec=3s` weisen wir den SystemD an, den `socat`-Prozess immer nach 3 Sekunden neu zu starten, sofern dieser sich beendet haben sollte.
Dadurch erreichen wir, dass unsere Verbindung auch nach einem Fehler immer wieder automatisch neu aufgebaut wird.

Nun können wir den neu angelegten Service aktivieren und starten:

```sh
sudo systemctl enable socat-ttyV0.service
sudo systemctl start socat-ttyV0.service
```

Wie oben bereits erwähnt, startet `socat` damit zunächst nur den TCP-Server.
Die virtuelle Schnittstelle `/tmp/ttyV0` wird erst erzeugt, sobald sich ein Client mit dem Server verbindet.

### SystemD-Service auf dem Sender-System

Auf dem Sender-System erstellen wir mit root-Rechten eine service-Datei mit folgendem Inhalt:

```properties /etc/systemd/system/socat-ttyUSB0.service
[Unit]
Description=Socat for ttyUSB0
After=network.target

[Service]
ExecStart=/usr/bin/socat -d -d file:/dev/ttyUSB0,b9600,raw,echo=0 tcp:192.168.1.50:60001
Restart=always
RestartSec=4s
User=pi
Group=pi

[Install]
WantedBy=multi-user.target
```

Hier lassen wir den `socat`-Prozess unter dem Benutzer _pi_ starten.
Auch hier bitte unbedingt wieder einen normalen Benutzer und nicht _root_ verwenden!

Als Zeit für einen Neustart habe ich hier mit 4 Sekunden bewusst eine andere Zeit als beim Empfänger-System gewählt, damit es nicht durch irgendwelche ungünstigen Verkettungen dazu kommt, dass sich beide Seiten permanent neu starten, obwohl eigentlich alles Okay wäre.

Auch diesen Service aktivieren und starten wir nun:

```sh
sudo systemctl enable socat-ttyUSB0.service
sudo systemctl start socat-ttyUSB0.service
```

### Testen

Sobald auf beiden Seiten der entsprechende Service läuft sollte die Verbindung automatisch hergestellt und die virtuelle Schnittstelle auf dem Empfänger-System angelegt werden.

Das Log der beiden Services können wir per `journalctl` einsehen:

```sh Empfänger-System
sudo journalctl -u socat-ttyV0.service -f
```

```sh Sender-System
sudo journalctl -u socat-ttyUSB0.service -f
```

Im Log sollte auf beiden Seiten der Verbindungsaufbau erkennbar sein, wie bereits oben gezeigt.

Zum Test können wir nun den Service auf dem Sender-System einmal neu starten. Dies trennt die Verbindung und beendet somit auch den `socat`-Prozess auf dem Empfänger-System. Der SystemD sollte den Prozess dann nach 3 Sekunden neu starten und kurz später sollte sich das Sender-System auch wieder verbinden.

```sh Sender-System
sudo systemctl restart socat-ttyUSB0.service
```

## Fazit und Ausblick

Unter Linux ist es mit einfachen Mitteln möglich eine serielle Schnittstelle zuverlässig per Ethernet an ein anderes System weiterzugeben.

Die hier gezeigten Beispiele sind aufgrund fehlender Verschlüsselung etc. nur für die Nutzung in einem lokalen Netzwerk geeignet.
Prinzipiell ist aber auch eine Übertragung über andere Netze, beispielsweise das Internet, möglich.
Dabei sollte dann zumindest die SSL-Verschlüsselung von `socat`, oder noch besser ein VPN verwendet werden.

Für Windows Systeme gibt es unter anderem das Programm [Comm Tunnel](https://www.serialporttool.com/GK/comm-tunnel/), welches ebenfalls eine Übertragung von seriellen Schnittstellen per Ethernet ermöglicht.  
Durch Kombination von `socat` und _Comm Tunnel_ ist es sogar möglich eine Schnittstelle zwischen Linux- und Windows-Systemen hin und her zu reichen.
