---
title: Node.js Modul pcf8574
author:
  name: Peter Müller
  link: https://crycode.de
#banner: banner.webp
date: 2017-04-17 12:00:00
updated: 2024-04-29 14:42:39
categories:
  - Node.js
tags:
  - Eigenentwicklung
  - I2C-Bus
  - Node.js
  - PCF8574
  - GPIO
abbr:
  I²C: Inter Integrated Circuit
  IC: Integrated Circuit / Integrierter Schaltkreis
---

Mit dem Node.js Modul [pcf8574](https://www.npmjs.com/package/pcf8574) ist es möglich, jeden Pin eines PCF8574/PCF8574A Porterweiterungs-{% abbr IC %}s einzeln zu kontrollieren. Es ist eine Eigenentwicklung von mir und kann über den Node.js Paketmanager `npm` installiert werden.

<!-- more -->

Der Quellcode ist öffentlich auf [GitHub](https://github.com/crycode-de/node-pcf8574) verfügbar.

> [!IMPORTANT]
> Dieses Paket ist inzwischen veraltet und sollte nicht länger verwendet werden.  
> Die neue Variante [i2c-io-expanders](https://www.npmjs.com/package/i2c-io-expanders) unterstützt zusätzliche {% abbr IC %}s und kann als drop-in Ersatz verwendet werden.

## Was kann das Modul pcf8574?

Jeder Pin eines PCF8574/PCF8574A {% abbr IC %}s kann einzeln entweder als Eingang oder als Ausgang definiert werden. Änderungen an Eingangs-Pins können über einen Interrupt oder durch aktives Polling erfasst werden.

Der PCF8574/PCF8574A ist ein 8-Bit Porterweiterungs-IC, welcher über den {% abbr I²C %}-Bus angesteuert wird. Jeder der 8 Pins kann separat als Eingang oder Ausgang benutzt werden. Weiterhin bietet der IC ein Interrupt-Signal, welches dem {% abbr I²C %}-Master (z.B. einem Raspberry Pi) mitteilen kann, dass sich etwas an einem Pin geändert hat. Weitere Informationen zu dem PCF8574/PCF8574A sind im [Datenblatt von Texas Instruments](http://www.ti.com/lit/ds/symlink/pcf8574.pdf) zu finden.

## Installation

```sh Installation von pcf8574
npm install pcf8574
```

TypeScript-Definitionen sind in dem Paket enthalten. Somit kann es ohne Weiteres direkt mit TypeScript verwendet werden.

Das Modul sollte auf jedem Linux basierten Betriebssystem funktionieren, sofern eine {% abbr I²C %} Schnittstelle vorhanden ist.

Zur Verwendung der Interrupt-Erkennung ist ein Raspberry Pi (oder ähnliches) erforderlich.

## Beispiele

Beachte bitte, dass das `i2c-bus` Objekt vorher erstellt und zusammen mit der {% abbr I²C %}-Adresse des {% abbr IC %}s an den Konstruktor der PCF8574-Klasse übergeben werden muss.

Das folgende Beispiel ist auch zusammen mit einem TypeScript-Beispiel im Repository unter [examples](https://github.com/crycode-de/node-pcf8574/tree/master/examples) zu finden.

{% codefile js example.js Beispiel zur Nutzung des Moduls pcf8574 %}

## API

Die API verwendet **Events** für erkannte Änderungen an Eingängen und **Promises** für alle asynchronen Aktionen.

Änderungen an Eingängen können auf zwei Wege erkannt werden:

* Unter Verwendung eines GPIO zur Beachtung des Interrupt-Signal vom PCF8574/PCF8574A. *Empfohlen bei Verwendung eines Raspberry Pi oder ähnlichem.*
* Manueller Aufruf der Funktion `doPoll()` in regelmäßigen Abständen, um aktiv den aktuellen Status des {% abbr IC %}s abzufragen. Dies führt zu einer höheren Last auf dem {% abbr I²C %}-Bus.

Wenn ein Pin als Eingang definiert ist und eine Änderung an diesem Pin erkannt wird, dann wir ein `input`-Event ausgelöst. Diesem Event wird ein Objekt mit dem Pin (`pin`) und dem neuen Wert (`value`) mitgegeben.

Für jeden Pin kann das invertiert-Flag einzeln gesetzt werden, was einen invertierten Eingang oder Ausgang zur Folge hat. Wenn ein invertierter Eingang ein low-Level aufweist wird dies als true interpretiert und ein high-Level als false. Ein invertierter Ausgang wird ein low-Level aufweisen, wenn er auf true gesetzt wird und ein high-Level bei false.

### new PCF8574(i2cBus, address, initialState)

```ts
constructor (i2cBus: I2CBus, address: number, initialState: boolean | number);
```

Konstruktor für eine neue PCF8574-Instanz.

* `i2cBus` – Instanz eines geöffneten i2c-bus.
* `address` – Die Adresse des PCF8574/PCF8574A ICs.
* `initialState` – Der Anfangszustand der Pins des ICs. Es kann eine Bitmaske (z.B. 0b00101010) verwendet werden, um jeden Pin einzeln festzulegen, oder true/false, um alle Pins auf einmal zu definieren.

Beachte bitte, dass das `i2c-bus` Objekt vorher erstellt und an den Konstruktor der PCF8574-Klasse übergeben werden muss.

Wenn der IC mit einem oder mehreren Eingängen verwendet wird, dann muss eine der folgenden Funktionen aufgerufen werden:

* `enableInterrupt(gpioPin)`, um die Interrupt-Erkennung über einen GPIO-Pin zu aktivieren, oder
* `doPoll()` in regelmäßigen Abständen, um Eingangsänderungen durch manuelles Abfragen zu erkennen.

### enableInterrupt(gpioPin)

```ts
enableInterrupt (gpioPin: PCF8574.PinNumber): void;
```

Aktiviert die Interrupt-Erkennung am angegebenen GPIO-Pin. Ein GPIO-Pin kann für mehrere Instanzen der PCF8574-Klasse verwendet werden.

* `gpioPin` – BCM-Nummer des Pins, der für Interrupt-Erkennung des PCF8574/PCF8574A ICs genutzt wird.

### disableInterrupt()

```ts
disableInterrupt (): void;
```

Deaktiviert die Interrupt-Erkennung. Gibt außerdem dem GPIO-Pin wieder frei.

### doPoll()

```ts
doPoll (): Promise<void>;
```

Manuell Änderungen an Eingangs-Pins des PCF8574/PCF8574A abfragen.

Wenn eine Änderung erkannt wurde, dann wird das `input`-Event ausgelöst. Diesem Event wird ein Objekt mit dem Pin (`pin`) und dem neuen Wert (`value`) des Pins mitgegeben.

Diese Funktion muss in regelmäßigen Abständen aufgerufen werden, wenn keine Interrupt-Erkennung verwendet wird. Erfolgt ein neuer Poll bevor der letzte abgeschlossen ist, dann wird das Promise mit einem Fehler zurückgewiesen.

### outputPin(pin, inverted, initialValue)

```ts
outputPin (pin: PCF8574.PinNumber, inverted: boolean, initialValue?: boolean): Promise<void>;
```

Definiert einen Pin als Ausgang.

* `pin` – Die Nummer des Pins. (0 bis 7)
* `inverted` – true wenn der Pin invertiert sein soll.
* `initialValue` – (optional) Der Anfangswert des Pins. Wird beim Einrichten des Pins gesetzt.

### inputPin(pin, inverted)

```ts
inputPin (pin: PCF8574.PinNumber, inverted: boolean): Promise<void>;
```

Definiert einen Pin als Eingang. Dies markiert einen Pin für die Auswertung von Signaländerungen und setzt einen high-Pegel an diesem Pin.

* `pin` – Die Nummer des Pins. (0 bis 7)
* `inverted` – true wenn der Pin invertiert sein soll.

Achtung: Der Pin wird immer intern auf einen high-Pegel gesetzt. (Pull-Up)

### setPin(pin, value)

```ts
setPin (pin: PCF8574.PinNumber, value?: boolean): Promise<void>;
```

Setzt den Wert eines Ausgangs. Wenn kein neuer Wert angegeben wird, dann wird der Ausgang getoggelt.

* `pin` – Die Nummer des Pins. (0 bis 7)
* `value` – Der neue Wert für den Pin.

### setAllPins(value)

```ts
setAllPins (value: boolean): Promise<void>;
```

Setzt den Wert aller Ausgänge.

* `value` – Der neue Wert für alle Ausgangs-Pins.

### getPinValue(pin)

```ts
getPinValue (pin: PCF8574.PinNumber): boolean;
```

Gibt den aktuellen Wert eines Pins zurück. Dies ist der zuletzt gespeicherte Zustand des Pins und nicht zwangsläufig der aktuell am {% abbr IC %} anliegende Zustand. Um den aktuellen Zustand zu erhalten muss zuerst `doPoll()` aufgerufen werden, wenn keine Interrupts verwendet werden.

## Lizenz

Lizenziert unter der [GPL Version 2](http://www.gnu.de/documents/gpl-2.0.de.html)

Copyright ©2017-2024 Peter Müller
