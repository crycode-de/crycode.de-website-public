---
title: Serversprache einstellen
author:
  name: Peter Müller
  link: https://crycode.de
date: 2015-06-23 12:00:00
updated: 2017-04-16 12:00:00
categories:
  - [Server]
  - [Linux]
tags:
  - Debian
  - Linux
  - Server
  - Ubuntu
---

Viele Standardinstallationen von Linux enthalten nur englische Standorteinstellung, die sogenannten Locales.

Die Standorteinstellungen lassen sich sehr einfach mit folgendem Befehl anpassen:

```sh Locales anpassen
sudo dpkg-reconfigure locales
```

<!-- more -->

Im folgenden Fenster wählen wir die Sprachen und Zeichensätze aus, die wir benötigen. Am besten `de_DE.UTF-8 UTF-8` und `en_US.UTF-8 UTF-8` um die deutschen und englischen Sprachen zu installieren.

{% img dpkg-reconfigure-locales-1.webp thumb: Sprachen auswählen %}

Auf der nächsten Seite wählen wir noch `de_DE` als unsere Standardeinstellung.

{% img dpkg-reconfigure-locales-2.webp thumb: Standardsprache auswählen %}

Anschließend werden automatisch die gewählten Locales generiert und die Einstellungen angepasst.

```plain Ausgabe
Generating locales (this might take a while)...
  de_DE.UTF-8... done
  en_US.UTF-8... done
Generation complete.
```

Damit sind die Standort-/Spracheinstellungen fertig angepasst und beim nächsten Login wird die neue Sprache verwendet.

Getestet mit Debian Lenny, Squeeze und Wheezy, sowie Raspbian.

## Ubuntu

Unter Ubuntu können die nötigen Sprachpakete wie folgt installiert und danach aktiviert werden:

```sh Sprachpakete unter Ubuntu installieren und aktivieren
sudo apt update
sudo apt install language-pack-de language-pack-de-base
sudo dpkg-reconfigure locales
sudo update-locale LANG=de_DE.UTF-8
```

Anschließend ist eventuell noch ein Neustart des Systems notwendig.
