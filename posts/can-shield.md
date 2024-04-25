---
title: CAN-Shield für Raspberry Pi und Arduino
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2024-04-25 13:57:11
categories:
  - [Elektronik]
tags:
  - CAN-Bus
  - Raspberry Pi
  - Arduino
  - MCP2515
  - Eigenentwicklung
abbr:
  CAN: Controller Area Network
  SPI: Serial Peripheral Interface
  GPIO: General Purpose Input Output
---

Das **CAN-Shield** ist eine von mir selbst entwickelte kleine Platine, über die sehr einfach eine {% abbr CAN %}-Bus Anbindung an einen Raspberry Pi, Arduino oder andere Hardware erfolgen kann.

<!-- more -->

Der Hardwareseitige Anschluss des {% abbr CAN %}-Bus erfolgt per RJ45 Stecker oder über Jumper-Kabel.

Auf einen Raspberry Pi kann das *CAN-Shield* ganz einfach aufgesteckt werden. Für den Anschluss an einen Arduino oder andere Hardware können die herausführten Stiftleisten verwendet werden.

## Hardware

Als Herzstück der Platine kommt ein [MCP2515](https://ww1.microchip.com/downloads/en/DeviceDoc/MCP2515-Stand-Alone-CAN-Controller-with-SPI-20001801J.pdf) {% abbr CAN %}-Controller zum Einsatz. Dieser Controller ist sehr weit verbreitet und bietet eine gute Unterstützung für den Raspberry Pi, Arduino und andere Platformen.

Die Hardwareseitige Anbindung an den Bus erfolgt über einen [MCP2562](https://ww1.microchip.com/downloads/en/devicedoc/20005167c.pdf) CAN-Transceiver.

Für den korrekten Takt des CAN-Controllers sorgt ein 16&nbsp;MHz Quarz.

Die Versorgungsspannung für den *MCP2515* CAN-Controller kann per Jumper (JP2) zwischen +3,3&nbsp;V (Raspberry Pi) und +5&nbsp;V (Arduino) gewählt werden.

{% grid 2 %}
{% img can-shield-1.webp thumb: CAN-Shield %}
{% img can-shield-2.webp thumb: CAN-Shield %}
{% img can-shield-3.webp thumb: CAN-Shield %}
{% img can-shield-4.webp thumb: CAN-Shield %}
{% img layout.webp thumb: Platinenlayout %}
{% img schaltplan.png thumb:schaltplan-thumb.webp Schaltplan %}
{% endgrid %}

Über einen Jumper (JP1) kann der auf der Platine vorhandene Abschlusswiderstand für den Bus aktiviert werden. Dieser Abschlusswiderstand muss an beiden Enden des CAN-Bus vorhanden (aktiv) sein. Bei allen Busteilnehmern dazwischen darf der Widerstand nicht aktiv sein!

> [!CAUTION]
> Die Belegung von der RJ45 Buchse ist auf mein Bus-System ausgelegt.  
> Eine vorgegebene Belegung gibt es meines Wissens nach nicht.

Die Platine habe ich bei [ALLPCB](https://www.allpcb.com/) fertigen lassen und anschließend selbst mit Bauteilen bestückt.

### Eagle-Dateien

* [Schaltplan](https://raw.githubusercontent.com/crycode-de/homepi-eagle/main/CAN-Shield.sch)
* [Layout](https://raw.githubusercontent.com/crycode-de/homepi-eagle/main/CAN-Shield.brd)

## Anschluss an einen Raspberry Pi

Auf einen Raspberry Pi kann das *CAN-Shield* einfach direkt aufgesteckt werden. Alle nötigen Verbindungen zwischen der Platine und dem Raspberry Pi erfolgen dabei über den 40-poligen Verbinder.

Als Datenleitungen werden für die {% abbr SPI %}-Schnittstelle *MISO*, *MOSI*, *SCLK* und *CE0* verwendet.

Der Interrupt erfolgt über {% abbr GPIO %} 6 (BCM).

> [!CAUTION]
> Der Jumper JP2 muss auf +3,3&nbsp;V gesteckt werden.  
> Damit wird der *MCP2515* mit den 3,3&nbsp;V des Raspberry Pi betrieben und verwendet somit die gleichen Signalpegel, wie der Raspi selbst. Bei +5&nbsp;V würde der Raspberry Pi beschädigt werden!

Die Software zur Einbindung habe ich im Beitrag [CAN-Bus am Raspberry Pi](/can-bus-am-raspberry-pi/) beschrieben.

## Anschluss an einen Arduino

Für den Anschluss an einen Arduino ist die Stiftleiste X2 vorgesehen. Hier sind alle nötigen Signale herausgeführt und können beispielsweise per Jumperkabel mit dem Arduino verbunden werden.

> [!NOTE]
> Der Jumper JP2 ist in diesem Fall auf +5&nbsp;V zu stecken.  
> Damit werden alle Teile des *CAN-Shield* dann mit den 5&nbsp;V des Arduino über X2 versorgt.

Gegebenenfalls ist für die Interrupt-Leitung ein externer PullUp-Widerstand von etwa 4,7&nbsp;kΩ erforderlich.

Für die Software für den Arduino kann beispielsweise die [Arduino MCP2515 CAN interface library](https://github.com/autowp/arduino-mcp2515) verwendet werden.

## Lizenz

Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

Copyright (c) 2020-2024 Peter Müller
