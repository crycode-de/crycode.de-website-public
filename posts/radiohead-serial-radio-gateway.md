---
title: RadioHead Serial-Radio-Gateway
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2020-05-16 12:00:00
updated: 2024-04-18 13:00:00
categories:
  - [Mikrocontroller]
  - [Elektronik]
tags:
  - Arduino
  - Elektronik
  - Hardware
  - RadioHead
---

Da in diversen Projekten und Beschreibungen von mir immer wieder von einem *Serial-Radio-Gateway* (oder auch Radio-Serial-Gateway) für das [RadioHead](http://www.airspayce.com/mikem/arduino/RadioHead/)-Protokoll die Rede ist, möchte ich dieses Gateway hier kurz beschreiben.

<!-- more -->

## Was ist ein Gateway?

Allgemein gesagt ist ein Gateway eine Komponente aus Hardware und/oder Software, welche zwei Systeme miteinander verbindet.

In diesem Fall stellt das Gateway die Verbindung zwischen dem 433&nbsp;MHz Funk und einer seriellen Schnittstelle her. Das RadioHead-Protokoll wird dabei beibehalten. Dadurch wird es sehr einfach möglich, den RadioHead 433&nbsp;MHz Funk von diversen Mikrocontrollern an einen PC oder Raspberry Pi anzubinden.

## Hardware

Die Hardware ist sehr einfach. Als Basis nehmen wir einen Arduino Nano (oder einen anderen Arduino mit USB-Schnittstelle) und schließen an diesen je einen 433&nbsp;MHz Funkempfänger und Funksender an. Dabei wird VCC der Module auf +5&nbsp;V des Arduinos und GND der Module auf GND vom Arduino verbunden. Die Data-Leitung des Empfängers kommt an D2 und die des Senders an D4 beim Arduino.

{% img aufbau.webp thumb: Aufbau der Hardware auf einem Steckbrett %}

Fertig!

> [!NOTE]
> Ich empfehle bei den Funkmodulen zumindest für den Empfänger Module vom Typ *Superheterodyne* oder *3400RF* zu verwenden, da diese deutlich höhere Reichweiten als die günstigeren *XY-MK-5V* ermöglichen.

## Software

Die Software für den Arduino ist ähnlich simpel. Hier muss nur in der Arduino IDE die RadioHead Bibliothek hinzugefügt werden (wenn nicht schon gesehen) und der folgende Sketch, den ich größtenteils aus den [original RadioHead Beispielen](http://www.airspayce.com/mikem/arduino/RadioHead/examples.html) entnommen habe, auf den Arduino geladen werden:

{% codefile cpp radio-serial-gateway.ino Arduino Sketch für das Serial-Radio Gateway %}

Damit ist dann das Serial-Radio-Gateway auch schon fertig und einsatzbereit. 🙂

## Funktionsweise

Der als Gateway fungierende Arduino empfängt sowohl über den 433&nbsp;MHz Funk, als auch über die serielle Schnittstelle die RadioHead Datenpakete für beliebige Adressen (Promiscuous-Mode) und sendet diese anschließend wieder über die jeweils andere Schnittstelle. Dabei werden die Headerdaten und der Inhalt der Datenpakete eins zu eins übernommen.

Somit wird jede über den Funk empfangene Nachricht an die serielle Schnittstelle und jede über seriell empfange Nachricht per Funk weitergeleitet.

## Verarbeitung der Daten am PC / Raspberry Pi

Die vom Gateway an den PC oder Raspberry Pi weitergeleiteten Daten können hier nicht direkt in einem Terminal oder seriellen Monitor angezeigt werden, da es sich quasi um Binärdaten des RadioHead-Protokolls handelt. Versuche die Daten beispielsweise im seriellen Monitor der Arduino IDE anzuzeigen resultieren nur in wirren Zeichen. Das ist Ok so!

Zur weiteren Verarbeitung der Daten muss die Software das RadioHead-Protokoll, genauer gesagt `RH_Serial`, verstehen können.

Hierzu habe ich für [Node.js](https://nodejs.org/de/) das Modul [radiohead-serial](https://www.npmjs.com/package/radiohead-serial) erstellt, welches das RadioHead-Protokoll mit `RH_Serial` in Node.js umsetzt. Auf diesem Modul basierend habe ich zudem für **ioBroker** den Adapter [ioBroker.radiohead](https://github.com/crycode-de/ioBroker.radiohead) erstellt, wodurch RadioHead relativ einfach in diese Heimautomatisierung eingebunden werden kann.

Für Anwendungen in C/C++ können direkt die RadioHead Quellen genutzt werden, um `RH_Serial` zu integrieren.
