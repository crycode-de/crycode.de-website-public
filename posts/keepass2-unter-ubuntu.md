---
title: KeePass2 unter Ubuntu/Debian
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2025-03-26 13:59:46
categories:
  - [Linux]
  - [Software]
tags:
  - KeePass2
  - KeePassRPC
  - Ubuntu
  - Debian
---

Der Passwortmanager [KeePass2](https://keepass.info/) kann neben vielen anderen Plattformen auf unter Ubuntu bzw. Debian genutzt werden.

<!-- more -->
<!-- toc -->

## Installation

Die grundlegende Installation erfolgt dabei einfach per `apt`:

```sh Installation von KeePass2
sudo apt install keepass2 mono-complete
```

Da KeePass eigentlich ein Windows-Programm ist, wird hierbei die `mono-runtime` mit installiert, wodurch die exe-Datei auch unter Linux ausführbar ist.  
`mono-complete` ist optional, wird aber für einige KeePass Plugins benötigt und sollte daher vorsichtshalber direkt mit installiert werden.

Die KeePass Dateien liegen nun im System unter `/usr/lib/keepass2/`. Plugins können nach `/usr/lib/keepass2/Plugins/` kopiert werden.

### Update auf eine aktuelle Version

Unter Ubuntu 24.04 wird aus den Paketquellen standardmäßig KeePass 2.47 installiert. Wer eine aktuellere Version bevorzugt oder z.B. für ein Plugin benötigt, kann nach der Installation per `apt` einfach manuell KeePass wie folgt updaten.

> [!CAUTION]
> Da hierbei die originalen Dateien aus dem deb-Paket ersetzt werden, muss dies wiederholt werden, falls es mal ein Update des Paketes gab.

Zuerst laden wir die aktuelle **Portable** Version KeePass von der [offiziellen Download-Seite](https://keepass.info/download.html) herunter. In diesem Beispiel ist das `KeePass-2.58.zip`.

Diese zip-Datei entpacken wir dann in ein temporäres Verzeichnis und kopieren die entsprechenden Dateien an die richtigen Stellen im System:

```sh KeePass entpacken und Dateien kopieren
DIR=$(mktemp -d)
cd $DIR
unzip ~/Downloads/KeePass-2.58.zip -d $DIR
sudo cp KeePass.exe  KeePass.exe.config /usr/lib/keepass2/
```

Nun kann man KeePass normal starten und prüfen, ob die neue Version ausgeführt wird (was der Fall sein sollte).

## Integration in Firefox

Über das Firefox Addon [Kee - Password Manager](https://addons.mozilla.org/de/firefox/addon/keefox/) kann KeePass sehr gut in Firefox integriert werden.

Zusätzlich zu dem Firefox Addon muss in KeePass das Plugin [KeePassRPC](https://github.com/kee-org/keepassrpc) installiert werden. Dazu einfach aus den [Releases](https://github.com/kee-org/keepassrpc/releases) die Datei `KeePassRPC.plgx` herunterladen und nach `/usr/lib/keepass2/Plugins/` kopieren.

Sobald dann Firefox und KeePass gestartet sind, sollte sich in Firefox die Seite "Kee-Autorisation" und ein Fenster von KeePass zum autorisieren der Verbindung öffnen. Der im KeePass-Fenster angezeigte Code muss hier dann das Passwort-Feld im Browser kopiert werden und mit einem Klick auf _Verbinden_ wird die Verbindung zwischen KeePass und Firefox hergestellt.

{% img keepass-mit-firefox-verbinden.webp KeePass mit Firefox verbinden %}

Anschließen sollten, solange in KeePass eine Datenbank geöffnet ist, in Firefox bei entsprechenden Login-Seiten direkt die Logindaten aus KeePass eingefügt werden. Über das Schlüsselsymbol in den Eingabefeldern der Login-Seite kann man zudem zwischen ggf. mehreren gespeicherten Logins für eine Seite wählen.

> [!TIP]
> Damit das automatische Ausfüllen auf den Webseiten funktioniert, muss bei den Einträgen in KeePass das _URL_ Feld mit der entsprechenden Adresse der zugehörigen Webseite befüllt sein. Hierüber erkennt das Kee Addon in Firefox welcher Login zu der jeweiligen Webseite gehört-
