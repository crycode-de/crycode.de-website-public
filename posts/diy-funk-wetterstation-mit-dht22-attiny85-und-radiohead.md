---
title: DIY Funk-Wetterstation mit DHT22, ATtiny85 und RadioHead
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2017-08-12 12:00:00
updated: 2024-04-28 16:59:23
categories:
  - Elektronik
tags:
  - Arduino
  - ATtiny
  - DIY
  - Eigenentwicklung
  - Elektronik
  - Heimautomatisierung
  - Mikrocontroller
  - Node.js
  - RadioHead
abbr:
  LCD: Liquid-Crystal Display
---

In diesem Beitrag beschreibe ich, wie man mit recht einfachen Mitteln und wenigen Bauteilen selbst eine kleine Funk-Wetterstation mit Temperatur und Luftfeuchtigkeit bauen kann.

<!-- more -->

Als Grundlage verwenden wir:

* Einen Temperatur- und Luftfeuchtigkeitssensor vom Typ **DHT22**
* Einen Mikrocontroller vom Typ **ATtiny85**
* Ein **433&nbsp;MHz Funkmodul** (Sender)
* Einen **5&nbsp;V DC-Boost-Konverter**
* Ein bis drei **Mignon-Batterien** (AA, LR6)

Der ATtiny85 Mikrocontroller befindet sich die meiste Zeit im Tiefschlaf-Modus und wacht in regelmäßigen Zeitabständen durch den integrierten Watchdog kurz auf, um den DHT22 Sensor auszulesen und die Daten per Funk zu übermitteln.

Der DC-Boost-Konverter dient als Step-Up Wandler und macht aus 0,6 bis 4,7&nbsp;V von den Batterien eine stabile 5&nbsp;V Versorgungsspannung für die anderen Bauteile.

