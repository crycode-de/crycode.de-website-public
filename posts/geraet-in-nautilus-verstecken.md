---
title: Gerät in Nautilus verstecken
author:
  name: Peter Müller
  link: https://crycode.de
date: 2015-06-16 12:00:00
updated: 2017-04-29 12:00:00
categories:
  - Linux
tags:
  - Linux
  - Nautilus
  - Partitionen
  - Ubuntu
  - udev
---

Sind auf einem *Ubuntu*-System noch mehrere Partitionen (z.B. von Windows oder Wiederherstellungspartitionen vom Hersteller) vorhanden, so werden diese im Dateimanager Nautilus links als Geräte mit angezeigt, obwohl man diese oftmals gar nicht braucht.

Mit Hilfe einer einfachen *udev*-Regel lassen sich diese Partitionen aber recht einfach vom System verstecken.

<!-- more -->

{% img geraete-in-nautilus.webp right:true %}

Hierfür erstellen wir mit root-Rechten die neue Datei `/etc/udev/rules.d/99-hide-disks.rules` und schreiben in diese den folgenden Inhalt (hier am Beispiel der Partition `sda1`):

```sh udev Regel
KERNEL=="sda1", ENV{UDISKS_IGNORE}="1"
```

Bei älteren Ubuntu-Versionen (vor 12.10) ist der folgende Eintrag nötig:

```sh udev-Regel für Ubuntu vor 12.10
KERNEL=="sda1", ENV{UDISKS_PRESENTATION_HIDE}="1"
```

Dabei ist unbedingt auf die richtige Groß-Klein-Schreibung zu achten. Sollen mehrere Partitionen versteckt werden, so können auch mehrere dieser Einträge in einer Datei untereinander stehen.

Übernommen werden die Änderungen dann durch Eingabe von:

```sh udev-Regeln anwenden
sudo udevadm trigger
```

Außerdem gibt es noch die Möglichkeit die Partition direkt über ihre *UUID* zu identifizieren. Dies bietet den Vorteil, dass auch bei einer Umpartitionierung der Festplatte die udev-Regel noch funktioniert. Für die Verwendung der UUID sieht der Eintrag wie folgt aus:

```sh udev-Regel unter Verwendung der UUID
ENV{ID_FS_UUID}=="CE04-74EE", ENV{UDISKS_IGNORE}="1"
```

Informationen über die Partitionen erhält man ganz einfach über das Terminalprogramm `blkid`:

```sh Abruf von Infos Über die Partitionen
blkid
/dev/sda1: LABEL="DELLUTILITY" UUID="CE04-74EE" TYPE="vfat" PARTUUID="17ce600b-01" 
/dev/sda2: LABEL="OS" UUID="5450-4444" TYPE="vfat" PARTUUID="17ce600b-02" 
/dev/sda3: UUID="9b703fa9-1834-46c3-a2ca-600fc9c760f4" TYPE="ext4" PTTYPE="dos" PARTUUID="17ce600b-03" 
/dev/sda5: UUID="d0e1a718-9632-4021-a120-a82cfdebc5d2" TYPE="swap" PARTUUID="17ce600b-05"
```
