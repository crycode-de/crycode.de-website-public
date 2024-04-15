---
title: Projekt HomePi - Aktive Kühlung für den Raspberry Pi
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2021-03-05 12:00:00
updated: 2024-04-11 19:05:00
abbr:
  PWM: Pulsweitenmodulation
  I²C: Inter Integrated Circuit
abbr_auto: true
categories:
  - HomePi
tags:
  - Elektronik
  - HomePi
  - I2C-Bus
  - Mikrocontroller
  - Platinen
  - PCB
---

Mit rein passiver Kühlung wird der in der Zentrale des *HomePi* eingesetzte Raspberry Pi 4, vor allem im Hochsommer, unter Volllast so warm, dass er beginnt seine Leistung zu drosseln. Da ich dies umgehen möchte und ohnehin geringere Temperaturen für die Hardware besser sind, habe ich eine extra Einschubplatine mit einem (vielleicht auch etwas überdimensionierten) Lüfter gebaut.

<!-- more -->

{% img eingebaute-platine.webp thumb:eingebaute-platine-thumb.webp Eingebaute Platine mit Lüfter right:true %}

Die Einschubplatine wird in der Zentrale direkt über der Platine mit dem Raspberry Pi eingesteckt, sodass der Lüfter von oben auf den Raspberry Pi pustet. Auf ihr ist ein handelsüblicher, möglichst leiser, 12 V PWM Lüfter mit einem Durchmesser von 80 mm montiert. Geregelt wird der Lüfter über einen Mikrocontroller vom Typ [ATtiny85](https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-2586-AVR-8-bit-Microcontroller-ATtiny25-ATtiny45-ATtiny85_Datasheet.pdf).

Der Mikrocontroller erhält über den I²C-Bus vom Raspberry Pi Steuerbefehle und regelt anhand dieser entsprechend den Lüfter über dessen PWM-Leitung. Zusätzlich kann der Raspberry Pi vom Mikrocontroller die aktuelle, aus dem Tachosignal des Lüfters ermittelte, Drehzahl abfragen.

Beim Start des Mikrocontrollers, oder einem entsprechenden Steuerbefehl über den I²C-Bus, werden automatisch die Eigenschaften des Lüfters ermittelt. Der Controller "lernt" somit in welchen Bereichen der Lüfter arbeitet. Damit ist im späteren Betrieb sichergestellt, dass der Lüfter beispielsweise bei einem Steuerbefehl von 0,1 % auf bei seiner minimalen Drehzahl läuft, aber nicht stehen bleibt.

{% grid 2 %}
{% img homepi-kuehler-1.webp thumb:homepi-kuehler-1-thumb.webp Kühler-Platine von oben %}
{% img homepi-kuehler-2.webp thumb:homepi-kuehler-2-thumb.webp Kühler-Platine von unten %}
{% img schaltplan.png thumb:schaltplan-thumb.png Schaltplan %}
{% img layout.png thumb:layout-thumb.png Platinenlayout %}
{% endgrid %}

## Software für den Mikrocontroller

Die Software für den ATtiny Mikrocontroller habe ich als [PlatformIO](https://platformio.org/) Projekt erstellt. PlatformIO ist ein Open Source Ecosystem für IoT-Anwendungen mit integrierter Verwaltung von verschiedensten Boards und Libraries. Als IDE kommt [Visual Studio Code](https://code.visualstudio.com/) zum Einsatz.

Beim Build und/oder Upload kümmert sich PlatformIO automatisch um alle benötigten Abhängigkeiten.

Der aktuelle Quellcode ist auf GitHub verfügbar: <https://github.com/crycode-de/attiny-i2c-fan-control>

## Steuerbefehle für den Mikrocontroller

Über die folgenden Steuerbefehle kann über den I²C-Bus mit dem Mikrocontroller interagiert werden:

| Register | Beschreibung |
|---|---|
| `0x00` | **Status**<br />Durch das Schreiben einer 1 in Bit 0 dieses Registers kann eine erneute Kalibrierung des Lüfters gestartet werden. |
| `0x01` | **Lüftergeschwindigkeit**<br />Durch das Schreiben in dieses Register kann die Lüftergeschwindigkeit gesetzt werden. Ebenso kann die aktuelle Einstellung gelesen werden.<br />Dabei bedeutet der Wert 0 *Lüfter aus* und 255 die *Maximalgeschwindigkeit*. |
| `0x02` | **Minimales PWM-Level für den Lüfter**<br />Lesen oder Schreiben des minimalen PWM-Levels für den Lüfter. Dies bestimmt die minimale Drehzahl bei einer gesetzten Lüftergeschwindigkeit von 1 und wird beim Start automatisch ermittelt. |
| `0x03` | **Aktuelle Lüftergeschwindigkeit in Umdrehungen pro Sekunde (RPS)**<br />Auslesen der aktuellen Lüftergeschwindigkeit in RPS.<br />Dieser Wert wird über das Tachosignal des Lüfters ermittelt. |
| `0x04` und `0x05` | **Aktuelle Lüftergeschwindigkeit in Umdrehungen pro Minute (RPM)**<br />Auslesen der aktuellen Lüftergeschwindigkeit in RPM.<br />Dieser Wert wird über das Tachosignal des Lüfters ermittelt.<br />`0x04` beinhaltet das Low-Byte und `0x05` das High-Byte. |

## Hinweise zum I²C-Bus

Da der verwendete ATtiny85 Mikrocontroller keine echte I²C-Schnittstelle besitzt, sondern diese über ein [USI](https://www.mikrocontroller.net/articles/USI) (Universal Serial Interface) bereitstellt, kann es beim Lesen oder Schreiben mehrerer Bytes auf einmal zu Problemen in der Kommunikation kommen.

Abhilfe schafft hier das einzelne Lesen/Schreiben der Bytes. So ist kann die aktuelle Lüftergeschwindigkeit in RPM durch einzelnes Lesen der Register `0x04` und `0x05` abgefragt werden, falls es beim Lesen eines Word (2 Bytes) auf `0x04` Probleme gibt.

Das nachfolgende Beispiel für ioBroker berücksichtigt dies bereits.

## Software in ioBroker

In *ioBroker* wird vom Info-Adapter die aktuelle CPU-Temperatur im State `info.0.sysinfo.cpu.temperature.main` erfasst. Alternativ kann man natürlich auch andere Quellen für die aktuelle Temperatur nutzen.

> [!NOTE]
> Der ioBroker Info-Adapter gilt inzwischen als veraltet und sollte mit Vorsicht genutzt werden.

Die Ansteuerung des Mikrocontrollers für den Lüfter erfolgt mit Hilfe des [ioBroker.i2c Adapters](https://github.com/UncleSamSwiss/ioBroker.i2c) über folgendes Skript:

{% codefile js iobroker-lueftersteuerung.js ioBroker Skript zur Lüftersteuerung %}

Solange dieses Skript läuft, wird der Lüfter damit automatisch anhand der aktuellen CPU-Temperatur geregelt. Je höher die CPU-Temperatur steigt, desto höher wird auch der Lüfter geregelt, um entgegenzuwirken. Bei Temperaturen unter der konfigurierten `TEMP_START` wird der Lüfter vollständig angehalten.

## Fazit

Mit dem Lüfter und dieser Regelung bewegen sich bei mir die CPU-Temperaturen des HomePi nun immer im Bereich zwischen 35 und 45 °C bei einer Ansteuerung des Lüfters von 0 bis 40 %.

Ohne diese Kühlung waren dies im Mai 2020 noch etwa 50 bis 70 °C und wäre im Hochsommer garantiert noch mehr geworden.
