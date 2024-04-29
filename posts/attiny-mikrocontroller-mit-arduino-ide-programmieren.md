---
title: ATtiny Mikrocontroller mit Arduino IDE programmieren
author:
  name: Peter Müller
  link: https://crycode.de
#banner: banner.webp
date: 2017-07-08 12:00:00
categories:
  - Elektronik
tags:
  - Arduino
  - ATtiny
  - AVR
  - Elektronik
  - Mikrocontroller
abbr:
  ISP: In-System-Programmierung
---

Die [Arduino IDE](https://www.arduino.cc/en/software) bringt von Hause aus keine Unterstützung für *ATtiny* Mikrocontroller mit. Über den *Boardverwalter* ist es jedoch sehr einfach möglich, zusätzliche Pakete mit diversen Boards zu installieren.

Damit wird es ermöglicht, Mikrocontroller der Typen **ATtiny25/45/85** und **ATtiny24/44/84** zu programmieren.

<!-- more -->

## Boardverwalter-URL hinzufügen

Als Erstes fügen wir eine zusätzliche Boardverwalter-URL hinzu.

Hierfür öffnen wir über das Menü Datei die *Voreinstellungen* und klicken anschließend auf den Fenster-Button neben *Zusätzliche Boardverwalter-URLs*.

{% grid 2 %}
{% img voreinstellungen.webp Voreinstellungen %}
{% img boardverwalter.webp thumb: Boardverwalter-URLs öffnen %}
{% endgrid %}

In dem sich öffnenden Fenster fügen wir die folgende URL in einer neuen Zeile hinzu und bestätigen beide Fenster mit OK.

`https://raw.githubusercontent.com/damellis/attiny/ide-1.6.x-boards-manager/package_damellis_attiny_index.json`

{% img boardverwalter-2.webp thumb: Boardverwalter-URLs %}

> [!TIP]
> Nicht von der 1.6.x in der URL irritieren lassen, es funktioniert auch mit der aktuellen Version einwandfrei. 😉

## Paket "attiny" installieren

Nun können wir das Paket "attiny" über den Boardverwalter installieren.

Dazu öffnen wir über das Menü *Werkzeuge*, *Board* den *Boardverwalter*.

{% img werkzeuge-boardverwalter.webp thumb: Menü Werkzeuge, Boardverwalter %}

Hier suchen wir nach "attiny" und installieren das Paket.

{% img boardverwalter-attiny.webp thumb: Suche nach attiny im Boardverwalter %}

## Board auswählen

Ist das Paket installiert, so kann über das Menü *Werkzeuge*, *Board* der *ATtiny25/45/85* oder *ATtiny24/44/84* ausgewählt werden.

{% img board-attiny.webp thumb: Board-Auswahl %}

Anschließend ist es noch wichtig, den entsprechenden Prozessor und die Clock auszuwählen.

{% img prozessor-attiny.webp thumb: Prozessorauswahl %}

## Pin-Belegung

Die Pin-Belegung der ATtiny Controllers in Arduino ist wie folgt:

| Hardware-Pin | Funktion | Arduino Pin | Alternative Funktion |
|---|---|---|---|
| 1 | PB 5 | D5 | Ain0 |
| 2 | PB 3 | D3 | Ain3 |
| 3 | PB 4 | D4 | Ain2 |
| 4 | GND | | |
| 5 | PB 0 | D0 | pwm0 |
| 6 | PB 1 | D1 | pwm1 |
| 7 | PB 2 | D2 | Ain1 |
| 8 | Vcc | | |

## Programmierung/Flashen

Zum Übertragen des Programms auf den ATtiny Mikrocontroller wird ein {% abbr ISP %}-Programmer benötigt. Für den normalen Arduino Bootloader besitzt der ATtiny einfach zu wenig Platz.

Als {% abbr ISP %}-Programmer kann ganz einfach ein Arduino verwendet werden, wie bereits im Beitrag [Arduino als ISP-Programmer](/arduino-als-isp-programmer/) beschrieben.

Das Hochladen des Sketches erfolgt dann durch einfaches klicken des *Hochladen*-Buttons, wobei automatisch erkannt wird, dass hierfür ein Programmer benötigt wird. Alternativ kann die Verwendung des Programmers durch klicken des Hochladen-Buttons bei gedrückter Umschalttaste, oder über das Menü *Sketch* -> *Hochladen mit Programmer* erzwungen werden.
