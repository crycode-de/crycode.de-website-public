---
title: Symlinks unter Windows
author:
  name: Peter Müller
  link: https://crycode.de
date: 2015-01-04 12:00:00
updated: 2017-04-17 12:00:00
categories:
  - Windows
tags:
  - Dateisystem
  - Symlink
  - Windows
---

*Symbolische Links*, oder *Symlinks*, sind spezielle Dateitypen, die eine Verknüpfung auf einen anderen Ordner enthalten. In der Praxis kann man solche Links beispielsweise nutzen, um Dateien oder Ordner an verschiedenen Stellen im Dateisystem zugänglich zu machen, oder Netzwerkfreigaben mit einem bestimmten Ordner zu verknüpfen.

Unter Linux sind symbolische Links ein fester Bestandteil des Betriebssystems. Kaum bekannt ist aber, dass auch Windows ab Vista solche Verknüpfungen erstellen kann. Voraussetzung hierfür ist lediglich, dass das NTFS-Dateisystem verwendet wird.

## Syntax

Möchte man unter Windows einen *Symlink* erstellen, so kann in der Eingabeaufforderung (`cmd`) den Befehl `mklink` verwenden:

```plain
MKLINK [[/D] | [/H] | [/J]] Verknüpfung Ziel

        /D           Erstellt eine symbolische Verknüpfung für ein Verzeichnis.
                     Standardmäßig wird eine symbolische Verknüpfung für
                     eine Datei erstellt.
        /H           Erstellt eine feste Verknüpfung anstelle einer
                     symbolischen Verknüpfung.
        /J           Erstellt eine Verzeichnisverbindung.
        Verknüpfung  Gibt den Namen für die symbolischen Verknüpfung an.
        Ziel         Gibt den Pfad (relativ oder absolut) an, auf den die
                     neue Verknüpfung verweist.
```

## Beispiel

```bat Symlink unter Windows erstellen
MKLINK /D %appdata%\.minecraft D:\Spiele\Minecraft
```

Erstellt den Symlink `C:\Users\Benutzername\AppData\Roaming\.minecraft` mit dem Ziel `D:\Spiele\Minecraft`.
