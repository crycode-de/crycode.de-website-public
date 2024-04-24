---
title: deb-downloader
author:
  name: Peter Müller
  link: https://crycode.de
#banner: banner.webp
date: 2018-01-14 12:00:00
updated: 2024-04-24 20:42:34
categories:
  - [Linux]
  - [Software]
tags:
  - Bash
  - deb
  - Debian
  - dpkg
  - Eigenentwicklung
  - Linux
  - Raspberry Pi
  - Ubuntu
---

Hin und wieder kommt es vor, dass man für ein (Debian basiertes) Linux-System, welches selbst keinen Zugang zum Internet hat, deb-Pakete aus den Repositories benötigt, um spezielle Software zu installieren.

Da es oftmals etwas mühselig ist, die entsprechenden Dateien per Hand in einem Repository zu finden, habe ich ein kleines Bash-Skript erstellt, welches einem die gesamte Arbeit abnimmt und die nötigen deb-Dateien herunterlädt. Die heruntergeladenen Dateien können anschließend auf das Zielsystem kopiert und dort installiert werden.

<!-- more -->

Das Skript lädt zuerst die entsprechenden Index-Dateien des Repositories herunter und entpackt diese. Mit Hilfe dieser Index-Dateien wird dann der Download-Link des entsprechenden Paketes ermittelt.

Optional ist es zudem möglich, alle Abhängigkeiten automatisch zu ermitteln und mit herunter zu laden.

Download des gesamten Skripts:

```sh Download des deb-downloader Skriptes
wget https://github.com/crycode-de/deb-downloader/raw/master/deb-downloader.sh
chmod +x deb-downloader.sh
```

[Projekt auf GitHub](https://github.com/crycode-de/deb-downloader)

## Aufruf des Skripts

Dem Skript müssen bestimmte Argumente mitgegeben werden.

### Benötigte Argumente

* `-m <Mirror URL>` Die URL des Spiegelservers vom Repository.
* `-d <Dist>` Codename der Distribution.
* `-p <Paket>` Name des Paketes, das heruntergeladen werden soll.

### Optionale Argumente

* `-c <Component>` Komponente(n) im Repository. Standard ist `main`.
* `-a <Architektur>` Architektur des Prozessors des Zielsystems. Standard ist `amd64`.
* `-D` Automatische Erkennung und Download aller Abhängigkeiten.
* `-t` Testlauf. Es werden nur die Index-Dateien des Repositories heruntergeladen und gegebenenfalls die Abhängigkeiten ermittelt.
* `-h` Anzeigen der Hilfe.

## Beispiele

Download des Paketes `nano` für Ubuntu `jammy` (22.04).

```sh Download von nano für Ubuntu jammy
./deb-downloader.sh -m http://archive.ubuntu.com/ubuntu/ -d jammy -p nano
```

Download des Paketes `inkscape` für Ubuntu `mantic` (23.10) unter Verwendung der `universe` Komponente für `i386` Systeme.

```sh Download von inkscape für Ubuntu mantic i386
./deb-downloader.sh -m http://archive.ubuntu.com/ubuntu/ -d mantic \
  -c universe -a i386 -p inkscape
```

Download des Paketes `ntp` für Raspberry Pi OS `bookworm` unter Verwendung der normalen Raspberry Pi OS Repository Einstellungen inklusive aller Abhängigkeiten.

```sh Download von ntp für Raspberry Pi OS bookworm mit allen Abhängigkeiten
./deb-downloader.sh -m http://archive.raspbian.org/raspbian/ -d bookworm \
  -c "main contrib non-free rpi" -a armhf -p ntp -D
```

## Lizenz

Lizenziert unter [GPL Version 2](http://www.gnu.de/documents/gpl-2.0.de.html)

Copyright (c) 2018 Peter Müller
