---
title: Projekt HomePi - Hardware der Zentrale Teil 2
author:
  name: Peter Müller
  link: https://crycode.de
banner: ../homepi-hardware-zentrale-teil-1/banner.webp
date: 2019-09-12 12:00:00
categories:
  - [HomePi]
tags:
  - HomePi
  - 433 MHz
  - Hardware
  - Netzteil
  - Patchpanel
  - USB-Festplatte
abbr:
  HE: Höheneinheiten
  TE: Teileinheiten
---

Dieser Beitrag soll der Hardware in der Zentrale des *HomePi* beschreiben.

In *Teil 2* sind dies Gehäuse, Netzteil und sonstige Komponenten.  
Hier geht es zu [Teil 1](/homepi-hardware-zentrale-teil-1/).

<!-- more -->

<!-- toc -->

## Gehäuse

Als Gehäuse für die Zentrale des *HomePi* dient eine Standard 19” Baugruppenträger mit 3&nbsp;{% abbr HE %} und 84&nbsp;{% abbr TE %}. Dieser ermöglicht einen einfachen und modularen Aufbau unter Nutzung von gängigen Industriestandards.

Hinten in dem Baugruppenträger ist die [Backplane](/homepi-hardware-zentrale-teil-1#backplane) montiert. Einzelne Einschubplatinen, wie beispielsweise die [Hauptplatine](/homepi-hardware-zentrale-teil-1#hauptplatine), können flexibel über ein Schienensystem eingesetzt und auf die Backplane gesteckt werden.

Den Baugruppenträger habe ich dann hochkant mit Hilfe eines Holzrahmens in einem kleinen Abstellraum fest montiert.

{% grid 2 %}
{% img baugruppentraeger-mit-backplane.webp thumb: Baugruppenträger mit Backplane %}
{% img baugruppentraeger-mit-platinen.webp thumb: Baugruppenträger mit eingesteckten Platinen %}
{% endgrid %}

{% img baugruppentraeger.webp thumb: Baugruppenträger %}

## Netzteil

Als Netzteil für die gesamte Spannungs- und Stromversorgung des *HomePi* inklusive aller direkt angeschlossenen Komponenten kommt ein 24&nbsp;V Schaltnetzteil zum Einsatz, welches bis zu 3&nbsp;A Strom liefern kann.

Die Spannung von 24&nbsp;V ist gut geeignet für eine Verteilung, auch über längere Kabel, im gesamten Haus, da hier für auch etwas größere Lasten ein recht geringer Strom benötigt wird. Dies wiederum wirkt sich positiv auf die entstehenden Übertragungsverluste aus. Die einzelnen angeschlossenen Komponenten können die 24&nbsp;V dann entweder direkt nutzen oder daraus ihre benötigten Spannungen (meist 5&nbsp;V oder 3,3&nbsp;V) selbst erzeugen.

Bei meinem System kommt ein Netzteil vom Typ 315-00008 von RND Power zum Einsatz. Dieses bietet einen guten Wirkungsgrad von 86&nbsp;% sowie eine geringe Restwelligkeit von etwa 120&nbsp;mV (laut Datenblatt). Zudem ist die Ausgangsspannung justierbar, das heißt sie kann innerhalb eines gewissen Bereiches manuell angepasst beziehungsweise nachgeregelt werden.

> [!NOTE]
> Ein gutes Netzteil ist wichtig für eine zuverlässige Funktion des Gesamtsystems.

{% grid 3 %}
{% img netzteil-1.webp thumb: Netzteil %}
{% img netzteil-2.webp thumb: Netzteil %}
{% img netzteil-3.webp thumb: Netzteil in Betrieb %}
{% endgrid %}

> [!CAUTION]
> **Wichtiger Hinweis:** Arbeiten an der 230&nbsp;V Elektrik sollten immer nur durch Elektrofachkräfte vorgenommen werden!

## USB-Festplatte

Aufgrund der Größe und der begrenzten Lebensdauer einer SD-Karte verwende ich bei meinem *HomePi* eine externe USB 3.0 Festplatte.

Auf dieser Festplatte befinden sich das Root-Dateisystem `/`, eine extra Home-Partition `/home`, eine Daten-Partition `/var/data`, sowie eine 8&nbsp;Gb große Swap-Partition.

Zumindest gefühlt startet der Raspberry Pi 4 zusammen mit der USB 3.0 Festplatte sogar schneller als von der standardmäßigen SD-Karte. 🙂

Wie die Einrichtung der USB-Festplatte funktioniert, habe ich grundlegend im Beitrag [USB-Festplatte am Raspberry Pi](/usb-festplatte-am-raspberry-pi/) beschrieben.

{% img usb-festplatte.webp thumb: USB-Festplatte %}

## 433 MHz Funkmodule

Für den 433&nbsp;MHz Funk über das [RadioHead](http://www.airspayce.com/mikem/arduino/RadioHead/) Protokoll kommen je ein Sender und Empfänger vom Typ *3400RF* und ein *Arduino Nano* zum Einsatz.

Die Funkmodule sind mit dem Arduino Nano verbunden. Der Arduino ist über USB an den zentralen Raspberry Pi angeschlossen und arbeitet als [Gateway](/radiohead-serial-radio-gateway/) zwischen dem 433&nbsp;MHz Funk und der seriellen Anbindung an den Raspberry Pi. Ein entsprechender Sketch für den Arduino ist [hier](https://github.com/crycode-de/node-radiohead-serial/blob/master/examples/rh_serial_ask_gateway.ino) zu finden.

Für einen besseren Empfang kommen zwei selbst gebaute [433&nbsp;MHz Dipol-Antennen](/diy-433-mhz-dipol-antenne/) zum Einsatz.

{% grid 2 %}
{% img 3400rf.webp thumb: 3400RF Funkmodule %}
{% img diy-433mhz-antenne.webp thumb: DIY 433 MHz Dipol-Antenne %}
{% img arduino-433mhz-gateway-1.webp thumb: Arduino 433 MHz Gateway %}
{% img arduino-433mhz-gateway-2.webp thumb: Arduino 433 MHz Gateway %}
{% endgrid %}

## Patchpanel

Für eine möglichst einfache und flexible Verkabelung wird ein einfaches 24-Port RJ45 Patchpanel verwendet. Hier können alle ankommenden Kabel ordentlich aufgelegt und anschließend über kurze Patchkabel mit den entsprechenden Ports der *HomePi*-Hardware verbunden werden.

Ich habe mir das Patchpanel so eingeteilt, dass die oberen Ports 1 bis 8 für den CAN-Bus und die unteren Ports 17 bis 24 für Ethernet reserviert sind. Die Mittleren Ports 9 bis 16 sind momentan als Reserve für eventuelle Erweiterungen vorgesehen.

{% img patchpanel-3.webp thumb: Patchpanel %}

{% grid 2 %}
{% img patchpanel-1.webp thumb: Patchpanel %}
{% img patchpanel-2.webp thumb: Patchpanel %}
{% endgrid %}
