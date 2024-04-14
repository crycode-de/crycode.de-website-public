---
title: Projekt HomePi – Die Spannungsversorgung
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2021-02-25 12:00:00
abbr:
  I²C: Inter Integrated Circuit
categories:
  - HomePi
tags:
  - Eagle
  - Elektronik
  - Hardware
  - HomePi
  - Platinen
  - Spannungsversorgung
---

Die Spannungsversorgung des HomePi erfolgt grundlegend über ein Schaltnetzteil, welches eine Spannung von +24&nbsp;V und bis zu 3&nbsp;A Strom liefert.  
Diese +24&nbsp;V werden über einen Phoenixstecker auf die *Spannungsversorgungsplatine* gegeben, auf welcher dann alle benötigten Spannungen erzeugt werden.

Die *Spannungsversorgungsplatine* verfügt zum Schutz des *HomePi* über eine 2,5&nbsp;A Rückstellsicherung (Polyfuse), die bei zu hohen Strömen abschaltet. Weiterhin besitzt sie eine Schutzdiode in Sperrrichtung, welche beim Anschließen einer falschen Polarität einen Kurzschluss verursacht, damit die zuvor genannte Sicherung auslöst und folglich die restliche Schaltung schützt.

<!-- more -->

## Spannungsebenen

{% img 24v-schaltnetzteil.webp thumb:24v-schaltnetzteil-thumb.webp right:true 24 V Schaltnetzteil %}

Über vier *TSR*-Schaltregler von *TracoPower* mit hohem Wirkungsgrad werden aus den +24&nbsp;V auf der Spannungsversorgungsplatine die folgenden Spannungen für das System erzeugt:

* **+5&nbsp;V mit bis zu 2&nbsp;A für interne Verwendung.**  
  Dient der Versorgung des Raspberry Pi und anderen Bauteilen innerhalb der Zentrale. Zur Vermeidung von Störungen am Raspberry Pi wird diese Spannung über zwei getrennte Leitungen zur / auf der Backplane verteilt.
* **+5&nbsp;V mit bis zu 1&nbsp;A für externe Verwendung.**  
  Dient der getrennten Versorgung von extern (außerhalb der Zentrale) angebundenen Komponenten. Durch die getrennte Spannungsversorgung von externen Komponenten sollen Störungen von außerhalb auf den Raspberry Pi vermindert werden.
* **+3,3&nbsp;V mit bis zu 1&nbsp;A für interne Verwendung.**  
  Dient der Versorgung diverser Komponenten innerhalb der Zentrale.
* **+12&nbsp;V mit bis zu 1&nbsp;A für interne Verwendung.**  
  Dient der Versorgung von beispielsweise einem Lüfter innerhalb der Zentrale.

Zusätzlich zu diesen vier Spannungen werden auch die +24&nbsp;V an die Backplane weitergegeben und stehen somit bei Bedarf jeder Einschubplatine zur Verfügung.

Zur einfachen (groben) Sichtkontrolle ist für jede Spannung eine eigene LED vorgesehen.

{% img platine-2020-04.webp thumb:platine-2020-04-thumb.webp HomePi Spannungsversorgungsplatine (Rev. 2020/04) %}

## Messung der Leistungsaufnahme

