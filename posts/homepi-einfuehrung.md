---
title: Projekt HomePi - Einführung
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2019-05-12 12:00:00
updates: 2024-04-28 16:50:00
categories:
  - HomePi
tags:
  - HomePi
  - Elektronik
  - Heimautomatisierung
  - ioBroker
abbr:
  CAN: Controller Area Network
  IO: Input/Output
  HE: Höheneinheiten
  TE: Teileinheiten
  GPIO: General Purpose Input Output
  I²C: Inter Integrated Circuit
  IC: Integrated Circuit / Integrierter Schaltkreis
  LCD: Liquid-Crystal Display
---

**Was ist der HomePi?**

Der *HomePi* ist ein langfristiges Projekt von mir, in dem eine kostengünstige Heimautomatisierung auf Basis eines Raspberry Pi und der Software ioBroker umgesetzt wird.

Es wird bewusst zu großen Teilen auf den Einsatz von fertigen, meist teuren, Lösungen verzichtet, da es hierbei nicht vorrangig um den schnellen Aufbau einer Heimautomatisierung, sondern vielmehr um Individualität und Spaß an der Eigenentwicklung geht.

<!-- more -->

Dieser Beitrag bildet den ersten Teil einer Serie zum Thema [HomePi](/kategorie/homepi/) und soll einen ersten Überblick über das Projekt bieten. Weitere Beiträge, die die einzelnen Komponenten genauer beschrieben, werden demnächst folgen.

{% img logos.webp %}

<!-- toc -->

## Historie

