---
title: Einbindung von MQTT in ioBroker
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2019-09-22 12:00:00
updated: 2024-04-18 16:10:00
categories:
  - [ioBroker]
  - [HomePi]
tags:
  - ioBroker
  - MQTT
abbr:
  MQTT: Message Queuing Telemetry Transport
  IoT: Internet of Things
---

MQTT (Message Queuing Telemetry Transport) ist ein recht einfaches und gerade im {% abbr IoT %} Bereich verbreitetes Protokoll für die Übermittlung von Nachrichten zwischen verschiedenen Endgeräten.

Dieser Beitrag beschreibt die Einbindung von MQTT in ioBroker zum Senden und Empfangen von Nachrichten.

<!-- more -->

Die [Installation des MQTT Brokers Mosca](/homepi-mqtt-broker-mosca) habe ich bereits in einem anderen Beitrag beschrieben.

## Installation des MQTT Adapters

Als erstes installieren wir den Adapter [MQTT Broker/Client](https://github.com/ioBroker/ioBroker.mqtt) über die Administrationsoberfläche von ioBroker. Auch wenn wir nur den Client benötigen empfehle ich trotzdem diesen Adapter, da er deutlich aktueller ist als der ebenfalls verfügbare Adapter MQTT Client.

{% grid 2 %}
{% img mqtt-adapter-suche.webp thumb: Suche nach dem MQTT Adapter in ioBroker %}
{% img mqtt-adapter-install.webp thumb: Installation vom MQTT Adapter in ioBroker %}
{% endgrid %}

Nach der Installation öffnet sich wie gewohnt direkt wieder die Konfigurationsseite der Adapterinstanz.

Hier wählen wir im Reiter *Verbindung* als Typ *Client/subscriber* aus und tragen die IP-Adresse und den Port unseres MQTT Brokers, sowie den Benutzernamen und das Passwort für die Verbindung ein.

Im Reiter *Client Settings* sollte bei *Subscribe patterns* eine Liste der zu empfangenden Topics eingetragen werden. Die *Client ID* ist in den meisten Fällen gleich dem Benutzernamen für den Login.

Unter *MQTT Einstellungen* empfehle ich zudem die *Maske zum Bekanntgeben eigener States* so anzupassen, dass nur die States gesendet werden, die man auch wirklich senden möchte. Zumindest sollte dies auf `mqtt.0.*` beschränkt werden, da sonst alle ioBroker States bei Veränderungen gesendet werden.

{% grid 3 %}
{% img mqtt-adapter-einstellungen-1.webp thumb: Adaptereinstellungen Reiter Verbindung %}
{% img mqtt-adapter-einstellungen-2.webp thumb: Adaptereinstellungen Reiter Client Settings %}
{% img mqtt-adapter-einstellungen-3.webp thumb: Adaptereinstellungen Reiter MQTT Einstellungen %}
{% endgrid %}

Diese Einstellungen bestätigen wir mit *Speichern und Schließen*.

Anschließend kann die Adapterinstanz mit einem Klick auf den noch roten Start-Button gestartet werden. Kurz darauf sollte der Punkt vor der Instanz grün werden, was eine erfolgreiche Verbindung zum MQTT Broker anzeigt.

{% grid 2 %}
{% img mqtt-adapter-start-1.webp thumb: Adapter starten %}
{% img mqtt-adapter-start-2.webp thumb: Adapter gestartet und verbunden %}
{% endgrid %}

## MQTT Objekte in ioBroker

Für alle empfangenen Topics legt der MQTT Adapter automatisch Objekte innerhalb der Adapterinstanz an.

**Beispiel:** Für die Topic `esp-stall/sensor/0/value` wird das Objekt `mqtt.0.esp-stall.sensor.0.value` angelegt und der empfangene Wert wird in den aktuellen State dieses Objektes geschrieben.

{% img mqtt-adapter-states.webp thumb: ioBroker States vom MQTT Adapter %}

Beim Senden eines geänderten States erfolgt diese Umschlüsselung genau entgegengesetzt. Aus dem State für `mqtt.0.esp-stall.switch.light.set` wird die Topic `esp-stall/switch/light/set` mit dem entsprechenden Wert aus dem State.

Zusätzlich zu den automatisch angelegten Objekten können auch eigene Objekte manuell erstellt werden. Ebenso ist es möglich die automatisch erzeugten Objekte nachträglich nach den eigenen Bedürfnissen anzupassen.

> [!NOTE]
> Zum Erstellen und Anpassen der States unter `mqtt.0.*` muss gegebenenfalls der Expertenmodus in der Adminoberfläche aktiviert werden.
