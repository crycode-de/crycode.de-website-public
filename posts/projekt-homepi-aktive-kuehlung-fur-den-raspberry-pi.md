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

```js ioBroker Skript zur Lüftersteuerung
/**
 * ioBroker script to communicate with the HomePi Fan Microcontroller.
 * 
 * Copyright (C) 2020-2024 Peter Müller <peter@crycode.de> (https://crycode.de)
 */

/**
 * I²C address of the fan microcontroller.
 */
const FAN_ADDRESS = 0x66;

/**
 * I²C register to set the fan speed.
 */
const REGISTER_FAN_SPEED = 0x01;

/**
 * I²C register to read the fan rpm.
 */
const REGISTER_RPM = 0x04;

/**
 * Temperature to start the fan at the lowest speed.
 */
const TEMP_START = 35;

/**
 * Temperature to run the fan on the highest speed.
 */
const TEMP_MAX = 60;

/**
 * Hysteresis for temperature changes to smooth the control a bit.
 */
const TEMP_HYST = 1.5;

/**
 * Time after which a set of the fan speed is forced, even if inside the hysteresis.
 */
const FORCE_FAN_SPEED_SET_TIME = 600000; // 10 minutes

/**
 * State to get the current temperature from.
 */
const STATE_TEMPERATURE = 'info.0.sysinfo.cpu.temperature.main';

/**
 * State to write the set fan speed in percent to.
 */
const STATE_PERCENT = '0_userdata.0.fan.percent';

/**
 * State to write the read fan rpm to.
 */
const STATE_RPM = '0_userdata.0.fan.rpm';

let lastTemp = 0;
let lastSpeed = -1;
let nextFanSeedSetForce = Date.now() + FORCE_FAN_SPEED_SET_TIME;

/**
 * Function to read the current fan rpm from the microcontroller.
 */
function readRpm () {
    sendTo('i2c.0', 'read', {
        address: FAN_ADDRESS,
        register: REGISTER_RPM,
        bytes: 1
    }, (buf1) => {
        if (!Buffer.isBuffer(buf1)) {
            log('Error reading lower byte rpm from fan IC!', 'warn');
            return;
        }
        sendTo('i2c.0', 'read', {
            address: FAN_ADDRESS,
            register: REGISTER_RPM + 1,
            bytes: 1
        }, (buf2) => {
            if (!Buffer.isBuffer(buf2)) {
                log('Error reading higher byte rpm from fan IC!', 'warn');
                return;
            }
            const rpm = buf1[0] + (buf2[0] << 8);
            setState(STATE_RPM, {
                val: rpm,
                ack: true
            });
        });
    });
}

/**
 * Map a given value into a given range.
 */
function map(x, in_min, in_max, out_min, out_max) {
    if (x <= in_min) {
        return out_min;
    }
    if (x >= in_max) {
        return out_max;
    }
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

/**
 * Function to send the fan speed to the mircocontroller.
 */
function setFanSpeed (temp, cb) {
    const speed = Math.round(map(temp, TEMP_START, TEMP_MAX, 0, 255));
    
    if (speed === lastSpeed) {
        return;
    }

    const buf = Buffer.alloc(1);
    buf[0] = speed;

    sendTo('i2c.0', 'write', {
        address: FAN_ADDRESS,
        register: REGISTER_FAN_SPEED,
        data: buf
    }, () => {
        lastSpeed = speed;
        nextFanSeedSetForce = Date.now() + FORCE_FAN_SPEED_SET_TIME;
        
        setState(STATE_PERCENT, {
            val: Math.round((speed * 100 / 255) * 100) / 100,
            ack: true
        });

        if (cb) {
            cb();
        }
    });
}

// Create the objects if not exists
if (!getObject(STATE_PERCENT)) {
    setObject(STATE_PERCENT, {
        type: 'state',
        common: {
            type: 'number',
            name: 'Fan speed percent',
            role: 'level',
            unit: '%',
            read: true,
            write: false,
        },
        native: {},
    });
}
if (!getObject(STATE_PERCENT)) {
    setObject(STATE_RPM, {
        type: 'state',
        common: {
            type: 'number',
            name: 'Fan speed rpm',
            role: 'value',
            unit: 'RPM',
            read: true,
            write: false,
        },
        native: {},
    });
}

// React on temperature changes
on({ id: STATE_TEMPERATURE, change: 'any' },  (obj) => {
    if (obj.newState.val >= lastTemp+TEMP_HYST || obj.newState.val <= lastTemp-TEMP_HYST || nextFanSeedSetForce <= Date.now()) {
        // change needed
        setFanSpeed(obj.newState.val, () => {
            lastTemp = obj.newState.val;
        });
    }
});

// Read the current fan rpm every 20 seconds
schedule('*/20 * * * * *', () => {
    readRpm();
});

// Set the fan speed to max on startup and read the current fan rpm
setFanSpeed(TEMP_MAX);
readRpm();
```

Solange dieses Skript läuft, wird der Lüfter damit automatisch anhand der aktuellen CPU-Temperatur geregelt. Je höher die CPU-Temperatur steigt, desto höher wird auch der Lüfter geregelt, um entgegenzuwirken. Bei Temperaturen unter der konfigurierten `TEMP_START` wird der Lüfter vollständig angehalten.

## Fazit

Mit dem Lüfter und dieser Regelung bewegen sich bei mir die CPU-Temperaturen des HomePi nun immer im Bereich zwischen 35 und 45 °C bei einer Ansteuerung des Lüfters von 0 bis 40 %.

Ohne diese Kühlung waren dies im Mai 2020 noch etwa 50 bis 70 °C und wäre im Hochsommer garantiert noch mehr geworden.
