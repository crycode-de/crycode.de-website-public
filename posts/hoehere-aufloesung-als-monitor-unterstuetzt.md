---
title: Höhere Auflösung als Monitor unterstützt
author:
  name: Peter Müller
  link: https://crycode.de
date: 2014-12-11 12:00:00
updated: 2024-05-03 12:30:00
categories:
  - Linux
tags:
  - Desktop
  - Linux
  - Ubuntu
---

Vor allem bei kleinen Monitoren passiert es manchmal, dass ein Programmfenster zu groß ist, um komplett dargestellt zu werden. Meist liegen dann auch noch die benötigten Teile des Fensters außerhalb des sichtbaren Bereiches.

Hier kann man sich bei Linux ganz einfach durch Aktivierung des sogenannten *Panning* (engl. Schwenkung) für den Monitor behelfen. Das Panning sorgt dafür, dass der Desktop eine höhere Auflösung bekommt, als auf dem Monitor dargestellt werden kann. Der Sichtbare Ausschnitt des Desktops wird dabei der Maus folgend (Verfolgungsmodus) nach links, rechts, oben oder unten automatisch verschoben. Man sieht also immer nur einen Teil des Desktops.

<!-- more -->

> [!NOTE]
> Die hier gezeigte Anleitung geht von einem Linux-System mit X11 aus. Bei Verwendung von Wayland wird dies nicht funktionieren.

Grundlegend wird das Panning dem Befehl `xrandr –output <output> –panning <w>x<h>` aktiviert. `<w>` und `<h>` stellen dabei die Breite bzw. Höhe des Desktops dar und `<output>` ist der Anschluss des Monitors.

## Anschluss des Monitors herausfinden

Um den Anschluss herauszufinden geben wir einfach folgendes ein:

```sh Anschluss des Monitors herausfinden
xrandr --query
Screen 0: minimum 320 x 200, current 1920 x 1200, maximum 4096 x 4096
LVDS1 connected 1024x768+0+0 (normal left inverted right x axis y axis) 261mm x 163mm
   1280x800       60.0 +
   1024x768       60.0* 
   800x600        60.3     56.2  
   640x480        59.9  
VGA1 disconnected (normal left inverted right x axis y axis)
DVI1 connected 1920x1200+0+0 (normal left inverted right x axis y axis) 518mm x 324mm
   1920x1200      60.0*+
   1024x768       60.0 +
   1600x1200      60.0  
   1680x1050      60.0  
   1280x1024      60.0  
   1440x900       59.9  
   1280x960       60.0  
   800x600        60.3  
   640x480        60.0
```

Die Ausgabe zeigt welche Anschlüsse vorhanden und welche davon aktiv sind. Ebenso werden die momentane Auflösung und die für den jeweils angeschlossen Monitor möglichen Auflösungen dargestellt.

Vorhandene Anschlüsse sind hier `LVDS1`, `VGA1` und `DVI1`. (`LVDS1` ist ein Laptopdisplay.)

## Panning aktivieren

Möchte man für den Monitor an `LVDS1` das Panning mit einer Auflösung von beispielsweise `1920×1200` aktivieren, so gibt man folgendes ein:

```sh Panning aktivieren
xrandr --output LVDS1 --panning 1920x1200
```

Anschließend sollte der Desktop größer sein und der sichtbare Bereich sich mit dem Mauszeiger verschieben lassen.

## Panning deaktivieren

Möchte man das panning wieder deaktivieren, so gibt man als Höhe und Breite einfach `0x0` an.

```sh Panning deaktivieren
xrandr --output LVDS1 --panning 0x0
```

Nun sollte der Desktop wieder ganz normal mit der Auflösung des Monitors arbeiten und sich kein Ausschnitt mehr mit der Maus verschieben lassen.

## Siehe auch

* [RandR im Ubuntuusers Wiki](https://wiki.ubuntuusers.de/RandR/)
