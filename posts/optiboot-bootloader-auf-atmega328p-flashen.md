---
title: Optiboot Bootloader auf ATMega328P flashen
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2019-09-12 12:00:00
updated: 2024-04-25 17:39:04
categories:
  - [Elektronik]
  - [HomePi]
tags:
  - Arduino
  - ATMega
  - Bootloader
  - Elektronik
  - Flashen
  - Mikrocontroller
abbr:
  ISP: In-System-Programmierung
  IC: Integrated Circuit / Integrierter Schaltkreis
  SPI: Serial Peripheral Interface
---

Auf manchen Platinen, die ich für meine Heimautomatisierung einsetze, befindet sich ein [ATMega328P](http://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf) Mikrocontroller. Dieser kann entweder über die {% abbr ISP %}-Schnittstelle oder deutlich einfacher über die serielle Schnittstelle programmiert werden.

Für die Programmierung über die serielle Schnittstelle muss vorher einmalig ein Bootloader auf den ATMega328P geflasht (programmiert) werden. Ich verwende hier den sehr verbreiteten [Optiboot](https://github.com/Optiboot/optiboot), welcher auch standardmäßig bei fast allen Arduinos zum Einsatz kommt.

<!-- more -->

Zum Flashen des Bootloaders und gleichzeitigen Setzen der richtigen Fuse- und Lockbits kommt ein Arduino Nano zusammen mit dem *Atmega Board Programmer* aus den [arduino_sketches](https://github.com/nickgammon/arduino_sketches) zum Einsatz.

## Verkabelung

{% img verkabelung.webp thumb: right:true Verkabelung %}

Die Verkabelung zwischen dem Arduino Nano und dem zu flashenden ATMega328P erfolgt wie bereits im Beitrag [Arduino als ISP-Programmer](/arduino-als-isp-programmer/) und unten in der Tabelle beschrieben.

Am {% abbr SPI %}-Bus des ATMega328P sollten beim Flashen möglichst keine weiteren {% abbr IC %}s angeschlossen oder aktiv sein, da dies den Flashvorgang stören könnte.

| Arduino Pin | ATMega328P Pin |
|---|---|
| D10 | Reset |
| D11 | MOSI |
| D12 | MISO |
| D13 | SCK |
| GND | GND |
| +5V | VCC (nur wenn keine externe Spannung vorhanden) |

## Atmega Board Programmer

Auf den Arduino Nano muss zunächst der *Atmega Board Programmer* geflasht werden.

Hierzu laden wir die aktuelle Version direkt aus dem [arduino_sketches GitHub Repository](https://github.com/nickgammon/arduino_sketches) herunter und öffnen davon das Verzeichnis *Atmega_Board_Programmer* in der Arduino IDE. Anschließend öffnen wir den *Seriellen Monitor* und stellen die Baudrate auf *115200* ein. Nun folgt der Upload des Programms auf den Arduino über den *Hochladen*-Button.

{% img atmega-board-programmer.webp thumb: Atmega Board Programmer in der Arduino IDE %}

Nach dem erfolgreichen Hochladen sollte dann folgendes im Monitor erscheinen:

{% img atmega-board-programmer-monitor.webp thumb: Atmega Board Programmer im Seriellen Monitor %}

## Flashen des Bootloaders

Zum Flashen des Bootloaders auf den ATMega328P tippen wir nun `U` für 16&nbsp;MHz ein und bestätigen mit Enter. Anschließend folgt ein `G` zum Programmieren des Bootloaders.

{% img atmega-board-programmer-monitor-2.webp thumb: Flashen des Bootloaders %}

Damit ist der Optiboot Bootloader auf den ATMega328P geflasht und die Fuse- und Lockbits sind automatisch richtig gesetzt.

## Überprüfen des Bootloaders

Zum Überprüfen des Bootloaders öffnen wir das Verzeichnis *Atmega_Board_Detector* aus den *arduino_sketches* und laden dieses Programm auf den Arduino hoch.

Die Ausgaben im Seriellen Monitor sollten dann wie folgt aussehen:

```plain Ausgaben vom Atmega Board Detector
Atmega chip detector.
Written by Nick Gammon.
Version 1.20
Compiled on Aug 20 2019 at 12:44:43 with Arduino IDE 10809.
Attempting to enter ICSP programming mode ...
Entered programming mode OK.
Signature = 0x1E 0x95 0x0F 
Processor = ATmega328P
Flash memory size = 32768 bytes.
LFuse = 0xFF 
HFuse = 0xDE 
EFuse = 0xFD 
Lock byte = 0xEF 
Clock calibration = 0xBB 
Bootloader in use: Yes
EEPROM preserved through erase: No
Watchdog timer always on: No
Bootloader is 512 bytes starting at 7E00

Bootloader:

7E00: 0x11 0x24 0x84 0xB7 0x14 0xBE 0x81 0xFF 0xF0 0xD0 0x85 0xE0 0x80 0x93 0x81 0x00 
7E10: 0x82 0xE0 0x80 0x93 0xC0 0x00 0x88 0xE1 0x80 0x93 0xC1 0x00 0x86 0xE0 0x80 0x93 
[...]
7FF0: 0xFF 0x27 0x09 0x94 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0x04 0x04 

MD5 sum of bootloader = 0xFB 0xF4 0x9B 0x7B 0x59 0x73 0x7F 0x65 0xE8 0xD0 0xF8 0xA5 0x08 0x12 0xE7 0x9F 
Bootloader name: optiboot_atmega328

First 256 bytes of program memory:

00: 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 
[...]
F0: 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 

Programming mode off.
```

## Hochladen eines Programms auf den ATMega328P über den Bootloader

Ist der Bootloader auf den ATMega328P geflasht, dann kann ein beliebiges Programm über die serielle Schnittstelle auf den Mikrocontroller hochgeladen werden.

In der Arduino IDE muss dafür als Board dann **Arduino/Genuino Uno** (ATMega328, 16 Mhz) ausgewählt werden.

Anschließend sollte ein Hochladen über einen USB-TTL-Adapter problemlos funktionieren.