Die ersten Teile des HomePi stammen bereits aus dem Jahr **2015**. Damals bestand das System noch aus lediglich einem Raspberry Pi 2 und einer Erweiterungsplatine, über die drei elektrische Rollläden gesteuert wurden. Als Software kam hier [Pimatic](https://pimatic.org/) zum Einsatz.

**2016** kamen dann einige Erweiterungen in Form einer {% abbr IO %}-Platine, 433&nbsp;MHz Funk und 1-Wire Temperatursensoren hinzu. Darüber erfolgt unter anderem die Steuerung der elektrischen Terrassenmarkise und die Aufzeichnung der Außentemperatur.

**2017** habe ich dann einen kleinen Funksensor für Temperatur und Luftfeuchtigkeit gebaut und in das Gesamtsystem mit eingebunden.

**2018** kam das [automatische Bewässerungssystem](/diy-automatisches-bewaesserungssystem/) für unser kleines Gewächshaus hinzu, welches ebenfalls über den 433&nbsp;MHz Funk angebunden ist.

In **2019** erfolgte eine teilweise Modernisierung der vorhandenen Platinen und eine Erweiterung um einen {% abbr CAN %}-Bus. Dieser {% abbr CAN %}-Bus ist für die Vernetzung weitere dezentraler Komponenten im gesamten Haus gedacht.  
Zusätzlich erfolgte die Anbindung eines weiteren Raspberry Pi mit dem [offiziellen 7” Touchdisplay](https://www.raspberrypi.org/products/raspberry-pi-touch-display/). Dieses Display ist in eine Wand eingelassen und soll eine einfache und zentrale Steuerung der gesamten Heimautomatisierung bieten.  
Zusammen mit dem Umbau der Hardware erfolgte auch eine Umstellung der Software von Pimatic auf [ioBroker](https://www.iobroker.net/).

**2020** gab es dann nochmals eine kleine Erweiterung der Zentrale um einen, aktiv durch ioBroker geregelten, Lüfter zur Kühlung des Raspberry Pi, da dieser vor allem im Hochsommer etwas ins Schwitzen kam. Weiterhin wurde die [Spannungsversorgung](/homepi-spannungsversorgung/) nochmals überarbeitet und unter anderem um eine Leistungsmessung erweitert.  
Zusätzlich kam eine über den {% abbr CAN %}-Bus angebundene Steuerung für die Gartenbewässerung hinzu.

**2023** Habe ich dann die Zentrale meiner Heimautomatisierung auf einen leistungsstärkeren Home-Server basierend auf [Proxmox](https://www.proxmox.com/de/) umgezogen.  
Als Software für die eigentliche Automatisierung kommt weiterhin ioBroker zum Einsatz.  
Der HomePi ist seitdem als Salve-System eingebunden und stellt weiterhin die ganzen Schnittstellen für das Gesamtsystem bereit.

## Die Zentrale

### Hardware

{% img homepi-zentrale.webp thumb: right:true HomePi Zentrale %}

Die Zentrale bildet neben dem Home-Server ein Raspberry Pi 4B 4Gb in einem Standard 19” Baugruppenträger mit 3 {% abbr HE %} und 84 {% abbr TE %}.

Der Baugruppenträger ist mit eigens designten Einschubplatinen bestückt. Diese einzelnen Einschubplatinen sind über eine Backplane miteinander verbunden. Somit ergibt sich ein modulares System, das jederzeit ohne großen Aufwand durch neue Platinen erweiterbar ist. Ebenso können einzelne Komponenten ohne größeren Aufwand durch beispielsweise aktuellere Versionen ausgetauscht werden.

Zur Speicherung von Daten und Dateien ist eine USB-Festplatte an den Raspberry Pi angeschlossen.

### Software

Auf dem Raspberry Pi kommt als Grundsystem ein normales [Raspberry Pi OS](https://www.raspberrypi.com/software/) zum Einsatz. Dieses ist dahingehend angepasst, dass das gesamte System auf der USB-Festplatte liegt und nicht wie meist üblich auf der SD-Karte. Damit sind auch intensivere Schreibvorgänge kein Problem mehr und die SD-Karte wird geschont.

Für die eigentliche Heimautomatisierung kommt seit September 2019 die Software [ioBroker](https://www.iobroker.net/) zum Einsatz. Damit ist es möglich verschiedenste Systemkomponenten anzusteuern und zu verwalten.

Aufgrund des sehr modularen Systems von ioBroker kann durch entsprechende Adapter nahezu jede Funktionalität je nach Bedarf hinzugefügt werden. Ich selbst habe beispielsweise die folgenden Adapter für ioBroker erstellt, um entsprechende Funktionen meinem ioBroker hinzuzufügen:

* [ioBroker.canbus](https://github.com/crycode-de/ioBroker.canbus)
* [ioBroker.ds18b20](https://github.com/crycode-de/ioBroker.ds18b20)
* [ioBroker.discord](https://github.com/crycode-de/ioBroker.discord)
* [ioBroker.radiohead](https://github.com/crycode-de/ioBroker.radiohead)
* [ioBroker.odl](https://github.com/crycode-de/ioBroker.odl)

### Weitere Möglichkeiten

Zusätzlich zu der Hauptaufgabe der Heimautomatisierung übernimmt mein HomePi noch die folgenden Funktionen:

* Dateiserver, der mittels [Samba](/dateifreigaben-mit-samba/) Freigaben für Netzlaufwerke erstellt.
* [DLNA-Mediaserver](/media-server-auf-dem-raspberry-pi/) zum Streamen von Musik und Videos.
* OpenVPN-Gateway zur Verbindung des lokalen Netzwerkes mit einem VPN-Netz.

## Anbindung von dezentralen Knoten

Die Anbindung von dezentralen Knoten, also Geräten, die sich nicht direkt in der Zentrale befinden, erfolgt über mehrere Wege. Die von mir aktuell eingesetzten Techniken möchte ich im Folgenden kurz vorstellen.

### Ethernet / WLAN

{% img ethernet.webp right:true %}

Die wohl einfachste Art der Anbindung ist per Ethernet beziehungsweise WLAN. Hierbei besteht eine direkte [TCP/IP](https://de.wikipedia.org/wiki/Transmission_Control_Protocol/Internet_Protocol)-Verbindung zwischen dem zentralen Raspberry Pi und dem jeweiligen Knoten.

Die zu übertragenden Daten werden beispielsweise über das Nachrichtenprotokoll [MQTT](https://de.wikipedia.org/wiki/MQTT) gesendet. Ebenso ist ein direkter Zugriff über eine REST-API möglich.

### CAN-Bus

Als Bussystem für die Vernetzung von einfachen dezentralen Knoten mit der Zentrale habe ich mich für den [{% abbr CAN %}-Bus](https://de.wikipedia.org/wiki/Controller_Area_Network) entschieden. Die Vorteile bei diesem System sind, dass es auch mit Mikrocontrollern recht einfach umzusetzen ist, mit einem vordefinierten Protokoll arbeitet und auch problemlos für größere Leitungslängen geeignet ist.

Über den {% abbr CAN %}-Bus können mit einem relativ geringen Verkabelungsaufwand jede Menge an Sensoren und Aktoren an den HomePi angebunden werden. Es ist lediglich nur ein Kabel notwendig, welches von Knoten zu Knoten verlegt wird. Über dieses eine Kabel erfolgt die Spannungsversorgung (+24&nbsp;V) der einzelnen Knoten und die Bus-Kommunikation.

Einzelne Nachrichten auf dem {% abbr CAN %}-Bus werden durch die sogenannten Objekt-Identifier gekennzeichnet. Die einzelnen Busteilnehmer können eigenständig Nachrichten senden (Multi-Master) und entscheiden wiederum auch selbstständig, auf welche Nachrichten sie "hören" möchten.

### ZigBee

{% img zigbee-logo.webp right:true %}

[ZigBee](https://de.wikipedia.org/wiki/ZigBee) ist ein weit verbreiteter Funkstandard beziehungsweise ein Kommunikationsprotokoll, das die Kommunikation von vernetzten Geräten ermöglicht.

Die Anbindung an den ioBroker erfolgt über einen [SONOFF Zigbee 3.0 USB Dongle](https://amzn.eu/d/5NhsY9Y).  
Als Geräte kommen bei mir dann hauptsächlich smarte Steckdosen und ein paar Lampen zum Einsatz.

### Anbindung über PCF8574 Porterweiterungs-ICs

{% img pcf8574.webp right:true %}

Ein oder mehrere Port-Expander vom Typ [PCF8574](https://www.mikrocontroller.net/articles/Port-Expander_PCF8574) sind über den {% abbr I²C %}-Bus mit dem zentralen Raspberry Pi verbunden. Jeder dieser Port-Expander verfügt über acht einzeln steuerbare Pins, die jeweils als Eingang oder Ausgang verwendet werden können.

Ich habe hierfür eine eigene Einschubplatine entwickelt, die insgesamt 16 Eingänge und 16 Ausgänge mit Hilfe von vier PCF8574 ICs bereitstellt. Jeder Ein- beziehungsweise Ausgang ist dabei über einen Optokoppler vom jeweiligen PCF8574 {% abbr IC %} getrennt, sodass selbst im Falle einer externen Fehlbeschaltung keine internen Komponenten gestört werden können.

### 433 MHz Funk mit RadioHead

{% img 433mhz-funk.webp right:true %}

Zur Anbindung des 433&nbsp;MHz Funks über das [RadioHead](https://www.airspayce.com/mikem/arduino/RadioHead/)-Protokoll ist ein Arduino Nano mit den entsprechenden Funkmodulen verbunden und mit dem [Serial-Gateway](/radiohead-serial-radio-gateway/) Sketch programmiert. Der Arduino ist über USB mit dem zentralen Raspberry Pi verbunden. Er leitet alle empfangenen Datenpakete an das Pi weiter beziehungsweise sendet die vom Pi erhaltenen Pakete.

Als Antennen kommen zwei selbst gebaute [433&nbsp;MHz Dipol-Antennen](/diy-433-mhz-dipol-antenne/) zum Einsatz. Diese ermöglichen eine deutlich größere Funkreichweite als beispielsweise die oftmals empfohlenen 17&nbsp;cm Drahtantennen.

### Direkte Anbindung an die GPIOs

Eine direkte Nutzung der {% abbr GPIO %}s des Raspberry Pi zur Steuerung von externen Komponenten (außerhalb der Zentrale) ist zwar möglich, jedoch würde ich dies nicht empfehlen. Dies schränkt die modulare Erweiterbarkeit des HomePi-Systems ein, da die verwendeten {% abbr GPIO %}s dann nicht mehr für interne Funktionen von zukünftigen Erweiterungsplatinen zur Verfügung stehen.

Bei der Verwendung der {% abbr GPIO %}s zur Steuerung von dezentralen Knoten sollten auf jeden Fall auf einen entsprechenden Schutz der {% abbr GPIO %}s geachtet werden. Ohne Schutzmaßnahmen kann der Raspberry Pi leicht beschädigt werden, insbesondere wenn längere Leitungen verlegt werden.

Eine mögliche Schutzmaßnahme ist beispielsweise der Einsatz von Optokopplern.

## Eingebundene Geräte und Funktionen

Im Folgenden möchte ich noch einen kurzen Überblick über die bei mir in das HomePi-System eingebundenen Geräte und Funktionen geben.

### 7” Touch-Display

{% img wanddisplay.webp thumb: right:true Wanddisplay %}

Für eine komfortable Steuerung des gesamten HomePi-Systems habe ich an einer zentralen Stelle des Hauses in eine Wand einen Raspberry Pi mit dem [offiziellen 7” Touchdisplay](https://www.raspberrypi.org/products/raspberry-pi-touch-display/) eingelassen. Somit ist auch ohne Computer oder Smartphone jederzeit eine Bedienung des Systems möglich.

Die Kommunikation mit der Zentrale erfolgt über Ethernet. Die Stromversorgung und eine zusätzliche Datenanbindung erfolgen von der Zentrale aus über das Kabel des CAN-Bus.

### Elektrische Rollläden / Markise

Die elektrischen Rollläden im Haus sind über eine eigens dafür entworfene Platine an den HomePi angebunden. Der HomePi steuert über ein direktes Kabel die Relais bei den Fenstern an. Eine zusätzliche Steuerung über Taster neben dem Fenster ist möglich.

Die Markise der Terrasse ist über eine {% abbr IO %}-Einschubplatine ähnlich wie die Rollläden angeschlossen. Hierbei ist eine Steuerung per Smartphone oder Funkfernbedienung möglich.

### MAX! Heizungssteuerung

{% img max-heizungssteuerung.webp right:true %}

Die intelligente [MAX! Heizungssteuerung](https://www.eq-3.de/produkte/max.html) von eQ-3 ist in Form der Hauslösung über das *MAX! Cube LAN Gateway* per Ethernet mit dem HomePi verbunden. Über der Adapter [Max! Cube](https://github.com/ioBroker/ioBroker.maxcube/) erfolgt die Einbindung in ioBroker.

Damit lassen sich alle Heizkörper, Fensterkontakte und Thermostate komfortabel zentral steuern beziehungsweise überwachen.

> [!NOTE]
> Das MAX! System wurde inzwischen vom Hersteller eingestellt und nicht weiter verkauft.

### Steuerung der Gartenbewässerung

{% img gartensteuerung.webp thumb: right:true Steuerung der<br /> Gartenbewässerung %}

Über den {% abbr CAN %}-Bus angebunden ist meine selbstgebaute Steuerung der Gartenbewässerung.

Hierbei werden 10 Magnetventile angesteuert, die jeweils das Wasser zu einem Strang der Bewässerung freigeben. An jedem Strang hängen bis zu 3 Versenkregnern und/oder kleinere Sprühsysteme zur Bewässerung des Rasens und anderer Pflanzen und Büsche im Garten.

Die Steuerung erfolgt per Taster an dem Modul im Geräteschuppen, oder per Smartphone oder PC.  
Zusätzliche werden den Sommer über durch ein Skript im ioBroker täglich die gemessenen Regenmengen der Vortage, die erwartete Regenmenge des aktuellen Tages und die erwarteten Tagestemperaturen verrechnet und auf Basis dieser Werte ggf. früh am Morgen eine automatische Bewässerung des Gartens gestartet.

Weiterhin misst das Modul noch die Außentemperatur und zeigt den aktuellen Zustand auf einem {% abbr LCD %} an.

### Automatisches Bewässerungssystem im Gewächshaus

{% img bewaesserungssystem.webp thumb: right:true Bewässerungssystem %}

Seit 2018 erfreuen sich die Tomaten im Gewächshaus unseres Gartens der regelmäßigen Wasserversorgung durch mein [automatisches Bewässerungssystem](/diy-automatisches-bewaesserungssystem/).

Das System sendet regelmäßig seine aktuellen Messdaten und Statusinformationen an die Zentrale des HomePi. Zudem wird durch den HomePi jeden Abend einmal eine "Zwangsbewässerung" initiiert und anschließend die automatische Bewässerung bis zum Vormittag des nächsten Tages pausiert.

### 1-Wire Temperatursensoren

Aktuell betreibe ich zwei 1-Wire Temperatursensoren vom Typ *DS18B20* an der Zentrale des HomePi.

Einer dieser beiden Sensoren ist direkt im Rack des HomePi untergebracht. Der andere ist über rund 30&nbsp;m Cat5 F/UTP-Kabel verbunden und misst die Außentemperatur.

### Hand-Funksender

Zur einfachen Bedienung der Terrassenmarkise habe ich einen kleinen 433&nbsp;MHz Hand-Funksender gebaut. Dieser verfügt über drei Knöpfe zur Steuerung und sendet bei Knopfdruck ein Signal an den ioBroker, der dann wiederum die Markise ansteuert.

### WLAN-Wetterstation

Für die Erfassung des aktuellen Wetters nutze ich eine [WLAN-Wetterstation](https://amzn.eu/d/5R5ZySP), welche Temperatur, Luftdruck, Regenmenge, Windgeschwindigkeit und -richtung, Sonneneinstrahlung usw. erfasst. Per WLAN werden die Daten von dieser Station dann direkt an meinen ioBroker übertragen und dort verarbeitet und aufgezeichnet.

### Funk-Wetterstation

{% img funk-wetterstation.webp thumb: right:true Funk-Wetterstation %}

Natürlich ist auch meine kleine selbst gebaute [Funk-Wetterstation](/diy-funk-wetterstation-mit-dht22-attiny85-und-radiohead/) mit in das System integriert.

Diese misst und sendet im Minutentakt die aktuelle Temperatur und Luftfeuchtigkeit.

### Türklingel

Die Türklingel ist über eine {% abbr IO %}-Einschubplatine an den HomePi angebunden.

Darüber erhält zum einen der ioBroker die Information wenn geklingelt wurde und sendet über Alexa eine Benachrichtigung und per Discord eine Nachricht mit einem aktuellen Foto von der Überwachungskamera.  
Zum anderen ist es darüber möglich die Klingel auch einfach zu abzuschalten, sodass es nicht laut klingelt.

### Sonstige Funktionen

Zu den sonstigen Funktionen gehören unter anderem eine Systemüberwachung des zentralen Raspberry Pi, die Überwachung bestimmter Netzwerkgeräte (z.B. WLAN-Repeater) und die Bereitstellung eines Discord-Bots, welcher mich bei bestimmten Ereignissen automatisch mit einer kurzen Nachricht informiert.

Allgemein lässt sich jede Funktion, die ioBroker von Hause aus, oder über einen Adapter unterstützt, einbinden. Bestimmt habe ich hier in der Auflistung auch das ein oder andere vergessen. 😉
