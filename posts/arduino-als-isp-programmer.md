---
title: Arduino als ISP-Programmer
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2017-07-27 12:00:00
categories:
  - Elektronik
tags:
  - Arduino
  - ATMega
  - ATtiny
  - Elektronik
  - ISP-Programmer
  - Mikrocontroller
abbr:
  ISP: In-System-Programmierung
  SPI: Serial Peripheral Interface
---

Ein Arduino kann recht einfach auch als {% abbr ISP %}-Programmer für andere Mikrocontroller verwendet werden. Dabei kommt die serielle {% abbr SPI %}-Schnittstelle zum Einsatz.

Mit Hilfe eines {% abbr ISP %}-Programmers ist es möglich, diverse Mikrocontroller-Typen zu programmieren. ISP steht dabei für In-System-Programming, was so viel bedeutet, wie dass der Controller direkt im Einsatzsystem programmiert werden kann.

<!-- more -->

Im folgenden Beispiel verwende ich einen *Arduino Nano* zum Programmieren eines *ATtiny85* Controllers. Es können natürlich auch andere Arduinos und andere Mikrocontroller (z.B. ATMega8, ATMega328, ATMega64, etc.) verwendet werden.

## Arduino vorbereiten

Damit der Arduino als {% abbr ISP %}-Programmer eingesetzt werden kann, muss dieser erst selbst entsprechend programmiert werden.

Hierfür ist in der *Arduino IDE* bereits das Beispiel *ArduinoISP* enthalten, welches lediglich geöffnet und über USB auf den Arduino geladen werden muss.

{% img arduinoisp.webp thumb: ArduinoISP Sketch laden %}

## Verkabelung zum Ziel-Mikrocontroller

Die Verkabelung zum Ziel-Mikrocontroller erfolgt nach dem folgenden Muster.

{% grid 2 %}
{% img steckplatine.webp thumb: Steckplatine %}
{% img schaltplan.webp thumb: Schaltplan %}
{% endgrid %}

| Arduino Pin | ISP-Funktion | Farbe im Beispiel |
|---|---|---|
| D13 | SCK | gelb |
| D12 | MISO | grün |
| D11 | MOSI | orange |
| D10 | RESET | weiß |

Der Kondensator dient als Puffer für den Reset des Arduinos selbst, da der Arduino sonst beim Programmieren des Ziel-Mikrocontrollers oftmals resettet wird und damit das Programmieren fehlschlägt. Ich habe hier einen 22&nbsp;µF Elko verwendet, da dieser mir als erstes in die Hände fiel. Andere Kondensatoren in dieser Größenordnung sollen den gleichen Effekt haben.

Der 10&nbsp;kΩ Widerstand dient als Pull-Up für den Reset des Ziel-Mikrocontrollers.

{% img steckplatine-foto.webp thumb: Foto vom Aufbau auf einer Steckplatine %}

## Programmieren des Ziel-Mikrocontrollers

### Arduino IDE

In der Arduino IDE muss über das Menü *Werkzeuge* -> *Programmer* -> *Arduino as ISP* ausgewählt werden.

Dann kann der Sketch entweder durch klicken des *Hochladen*-Buttons bei gedrückter Umschalttaste, oder über das Menü *Sketch* -> *Hochladen mit Programmer* auf den Ziel-Mikrocontroller geladen werden.

### avrdude

Bei Verwendung von *avrdude* über die Kommandozeile sind die folgenden Parameter anzugeben:

* Programmer: `-c arduino` oder `-c stk500v1`
* Port: `-P /dev/ttyUSB0`
* Baud: `-b 19200`

Zum Lesen der Fuse-Bits des ATtiny85 würde der komplette avrdude-Befehl dann so aussehen:

```sh Fuse-Bits des ATtiny85 mit avrdude auslesen
avrdude -p t85 -c arduino -P /dev/ttyUSB0 -b 19200 -v -E noreset -F \
  -U lfuse:r:-:i -U hfuse:r:-:i
```
