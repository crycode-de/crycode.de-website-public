---
title: Fehlende Unicode-Zeichen im WSL Terminal
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2021-05-03 12:00:00
abbr:
  WSL: Windows Subsystem for Linux
categories:
  - Windows
tags:
  - Bash
  - Schriftart
  - Terminal
  - Unicode
  - Windows
  - WSL
---

Mit den Standardeinstellungen vom {% abbr WSL %} Terminal unter Windows werden die meisten Unicode-Sonderzeichen (wie z.B. ✔) nicht richtig angezeigt, sondern nur als Viereck (eventuell mit Fragezeichen drin) dargestellt:

<!-- more -->

{% img viereck.webp Fehlerhafte Unicode Zeichen im WSL Terminal %}

Dies liegt daran, dass die verwendete Schriftart die Zeichen nicht kennt und somit Platzhalter anzeigt.  
Die Lösung ist denkbar einfach: Eine andere Schriftart auswählen.

Dazu machen wir zuerst einen Rechtsklick auf die Titelleiste des {% abbr WSL %} Fensters und wählen dann *Einstellungen* für die Einstellungen des aktuellen Fensters, oder *Standardwerte* für die Einstellungen neuer Fenster.

{% img kontextmenue.webp Kontextmenü vom WSL Terminal %}

In dem Eigenschaften-Fenster wählen wir dann als Schriftart beispielsweise *DejaVu Sans Mono* aus und bestätigen mit *OK*. Alternativ könnt ihr auch andere Schriftarten ausprobieren, aber nicht alle unterstützen die Unicode-Zeichen.

{% img einstellungen.webp Einstellungen vom WSL Terminal %}

Nun werden alle Zeichen richtig angezeigt.

{% img korrekte-darstellung.webp Korrekt dargestellte Unicode Zeichen im WSL Terminal %}
