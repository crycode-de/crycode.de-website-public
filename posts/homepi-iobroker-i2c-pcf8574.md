---
title: Projekt HomePi - ioBroker I²C-Porterweiterung PCF8574
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2019-09-21 12:00:00
updated: 2024-04-19 13:27:10
categories:
  - [HomePi]
  - [ioBroker]
tags:
  - I2C-Bus
  - HomePi
  - ioBroker
  - PCF8574
  - Raspberry Pi
abbr:
  GPIO: General Purpose Input Output
  I²C: Inter Integrated Circuit
  IC: Integrated Circuit / Integrierter Schaltkreis
---

Über den Adapter *i2c* ist es möglich diverse Geräte über den {% abbr I²C %}-Bus in ioBroker einzubinden.

In meinem Projekt [HomePi](/kategorie/homepi) verwende ich einige ICs vom Typ [PCF8574](http://www.ti.com/lit/ds/symlink/pcf8574.pdf) zur Bereitstellung von zusätzlichen {% abbr GPIO %}s. Dieser Beitrag soll die Einbindung der *PCF8574* {% abbr IC %}s in ioBroker beschreiben.

<!-- more -->

Es wird davon ausgegangen, dass der {% abbr I²C %}-Bus bereits am Raspberry Pi eingerichtet ist und die angeschlossenen {% abbr IC %}s erreichbar sind.

## Installation des Adapters i2c

Die Installation des Adapters [i2c](https://github.com/UncleSamSwiss/ioBroker.i2c) ist ganz normal über das Stable-Repository von ioBroker möglich.

Sobald die Installation Abgeschlossen ist, öffnet sich automatisch die Adapterkonfiguration, welche wir vorerst auch direkt wieder *schließen* können.

In der Übersicht der Instanzen starten wir nun die Instanz `i2c.0` durch einen Klick auf den Start-Button.

Sobald die Instanz läuft, öffnen wir wieder die Adapterkonfiguration durch einen Klick auf den Schraubenschlüssel-Button und klicken dort dann auf Geräte suchen. Die erkannten {% abbr I²C %}-Geräte werden daraufhin als einzelne Tabs angezeigt und können über diese konfiguriert werden.

{% grid 2 %}
{% img adapter-i2c-allgemein.webp thumb: Allgemeine Einstellungen des i2c-Adapters %}
{% img adapter-i2c-pcf8574-ausgang.webp thumb: PCF8574 Einstellungen des i2c-Adapters %}
{% endgrid %}

## Verwendung der Interrupts

Für die Verwendung der Interrupts ist der [RPI-Monitor (rpi2) Adapter](https://github.com/iobroker-community-adapters/ioBroker.rpi2) erforderlich. Die Installation von diesem habe ich bereits im Beitrag [ioBroker GPIOs](/homepi-iobroker-gpios) beschrieben.  
Alternativ können auch andere beliebige ioBroker States als Auslöser verwendet werden, sofern dies Sinn macht.

Standardmäßig werden Veränderungen an Eingangspins über aktives Polling abgefragt. Das Intervall, in dem die Abfragen stattfinden wird über die Option *Abfrage-Intervall* festgelegt.

Über die Auswahl eines *Interrupt-Objektes* kann ein {% abbr GPIO %} des Raspberry Pi ausgewählt werden, an dem die Interrupt-Leitung des *PCF8574* {% abbr IC %}s angeschlossen ist. Sobald sich dann der State von diesem Interrupt-Objekt ändert, werden die Eingänge des {% abbr IC %}s neu gelesen. Das *Abfrage-Intervall* kann dann auf `0` gesetzt und damit deaktiviert werden.

{% img adapter-i2c-pcf8574-eingang.webp thumb: PCF8574 mit Interrupt Einstellungen des i2c-Adapters %}

## Objekte

Gemäß den gewählten Einstellungen für die einzelnen {% abbr IC %}s werden die Objekte für die Ein- und Ausgänge automatisch durch den Adapter angelegt und jeweils auch als *Input* oder *Output* gekennzeichnet.

{% img adapter-i2c-objekte.webp thumb: PCF8574 Objekte des i2c-Adapters %}

> [!NOTE]
> Es ist zwar möglich die Objekte per Hand umzubenennen, jedoch wird dies bei jedem Neustart des Adapter wieder überschrieben.  
> Möchte man eigene Infos hinzufügen, so kann die Beschreibung (`desc`) des Objekte verwendet werden. Diese wird nicht automatisch überschrieben.