Softwareseitig verwenden wir zur Programmierung des ATtiny85 die [ArduinoIDE](https://www.arduino.cc/en/software) und zur Funkübertragung die Open Source paketbasierte Funkmodul-Bibliothek [RadioHead](http://www.airspayce.com/mikem/arduino/RadioHead/).

<!-- toc 2 -->

## Aufbau der Hardware

Der Aufbau der Hardware erfolgt nach folgendem Schema:

{% img steckbrett.webp thumb: Aufbau auf einem Steckbrett %}

Wichtig sind hier der 4,7&nbsp;kOhm Widerstand vom Data-Pin des DHT22 gegen +5&nbsp;V, sowie der 10&nbsp;kOhm Widerstand vom Reset-Pin des ATtiny85 gegen ebenfalls +5&nbsp;V.

Die beiden Leuchtdioden sind optional und dienen lediglich der Anzeige einer Aktivität des Mikrocontrollers. Es sollten am besten Low-Current LEDs (2&nbsp;mA) mit 1,5&nbsp;kOhm Vorwiderständen verwendet werden, um möglichst stromsparend zu arbeiten.  
Die grüne LED blinkt bei jeder Funkübertragung kurz auf und die rote LED zeigt, vom Mikrocontroller gesteuert, den Status an (einmal blinken = Ok, mehrfach blinken = Fehler).

Die direkte Verbindung vom Pluspol der Batterien zum Pin 7 (ADC1) des ATtiny85 dient der Spannungsüberwachung der Batterien.

Je nach Qualität des DC-Boost-Konverters kann es erforderlich sein, zwischen GND und +5&nbsp;V einen zusätzlichen kleinen Kondensator (~20&nbsp;µF) zu schalten.

Das Ganze platzsparend auf eine kleine Leiterplatte gebracht und in ein Gehäuse gesteckt könnte dann so aussehen:

{% img aufbau-1.webp thumb: Aufbau der Elektronik %}

{% grid 2 %}
{% img aufbau-2.webp Kleine Platine %}
{% img aufbau-3.webp Fertig zusammengebaut %}
{% endgrid %}

## Software

Die Software wird mit der ArduinoIDE auf den ATtiny85 Mikrocontroller geflasht. Wie dies grundlegend funktioniert, habe ich bereits im Beitrag [ATtiny Mikrocontroller mit Arduino IDE programmieren](/attiny-mikrocontroller-mit-arduino-ide-programmieren/) beschrieben.

Die gesamte Software ist im [GitHub Repository](https://github.com/crycode-de/attiny85-radiohead-dht22-weather-sensor) verfügbar.

Es wird bewusst nicht die aktuelle DHT22-Library von Adafruit eingesetzt, da diese für den ATtiny85 Mikrocontroller zu viel Speicher benötigt. Stattdessen wird die [Fast DHT22 Library](https://github.com/LittleBuster/avr-dht22) von Sergey Denisov benutzt.

Mit dieser Software schläft der ATtiny85 die meiste Zeit im *Power Down* Modus und benötigt dadurch extrem wenig Strom (< 10&nbsp;µA für die gesamte Schaltung).

Der Watchdog weckt den Mikrocontroller alle 8 Sekunden auf, woraufhin dieser einen Zähler hoch zählt und sich wieder schlafen legt.

Bei jedem siebenten Aufwachen, also *alle 56 Sekunden*, werden die Temperatur und die Luftfeuchtigkeit vom Sensor abgerufen und per Funk übertragen.

Möchte man genau alle 60 Sekunden einen Messwert haben, so kann im Arduino Sketch im oberen Config-Bereich `#define WATCHDOG_TIME 1` und `#define WATCHDOG_WAKEUPS_TARGET 60` gesetzt werden. Dies führt jedoch zu einem etwas höheren Energieverbrauch, da der Mikrocontroller dann 8 mal häufiger aufwacht.

Bei jedem 30. Messvorgang wird zudem der Batteriestatus über den Analog-Digial-Konverter (ADC) abgerufen und per Funk übertragen. Dies ist über `#define BAT_CHECK_INTERVAL 30` einstellbar.

Der Batteriestatus wird in zwei Formaten übertragen. Dies ist zum einen der reine ADC-Messwert im Bereich von 0 bis 255, was 0&nbsp;V bis 5&nbsp;V entspricht und zum anderen eine berechnete Prozentangabe. Diese Prozentangabe wird mit Hilfe der beiden Optionen `#define BAT_ADC_MIN 40` (~0,78&nbsp;V) und `#define BAT_ADC_MAX 225` (~4,41&nbsp;V) ermittelt.

### Board-Auswahl in der ArduinoIDE

Die folgenden Board-Einstellungen müssen vor dem Kompilieren in der ArduinoIDE vorgenommen werden:

Board: *ATtiny25/45/85*

Prozessor: *ATtiny85*

Clock: *Internal 8 MHz*

### Mögliche Probleme und Lösungen

#### Fehler beim Kompilieren

Abhängig von den verwendeten Versionen der ArduinoIDE und der RadioHead Bibliothek kann es beim Kompilieren zu Fehlermeldung wie beispielsweise `‘Serial’ was not declared in this scope` kommen. Grund hierfür ist, dass beim Kompilieren einzelne Module von RadioHead mit kompiliert werden, die jedoch gar nicht benötigt werden.

Die einfachste Lösung ist hier das Löschen oder Umbenennen der folgenden `.cpp` und `.h` Dateien der RadioHead Bibliothek: `RH_CC110`, `RH_E32`, `RH_MRF89`, `RH_NRF24`, `RH_NRF905`, `RH_RF22`, `RH_RF24`, `RH_RF69`, `RH_RF95`, `RHHardwareSPI`, `RHNRFSPIDriver`, `RHSPIDriver`

#### Daten werden nicht empfangen

Anhand der blinkenden LEDs ist erkennbar, dass der Sensor arbeitet, aber ein Empfänger bekommt keine Daten. Die häufigste Ursache dafür ist, dass die Fuse-Bits des ATtiny85 falsch gesetzt sind und er dadurch mit einem Takt von 1&nbsp;MHz anstatt den erwarteten 8&nbsp;MHz arbeitet.

Für den richtigen Takt sollte das Byte `lfuse` auf `0xE2` gesetzt sein. Dies wird am einfachsten erreicht, indem man über die ArduinoIDE über das Menü *Werkzeuge* -> *Bootloader berennen* den Bootloader sowie die passenden Fuse-Bits in den ATtiny85 schreibt. Anschließend muss der Sketch des Wettersensors nochmals neu auf den Controller hochgeladen werden.

## Übertragene RadioHead Datenpakete

Es werden vier verschiedene Arten von Datenpaketen übertragen. Das jeweils erste Byte eines Datenpakets kennzeichnet dabei die Art.

### 0x00 Startmeldung

Dieses Datenpaket wird einmalig beim Start des Mikrocontrollers übertragen.

Es besteht aus nur einem Byte mit dem Wert `0x00`.

### 0x01 Temperatur und Luftfeuchtigkeit

Dieses Datenpaket wird nach jeder Messung der Temperatur und Luftfeuchtigkeit übertragen.

Es besteht aus 9 Byte: `0x01`, gefolgt von 4 Byte Temperatur und 4 Byte Luftfeuchtigkeit, jeweils als Float Zahl im Little-Endian Format.

`0x01 t t t t h h h h`

z.B. `0x01 0xcd 0xcc 0xd0 0x41 0xcd 0xcc 0x4e 0x42`, was 26,1&nbsp;°C und 51,7&nbsp;% Luftfeuchtigkeit entspricht

### 0x02 Batteriestatus

Dieses Datenpaket besteht aus 3 Byte, beginnend mit dem Code `0x02`, gefolgt vom Batteriestatus in Prozent (0 bis 100) und dem reinen ADC-Wert (0 bis 255).

z.B. `0x02 0x64 0xe7`, was 100&nbsp;% und einem ADC-Wert von 231 entspricht

### 0xEE Fehlermeldung

Dieses Datenpaket mit einem Byte `0xEE` wird gesendet, wenn es bei der Messung der Temperatur/Luftfeuchtigkeit einen Fehler gab.

## Batterielebensdauer

Mit dieser Hard- und Software zeigt sich nun schon über mehrere Monate, dass circa 1&nbsp;% pro Monat von den Batterien verbraucht wird.

Damit sollte die Funk-Wetterstation also **mehrere Jahre** problemlos mit den drei Mignon-Batterien arbeiten können.

## Beispiel-Sketch für einen Empfänger

[Hier](https://gist.github.com/crycode-de/10496eedfdf82781e878d87b489892f8) ist ein Beispiel-Sketch für einen Empfänger zu finden, welcher unter anderem auf einem Arduino Nano oder Uno verwendet werden kann.

Die empfangenen Nachrichten werden anhand des Typs der Nachricht unterschiedlich verarbeitet. Die empfangenen Daten werden über die serielle Schnittstelle (USB-Anschluss eines Arduinos) ausgegeben.

Das Beispiel geht davon aus, dass alle empfangenen Nachrichten von einem Wettersensor stammen. Im produktiven Einsatz sollte beispielsweise anhand der Absenderadresse geprüft werden, ob die Nachricht von einem Wettersensor stammt.

## Anwendungsbeispiele

Ein Beispiel für die Anwendung dieser Mini-Wetterstation ist Überwachung und Protokollierung der Temperatur und Luftfeuchtigkeit im Gewächshaus unseres Gartens.

{% img im-einsatz.webp thumb: right:true Mini-Wetterstation im Einsatz %}

Die Wetterstation sendet im Minutentakt die aktuellen Daten an die Heimautomatisierung [ioBroker](https://www.iobroker.net/). Hier nimmt der ebenfalls von mir entwickelte Adapter [ioBroker.radiohead](https://github.com/crycode-de/ioBroker.radiohead) die Daten entgegen. Als Hardware wird auf der Empfängerseite (ioBroker) lediglich ein Arduino Nano mit 433&nbsp;MHz Funkempfänger benötigt, der als [Serial-Radio-Gateway](/radiohead-serial-radio-gateway/) dient.

Zweites Beispiel wäre ein Arduino mit 433&nbsp;MHz Funkempfänger und einem {% abbr LCD %}, welcher die gemessenen Daten entgegennimmt und auf dem Display darstellt.

Weiterhin kann über das [Node.js](https://nodejs.org/) Modul [radiohead-serial](https://www.npmjs.com/package/radiohead-serial) ein solcher Wettersensor in jedes Node.js Programm eingebunden werden. Damit sind die Möglichkeiten nahezu unendlich. 😉

## Lizenz

Lizenziert unter GPL Version 2

Copyright (c) 2017-2024 Peter Müller
