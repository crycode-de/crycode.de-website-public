---
title: Firefox - "befindet sich jetzt im Vollbildmodus" Meldung vollständig deaktivieren
date: 2021-06-01 12:00:00
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
categories:
  - Software
tags:
  - Firefox
  - Fullscreen-API
  - Vollbildmodus
  - Warnmeldung
---

Der Browser *Firefox* zeigt standardmäßig bei Webseiten, welche die Fullscreen-API verwenden (sich also selbst in den Vollbildmodus schalten können), immer eine Warnung an, dass die Seite sich im Vollbildmodus befindet.  
Diese Warnung soll der Sicherheit des Nutzers dienen und beispielsweise unerwünschtes Phishing verhindern.

In einigen Fällen kann diese Warnung jedoch auch einfach nur lästig sein. Dies ist zum Beispiel der Fall, wenn wir eine Webseite permanent zu Informations- oder Steuerzwecken auf einem Touchdisplay anzeigen wollen.

<!-- more -->

Die Warnung lässt sich relativ einfach über die Spezialseite `about:config` von Firefox deaktivieren.

## Deaktivieren der Warnmeldung

Zunächst tragen wir in die Adresszeile `about:config` ein und drücken die Entertaste.  
Es erscheint eine Warnung, welche wir mit einem Klick auf *Risiko akzeptieren und fortfahren* bestätigen.

{% img warnmeldung.webp Warnmeldung zu about:config in Firefox %}

**Achtung:** Falsche Konfigurationen in diesem Bereich können Firefox negativ beeinflussen!

Auf der folgenden Seite suchen wir nach `full-screen-api.warning`, wodurch wir die beiden Optionen `full-screen-api.warning.delay` und `full-screen-api.warning.timeout` finden.

{% img einstellungen1.webp Originale Fullscreen-API Einstellungen in Firefox %}

`delay` ist die Zeit vom Aktivieren des Vollbildmodus bis zum Anzeigen der Warnung und `timeout` ist die Zeit bis zum automatischen Schließen der Warnung.

Hier ändern wir nun durch Doppelklick den Wert für `delay` auf `-1` und `timeout` auf `0`.

{% img einstellungen2.webp Angepasste Fullscreen-API Einstellungen in Firefox %}

Die meisten anderen Anleitungen erwähnen nur `full-screen-api.warning.timeout` auf `0` zu setzen. Dies führt jedoch dazu, dass die Meldung initial zwar nicht angezeigt wird, dafür jedoch jedes Mal, wenn man mit dem Mauszeiger an den oberen Bildschirmrand kommt. Durch zusätzliches Setzen von `full-screen-api.warning.delay` auf `-1` wird auch dies unterbunden.

Die Einstellungen werden sofort übernommen und es ist kein Neustart des Firefox notwendig.
