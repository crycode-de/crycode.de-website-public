---
title: Projekt HomePi - Hardware der Zentrale Teil 1
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2019-08-28 12:00:00
updated: 2021-02-25 12:00:00
categories:
  - HomePi
tags:
  - HomePi
  - Hardware
  - CAN-Bus
  - Eagle
  - Elektronik
  - Platinen
abbr:
  THT: engl. 'through-hole technology' - bedrahtete Bauteile
  SMD: engl. 'Surface-mounted device' - oberflächenmontiertes Bauelement
  I²C: Inter Integrated Circuit
  IC: Integrated Circuit / Integrierter Schaltkreis
  SPI: Serial Peripheral Interface
  UART: Universal Asynchronous Receiver / Transmitter
  GPIO: General Purpose Input Output
  1-Wire: Eindraht-Bus
  CAN: Controller Area Network
  ISP: In-System-Programmierung
  IO: Input/Output
---

Dieser Beitrag soll der Hardware in der Zentrale des [HomePi](/kategorie/homepi) beschreiben.

In *Teil 1* sind dies die Platinen, die alle Einzelkomponenten miteinander verbinden.  
Hier geht es zu [Teil 2](/homepi-hardware-zentrale-teil-2/).

<!-- more -->

Die in der Zentrale des *HomePi* verwendeten Platinen habe ich selbst mit [EAGLE](https://www.autodesk.de/products/eagle/overview) entworfen und dann nach meinen Layouts fertigen lassen und schließlich von Hand bestückt.

Die ersten Platinen aus dem Jahr **2015** sind noch recht einfach gehalten mit {% abbr THT %}-Bauteilen, ohne Lötstopplack und ohne Durchkontaktierungen.

Die erste Erweiterung im Jahr **2016** folgten kann war dann schon etwas komplexer und in der gleichen Qualität.

Im Mai **2019** habe ich dann zusammen mit einer Erweiterung einige Platinen unter Verwendung von {% abbr SMD %}-Bauteilen neu designt und inklusive Durchkontaktierungen, Lötstopplack und Bestückungsdruck fertigen lassen.

Anfang **2020** folgten dann nochmals ein paar Erweiterungen und Upgrades mit neuen Platinen.

Die Platinen aus 2015 und 2016 habe ich mit gutem Ergebnis bei der kleinen deutschen Firma [Platinenbelichter](https://platinenbelichter.de/) fertigen lassen.

Die neuen Platinen in 2019 und 2020 wurden von [ALLPCB](https://www.allpcb.com/) in China gefertigt. Die Qualität und das Preis-/Leistungsverhältnis sind echt top.

{% grid 3 %}
{% img platinen-2015-oben.webp thumb: Platinen 2015 oben %}
{% img platinen-2015-unten.webp thumb: Platinen 2015 unten %}
{% img platinen-2016-oben.webp thumb: Platinen 2016 oben %}
{% img platinen-2016-unten.webp thumb: Platinen 2016 unten %}
{% img backplane-2019.webp thumb: Backplane 2019 %}
{% img spannungsversorgungsplatine-2019.webp thumb: Spannungsversorgungsplatine 2019 %}
{% endgrid %}
{% grid 2 %}
{% img hauptplatine-2019.webp thumb: Hauptplatine 2019 %}
{% img canbus-platine-2019.webp thumb: CAN-Bus Platine 2019 %}
{% endgrid %}

<!-- toc 2 -->

## Hauptplatine mit Raspberry Pi

Das Herzstück des *HomePi* bildet ein Raspberry Pi 4 Modell B mit 4&nbsp;Gb Arbeitsspeicher. Dieser ist auf die selbst designte *HomePi* Hauptplatine aufgeschraubt und über ein kurzes 40-poliges Flachbandkabel verbunden.

Die *Hauptplatine* stellt die Verbindung des Raspberry Pi mit der Backplane sicher. Hierzu gehören die Spannungsversorgung, der {% abbr I²C %}-Bus, die {% abbr SPI %}-Schnittstelle, der {% abbr 1-Wire %} Bus, die {% abbr UART %}-Schnittstelle, sowie einige {% abbr GPIO %}s.

Weiterhin verfügt die Hauptplatine über zwei Status-LEDs, die direkt über die GPIOs 26 und 27 (BCM) angesteuert werden können.

Der 1-Wire Bus ist mit dem GPIO 04 (BCM) verbunden und mit einem Pullup-Widerstand gegen +3,3&nbsp;V versehen. Zur Überwachung der Temperatur in der Zentrale ist zudem in Temperatursensor vom Typ *DS18B20* vorgesehen.

Für den Fall, dass sich der Raspberry Pi mal aufhängt, ist eine Ansteuerung des Reset-Pins des Raspberry Pi vorgesehen. Der Reset-Pin wird bei Bedarf über einen Optokoppler gegen GND geschaltet. Hierfür ist die Reset-Leitung als Active Low auf den Pin *A26* zur Backplane geführt.

Optional ist eine +5&nbsp;V Stromversorgung für eine 2,5” USB-Festplatte über einen Phoenixstecker vorgesehen.

{% grid 3 %}
{% img hauptplatine-2019-1.webp thumb: Hauptplatine 2019 %}
{% img hauptplatine-2019-2.webp thumb: Hauptplatine 2019 %}
{% img hauptplatine-2019-3.webp thumb: Hauptplatine 2019 %}
{% img hauptplatine-2019-4.webp thumb: Hauptplatine 2019 %}
{% img hauptplatine-2019-layout.webp thumb: Hauptplatine 2019 Layout %}
{% img hauptplatine-2019-schaltplan.webp thumb: Hauptplatine 2019 Schaltplan %}
{% endgrid %}

### Eagle-Dateien der Hauptplatine

* [Schaltplan](https://raw.githubusercontent.com/crycode-de/homepi-eagle/main/Pi-4.sch)
* [Layout](https://raw.githubusercontent.com/crycode-de/homepi-eagle/main/Pi-4.brd)

## Backplane

Die *Backplane* dient der Verbindung aller Einschubplatinen und stellt somit die Signalübertragung zwischen den einzelnen Platinen her. Alle Signale werden direkt zu allen Einschubplatinen weitergeleitet.

Pro Backplane können über 64-polige Feder- beziehungsweise Messerleisten bis zu vier Einschubplatinen verbunden werden. Über zweireihige Stift- beziehungsweise Buchsenleisten ist zudem eine Verbindung mehrerer Backplanes und somit eine einfache Erweiterbarkeit möglich.

{% grid 3 %}
{% img backplane-2019-1.webp thumb: Backplane 2019 vorne %}
{% img backplane-2019-2.webp thumb: Backplane 2019 hinten %}
{% img backplane-2019-3.webp thumb: Backplane 2019 Verbindung %}
{% img backplane-2019-layout.webp thumb: Backplane 2019 Layout %}
{% img backplane-2019-schaltplan-1.webp thumb: Backplane 2019 Schaltplan Teil 1 %}
{% img backplane-2019-schaltplan-2.webp thumb: Backplane 2019 Schaltplan Teil 2 %}
{% endgrid %}

### Eagle-Dateien der Backplane

* [Schaltplan](https://raw.githubusercontent.com/crycode-de/homepi-eagle/main/Backplane-4.sch)
* [Layout](https://raw.githubusercontent.com/crycode-de/homepi-eagle/main/Backplane-4.brd)

## Spannungsversorgung

Die *Stromversorgung* erfolgt über ein Schaltnetzteil, welches eine Spannung von +24&nbsp;V und bis zu 3&nbsp;A Strom liefert. Diese +24&nbsp;V werden über einen Phoenixstecker auf die Spannungsversorgungsplatine gegeben.

Details zur im Jahr 2020 aktualisierten Spannungsversorgung sind im Beitrag [Projekt HomePi - Die Spannungsversorgung](/homepi-spannungsversorgung/) zu finden.

## CAN-Bus

Diese Einschubplatine ermöglicht die Anbindung eines {% abbr CAN %}-Bus an den HomePi. Die Anbindung an den zentralen Raspberry Pi erfolgt über die {% abbr SPI %}-Schnittstelle über einen *MCP2515* CAN-Controller sowie einen *MCP2562* {% abbr CAN %}-Transceiver.

Details zum CAN-Bus am Raspberry Pi habe ich in [einem anderen Beitrag](/can-bus-am-raspberry-pi/) beschrieben.

Herausgeführt wird der CAN-Bus über RJ45 Buchsen, wodurch die externe Verkabelung die Verwendung von handelsüblichen Netzwerkkabeln ermöglicht.

> [!CAUTION]
> Es darf, trotz gleicher Stecker, keine Verbindung zwischen dem CAN-Bus und einem Ethernet hergestellt werden, da dies zu Beschädigungen auf beiden Seiten führen kann!

Es sind ein bis drei Anschlüsse von Kabeln zur externen Verteilung des CAN-Bus sowie +24&nbsp;V Versorgungsspannung vorgesehen. Da ein CAN-Bus als Linientopologie aufgebaut wird, sind die drei Anschlüsse in Reihe geschaltet. Über ein angeschlossenes Kabel wird der CAN-Bus hin- und auch wieder zurückgeführt. Bei dem letzten verwendeten Anschluss muss die Drahtbrücke (Jumper) zur Aktivierung des Abschlusswiderstands gesetzt werden.

Zusätzlich zu der direkten Anbindung an den Raspberry Pi verfügt diese Platine über einen eigenständigen Mikrocontroller vom Typ *ATMega328*, der ebenfalls über einen *MCP2515* und *MCP2562* an den CAN-Bus angebunden ist. Über diesen kann bei einer entsprechenden Nachricht über den CAN-Bus ein Hardware-Reset des zentralen Raspberry Pi ausgelöst werden. Zusätzlich steuert er drei Status-LEDs an und verfügt über neun freie GPIOs, die bei Bedarf auf die Leitungen *A14* bis *A22* der Backplane gelegt werden können.

Die drei Status-LEDs können, je nach Programmierung des *ATMega328* Mikrocontrollers, beispielsweise dazu genutzt werden den Empfang von bestimmten CAN-Nachrichten unabhängig vom zentralen Raspberry Pi zu signalisieren.

Programmiert werden kann der *ATMega328* Mikrocontroller entweder über die herausgeführten Pins der {% abbr ISP %}-Schnittstelle, oder alternativ über die nach vorne herausgeführte {% abbr UART %}-Schnittstelle. Für die Verwendung der {% abbr UART %}-Schnittstelle ist ein entsprechender Bootloader auf dem Mikrocontroller erforderlich. Die Belegung der Buchsenleiste ist für ein direktes Anstecken der meisten *FT232RL* USB-TTL-Konverter ausgelegt.

{% grid 3 %}
{% img canbus-platine-2019-1.webp thumb: CAN-Bus Platine vorne %}
{% img canbus-platine-2019-2.webp thumb: CAN-Bus Platine vorne %}
{% img canbus-platine-2019-3.webp thumb: CAN-Bus Platine hinten %}
{% img canbus-platine-2019-layout.webp thumb: CAN-Bus Platine Layout %}
{% img canbus-platine-2019-schaltplan-1.webp thumb: CAN-Bus Platine Schaltplan Teil 1 %}
{% img canbus-platine-2019-schaltplan-2.webp thumb: CAN-Bus Platine Schaltplan Teil 2 %}
{% endgrid %}

### Eagle-Dateien der CAN-Bus Platine

* [Schaltplan](https://raw.githubusercontent.com/crycode-de/homepi-eagle/main/CanBus.sch)
* [Layout](https://raw.githubusercontent.com/crycode-de/homepi-eagle/main/CanBus.brd)

## Rollladensteuerung

Zur Ansteuerung von drei Rollläden habe ich bereits im Jahr 2015 diese Platine entworfen und gebaut.

> [!NOTE]
> Die Platine funktioniert seitdem sehr gut, trotzdem an dieser Stelle der Hinweis, dass ich dies inzwischen etwas anders bauen würde.

Auf der Platine befinden sich zwei [PCF8574](https://www.ti.com/lit/ds/symlink/pcf8574.pdf) {% abbr IC %}s, wobei jeweils einer für 6 Aus- beziehungsweise 6 Eingänge zuständig ist. Die Ansteuerung der beiden {% abbr IC %}s erfolgt durch den zentralen Raspberry Pi über den {% abbr I²C %}-Bus. Alle Ein- und Ausgänge sind über Optokoppler von der externen Verkabelung galvanisch getrennt.

Die Ausgänge sind über einen [74HCT04N](https://datasheet.octopart.com/74HCT04N-Philips-datasheet-8207631.pdf) und zwei [74HCT08N](https://datasheet.octopart.com/74HCT08N-Philips-datasheet-8215660.pdf) Logik-{% abbr IC %}s zur Sicherheit zusätzlich Hardwaremäßig gegeneinander verriegelt, sodass selbst bei einer falschen Ansteuerung des *PCF8574* nicht hoch und runter von einem Rollladen gleichzeitig angesteuert werden können. Zur Anzeige des Status der Ausgänge sind zudem 6 Status-LEDs vorhanden.

Der Anschluss der externen Leitungen erfolgt über 10-polige Wannenstecker und die zugehörigen Pfostenbuchsen.

Zur Einbindung des alten Stecksystems an die neue 2019er Backplane ist eine Adapterplatine (siehe unten) erforderlich.

{% grid 3 %}
{% img rolllaeden-platine-2015-1.webp thumb: Rollläden-Platine vorne %}
{% img rolllaeden-platine-2015-2.webp thumb: Rollläden-Platine hinten %}
{% img rolllaeden-platine-2015-layout.webp thumb: Rollläden-Platine Layout %}
{% img rolllaeden-platine-2015-schaltplan-1.webp thumb: Rollläden-Platine Schaltplan Teil 1 %}
{% img rolllaeden-platine-2015-schaltplan-2.webp thumb: Rollläden-Platine Schaltplan Teil 2 %}
{% img rolllaeden-platine-2015-schaltplan-3.webp thumb: Rollläden-Platine Schaltplan Teil 3 %}
{% endgrid %}

### Eagle-Dateien der Rollladensteuerungsplatine

* [Schaltplan](https://raw.githubusercontent.com/crycode-de/homepi-eagle/main/Rolllaeden.sch)
* [Layout](https://raw.githubusercontent.com/crycode-de/homepi-eagle/main/Rolllaeden.brd)

## IO-Platine

Über die {% abbr IO %}-Platine aus dem Jahr 2016 werden jeweils 16 digitale Ein- und Ausgänge bereitgestellt.

> [!NOTE]
> Auch hier wieder der Hinweis, dass die Platine super funktioniert, ich dies inzwischen jedoch etwas anders bauen würde.

Die Steuerung der Ein- und Ausgänge erfolgt über vier [PCF8574](http://www.ti.com/lit/ds/symlink/pcf8574.pdf) {% abbr IC %}s, wobei die {% abbr I²C %}-Adressen über Lötbrücken einstellbar sind. Jeder Ein- beziehungsweise Ausgang ist über jeweils einen Optokoppler galvanisch getrennt angebunden. Alle Ausgänge werden zudem über einen Transistor vom Typ *BC337-25* geschaltet, wodurch auch Lastströme bis zu 0,8&nbsp;A direkt gesteuert werden können.

Die Anbindung von externen Komponenten erfolgt über RJ45-Buchsen. Diese sind recht günstig in der Anschaffung und einfach in der Handhabung. Einziger Nachteil ist, dass es eventuell zu Verwechslungen mit Ethernet-Buchsen kommen könnte.
Weiterhin sind zwei Wannenstecker vorgesehen, über die eine zusätzliche Verbindung zu anderen Platinen hergestellt werden kann. Dies kann beispielsweise erforderlich werden, wenn die Pins der RJ45-Buchsen nicht mehr ausreichen.

Um die Platine so flexibel wie möglich zu gestalten, wurde auf eine feste Verbindung der {% abbr IO %}s mit den RJ45-Buchsen beziehungsweise den Wannensteckern verzichtet. Dafür sind an den jeweiligen Stellen auf der Platine Lötpunkte vorgesehen, sodass einfache Kabelbrücken vom Ein- beziehungsweise Ausgang zum entsprechenden Anschluss geschaffen werden können.

Zur Einbindung des alten Stecksystems an die neue 2019er Backplane ist eine Adapterplatine (siehe unten) erforderlich.

{% grid 3 %}
{% img io-platine-2016-1.webp thumb: IO-Platine %}
{% img io-platine-2016-2.webp thumb: IO-Platine %}
{% img io-platine-2016-3.webp thumb: IO-Platine %}
{% img io-platine-2016-layout.webp thumb: IO-Platine Layout %}
{% img io-platine-2016-schaltplan-1.webp thumb: IO-Platine Schaltplan Teil 1 %}
{% img io-platine-2016-schaltplan-2.webp thumb: IO-Platine Schaltplan Teil 2 %}
{% img io-platine-2016-schaltplan-3.webp thumb: IO-Platine Schaltplan Teil 3 %}
{% img io-platine-2016-schaltplan-4.webp thumb: IO-Platine Schaltplan Teil 4 %}
{% img io-platine-2016-schaltplan-5.webp thumb: IO-Platine Schaltplan Teil 5 %}
{% endgrid %}

### Eagle-Dateien der IO-Platine

* [Schaltplan](https://raw.githubusercontent.com/crycode-de/homepi-eagle/main/IO-Board.sch)
* [Layout](https://raw.githubusercontent.com/crycode-de/homepi-eagle/main/IO-Board.brd)

## Adapterplatine

Damit die älteren Platinen aus 2015 und 2016 mit der neuen Backplane aus 2019 weiterverwendet werden können, habe ich eine kleine Adapterplatine erstellt. Auf diese Adapterplatine kann eine alte Platine aufgelötet werden und die Kombination dann zusammen in das neue System gesteckt werden.

{% grid 3 %}
{% img adapterplatine-2019-1.webp thumb: Adapterplatine vorne %}
{% img adapterplatine-2019-2.webp thumb: Adapterplatine hinten %}
{% img adapterplatine-2019-3.webp thumb: Adapterplatine %}
{% endgrid %}
{% grid 2 %}
{% img adapterplatine-2019-layout.webp thumb: Adapterplatine Layout %}
{% img adapterplatine-2019-schaltplan.webp thumb: Adapterplatine Schaltplan %}
{% endgrid %}

### Eagle-Dateien der Adapterplatine

* [Schaltplan](https://raw.githubusercontent.com/crycode-de/homepi-eagle/main/Platinen-Adapter.sch)
* [Layout](https://raw.githubusercontent.com/crycode-de/homepi-eagle/main/Platinen-Adapter.brd)
