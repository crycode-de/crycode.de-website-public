---
title: Projekt HomePi - MQTT Broker Mosca
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2019-09-22 12:00:00
categories:
  - [HomePi]
  - [Netzwerk]
tags:
  - Mosca
  - MQTT
  - Redis
  - SystemD
abbr:
  JSON: JavaScript Object Notation
---

Für den Einsatz des *Message Queuing Telemetry Transport* (kurz MQTT) wird immer ein Server, der sogenannte *Broker*, benötigt. Dieser kümmert sich um die Kommunikation mit allen Clients und die entsprechende Verteilung der einzelnen Datenpakete.

Ich verwende als MQTT Broker [Mosca](https://github.com/mcollina/mosca). Dies ist ein recht einfacher Broker auf Basis von Node.js.

<!-- more -->

<!-- toc Inhalt -->

## Installation von Mosca

Da [Mosca](https://github.com/mcollina/mosca) auf Node.js basiert, muss dies natürlich vorher auf dem System installiert sein. Infos hierzu sind in meinem Beitrag [Installation von Node.js](/installation-von-node-js) zu finden.

Die Installation von *Mosca* als Standalone ist recht einfach:

```sh Installation von Mosca
npm install -g mosca bunyan
```

[Bunyan](https://github.com/trentm/node-bunyan) ist eine {% abbr JSON %} Logging Library, welche zur lesbaren Ausgabe der *Mosca* Logs verwendet wird.

Nach der Installation kann *Mosca* probeweise gestartet werden:

```sh Manueller Start von Mosca
mosca -v | bunyan
```

Zum Beenden einfach wie gewohnt `STRG`+`C` drücken.

## Anlegen von Benutzern

Standardmäßig verwendet *Mosca* keine Benutzerauthentifizierung und erlaubt jedem Client alles. Da dies relativ unsicher ist, legen wir Benutzer an, die für die Verbindung zu *Mosca* zugelassen sind.

Die Benutzer werden in der Datei `~/mosca/credentials.json` gespeichert. Das entsprechende Verzeichnis legen wir zuerst an, sofern es nicht bereits vorhanden ist.

```sh Mosca Nutzer anlegen
mkdir -p ~/mosca
mosca adduser <user> <password> --credentials ~/mosca/credentials.json
```

Hierbei müssen natürlich `<user>` durch den Benutzernamen und `<password>` durch das Passwort für den Benutzer ersetzt werden.

Damit angelegten Benutzern werden Rechte für *Publish* und *Subscribe* auf alle Topics gegeben. Möchte man die Rechte auf bestimmte Topics oder Topic-Bereiche einschränken, so ist dies wie folgt möglich:

```sh Mosca Nutzer mit eingeschränkten Rechten anlegen
mosca adduser myuser mypass --credentials ~/mosca/credentials.json \
  --authorize-publish 'hello/**' --authorize-subscribe 'hello/**'
```

Zur Sicherheit setzen wir nun noch die Dateirechte der Benutzerdatei so, dass nur der Eigentümer die Datei lesen darf:

```sh Dateirechte anpassen
chmod 0600 ~/mosca/credentials.json
```

Damit von *Mosca* die Benutzer beim Start geladen werden muss die entsprechende Datei als Parameter mit angegeben werden:

```sh Mosca Start mit Authentifizierung
mosca -v --credentials ~/mosca/credentials.json | bunyan
```

## Entfernen von Benutzern

Angelegte Benutzer können wie folgt wieder entfernt/gelöscht werden:

```sh Mosca Benutzer löschen
mosca rmuser myuser --credentials ~/mosca/credentials.json
```

## Konfiguration

Die Konfiguration kann über eine js-Datei erfolgen, die wir unter `~/mosca/config.js` speichern.  
Der Inhalt der Datei könnte wie folgt aussehen. Eine [vollständige Beschreibung](https://github.com/mcollina/mosca/wiki/Mosca-as-a-standalone-service.#configuration) ist im offiziellen GitHub Repository von *Mosca* zu finden.

```js Mosca Konfigurationsdatei
var mosca = require('mosca');

module.exports = {
  port: 1883,
  id: 'homepi-broker',
  stats: true,
  logger: {
    level: 'info'
  },
  backend: {
    type: 'redis',
    port: 6379,
    host: 'localhost',
    return_buffers: true
  },
  persistence: {
    factory: mosca.persistence.Redis,
    port: 6379,
    host: 'localhost'
  }
};
```

Diese Konfiguration verwendet [Redis](https://redis.io/) als Cache. Sofern ihr keine lokale Redis Installation betreibt oder diese Funktion nicht benötigt, können die Bereiche `backend` und `persistence` auch einfach weggelassen werden.

Damit die Config-Datei auch verwendet wird, muss sie beim Start mit angegeben werden:

```sh Start von *Mosca* mit Authentifizierung und Konfiguration
mosca -v --credentials ~/mosca/credentials.json --config ~/mosca/config.js | bunyan
```

## Startscript

Damit der Start von *Mosca* einfacher wird erstellen wir ein kleines Startscript in `~/mosca/mosca.sh`. Dieses Script wird auch für den weiter unten beschriebenen *SystemD*-Service benötigt.

```sh Mosca Startscript
#!/bin/bash
export PATH=$PATH:~/.npm-global/bin
export NODE_PATH=~/.npm-global/lib/node_modules

mosca -v --credentials ~/mosca/credentials.json --config ~/mosca/config.js | bunyan

exit $?
```

Die Pfade bei `PATH` und `NODE_PATH` müssen gegebenenfalls an das eigene System angepasst werden. Dies hängt unter anderem von der Art der Node.js Installation ab.

Abschließend müssen wir das Script noch ausführbar machen und können dann *Mosca* darüber starten:

```sh Startscript ausführbar machen und ausführen
chmod +x ~/mosca/mosca.sh
~/mosca/mosca.sh
```

## SystemD-Service

Damit der *Mosca* Broker in das System integriert wird, sollte ein *SystemD*-Service für diesen angelegt werden. Mit diesem kann *Mosca* dann beispielsweise automatisch beim Systemstart als Daemon gestartet werden.

Die *SystemD*-Service-Datei speichern wir mit folgendem Inhalt unter `/etc/systemd/system/mosca.service`.

```ini
[Unit]
Description=Mosca MQTT Broker
After=network.target

[Service]
ExecStart=/home/pi/mosca/mosca.sh
KillMode=control-group
Restart=always
RestartSec=3s
User=pi
Group=pi

[Install]
WantedBy=multi-user.target
```

Gegebenenfalls müssen der Pfad in `ExecStart`, sowie `User` und `Group` noch an das jeweilige System angepasst werden.

Der neue *SystemD*-Service kann anschließend wie folgt gestartet werden:

```sh SystemD-Service starten
sudo systemctl start mosca.service
```

Die Logmeldungen können wie gewohnt über `journalctl` eingesehen werden:

```sh SystemD-Service starten
sudo journalctl -u mosca.service
```

Die Ausgabe sollte dann in etwa so aussehen:

```plain
Sep 12 10:06:40 homepi systemd[1]: Started Mosca MQTT Broker.
Sep 12 10:06:40 homepi mosca.sh[6790]:        +++.+++:   ,+++    +++;   '+++    +++.
Sep 12 10:06:40 homepi mosca.sh[6790]:       ++.+++.++   ++.++  ++,'+  `+',++  ++,++
Sep 12 10:06:40 homepi mosca.sh[6790]:       +`  +,  +: .+  .+  +;  +; '+  '+  +`  +`
Sep 12 10:06:40 homepi mosca.sh[6790]:       +`  +.  +: ,+  `+  ++  +; '+  ;+  +   +.
Sep 12 10:06:40 homepi mosca.sh[6790]:       +`  +.  +: ,+  `+   +'    '+      +   +.
Sep 12 10:06:40 homepi mosca.sh[6790]:       +`  +.  +: ,+  `+   :+.   '+      +++++.
Sep 12 10:06:40 homepi mosca.sh[6790]:       +`  +.  +: ,+  `+    ++   '+      +++++.
Sep 12 10:06:40 homepi mosca.sh[6790]:       +`  +.  +: ,+  `+     ++  '+      +   +.
Sep 12 10:06:40 homepi mosca.sh[6790]:       +`  +.  +: ,+  `+  +:  +: '+  ;+  +   +.
Sep 12 10:06:40 homepi mosca.sh[6790]:       +`  +.  +: .+  .+  +;  +; '+  '+  +   +.
Sep 12 10:06:40 homepi mosca.sh[6790]:       +`  +.  +:  ++;++  ++'++   ++'+'  +   +.
Sep 12 10:06:40 homepi mosca.sh[6790]:       +`  +.  +:   +++    +++.   ,++'   +   +.
Sep 12 10:06:41 homepi mosca.sh[6790]: [1568275601915]  INFO: mosca/6792 on homepi: server started (mqtt=1883)
```

Wenn alles läuft kann der *SystemD*-Service noch aktiviert werden, sodass er automatisch bei jedem Systemstart geladen wird:

```sh SystemD-Service aktivieren
sudo systemctl enable mosca.service
```

## Möglicher Fehler beim Start des SystemD-Services

Wenn beim Start des *SystemD*-Services die Fehlermeldung `Error: Cannot find module 'mosca'` erscheint, dann hilft es das global installierte Modul `mosca` in das Verzeichnis der Datei `config.js` zu verlinken. Die machen wir wie folgt:

```sh Global installiertes Modul verlinken
cd ~/mosca
npm link mosca
```

Anschließend sollte der *SystemD*-Service ohne Fehlermeldung gestartet werden können.
