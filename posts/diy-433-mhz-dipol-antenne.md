---
title: DIY 433 MHz Dipol-Antenne
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2017-08-13 12:00:00
updated: 2024-04-28 18:01:04
categories:
  - Elektronik
tags:
  - 433 MHz
  - Antenne
  - DIY
  - Elektronik
  - Funk
---

In diesem Betrag beschreibe ich, wie man ganz leicht eine 433&nbsp;MHz Dipol-Antenne mit guten Empfangs- und Sendeeigenschaften selbst bauen kann.

<!-- more -->

> [!WARNING]
> Die Benutzung der hier gezeigten Antennen geschieht auf eigene Gefahr!  
> Bei Verwendung dieser Antenne für einen Sender kann u.U. die abgestrahlte Sendeleistung so weiter erhöht werden, dass sie über den in Deutschland zulässigen 10&nbsp;mW liegt.

Als 433&nbsp;MHz Funkempfänger verwende ich vorrangig Module vom **Superheterodyne**, welche meiner Erfahrung nach die besten Reichweiten bieten. Alternativ nutze ich zudem den Typ **3400RF**, sowie teilweise auch die teilweise deutlich schlechteren **XY-MK-5V** mit den jeweils dazugehörigen Sendern.

{% grid 3 %}
{% img superheterodyne.webp thumb: Superheterodyne %}
{% img 3400rf.webp thumb: 3400RF %}
{% img xy-mk-5v.webp thumb: XY-MK-5V %}
{% endgrid %}

Meistens werden zu 433&nbsp;MHz Funkmodulen zwei Arten von Antennen empfohlen: Ein 17&nbsp;cm langer gerader Draht (Monopol-Antenne), oder ein schraubenförmig aufgewickelter Draht (Helix-Antenne).

Diese beiden Antennenformen brachten bei mir nur eine recht geringe Reichweite von wenigen Metern.

Nach einigem Suchen und Experimentieren bin ich dann schließlich bei einer **Eigenbau-Dipol-Antenne** aus etwas **Koaxialkabel** und **Einzeladern einer NYM-Leitung** gelandet, mit der sich Reichweiten von über 30 Metern (aus dem Garten und quer durchs Haus) erzielen lassen.

Fertig gebaut sieht die Dipol-Antenne dann so aus:

{% img 433mhz-dipol-antenne-fertig.webp thumb: 433&nbsp;MHz Dipol-Antenne %}

## Was wird benötigt?

* Ein kleines Stück Streifenleiterplatte als Träger
* Koaxialkabel (normales Antennenkabel)
* Zwei Einzeladern aus einer NYM-Leitung mit einem Leitungsquerschnitt von 1,5&nbsp;mm² oder 2,5&nbsp;mm²
* Lötkolben und etwas Lötzinn

## Schritt 1 - Vorbereitung des Trägers

Als erstes schneiden wir uns ein Stück Streifenleitplatte (8×1) zurecht und trennen die Leiterbahn in der Mitte auf, wie auf dem folgenden Bild zu sehen.

{% img traeger.webp thumb: Träger auf einem Stück Streifenleiterplatte %}

## Schritt 2 - Vorbereitung der Antennenstäbe

Als Antennenstäbe verwenden wir zwei Einzeladern von einer 1,5&nbsp;mm² oder 2,5&nbsp;mm² NYM-Leitung.

Wir schneiden zuerst ein **mindestens 17&nbsp;cm** langes Stück von der NYM-Leitung ab und entfernen davon den äußeren Mantel, sodass wir die noch isolierten Einzeladern erhalten. Hier kommt es noch nicht auf die genaue Länge an, da wir diese später eh noch etwas einkürzen.

{% img staebe.webp thumb: Antennenstäbe aus Einzeladern einer NYM-Leitung %}

## Schritt 3 - Vorbereitung des Koaxialkabels

Das Koaxialkabel isolieren wir an einem Ende vorsichtig 1-2&nbsp;cm weit ab, wobei der äußere Schirm (das Drahtgeflecht) möglichst nicht beschädigt werden sollte. Der innere Kunststoffmantel um die mittlere Ader sollte 1-2&nbsp;mm länger bleiben, als der äußere Mantel. Der Schirm wird seitlich zu einer Litze verdrillt.

