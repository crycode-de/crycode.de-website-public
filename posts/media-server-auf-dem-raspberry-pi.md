---
title: Media-Server auf dem Raspberry Pi
author:
  name: Peter Müller
  link: https://crycode.de
date: 2015-10-04 12:00:00
updated: 2017-05-24 12:00:00
categories:
  - [Software]
  - [Server]
  - [Raspberry Pi]
tags:
  - Heimnetz
  - Linux
  - Raspberry Pi
  - Server
---

Mit Hilfe eines Media-Servers können Musik, Videos und Bilder über das Netzwerk an DLNA-fähige Geräte (beispielsweise Smart-TV) gestreamt werden.

Für den Raspberry Pi gibt es den DLNA-Server *MiniDLNA*, welchen wir im Folgenden installieren und einrichten werden.

<!-- more -->

## Installation

Die Installation ist über die Paketverwaltung gewohnt einfach.

```sh Installation von MiniDLNA
sudo apt update
sudo apt install minidlna
```

## Konfiguration

Die Konfiguration von *MiniDLNA* erfolgt in der Datei `/etc/minidlna.conf`.

Entscheidend ist hier der Eintag `media_dir`, da über diesen das Verzeichnis mit den bereitzustellenden Daten festgelegt wird. Möchten wir zum Beispiel alle Daten in `/var/daten/dlna` freigeben passen wir den Eintrag wie folgt an:

```ini Eintrag des Verzeichnisses in minidlna.conf
media_dir=/var/daten/dlna
```

Es ist auch möglich getrennte Verzeichnisse für Audio (A), Bilder/Pictures (P) und Videos (V) nach folgendem Muster anzugeben:

```ini Eintrag von verschiedenen Verzeichnissen ja Mediatyp in minidlna.conf
media_dir=A,/var/daten/musik
media_dir=P,/var/daten/fotos
media_dir=V,/var/daten/videos
```

Etwas weiter unten müssen wir noch die Zeile `#network_interface=` ändern und die verwendete Netzwerkschnittstelle (`eth0` oder `wlan0`) eintragen.

```ini Netzwerkinterface in minidlna.conf
network_interface=eth0
```

Damit *MiniDLNA* automatisch neue Dateien erkennt und hinzufügt entfernen wir noch die `#` vor dem entsprechenden Eintrag in der `minidlna.conf`.

```ini Erkennung neuer Dateien in minidlna.conf
inotify=yes
```

Den bei den Clients angezeigten Namen unseres DLNA-Servers können wir bei `friendly_name=` angeben.

```ini Name des Servers in minidlna.conf
friendly_name=RasPi Media-Server
```

Sind alle Einstellungen angepasst und die Datei gespeichert starten wir *MiniDLNA* neu um die Änderungen zu übernehmen.

```sh Neustart von MiniDLNA
sudo systemctl restart minidlna
```

*MiniDLNA* fängt nun an seinen Index der Mediendateien aufzubauen. Dies kann einige Zeit dauern.

Den aktuellen Status könnt ihr über einen Browser über `http://raspberrypi:8200` abfragen. Dabei müsst ihr `raspberrypi` durch den Hostnamen oder die IP-Adresse eures RasPi ersetzen.

DLNA-Clients im lokalen Netzwerk (zum Beispiel ein Smart-TV oder Windows) sollten nun bereits den *RasPi Media-Server* anzeigen und verwenden können.
