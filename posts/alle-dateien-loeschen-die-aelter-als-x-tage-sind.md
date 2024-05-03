---
title: Alle Dateien löschen, die älter als X Tage sind
author:
  name: Peter Müller
  link: https://crycode.de
date: 2014-12-16 12:00:00
updated: 2016-12-16 12:00:00
categories:
  - Linux
tags:
  - Bash
  - Linux
  - Shell
---


Oftmals wird die Festplatte durch Backups und Logdateien immer voller.

Möchte man nun alle Dateien in einem Verzeichnis, die älter als z.B. 14 Tage sind löschen, so geht dies ganz einfach mit dem folgenden Befehl:

```sh Beispiel um Dateien älter als 14 Tage zu löschen
find /var/backup -name 'meinbackup*' -mtime +14 -exec rm -f {} \;
```

<!-- more -->

Da die Syntax des Befehls etwas kryptisch aussieht hier noch eine kurze Erklärung:

Mit `find` werden im Verzeichnis `/var/backup` alle Dateien gesucht, deren Dateiname mit *meinbackup* anfängt und die vor mehr als 14 Tagen zuletzt modifiziert wurden. Für alle von `find` gefundenen Dateien wird dann `rm` ohne jegliche Nachfragen ausgeführt.

Weitere Möglichkeiten zur zeitlichen Filterung der Dateien sind:

`-amin` letzter Dateizugriff in Minuten
`-atime` letzter Dateizugriff in Tagen
`-cmin` letzte Dateistatusänderung (z.B. Dateirechte) in Minuten
`-ctime` letzte Dateistatusänderung (z.B. Dateirechte) in Tagen
`-mmin` letzte inhaltliche Änderung der Datei in Minuten
`-mtime` letzte inhaltliche Änderung der Datei in Tagen