{% img koaxkabel.webp thumb: Abisoliertes Koaxialkabel %}

## Schritt 4 - Anbringung des Trägers

Nun stecken wir den Träger (die vorbereitete Streifenleiterplatte) mittig auf die mittlere Ader des Koaxialkabels und verlöten diese mit der einen Seite der Leiterplatte. Den verdrillten Schirm löten wir direkt daneben an die andere Seite der Leiterplatte und schneiden von beidem die überstehenden Reste ab.

> [!CAUTION]
> Zwischen beiden Seiten darf keine elektrisch leitfähige Verbindung bestehen!

{% grid 2 %}
{% img traeger-1.webp thumb: Mittlere Ader an der Leiterplatte %}
{% img traeger-2.webp thumb: Schirm an der Leiterplatte %}
{% endgrid %}

## Schritt 5 - Anbringung der Antennenstäbe

Von den zwei vorbereiteten Antennenstäben entfernen wir jeweils auf einer Seite circa 8&nbsp;mm weit die Isolierung und löten sie dann mit ausreichend Lötzinn auf den freien Kupferflächen des Trägers fest. Ein Antennenstab wird dabei mit der Mittelader des Koaxialkabels und der andere mit dem Schirm verbunden.

{% img traeger-3.webp thumb: Antennenstäbe am Träger angelötet %}

## Schritt 6 – Kürzen der Antennenstäbe

Jetzt müssen nur noch beide Antennenstäbe auf je 16,3&nbsp;cm gekürzt werden und schon ist die Eigenbau-Dipol-Antenne fertig. Diese 16,3&nbsp;cm sind die gesamte Länge eines Antennenstabes, also vom Anfang des Kupfers der Streifenleiterplatte (mittig des Koaxialkabels) bis zum Ende des Stabes.

{% img 16-3cm.webp thumb: 16,3&nbsp;cm auf jeder Seite %}

Wieso es genau 16,3&nbsp;cm sein müssen kann ich an dieser Stelle leider nicht genau beantworten. Nach der Wellenlänge bei 433&nbsp;MHz von rund 70&nbsp;cm wäre λ/4 eigentlich 17&nbsp;cm. Ich habe hier mit verschieden Längen experimentiert und bei eben 16,3&nbsp;cm die besten Ergebnisse erzielt. Vielleicht sind etwas andere Längen unter anderen Bedingungen auch vorteilhafter.

Nachtrag: Die etwas kürzere Länge als λ/4 ist durch die Dicke des Drahtes (Stichwort Verkürzungsfaktor) und durch die optimale Anpassung der Impedanz der Antenne an das Koaxialkabel begründet.

> [!TIP]
> Für optimale Ergebnisse einfach selbst mal mit leicht unterschiedlichen Längen etwas herumexperimentieren.

## Schritt 7 - Anschluss der Antenne

Zum Anschluss der Antenne an das Funkmodul muss das andere Ende des Koaxialkabels genauso wie in Schritt 3 abisoliert werden. Die Länge des Koaxialkabels spielt dabei eine eher zu vernachlässigende Rolle.

Die mittlere Ader des Koaxialkabels wird dann mit dem *ANT*-Pin des Funkmoduls und der Schirm mit *GND* verbunden. Dabei sollte die Strecke zwischen dem Funkmodul und dem Beginn des Koaxialkabels so kurz wie möglich gehalten werden. Schon wenige Millimeter ungeschirmtes Kabel wirken hier wieder als Antenne und verschlechtern das Gesamtergebnis deutlich.

## Optional Schritt 8 - Abdeckung/Verstärkung der T-Stelle mit Gehäuse aus dem 3D-Drucker

Zur Verstärkung der T-Stelle der Antennen habe ich ein 3D-Modell entworfen, welches einfach 2-teilig aufgesteckt wird und damit ein Gehäuse bildet.

{% grid 2 %}
{% img 3d-modell.webp thumb: 3D-Modell des Gehäuses %}
{% img gehaeuse-foto.webp thumb: Montierte Gehäuse %}
{% endgrid %}

Die stl-Datei zu dem 3DModells gibt es [hier](/diy-433-mhz-dipol-antenne/433mhz-dipol-gehaeuse.stl) zum Download.
