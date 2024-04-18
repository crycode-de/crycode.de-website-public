---
title: Projekt HomePi – ioBroker GPIOs
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2019-09-20 12:00:00
updated: 2024-04-18 17:30:00
categories:
  - [HomePi]
  - [ioBroker]
tags:
  - GPIO
  - Raspberry Pi
  - HomePi
  - ioBroker
abbr:
  GPIO: General Purpose Input Output
---

Betreibt man ioBroker auf einem Raspberry Pi, dann möchte man sicherlich auch die {% abbr GPIO %}s nutzen.

Dieser Beitrag beschreibt die Installation und Einrichtung des RPI-Monitor Adapters, welcher den Zugriff auf einzelne (oder alle) {% abbr GPIO %}s des Raspberry Pi ermöglicht.

## Installation des RPI-Monitor Adapters

Die Installation des Adapters [RPI-Monitor (rpi2)](https://github.com/iobroker-community-adapters/ioBroker.rpi2) erfolgt wie gewohnt über die Administrationsoberfläche von ioBroker.

{% grid 2 %}
{% img rpi2-adapter-suche.webp thumb: Suche nach dem RPI-Monitor Adapter in ioBroker %}
{% img rpi2-adapter-install.webp thumb: Installation vom RPI-Monitor Adapter in ioBroker %}
{% endgrid %}

Nach der Installation öffnet sich die Adapterkonfiguration, in der wir die gewünschten Funktionen einzeln aktivieren und deaktivieren können.

{% img rpi2-adapter-haupteinstellungen.webp thumb: Haupteinstellungen vom RPI-Monitor Adapter %}

> [!NOTE]
> Nicht benötigte Funktionen sollten hier deaktiviert werden, um Ressourcen zu sparen.  
> Wer nur die GPIOs verwenden möchte, der kann getrost alle anderen Funktionen deaktivieren.

## GPIOs

Für die Verwaltung der {% abbr GPIO %}s gibt es in der Adapterkonfiguration einen extra Reiter.  
Hier kann jeder {% abbr GPIO %} einzeln aktiviert und seine Richtung (Eingang oder Ausgang) festgelegt werden. Die {% abbr GPIO %}-Nummerierung richtet sich dabei nach den BCM-Nummern der {% abbr GPIO %}s.  
Zudem können bestimmte Sonderfunktionen ausgewählt werden.

{% img rpi2-adapter-gpios.webp thumb: GPIO-Einstellungen vom RPI-Monitor Adapter %}

Beim Speichern werden die {% abbr GPIO %}s dann entsprechend der Konfiguration eingerichtet und die zugehörigen Objekte erstellt.

{% img rpi2-adapter-states.webp thumb: ioBroker States vom RPI-Monitor Adapter %}

Der aktuelle Zustand des {% abbr GPIO %} 2 ist damit dann immer über die Objekt-ID rpi2.0.gpio.2.state verfügbar.

## Hinweise zum Multihost

Betreibt man seinen ioBroker nicht auf einem Raspberry Pi, möchte aber einen Raspberry Pi im **lokalen** Netzwerk in diesen mit einbinden, so kann man ioBroker im [Multihost](https://www.iobroker.net/#de/documentation/config/multihost.md) Modus betreiben, wobei der Raspberry Pi dann ein *Slave*-Host ist.

Der Slave-Host ist zudem deutlich sparsamer in Bezug auf die benötigten Systemressourcen und somit optimal für einen Raspberry Pi geeignet.

Der RPI-Monitor Adapter ist dabei dann auf dem Slave-Host zu installieren, damit er auf dem Raspberry Pi ausgeführt wird.  
Alle States und damit auch die {% abbr GPIO %}s sind dann im gesamten ioBroker verfügbar.

Weiterhin ist es möglich mehrere Raspberry Pi als Slave-Host einzubinden und somit zu steuern.
