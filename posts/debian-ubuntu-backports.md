---
title: Debian/Ubuntu Backports
author:
  name: Peter Müller
  link: https://crycode.de
date: 2016-12-28 12:00:00
updated: 2024-04-29 20:57:00
categories:
  - [Software]
  - [Linux]
tags:
  - deb
  - Debian
  - Linux
  - Ubuntu
  - Updates
---

Bei Debian und teilweise auch Ubuntu *stable* gibt es hin und wieder das Problem, dass manche Pakte recht alt sind und bestimmte Software neuere Versionen der Pakete benötigt. Hier kommen die Debian *Backports* ins Spiel.

Backports sind Pakete, die auf Programmversionen aus *testing* (hauptsächlich) und *unstable* (nur in einigen Fällen, beispielsweise Sicherheits-Updates) basieren und so kompiliert wurden, dass sie möglichst ohne neue Bibliotheken auf Debian *stable* verwendet werden können.

<!-- more -->

> [!TIP]
> Es wird empfohlen, sich einzelne Backports herauszusuchen, die man benötigt, statt alle verfügbaren Backports zu installieren.

## Backports aktivieren

Um die Backports zu aktivieren fügt man in der Datei `/etc/apt/sources.list` den entsprechenden Eintrag hinzu.

Anschließend wird ein `apt update` ausgeführt und schon können die Backports verwendet werden.

### Beispiel für Debian Bookworm

```ini Eintrag für &#47;etc/apt/sources.list
# Backports
deb http://ftp.debian.org/debian bookworm-backports main contrib non-free
```

Wenn man ausschließlich freie Software verwenden möchte, dann sollte man die Sektionen `contrib` und `non-free` weg lassen.

### Beispiel für Ubuntu 22.04 (jammy)

```ini Eintrag für &#47;etc/apt/sources.list
# Backports
deb http://de.archive.ubuntu.com/ubuntu/ jammy-backports main restricted universe multiverse
deb-src http://de.archive.ubuntu.com/ubuntu/ jammy-backports main restricted universe multiverse
```

## Ein Paket aus den Backports installieren

Selbst wenn die Backports aktiviert sind, werden sie standardmäßig nicht verwendet. Dies ist auch gut so, da man in dem meisten Fällen ja die *stable*-Variante bevorzugt.

Um nun ein Paket aus den Backports zu installieren gibt man diese als Quelle bei der Installation über den Parameter `-t` oder über `paketname/xxx-backports` mit an.

### Beispiel für Debian Bookworm und das Paket borgbackup

```sh Beispielinstallation aus den Backports
apt -t bookworm-backports install borgbackup
```

### Beispiel für Ubuntu 22.04 (jammy) und das Paket libreoffice

```sh Beispielinstallation aus den Backports
apt-get install libreoffice/jammy-backports
```

## Weblinks

* [Backports im Debian Wiki](https://wiki.debian.org/de/Backports)
* [Backports in der Ubuntu Dokumentation](https://help.ubuntu.com/community/UbuntuBackports)
* [Liste mit Backports-Paketen von Ubuntu 22.04 (jammy)](https://packages.ubuntu.com/jammy-backports/)
