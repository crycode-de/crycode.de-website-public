---
title: 'VS Code Server for WSL closed unexpectedly: Input/output error'
date: 2021-10-22 12:00:00
updated: 2024-04-01 14:39:00
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.jpg
categories:
  - [Windows]
  - [Software]
tags:
  - Fehlerbehebung
  - Mount
  - VS Code
  - Windows
  - WSL
abbr:
  VS Code: Visual Studio Code
  WSL: Windows-Subsystem für Linux
---

Wer {% abbr "VS Code" %} zusammen mit dem {% abbr WSL %} Remote nutzt, kennt das Problem vielleicht:  
Nach einem Herunterfahren des Computers und anschließenden wieder Hochfahren hat VS Code oftmals Probleme mit der Initialisierung des _VS Code Server for WSL_.

Als Fehlermeldung erscheint dann:

> VS Code Server for WSL closed unexpectedly.
> Check WSL terminal for more details.

{% img vscode-wsl-closed-unexpectedly.png %}

<!-- more -->

> [!NOTE]
> Das Problem scheint nur zusammen mit WSL1 aufzutreten. Mit WSL2 hatte ich das Problem bislang nicht.  
> Die hier beschriebenen Schritte sind aber auch unter WSL2 möglich.

Im Terminal sind zu dem Fehler die folgenden Infos zu sehen:

```plain VS Code Terminal Ausgabe
Resolving wsl+ubuntu, resolveAttempt: 1
Starting VS Code Server inside WSL (Ubuntu)
Extension version: 0.58.2, Windows build: 19043. Multi distro support: available. WSL path support: enabled
No shell environment set or found for current distro.
Probing if server is already installed: C:\WINDOWS\System32\wsl.exe -d Ubuntu -e sh -c "[ -d ~/.vscode-server/bin/c13f1abb110fc756f9b3a6f16670df9cd9d4cf63 ] && printf found || ([ -f /etc/alpine-release ] && printf alpine-; uname -m)"
Probing result: found
Server install found in WSL
Launching C:\WINDOWS\System32\wsl.exe -d Ubuntu sh -c '"$VSCODE_WSL_EXT_LOCATION/scripts/wslServer.sh" c13f1abb110fc756f9b3a6f16670df9cd9d4cf63 stable .vscode-server 0  --disable-telemetry'}
sh: 1: /mnt/c/Users/peter/.vscode/extensions/ms-vscode-remote.remote-wsl-0.58.2/scripts/wslServer.sh: Input/output error
VS Code Server for WSL closed unexpectedly.
For help with startup problems, go to
https://code.visualstudio.com/docs/remote/troubleshooting#_wsl-tips
WSL Daemon exited with code 0
```

Der entscheidende Hinweis hierbei ist `Input/output error`.

Der als Hilfestellung vorgeschlagene Link bringt uns in diesem Fall leider nicht weiter.

## Ursache des Problems

Die Ursache für diesen `Input/output error` ist, dass im WSL normalerweise die Windows-Laufwerke automatisch unter `/mnt/` gemountet sind und damit unter anderem das Laufwerk `c:\` im WSL unter `/mnt/c/` zur Verfügung steht.

Nach einem Herunterfahren und wieder Hochfahren von Windows, wobei standardmäßig der _Schnellstart Hybridmodus_ genutzt wird, ist diese Einbindung von Laufwerk `c:\` jedoch oftmals gestört. Ein Versuch auf `/mnt/c/` zuzugreifen endet dann ebenfalls im `Input/output error`.

## Lösung

Wie so oft gibt es auch hier verschiedene Lösungsansätze, welche jeweils ihre eigenen Vor- und Nachteile haben.

### a) Neustart vom WSL

Die wohl einfachste Lösung ist der Neustart vom WSL.

Hierzu rufen wir einfach in einer Eingabeaufforderung oder PowerShell folgendes auf:

```ps
wsl --shutdown
```

Dies beendet das WSL und es wird bei der nächsten Verwendung automatisch wieder neu gestartet. Dabei werden dann auch die Laufwerke wieder richtig eingebunden.

Vorteile:

* Einfach
* Relativ schnell

Nachteile:

* Beendet alles, was aktuell im WSL läuft

### b) Neu Einbinden des Laufwerks im WSL

Falls Lösung a) nicht möglich ist, da beispielsweise andere Prozesse im WSL weiter laufen sollen, gibt es die Möglichkeit den Mount im WSL neu einzubinden.

Hierzu müssen wir zuerst die fehlerhafte Einbindung entfernen und anschließend neu erstellen:

```sh
sudo umount /mnt/c
sudo mount -t drvfs C:\\ /mnt/c
```

Anschließend ist Laufwerk `c:\` wieder im aktuellen WSL verfügbar und VS Code kann auch wieder das WSL Remote nutzen.

Um sich diese Befehle nicht jedes mal merken zu müssen, kann man auch den folgenden Alias in die Datei `~/.bash_aliases` im WSL eintragen:

```sh ~/.bash_aliases
alias fixc='sudo umount /mnt/c && sudo mount -t drvfs C:\\ /mnt/c'
```

Anschließend genügt ein Aufruf von `fixc` und die Welt ist wieder in Ordnung.

Vorteile:

* Im laufenden WSL möglich, kein Neustart benötigt
* Sehr schnell

Nachteile:

* _sudo_-Passwort im WSL wird benötigt

### c) Deaktivieren des Schnellstart Hybridmodus

Eine dauerhafte Lösung ist die Deaktivierung des _Schnellstart Hybridmodus_ von Windows. Damit werden beim normalen Herunter- und Hochfahren des Systems alle Anwendungen korrekt geschlossen beziehungsweise wieder gestartet.

Hierzu gibt es diverse Anleitungen im Netz. Deshalb hier nur in Kurzform der Befehl zum Deaktivieren über eine Eingabeaufforderung oder PowerSchell, jeweils als Administrator:

```ps Schnellstart Hybridmodus in Windows deaktivieren
powercfg /hibernate off
```

Einmal ausgeführt ist der _Schnellstart Hybridmodus_ dauerhaft deaktiviert.

Vorteile:

* Dauerhafte Lösung

Nachteile:

* Eingriff in das System
* Administratorrechte erforderlich
* Jeder Start von Windows dauert anschließend merkbar länger, da alles neu geladen werden muss

### d) Neustart von Windows

Nicht wirklich praktikabel, aber der Vollständigkeit halber erwähnt: Auch ein Neustart von Windows hilft bei dem Problem.

Beim Neustart wird das System im Gegensatz zum einfachen Herunter- und Hochfahren komplett neu gestartet und dabei alle Anwendungen richtig geschlossen und anschließend neu geöffnet.

Nachteile:

* Langsam
* Alle offenen Programme etc. werden geschlossen