Die *Spannungsversorgungsplatine* verfügt zudem über einen Strom- und Leistungssensor vom Typ [INA226](https://www.ti.com/lit/ds/symlink/ina226.pdf), welcher über den {% abbr I²C %}-Bus an den Raspberry Pi angebunden ist.

Der *INA226* misst die genaue aktuelle Eingangsspannung (+24&nbsp;V) und die über einen speziellen Shunt-Widerstand (0,02&nbsp;Ω, 1&nbsp;%, 5&nbsp;W) abfallende Spannung. Mit diesen Werten können der aktuelle Strom und die aktuelle Leistungsaufnahme des Gesamtsystems ermittelt werden.

Abgefragt werden die Daten in *ioBroker* mit Hilfe des [ioBroker.i2c Adapters](https://github.com/UncleSamSwiss/ioBroker.i2c) über ein folgendes Skript:

```js ioBroker INA226 Skript
/**
 * ioBroker script to read voltages and calculate power from INA226 power monitor IC.
 *
 * Copyright (C) 2020-2024 Peter Müller <peter@crycode.de> (https://crycode.de)
 */

const INA_ADDRESS = 0x40;
const R_SHUNT = 0.02;

const CONFIGURATION_REGISTER = 0x00;
const SHUNT_VOLTAGE_REGISTER  = 0x01;
const BUS_VOLTAGE_REGISTER = 0x02;

const SHUNT_VOLTAGE_LSB = 0.0000025; // 2.5µV
const BUS_VOLTAGE_LSB = 0.00125; // 1.25mV

const CONFIGURATION_REGISTER_VALUE = 0x4427; // 16 averages, 1.1ms conversion time, shunt and bus continuous

const STATE_SHUNT_VOLTAGE = '0_userdata.0.power-monitor.shunt-voltage';
const STATE_BUS_VOLTAGE = '0_userdata.0.power-monitor.bus-voltage';
const STATE_POWER = '0_userdata.0.power-monitor.power';

/**
 * Function to read data from INA226.
 */
function readIna () {
    sendTo('i2c.0', 'read', {
        address: INA_ADDRESS,
        register: SHUNT_VOLTAGE_REGISTER,
        bytes: 2
    }, (buf) => {
        let shuntVoltage = buf.readUInt16BE();
        if(shuntVoltage & 0x8000){
            shuntVoltage -= 1; // subtract 1
            shuntVoltage ^= 0xFFFF; // invert bits
            shuntVoltage *= -1; // negate
        }
        shuntVoltage = shuntVoltage * SHUNT_VOLTAGE_LSB;

        sendTo('i2c.0', 'read', {
            address: INA_ADDRESS,
            register: BUS_VOLTAGE_REGISTER,
            bytes: 2
        }, (buf) => {
            let busVoltage = buf.readUInt16BE();
            busVoltage = busVoltage * BUS_VOLTAGE_LSB;

            let power = busVoltage * shuntVoltage / R_SHUNT;

            setState(STATE_SHUNT_VOLTAGE, Math.round(shuntVoltage * 100000) / 100000, true);
            setState(STATE_BUS_VOLTAGE, Math.round(busVoltage * 1000) / 1000, true);
            setState(STATE_POWER, Math.round(power * 100) / 100, true);
        });
    });
}

// create the  objects if not exists
if (!getObject(STATE_SHUNT_VOLTAGE)) {
    setObject(STATE_SHUNT_VOLTAGE, {
        type: 'state',
        common: {
            name: 'Shunt-Spannung',
            role: 'value',
            type: 'number',
            unit: 'V',
            read: true,
            write: false
        },
        native: {},
    });
}
if (!getObject(STATE_BUS_VOLTAGE)) {
    setObject(STATE_BUS_VOLTAGE, {
        type: 'state',
        common: {
            name: 'Bus-Spannung',
            role: 'value',
            type: 'number',
            unit: 'V',
            read: true,
            write: false
        },
        native: {},
    });
}
if (!getObject(STATE_POWER)) {
    setObject(STATE_POWER, {
        type: 'state',
        common: {
            name: 'Leistung',
            role: 'value',
            type: 'number',
            unit: 'W',
            read: true,
            write: false
        },
        native: {},
    });
}

// write config to INA226 on startup ...
let buf = Buffer.alloc(2);
buf.writeUInt16BE(CONFIGURATION_REGISTER_VALUE, 0);
sendTo('i2c.0', 'write', {
    address: INA_ADDRESS,
    register: CONFIGURATION_REGISTER,
    data: buf
}, (b) => {
    // ... then read data and schedule readings
    readIna();
    schedule('0,30 * * * * *', readIna); // every 30 seconds
});
```

## Schaltplan und Platinenlayout

{% grid 2 %}
{% img schaltplan.webp thumb:schaltplan-thumb.webp HomePi Spannungsversorgung Rev. 2020/04 Schaltplan %}
{% img layout.webp thumb:layout-thumb.webp HomePi Spannungsversorgung Rev. 2020/04 Platinenlayout %}
{% endgrid %}

Downloads: {% asset_link homepi-spannungsversorgung.pdf Schaltplan+Layout als PDF %}, [Eagle Schaltplan](https://github.com/crycode-de/homepi-eagle/raw/main/Spannungsversorgung-3.sch), [Eagle Platinenlayout](https://github.com/crycode-de/homepi-eagle/raw/main/Spannungsversorgung-3.brd)
