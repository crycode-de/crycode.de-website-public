---
title: Doppelte Touch/Klick-Events beim Raspberry Pi Touchscreen mit Firefox
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2020-06-30 12:00:00
categories:
  - [Raspberry Pi]
  - [Software]
tags:
  - Firefox
  - Raspberry Pi
  - Touchscreen
---

Bei Verwendung des offiziellen [Raspberry Pi 7" Touchscreens](https://www.rasppishop.de/Raspberry-Pi-7-Touchscreen-Display_3) zusammen mit dem Firefox Browser kommt es oftmals vor, dass ein einzelnes Antippen eines Elements einer Webseite gleich zwei Klicks kurz nacheinander auslöst, als hätte man doppelt getippt.

Dies hängt damit zusammen, dass ein Antippen gleich mehrere Events (Touch-Start, Touch-End, Click, …) im Browser auslöst, welche dann teilweise zu doppelt ausgeführten Aktionen führen.

<!-- more -->

## Optimierung im Firefox

Im Firefox lässt sich dieses Verhalten für den Raspberry Pi Touchscreen optimieren, indem man die erweiterten Konfigurationseinstellungen durch Eingabe von `about:config` in der Adresszeile aufruft.

Da man in diesem Bereich auch schnell unbeabsichtigt etwas kaputt machen, erscheint zunächst ein Warnhinweis, den wir bestätigen müssen.

{% img firefox-about-config-warnung.webp about:config Warnhinweis im Firefox %}

Ist die Warnung bestätigt suchen wir nach `dom.w3c` und ändern dann den Wert bei `dom.w3c_touch_events.legacy_apis.enabled` von `false` auf `true`.

{% img firefox-about-config-dom-w3c.webp about:config dom.w3c Konfiguration im Firefox %}

Weiterhin kann durch setzen von `dom.w3c_touch_events.enabled` auf `1` zusätzlich die Aktivierung der Touch-Events explizit aktiviert werden.
(`0` = aus, `1` = ein, `2` = automatische Erkennung)

Diese Einstellungen werden sofort übernommen. Es ist also nicht nötig den Firefox neu zu starten.

Nach dieser kleinen Änderung sollte das Antippen, Scrollen und Zoomen über den Touchscreen dann deutlich besser und intuitiver funktionieren.

> [!NOTE]
> Bei einem Update von Firefox kann es vorkommen, dass diese Einstellungen auf den Standardwert zurückgesetzt werden und somit die Änderungen erneut durchgeführt werden müssen.
