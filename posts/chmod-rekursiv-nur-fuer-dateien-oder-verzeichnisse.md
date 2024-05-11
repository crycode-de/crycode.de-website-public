---
title: Chmod rekursiv nur für Dateien oder Verzeichnisse
author:
  name: Peter Müller
  link: https://crycode.de
date: 2014-12-15 12:00:00
updated: 2019-08-19 12:00:00
categories:
  - Linux
tags:
  - Bash
  - Linux
  - Shell
---

Mit dem Befehl `chmod -R 755 ./*` können die Rechte von allen Dateien und Verzeichnissen im aktuellen und allen Unterverzeichnissen gesetzt werden.

Möchten wir nun jedoch die Rechte *nur von Dateien* oder *nur von Verzeichnissen* setzen hilft uns das Programm `find` weiter.

<!-- more -->

Im Folgenden zwei kleine Beispiele dazu.

## Rechte nur bei Dateien setzen

```sh Rechte nur bei Dateien setzen
find ./* -type f -exec chmod 644 {} \;
```

## Rechte nur bei Verzeichnissen setzen

```sh Rechte nur bei Verzeichnissen setzen
find ./* -type d -exec chmod 755 {} \;
```

## Verwendung von "xargs"

Bei Datei- oder Verzeichnisnamen, die Leerzeichen, Anführungszeichen oder Backslashs enthalten, kann es zu Fehlern kommen. Um dies zu vermeiden ist zusätzlich die Verwendung von `xargs` zu empfehlen:

```sh Rechte nur bei Dateien setzen mit xargs
find ./* -type f -print0 | xargs -0 chmod 644
```

Der Parameter `-print0` bei bewirkt, dass `find` jedes gefundene Element mit einem *Nullbyte* abschließt. Dieses *Nullbyte* wird von `xargs` durch den Parameter `-0` verwendet um die Eingaben zu trennen und richtig an `chmod` weiterzugeben.

## Siehe auch

Für weitere Informationen zu den einzelnen Programmen siehe:

```sh Handbücher der Programme anzeigen
man chmod
man find
man xargs
```
