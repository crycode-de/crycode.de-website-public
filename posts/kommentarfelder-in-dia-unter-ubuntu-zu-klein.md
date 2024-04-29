---
title: Kommentarfelder in Dia unter Ubuntu zu klein
author:
  name: Peter Müller
  link: https://crycode.de
date: 2016-12-29 12:00:00
updated: 2017-04-29 12:00:00
categories:
  - [Software]
  - [Linux]
tags:
  - BugFix
  - Dia
  - Linux
  - Ubuntu
---

{% img dia-kommentarfelder-zu-klein.webp thumb: right:true Kommentarfelder zu klein %}

*Dia* ist ein Programm zum Zeichnen von Diagrammen wie Flussdiagrammen, Datenbank-Diagrammen, UML-Diagrammen usw. Es sind aber auch Freihand Diagramm-Zeichnungen möglich.

Unter Ubuntu gibt es in Dia einen Bug, durch den die Kommentarfelder zu klein dargestellt werden und dadurch teilweise gar nicht nutzbar sind. (siehe Bild)

<!-- more -->

## BugFix

Zur Lösung dieses Problems kann Dia mit dem folgenden Befehl gestartet werden:

```sh Start von Dia mit BugFix
LIBOVERLAY_SCROLLBAR=0 dia
```

Damit Dia immer (auch über beispielsweise einen Launcher) so gestartet wird, fügt man die Datei `/usr/bin/dia` die Variable `LIBOVERLAY_SCROLLBAR=0` nach folgendem Beispiel hinzu:

```sh &#47;usr/bin/dia
#!/bin/sh
#
# Wrapped that calls dia in integrated version
#

LIBOVERLAY_SCROLLBAR=0 dia-normal --integrated "$@"
```

## Weblinks

* [Dia im Ubuntu Wiki](https://wiki.ubuntuusers.de/Dia/)
* [Bug #1011446 "UML drawing tools’ comment fields are too small to be usable"](https://bugs.launchpad.net/ubuntu/+source/dia/+bug/1011446)
