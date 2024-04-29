---
title: Installation von Node.js
author:
  name: Peter Müller
  link: https://crycode.de
#banner: banner.webp
date: 2017-04-17 12:00:00
updated: 2024-04-29 12:47:47
categories:
  - [Node.js]
  - [Software]
tags:
  - Node.js
  - Linux
---

{% img nodejs-logo.webp type:none right:true %}

In den Repositories von Ubuntu, Debian und anderen Linux Systemen ist [Node.js](https://nodejs.org/) zwar vorhanden, jedoch sind dies meistens keine aktuellen Versionen.

Zur Installation einer aktuellen Version gibt es drei Möglichkeiten, welche im Folgenden beschrieben werden.

<!-- more -->

> [!TIP]
> Es sollte möglichst immer die jeweils aktuelle LTS-Version von Node.js genutzt werden.  
> LTS-Versionen sind hier alle Versionen mit einer geraden Major-Versionsnummer (z.B. 20.x).

Unabhängig von der verwendeten Installationsmethode müssen wir zunächst die gegebenenfalls installierte veraltete Version von Node.js vom System entfernen:

```sh Entfernen der alten Node.js Version
sudo apt remove nodejs
sudo apt autoremove
```

<!-- toc -->

## Installation mittels Node Version Manager (nvm)

{% img nvm-logo.webp type:none right:true %}

Der [Node Version Manager](https://github.com/nvm-sh/nvm) (nvm) ist ein Script, welches es sher komfortabel ermöglicht schnell und einfach eine oder auch mehrere Versionen von Node.js zu installieren und zu verwalten.

Die Installation von *nvm* erfolgt einfach über den folgenden Befehl:

```sh Installation von nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Dieses Installationsscript läd die benötigten Dateien von GitHub herunter und fügt die benötigten Einträge in beispielsweise der Datei `~/.bashrc` hinzu.

Zum Installieren von Node.js wird anschließend `nvm install` mit der gewünschten Node.js Version aufgerufen.

```sh Installation einer Node.js Version mittels nvm
nvm install 20
```

Mit *nvm* ist es auch möglich mehrere Node.js Versionen parallel zu installieren. Hierzu wird einfach `nvm install` mehrfach mit der jeweiligen Version aufgerufen. Die entsprechend aktuell zu verwende Version kann dann jederzeit mittels `nvm use` ausgewählt werden.

```sh nvm install und use Beispiele
nvm install 16
nvm use 16
# Now using node v16.20.2 (npm v8.19.4)
node -v
# v16.20.2
nvm use 20
# Now using node v20.12.2 (npm v10.5.0)
node -v
# v20.12.2
```

> [!NOTE]
> Nachteil dieser Installationsmethode ist, dass *Node.js* damit nur dem aktuellen Benutzer zur Verfügung steht und es bei der Verwendung von unterschiedlichen Nutzern für verschiedene Programme zu etwas umständlichen Konstellationen kommen kann.

## Installation über das NodeSource-Repository

Dies ist eine einfache und zugleich sichere Methode zur Installation. Hierbei wird das Repository von [NodeSource](https://github.com/nodesource/distributions/) verwendet und alle Updates werden wie gewohnt über den Paketmanager installiert.

Abhängig von der gewünschten Version rufen wir einen der folgenden Befehle auf. Das Setup-Script erkennt dabei automatisch das verwendete Betriebssystem und richtet die Paketquellen dementsprechend ein.

```sh Einrichtung des NodeSource Repositories
VERSION=20.x
curl -fsSL https://deb.nodesource.com/setup_$VERSION | sudo -E bash -
```

Die Variable `VERSION=20.x` muss jeweils auf gewünschte Version angepasst werden. Für *Node.js* 18 wäre dies dann beispielsweise `VERSION=18.x`.

Anschließend installieren wir *Node.js* und die Build-Tools, welche zur Installation von *Node.js* Modulen mit nativen Addons benötigt werden.

```sh Installation von Node.js über das NodeSource Repository
sudo apt install nodejs build-essential
```

### Probleme beim Installieren von globalen Modulen

Bei der Installation von globalen Modulen (`-g` bzw. `--global`) kann es zu *EACCESS*-Fehlern, also Berechtigungsfehlern kommen. Selbst `sudo` hilft hier wenig und sollte in diesem Fall eh nicht verwendet werden.

Als Lösung wird in der [offiziellen Dokumentation](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally) empfohlen das Standardverzeichnis für *npm* zu ändern.

Hierfür legen wir zuerst im eigenen Home-Verzeichnis ein neues Verzeichnis an, sofern dies nicht bereits existiert:

```sh Verzeichnis .npm-global anlegen
mkdir -p ~/.npm-global
```

Anschließend wird *npm* so konfiguriert, dass es dieses Verzeichnis für gobale Module verwendet:

```sh npm für das Verzeichnis konfigurieren
npm config set prefix '~/.npm-global'
```

Damit die Module in einer Shell auch gefunden werden, wird ein entsprechender Eintrag am Ende der Datei `~/.profile` hinzugefügt und die Änderungen anschließend in die aktuelle Shell übernommen:

```sh Pfad für global installierte Module dem Profil hinzufügen
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

Das war’s dann auch schon. 🙂

## Manuelle Installation

Zur manuellen Installation ist es zunächst entscheidend, sich über die [offizielle Downloadseite](https://nodejs.org/en/download/) von *Node.js* die zur Plattform passende Variante herunterzuladen.

* Auf einem normalen 64-bit Ubuntu oder Debian System ist dies von den *Prebuild Binaries* für *Linux* die *x64* Variante.
* Auf neueren Raspberry Pis mit 64-bit Betriebssystem ist dies von den *Prebuild Binaries* für *Linux* die *ARM64* Variante.
* Auf einem Raspberry Pi ab Modell 2B ist dies von den *Prebuild Binaries* für *Linux* die *ARMv7* Variante.
* Für die älteren oder kleineren Raspberry Pis mit ARMv6 Prozessor (Raspberry Pi A/A+/B/B+/Zero/ZeroW) oder auch 32-bit Linux Systeme gibt es keine offiziellen Downloads mehr. Wie wir dennoch eine aktuelle Version von *Node.js* auf diese Systeme installiert bekommen, beschreibe ich weiter unten im Abschnitt Aktuelles *Node.js* auf ARMv6 oder 32-bit Linux.

Im folgenden Beispiel verwenden wir ARMv7 von *Node.js* v20.12.2.

```Manuelle Installation von Node.js auf einem Raspberry Pi
cd /tmp
wget https://nodejs.org/dist/v20.12.2/node-v20.12.2-linux-armv7l.tar.xz
tar -xvf node-v20.12.2-linux-armv7l.tar.xz
sudo mv node-v20.12.2-linux-armv7l /opt/
sudo ln -s /opt/node-v20.12.2-linux-armv7l /opt/node
sudo chown -R root:root /opt/node*
sudo ln -s /opt/node/bin/node /usr/bin/node
sudo ln -s /opt/node/bin/npm /usr/bin/npm
```

Damit ist *Node.js* dann installiert und Befehle `node` sowie `npm` sind global verfügbar.

Es empfiehlt sich auch noch das Verzeichnis `/opt/node/bin` der *PATH*-Variable hinzuzufügen, damit global installierte *Node.js* Module (wie beispielsweise TypeScript) automatisch global in jeder Shell verfügbar werden. Hierfür rufen wir einfach den folgenden Befehl auf, welcher die Datei `/etc/profile.d/nodejs.sh` anlegt und damit bei jedem Login eines Benutzer den Pfad automatisch erweitert.

```sh Pfad global hinzufügen
echo PATH=\$PATH:/opt/node/bin | sudo tee /etc/profile.d/nodejs.sh > /dev/null
```

Damit ist dann auch die manuelle Installation abgeschlossen. Zu beachten bleibt noch, dass keine automatischen Updates erfolgen.

### Aktuelles Node.js auf ARMv6 oder 32-bit Linux - Unofficial Builds

Seit *Node.js* Version 10 gibt es keine offiziellen Downloads mehr für Linux-Systeme mit 32-bit Prozessor. Ab Version 12 dann auch nicht mehr für Systeme mit ARMv6.

Glücklicherweise gibt es aber das [Node.js Unofficial Builds Project](https://github.com/nodejs/unofficial-builds), welches genau diese Varianten automatisch zu jedem neuen Release bereitstellt.

> [!IMPORTANT]
> Dieses Projekt ist experimentell! Es wird nicht garantiert, dass sein Ergebnis konsistent bleibt, und seine Existenz wird nicht für die Zukunft garantiert.

Auf der [Downloadseite](https://unofficial-builds.nodejs.org/download/release/) sind für alle aktuellen Versionen von *Node.js* die fertig kompilierten Archive, für unter anderem *armv6l* und *x86*, verfügbar.

Die Installation auf dem System erfolgt wie weiter oben im Abschnitt [Manuelle Installation](#manuelle-installation) beschrieben, nur eben mit dem passenden Link aus den inoffiziellen Builds.
