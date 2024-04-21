---
title: ioBroker MAX! Heizungssteuerung
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2019-09-20 12:00:00
updated: 2024-04-21 20:22:10
categories:
  - [ioBroker]
  - [HomePi]
tags:
  - ioBroker
  - Heizungssteuerung
  - MAX!
  - Skripte
---

Dieser Beitrag beschreibt die Einbindung von [MAX! Heizkörperthermostaten und Zubehör](https://www.eq-3.de/produkte/max.html) in ioBroker.

Hierfür wird der *MAX! Cube LAN Gateway* benötigt. Zur Anbindung an *ioBroker* nutzen wir den Adapter [Max! Cube](https://github.com/ioBroker/ioBroker.maxcube).

<!-- more -->

> [!NOTE]
> Die MAX! Serie wurde leider vom Hersteller 2023 eingestellt und die zugehörige Cloud wird nicht weiter betrieben.  
> Die hier gezeigte Lösung arbeitet unabhängig von externen Diensten rein lokal und funktioniert damit auch weiterhin noch völlig problemlos. 🙂

<!-- toc Inhalt -->

## Installation des Adapters

Die Installation des Adapters [Max! Cube](https://github.com/ioBroker/ioBroker.maxcube) erfolgt wie gewohnt über die Adminoberfläche von *ioBroker*.

{% grid 2 %}
{% img adapter-maxcube-suche.webp thumb: Suche nach dem Max! Cube Adapter %}
{% img adapter-maxcube-installation.webp thumb: Installation vom Max! Cube Adapter %}
{% endgrid %}

Im Anschluss an die Installation öffnet sich die Konfigurationsseite der Adapterinstanz. Auf dieser tragen wir die IP-Adresse oder den Hostnamen des *MAX! Cube* ein und bestätigen mit *Speichern und Schließen*.

{% img adapter-maxcube-einstellungen.webp thumb: Einstellungen vom Max! Cube Adapter %}

Nun sollte die Adapterinstanz starten und eine Verbindung zum *MAX! Cube* herstellen, was wie üblich am grünen Statussymbol in der Liste der Adapterinstanzen zu sehen ist.

## Objekte des MAX! Cube Adapters

Bei erfolgreicher Verbindung mit dem *MAX! Cube* werden von dem Adapter automatisch alle im Cube bekannten Thermostate und Sensoren unter `maxcube.0.devices.*` sowie einige allgemeine Informationen unter `maxcube.0.info.*` angelegt.

{% img adapter-maxcube-objekte.webp thumb: Auszug aus dem Objektbaum %}

Sollte bei einem Gerät `error` auf `true` gesetzt sein, so hilft oftmals ein Neustart des *MAX! Cube*.

Die unter `temp` enthaltene Temperatur stellt die am Thermostat gemessene *ist*-Temperatur dar.

> [!IMPORTANT]
> Bei den Heizkörperthermostaten wird die ist-Temperatur immer nur bei einer Änderung (Modus, Ventilstand, …) übertragen und kann unter Umständen auch mal fälschlicherweise 0&nbsp;°C betragen. Dies hängt mit dem Cube und der Kommunikation zwischen dem Cube und den Thermostaten zusammen und ist kein Fehler des Adapters.

## Einbindung in VIS

{% img vis.webp right:true Anzeige in VIS %}
Für die Einbindung in VIS empfehle ich den Adapter [Hochwertige Widgets (vis-hqwidgets)](https://github.com/ioBroker/ioBroker.vis-hqwidgets) zu installieren. Dieser bietet unter anderem ein schönes Widget für die Innentemperatur, über welches sich die aktuelle Temperatur, die Solltemperatur, der Ventilstand und gegebenenfalls eine Batteriewarnung ablesen lassen. Zudem ist es über das Widget möglich die Solltemperatur anzupassen.

Für die Umschaltung des Modus bietet sich beispielsweise das Widget *Zustände steuern* als Typ *radio* an.

{% grid 2 %}
{% img vis-editor-1.webp thumb: VIS Editor Thermostat %}
{% img vis-editor-2.webp thumb: VIS Editor Thermostat Modus %}
{% endgrid %}

## Moduswechsel bei manueller Solltemperaturänderung

> [!NOTE]
> Wenn sich ein Thermostat im Automatikmodus befindet und über *ioBroker* die Solltemperatur geändert wird, dann versetzt der Adapter das Thermostat automatisch in den manuellen Modus.

Dieses Verhalten finde ich eher unpraktisch, da man damit bei jeder manuellen Änderung auch wieder daran denken muss, das Thermostat anschließend zurück in den Automatikmodus zu schalten.

Damit der Modus nach einer manuellen Änderung der Solltemperatur wieder auf *Auto* gestellt wird, habe ich ein kleines Skript erstellt. In *ioBroker* eingebunden stellt dieses Skript dann kurz nach der Änderung wieder auf den Automatikmodus zurück, sofern dieser vorher aktiv war. Die zuvor manuell eingestellte Solltemperatur bleibt dabei bis zur nächsten automatischen Anpassung erhalten.

{% codefile js iobroker-skript-automatikmodus.js ioBroker Skript zum Wiederherstellen des Automatikmodus %}

Das Skript kann direkt so übernommen werden. Lediglich die IDs der ignorierenden Thermostate müssen gegebenenfalls angepasst werden.

Die grundlegende Verwendung von Skripten habe ich im Beitrag [ioBroker Skripte](/iobroker-skripte) beschrieben.
