---
title: Grundlagen und Installation von ioBroker
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2019-09-18 12:00:00
updated: 2024-04-19 15:17:51
categories:
  - ioBroker
tags:
  - ioBroker
  - InfluxDB
  - MySQL
  - Redis
  - VIS
abbr:
  IoT: Internet of Things
  JSON: JavaScript Object Notation
  AGB: Allgemeine Geschäftsbedingungen
---

Dieser Beitrag beschreibt die grundlegende Installation von *ioBroker* inklusive der Einrichtung von Redis für eine bessere Performance und *InfluxDB* oder *MySQL* für die Historie von Daten.

<!-- more -->

<!-- toc Inhalt -->

## Grundlagen von ioBroker

[ioBroker](https://www.iobroker.net/) ist eine {% abbr IoT %}-Plattform, die es unter anderem ermöglicht sehr umfangreiche und trotzdem flexible Heimautomatisierungen aufzubauen.

Hier kurz die wichtigsten Eckdaten zu *ioBroker*:

* Open Source auf Basis der MIT-Lizenz
* Geschrieben in TypeScript/JavaScript, ausgeführt mit Node.js
* Läuft auf Linux, Windows, OSX, Raspberry Pi, ARM
* Umfassende Unterstützung für verschiedenste Smart Home Komponenten
* Sehr gute Erweiterbarkeit für Hard- und Software
* Große Community
* Langjährige sehr aktive Entwicklung und ein großer Kreis an aktiven Entwicklern

## Adapter und Instanzen

Über sogenannte Adapter kann *ioBroker* um nahezu jede erdenkliche Funktionalität erweitert werden. Dies betrifft sowohl die Anbindung von Hardware als auch die Einbindung von zusätzlichen Softwarekomponenten wie beispielsweise einer Benutzeroberfläche.

Die einzelnen Adapter lassen sich problemlos und komfortabel über die Administrationsoberfläche installieren.

{% img iobroker-adapter.webp thumb: ioBroker Admin-UI Adapterliste %}

Zur Verwendung werden von den Adaptern einzelne Instanzen erzeugt.  
Einfach gesagt: Ein eingerichteter Adapter ist eine Instanz.

Von einem Adapter können zudem mehrere Instanzen erzeugt werden, was beispielsweise bei spezieller Hardware erforderlich ist. Im Regelfall wird jedoch nur jeweils eine Instanz benötigt.

Der Name der Instanz ist dabei vom Namen des Adapters abhängig. Heißt der Adapter beispielsweise `sql`, so heißt die erste Instanz des Adapters dann `sql.0`. Eine zweite Instanz würde `sql.1` heißen und so weiter.

## Objekte

In *ioBroker* werden alle Datenstrukturen über Objekte abgebildet.

Abhängig vom jeweiligen Adapter werden Baumstrukturen aus Geräten, Kanälen und Werten erzeugt.

Jede Instanz eines Adapters hat einen eigenen Namensbereich, in dem die Objekte der Instanz abgelegt werden.  
So ist beispielsweise bei einem Raspberry Pi mit installiertem [RPI-Monitor](https://github.com/iobroker-community-adapters/ioBroker.rpi2) Adapter die aktuelle CPU-Temperatur über die Objekt-ID `rpi2.0.temperature.soc_temp` verfügbar.

{% img iobroker-objekte.webp thumb: ioBroker Admin-UI Objekt-Baumstruktur %}

## Speicherung von Daten in ioBroker

Standardmäßig speichert *ioBroker* alle Daten in jsonl-Dateien auf dem Dateisystem.

JSONL ist eine spezielle Form von {% abbr JSON %}-Dateien, wobei Änderungen zunächst an die vorhandenen Daten angehängt werden, anstatt die gesamte Datei neu zu schreiben. Damit sollen Schreibvorgänge auf das Dateisystem minimiert werden.

### Objects-DB

Die Objects-DB beinhaltet die Strukturen und Eigenschaften von allen in ioBroker angelegten Objekten. Sie wird bei jeder Veränderung an einem Objekt ergänzt beziehungsweise neu geschrieben.

Speicherort: `/opt/iobroker/iobroker-data/objects.jsonl`

### States-DB

Die States-DB enthält alle aktuellen Zustände und Werte der Objekte. Sie unterliegt somit ständigen Lese- und Schreibvorgängen.

Speicherort: `/opt/iobroker/iobroker-data/states.jsonl`

### Historische Daten

Standardmäßig werden nur die aktuellen Zustände und keine historischen Daten erfasst. Sollen historische Daten, beispielsweise zur Darstellung von Zeitreihen, aufgezeichnet werden, so muss hierfür extra ein Adapter installiert und eingerichtet werden.

Auch eine Kombination aus mehreren Adapterinstanzen für historische Daten ist möglich.

Ist ein entsprechender Adapter installiert, so kann er für jedes Objekt einzeln aktiviert werden. Dadurch werden nur Daten aufgezeichnet, die man auch wirklich haben möchte.

Der einfachste Adapter zur Aufzeichnung der Daten ist [History](https://github.com/ioBroker/ioBroker.history). Die Daten werden hierbei dann tageweise unter `/opt/iobroker/iobroker-data/history/yyyymmdd/` in json-Dateien gespeichert.

Eine gute Alternative stellt der Adapter [InfluxDB](https://github.com/ioBroker/ioBroker.influxdb) dar.
Dieser ermöglicht es die Daten in eine InfluxDB, welche besonders für Zeitreihendaten geeignet ist, zu speichern.

Eine weitere Alternative ist der Adapter [SQL](https://github.com/ioBroker/ioBroker.sql),welcher eine Speicherung in eine MySQL, PostgreSQL, Microsoft SQL Server oder SQLite Datenbank ermöglicht.

Die Einbindung der InfluxDB- und SQL-Adapter wird weiter unten beschrieben.

## Installation in ioBroker

Als Basis für *ioBroker* wird eine aktuelle Version von Node.js benötigt. Ich empfehle hier immer aktuelle LTS-Version zu verwenden. Die [Installation von Node.js](/installation-von-node-js) habe ich im entsprechenden Beitrag bereits ausführlich beschrieben.

Die Installation von *ioBroker* erfolgt über das offizielle Install-Skript:

```sh Installation von ioBroker über das offizielle Installations-Skript
curl -sLf https://iobroker.net/install.sh | bash -
```

Dieses Skript installiert alle Abhängigkeiten, installiert *ioBroker* nach `/opt/iobroker`, legt den Systembenutzer `iobroker` an und erstellt den *SystemD*-Service `iobroker.service`.

> [!NOTE]
> Die Installation kann je nach System einige Zeit in Anspruch nehmen.

Nach der Installation sollte das System am besten einmal neu gestartet werden, damit alle Anpassungen aktiv werden.

Anschließend ist die Administrationsoberfläche über `http://<ip>:8081/` erreichbar.

{% img iobroker-admin-ui.webp thumb: ioBroker Admin-UI nach der Installation %}

> [!NOTE]
> Eine Benutzeroberfläche ist bis jetzt noch nicht vorhanden. Diese werden wir weiter unten installieren.

## Redis

Da die Verwendung von Dateien vor allem im Zusammenhang mit der States-DB doch recht langsam ist, ersetzen wir diese durch [Redis](https://redis.io/de/).

Redis ist eine In-Memory-Datenbank mit einer einfachen Schlüssel-Werte-Datenstruktur. Diese ermöglicht eine deutlich performantere Speicherung der States, wodurch *ioBroker* insgesamt spürbar flüssiger reagiert.

Redis kann für die States-DB und die Objects-DB verwendet werden. Auch eine Kombination, beispielsweise Redis für die States-DB und JSONL für die Objects-DB ist möglich.

### Installation von Redis

Die Installation ist denkbar einfach, da Redis bereits in den offiziellen Paketquellen von Ubuntu, Debian und Raspbian enthalten ist:

```sh Installation von Redis
sudo apt update
sudo apt install redis
```

Anschließend können wir testen, ob der Redis Server läuft, indem wir `redis-cli` aufrufen und alle gespeicherten Schlüssel abfragen:

```sh Test von Redis
user@host:~ $ redis-cli
127.0.0.1:6379> KEYS *
(empty list or set)
```

Mit `STRG`+`D` können wir `redis-cli` wieder verlassen.

Standardmäßig ist der Redis Server nur über Localhost (127.0.0.1) erreichbar. Dies ist auch gut so, damit keine fremden Nutzer diesen verwenden können. Zur Sicherheit überprüfen wir das noch:

```sh Redis Localhost prüfen
user@host:~ $ sudo grep "^bind" /etc/redis/redis.conf
bind 127.0.0.1 ::1
user@host:~ $ sudo netstat -tulpen | grep 6379
tcp   0  0 127.0.0.1:6379  0.0.0.0:*  LISTEN  113  120233  5108/redis-server 1
tcp6  0  0 ::1:6379        :::*       LISTEN  113  120234  5108/redis-server 1
```

> [!NOTE]
> Bei Multihost-Systemen muss der Redis Server von den Salves aus erreichbar sein. Hierzu sind Änderungen an der Redis Konfiguration und zur Absicherung entsprechende Firewall-Regeln notwendig.

### Umstellung von ioBroker auf Redis

Ist der Redis Server erfolgreich installiert, dann kann die States-DB von ioBroker von den jsonl-Dateien auf Redis umgestellt werden.

Es ist auch möglich die Objects-DB auf Redis umzustellen, was aber nicht unbedingt nötig ist.  
Diese Anleitung stellt nur die States-DB auf Redis um.

> [!CAUTION]
> Bei der Einrichtung wird gefragt, ob man die Objekte und States migrieren möchte. Antwortet man hier mit nein, gehen alle aktuell gespeicherten States (und ggf. Objekte) dabei verloren!

Vor der Umstellung müssen wir zunächst die laufende ioBroker Instanz stoppen.

```sh ioBroker stoppen
user@host:~ $ iobroker stop
```

Für die Umstellung rufen wir anschließend `iobroker setup custom` auf.  
Die Frage nach *objects DB* beantworten wir mit `j`, um die Objects-DB als jsonl-Dateien zu belassen und die Frage nach der *states DB* mir `r` für Redis.  
Die Frage zur Migration der Objekte und States beantworten wir mit `y`, damit alle bisher vorhandenen States aus den jsonl-Dateien nach Redis kopiert werden.  
Bei allen anderen Fragen belassen wir den Standard durch einfaches Drücken der *Entertaste*.

```sh ioBroker Umstellung auf Redis
user@host:~ $ iobroker setup custom
Current configuration:
- Objects database:
  - Type: jsonl
  - Host/Unix Socket: 127.0.0.1
  - Port: 9001
- States database:
  - Type: jsonl
  - Host/Unix Socket: 127.0.0.1
  - Port: 9000
- Data Directory: ../../iobroker-data/

Type of objects DB [(j)sonl, (f)ile, (r)edis, ...], default [jsonl]: j
Host / Unix Socket of objects DB(jsonl), default[127.0.0.1]: 
Port of objects DB(jsonl), default[9001]: 
Type of states DB [(j)sonl, (f)file, (r)edis, ...], default [jsonl]: r

When States are stored in a Redis database please make sure to configure Redis
persistence to make sure a Redis problem will not cause data loss!

Host / Unix Socket of states DB (redis), default[127.0.0.1]: 
Port of states DB (redis), default[6379]: 
Data directory (file), default[../../iobroker-data/]: 
Host name of this machine [iobroker-test]: 
This host appears to be a Master or a Single host system. Is this correct? [Y/n]: 

Do you want to migrate objects and states from "jsonl/jsonl" to "jsonl/redis" [y/N]: y
Connecting to previous DB "jsonl/jsonl"...
Creating backup ...
This can take some time ... please be patient!
[...]
Important: If your system consists of multiple hosts please execute 
"iobroker upload all" on the master AFTER all other hosts/slaves have 
also been updated to this states/objects database configuration AND are
running!
```

> [!NOTE]
> Die Migration der Daten kann, je nach Datenmenge, einige Zeit dauern.

Anschließend starten wir ioBroker wieder:

```sh ioBroker starten
user@host:~ $ iobroker start
```

Wenn wir nun erneut aus Redis alle bekannten Schlüssel abfragen, sollten wir schon einige Ergebnisse erhalten:

```sh Redis Keys abfragen
user@host:~ $ redis-cli KEYS '*'
 1) "io.system.adapter.admin.0.logging"
 2) "io.system.host.iobroker-test.instancesAsCompact"
 3) "io.system.host.iobroker-test.eventLoopLag"
 4) "io.admin.0.info.newsFeed"
[...]
56) "io.system.host.iobroker-test.memRss"
57) "io.admin.0.info.updatesJson"
```

Damit ist Redis auch schon fertig eingerichtet und bereit für jede Menge States. 🙂

## Historie über InfluxDB

Optimal für die Aufzeichnung von Zeitreihendaten ist eine [InfluxDB](https://www.influxdata.com/) geeignet.

Dabei sollte möglichst InfluxDB 2 verwendet werden.

### Installation des InfluxDB 2 Servers

Da InfluxDB 2 aktuell (Stand April 2024) nicht in den Standardpaketquellen enthalten ist, müssen wir das Repository für InfluxDB 2 erst unserem System hinzufügen.

> [!CAUTION]
> Bitte beachten, dass für InfluxDB 2 ein 64 Bit System benötigt wird!

```sh InfluxDB 2 Repository hinzufügen
wget -q https://repos.influxdata.com/influxdata-archive_compat.key
echo '393e8779c89ac8d958f81f942f9ad7fb82a25e133faddaf92e15b16e6ac9ce4c influxdata-archive_compat.key' | sha256sum -c && cat influxdata-archive_compat.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg > /dev/null
echo 'deb [signed-by=/etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg] https://repos.influxdata.com/debian stable main' | sudo tee /etc/apt/sources.list.d/influxdata.list
```

(Quelle: <https://www.influxdata.com/downloads/>)

Anschließend können wir InfluxDB 2 wie gewohnt installieren:

```sh Installation von InfluxDB 2
sudo apt update
sudo apt install influxdb2
```

Anschließend müssen wir den SystemD-Service noch starten:

```sh Start von InfluxDB 2 nach der Installation
sudo systemctl start influxdb
```

Die Weboberfläche von InfluxDB 2 ist anschließend über `http://<ip>:8086/` erreichbar und sollte genutzt werden, um die Einrichtung abzuschließen.

Die Einstellungen für Benutzername, Organisationsname und Bucket Name sind frei wählbar, werden aber später benötigt.  
Im Anschluss wird ein Token angezeigt, welches wir uns unbedingt notieren sollten.

{% grid 2 %}
{% img influxdb2-setup-1.webp thumb: Initiales InfluxDB 2 Setup %}
{% img influxdb2-setup-2.webp thumb: InfluxDB 2 Token %}
{% endgrid %}

> [!CAUTION]
> Der Einfachheit halber nutzen wir hier in der Anleitung direkt den Token, welcher alle Rechte beinhaltet.  
> Für eine rein lokale Installation im Heimnetz ist dies denke ich auch vertretbar.  
> Um die Sicherheit zu erhöhen, kann man sich nach der Einrichtung auch in der Weboberfläche von InfluxDB 2 einloggen und dort weitere Tokens mit eingeschränkten Rechen erstellen.

### InfluxDB-Adapter Installieren und Konfigurieren

Zur Installation des [InfluxDB-Adapters](https://github.com/ioBroker/ioBroker.influxdb) suchen wir dieser in der Adminoberfläche und fügen ihn anschließend hinzu.

{% grid 2 %}
{% img iobroker-adapter-influxdb-suche.webp thumb: Suche nach dem InfluxDB-Adapter %}
{% img iobroker-adapter-influxdb-installation.webp thumb: Installation InfluxDB-Adapter %}
{% endgrid %}

Anschließend öffnet sich direkt die Konfiguration der Adapterinstanz.  
Hier wählen wir als *DB-Version* die *2.x* aus und tragen den Namen der Organisation und den Token (beides aus dem InfluxDB 2 Setup) ein.

Mit *Verbindung Testen* kann die Verbindung zur InfluxDB getestet werden.

{% img iobroker-adapter-influxdb-einstellungen.webp thumb: Einstellungen der InfluxDB Adapterinstanz %}

Anschließend bestätigen wir wie üblich mit *Speichern und Schließen*, woraufhin die InfluxDB Instanz neu startet und anschließen mit einem grünen Symbol als laufend dargestellt werden sollte.

{% img iobroker-adapter-influxdb-laeuft.webp thumb: InfluxDB Adapterinstanz läuft und ist mit der DB verbunden %}

### Aktivieren der Aufzeichnung

Damit nun auch eine Historie aufgezeichnet wird, müssen bei dem gewünschten Objekt die Eigenschaften für `influxdb.0` entsprechend gesetzt werden. Hierzu suchen wir uns das Objekt über die Baumansicht der Objekte heraus und klicken bei dem Objekt ganz rechts auf den Zahnrad-Button.  
In dem folgenden Dialog setzen wir in den Benutzerdefinierten Einstellungen für `influxdb.0` den Haken bei Aktiviert, passen gegebenenfalls noch die anderen Optionen an und klicken auf *Speichern & Schließen*.

{% grid 2 %}
{% img iobroker-adapter-influxdb-aktivieren.webp thumb: Objekt-Einstellungen über das Zahnrad %}
{% img iobroker-adapter-influxdb-aktivieren2.webp thumb: SQL-Adapter Objekt-Einstellungen %}
{% endgrid %}

Wenn alles funktioniert, dann ist schon kurze Zeit später in demselben Dialog über den Reiter *Verlaufsdaten* eine Tabelle der gespeicherten Daten verfügbar.

{% img iobroker-adapter-influxdb-verlaufsdaten.webp thumb: Verlaufsdaten über den SQL-Adapter %}

Die gespeicherten Daten können nun von anderen Adaptern oder auch externen Tools verwendet werden.

## Historie über MySQL

Die Aufzeichnung von historischen Daten kann alternativ auch über eine MySQL Datenbank (MariaDB) erfolgen. Hierfür installieren wir zuerst den MariaDB-Server und anschließend den [SQL-Adapter](https://github.com/ioBroker/ioBroker.sql).

### Installation des MariaDB-Servers

Da MariaDB in den offiziellen Paketquellen von Ubuntu, Debian und Raspbian enthalten ist, erfolgt die Installation wie üblich:

```sh Installation von MariaDB
sudo apt install mariadb-server mariadb-client
```

Anschließend sichern wir die neue Installation noch ab, damit erst gar keine Sicherheitsrisiken aufkommen. Alle Punkte können dabei einfach mit *Enter* beantwortet werden. Lediglich ein Root-Passwort sollte gesetzt werden:

```sh MariaDB Installation absichern
user@host:~ $ sudo mysql_secure_installation

NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MariaDB
      SERVERS IN PRODUCTION USE!  PLEASE READ EACH STEP CAREFULLY!

In order to log into MariaDB to secure it, we'll need the current
password for the root user. If you've just installed MariaDB, and
haven't set the root password yet, you should just press enter here.

Enter current password for root (enter for none): 
OK, successfully used password, moving on...

Setting the root password or using the unix_socket ensures that nobody
can log into the MariaDB root user without the proper authorisation.

You already have your root account protected, so you can safely answer 'n'.

Switch to unix_socket authentication [Y/n] 
Enabled successfully!
Reloading privilege tables..
 ... Success!


You already have your root account protected, so you can safely answer 'n'.

Change the root password? [Y/n] 
New password: ...
Re-enter new password: ...
Password updated successfully!
Reloading privilege tables..
 ... Success!


By default, a MariaDB installation has an anonymous user, allowing anyone
to log into MariaDB without having to have a user account created for
them.  This is intended only for testing, and to make the installation
go a bit smoother.  You should remove them before moving into a
production environment.

Remove anonymous users? [Y/n] 
 ... Success!

Normally, root should only be allowed to connect from 'localhost'.  This
ensures that someone cannot guess at the root password from the network.

Disallow root login remotely? [Y/n] 
 ... Success!

By default, MariaDB comes with a database named 'test' that anyone can
access.  This is also intended only for testing, and should be removed
before moving into a production environment.

Remove test database and access to it? [Y/n] 
 - Dropping test database...
 ... Success!
 - Removing privileges on test database...
 ... Success!

Reloading the privilege tables will ensure that all changes made so far
will take effect immediately.

Reload privilege tables now? [Y/n] 
 ... Success!

Cleaning up...

All done!  If you've completed all of the above steps, your MariaDB
installation should now be secure.

Thanks for using MariaDB!
```

Damit ist der MySQL/MariaDB-Server dann auch schon fertig installiert und bereit für *ioBroker*.

### SQL-Adapter Installieren und Konfigurieren

Damit sich der [SQL-Adapter](https://github.com/ioBroker/ioBroker.sql) mit unserer Datenbank verbinden kann, müssen wir zuerst auf dem MySQL/MariaDB-Server eine Datenbank und einen entsprechenden Benutzer anlegen. Dies machen wir über ein Terminal:

```sh MySQL Nutzer anlegen
user@host:~ $ mysql -u root -p
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
[...]

MariaDB [(none)]> CREATE DATABASE iobroker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
Query OK, 1 row affected (0.001 sec)

MariaDB [(none)]> CREATE USER 'iobroker'@'%' IDENTIFIED BY 'Passw0rt';
Query OK, 0 rows affected (0.001 sec)

MariaDB [(none)]> GRANT ALL PRIVILEGES ON iobroker.* TO 'iobroker'@'%';
Query OK, 0 rows affected (0.001 sec)

MariaDB [(none)]> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.001 sec)
```

Die MySQL-Session beenden wir anschließend mit `STRG`+`D`.

Das `Passw0rt` solltet ihr natürlich ändern. 😉

Anschließend können wir über die Administrationsoberfläche den SQL-Adapter suchen und installieren.

{% grid 2 %}
{% img iobroker-adapter-sql-suche.webp thumb: Suche nach dem SQL-Adapter %}
{% img iobroker-adapter-sql-installation.webp thumb: Installation vom SQL-Adapter %}
{% endgrid %}

Die Installation kann einige Zeit dauern, da hierbei unter anderem ggf. native Node.js-Module kompiliert werden müssen.

Sobald die Installation abgeschlossen ist, öffnet sich automatisch die Konfigurationsseite für den Adapter. Hier wählen wir dann als *DB Typ* die Option *MySQL* aus und tragen unsere zuvor erstellten Logindaten ein. Eine verschlüsselte Verbindung ist nicht erforderlich, da ioBroker und die Datenbank auf dem gleichen System laufen.

{% img iobroker-adapter-sql-einstellungen.webp thumb: DB Einstellungen vom SQL-Adapter %}

Über den Button *Verbindung Testen* kann die Verbindung zum MySQL/MariaDB-Server überprüft werden. Wenn die Verbindung ok ist, dann bestätigen wir den Dialog mit *Speichern und Schließen*. Nach kurzer Zeit sollte dann der Punkt vor `sql.0` in der Übersicht unserer Instanzen grün werden, was eine erfolgreiche Verbindung anzeigt.

{% img iobroker-adapter-sql-laeuft.webp thumb: SQL-Adapter läuft und ist verbunden %}

### Aktivieren der Aufzeichnung

Die Aktivierung erfolgt genauso wie beim InfluxDB Adapter weiter oben bereits beschrieben. Es muss lediglich `sql.0` anstatt `influxdb.0` aktiviert werden.

## Benutzeroberfläche mit VIS

Bisher verfügt unser *ioBroker* noch über keine Benutzeroberfläche.

Dies wollen wir nun ändern und installieren hierfür den Adapter Visualisierung, kurz VIS.  
Inzwischen gibt es auch die neue, verbesserte Version [VIS 2](https://github.com/ioBroker/ioBroker.vis-2). Es empfiehlt sich diese auch für alle neuen Installationen zu nutzen.

Vor der Installation müssen wir zunächst die Lizenzbedingungen lesen und akzeptieren.

{% grid 3 %}
{% img iobroker-vis2-suche.webp thumb: Suche nach dem VIS 2 Adapter %}
{% img iobroker-vis2-lizenz.webp thumb: Lizenz vom VIS 2 Adapter %}
{% img iobroker-vis2-installation.webp thumb: Installation vom VIS 2 Adapter %}
{% endgrid %}

> [!NOTE]
> Je nach Leistung eures Systems kann die Installation etwas dauern. Also nicht ungeduldig werden. 😉

Zusätzlich zu VIS wird automatisch auch der [Webserver-Adapter](https://github.com/ioBroker/ioBroker.web) installiert. Dieser wird von VIS und einigen anderen Adaptern benötigt, um ihre Dienste bereitzustellen.

Ist die Installation abgeschlossen, so öffnet sich die Konfiguration der VIS 2 Adapterinstanz.  
Hier muss ein Lizenzschlüssel eingegeben werden, damit der Adapter genutzt werden kann.

{% img iobroker-vis2-einstellungen.webp thumb: Einstellungen der VIS 2 Adapterinstanz %}

Für die **private** Nutzung ist VIS kostenlos.  
Über <https://iobroker.net/> kann man sich einen *ioBroker Cloud Account* erzeugen.  
Mit diesem ist es dann möglich eine *Community-Lizenz* für *iobroker.vis-2* kostenfrei zu "bestellen".

> [!TIP]
> Bei mir ist E-Mail zur Bestätigung der Adresse im Spam-Ordner gelandet. Wenn ihr also scheinbar keine E-Mail bekommt, dann schaut dort mal nach.

Bei der Bestellung müssen die {% abbr AGB %} akzeptiert und ein paar persönliche Daten angegeben werden.  
Die Seriennummer der *ioBroker*-Installation ist in den Adaptereinstellungen zu finden und muss von dort kopiert werden.

{% grid 2 %}
{% img vis2-lizenz-1.webp thumb: Auswahl der Lizenz %}
{% img vis2-lizenz-2.webp thumb: Daten eingeben %}
{% img vis2-lizenz-3.webp thumb: AGB lesen und akzeptieren %}
{% img vis2-lizenz-4.webp thumb: Lizenz erstellt %}
{% endgrid %}

Trotz der Auswahl von VIS 2 wurde bei mir die Lizenz für VIS &lt;2 erstellt. Über den Button *Zu v2 konvertieren* kann die Lizenz aber einfach für VIS 2 konvertiert werden. Dabei muss nochmals die Seriennummer der *ioBroker*-Installation angegeben werden.

Über den Auge-Button können wir anschließend die Lizenz anzeigen lassen.

{% grid 2 %}
{% img vis2-lizenz-5.webp thumb: Lizenz wurde für VIS &lt;2 erstellt %}
{% img vis2-lizenz-6.webp thumb: Seriennummer erneut eingeben %}
{% img vis2-lizenz-7.webp thumb: Lizenzübersicht %}
{% img vis2-lizenz-8.webp thumb: Lizenz ansehen %}
{% endgrid %}

Den *Lizenzschlüssel* kopieren wir in die Adaptereinstellungen und klicken auf *Speichern und Schließen*.

{% img iobroker-vis2-einstellungen-2.webp thumb: Lizenzschlüssel in den Adaptereinstellungen einfügen %}

Anschließend können wir die VIS-Oberfläche über `http://<ip>:8082/` erreichen und von dort aus zur Anzeige, der sogenannten *Runtime* oder zum *Editor* wechseln.

Hier wählen wir zunächst den *Editor*, um unsere Oberfläche zu erstellen und zu bearbeiten. Dort wählen wir dann *Neues Projekt erstellen* und geben dem Projekt einen beliebigen Namen.

{% grid 2 %}
{% img vis2-uebersicht.webp thumb: Übersicht %}
{% img vis2-neues-projekt.webp thumb: Neues Projekt erstellen %}
{% endgrid %}

In dieser Editor-Ansicht können wir uns dann aus der linken Seite alle möglichen Elemente, die sogenannten Widgets, in unsere Ansicht in der Mitte ziehen.

In der rechten Seitenleiste kann das jeweils aktuell ausgewählte Widget sehr detailliert konfiguriert werden.

{% img vis2-editor.webp thumb: VIS Editor %}

> [!NOTE]
> Der Editor kann im ersten Moment etwas überwältigend wirken, da er sehr viele Funktionen bietet.
> Es lohnt sich aber definitiv sich etwas einzuarbeiten.
> Mit etwas Übung lassen sich relativ einfach sehr gute Oberflächen mit vielen Möglichkeiten erstellen.

VIS ist extrem flexibel und bietet nahezu unbegrenzte Möglichkeiten die Benutzeroberfläche nach den eigenen Vorstellungen anzupassen.  
Mit VIS 2 lassen sich inzwischen sogar responsive Layouts erstellen, welche sich der Größe des jeweils verwendeten Endgerätes angleichen.

## Abschließende Hinweise

Diese Anleitung beinhaltet nur einen kleinen Teil dessen, was mit *ioBroker* alles möglich ist.

Viele weitere, teils sehr ausführliche Informationen sind in der offiziellen [Dokumentation](https://www.iobroker.net/#de/documentation) zu finden.

Eine Übersicht über aktuell verfügbare Adapter kann in der [Adapterliste](https://www.iobroker.net/#de/adapters) eingesehen werden.

Zudem lohnt sich fast immer ein Blick in das [ioBroker Forum](https://forum.iobroker.net/). Hier können auch alle möglichen Fragen und Probleme mit der Community und den Entwicklern geklärt werden.

---

Wenn euch meine Anleitung gefallen hat, lasst gerne einen Daumen hoch oder einen Kommentar da.

**Viel Erfolg mit eurem *ioBroker*! 😎**
