---
title: Nextcloud Client auf dem Raspberry Pi
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2019-09-13 12:00:00
updated: 2024-04-22 17:04:53
categories:
  - [Raspberry Pi]
  - [Software]
tags:
  - Nextcloud
  - Raspberry Pi
  - Sync
  - Raspbian
  - Raspberry Pi OS
---

[Nextcloud](https://nextcloud.com/de/) ist inzwischen eine sehr verbreitete Software zur Speicherung von Dateien, Kontakten, Kalendereinträgen und vielem mehr auf einem eigenen Server.

Dieser Beitrag soll die Einrichtung und Verwendung des *Nextcloud Clients* auf einem Raspberry Pi zur Synchronisierung von Dateien beschreiben.

<!-- more -->

<!-- toc Inhalt 3 -->

## Installation

Wie der Nextcloud Client installiert wird, hängt etwas von dem verwendeten System ab.

### Installation auf Raspberry Pi OS Bookworm

Unter dem aktuellen (Stand April 2024) *Raspberry Pi OS* "Bookworm" ist der Nextcloud Client als `nextcloud-desktop` in den Standard-Paketquellen vollständig enthalten und kann darüber installiert werden.

```sh Installation von nextcloud-desktop über die offiziellen Paketquellen
sudo apt update
sudo apt install nextcloud-desktop nextcloud-desktop-cmd
```

### Installation auf RaspOS/Raspbian Bullseye

Bei älteren Systemen gestaltet sich die Installation etwas aufwändiger, da hier nicht alle erforderlichen Teile in den Paketquellen enthalten sind.
Zum Glück können jedoch die originalen Debian-Pakete genutzt werden, was im folgenden Abschnitt beschrieben ist.

<details>
<summary>Alte Anleitung einblenden</summary>

Je nachdem ob wir lediglich den CMD-Client oder den grafischen GUI-Client haben wollen, brauchen wir zunächst unterschiedliche Pakete aus den Debian-Quellen:

* CMD: `libnextcloudsync0`, `nextcloud-desktop-cmd`
* GUI: `libnextcloudsync0`, `libqt5webenginecore5`, `libqt5webenginewidgets5`, `nextcloud-desktop`

Natürlich können auch beide Varianten zusammen, wie im folgenden beschrieben, installiert werden.

Da die einzelnen Pakete jeweils eigene Abhängigkeiten haben, die zum Glück aber aus den normalen Paketquellen des Systems bedient werden können, werden bei den folgenden `dpkg -i ...` Befehlen einige Abhängigkeitsfehler gemeldet werden. Diese können wir aber ganz einfach mittels `apt install --fix-broken` reparieren.

#### libnextcloudsync0 (CMD und GUI)

Original Debian-Paket: <https://packages.debian.org/bullseye/libnextcloudsync0>

```sh Paket libnextcloudsync0 installieren
wget http://ftp.de.debian.org/debian/pool/main/n/nextcloud-desktop/libnextcloudsync0_3.1.1-2+deb11u1_armhf.deb
sudo dpkg -i libnextcloudsync0_3.1.1-2+deb11u1_armhf.deb
sudo apt install --fix-broken
```

#### nextcloud-desktop-cmd (CMD)

Original Debian-Paket: <https://packages.debian.org/bullseye/nextcloud-desktop-cmd>

```sh Paket nextcloud-desktop-cmd installieren
wget http://ftp.de.debian.org/debian/pool/main/n/nextcloud-desktop/nextcloud-desktop-cmd_3.1.1-2+deb11u1_armhf.deb
sudo dpkg -i nextcloud-desktop-cmd_3.1.1-2+deb11u1_armhf.deb
sudo apt install --fix-broken
```

#### libqt5webenginecore5 (GUI)

Original Debian-Paket: <https://packages.debian.org/bullseye/libqt5webenginecore5>

```sh Paket libqt5webenginecore5 installieren
wget http://ftp.de.debian.org/debian/pool/main/q/qtwebengine-opensource-src/libqt5webenginecore5_5.15.2+dfsg-3_armhf.deb
sudo dpkg -i libqt5webenginecore5_5.15.2+dfsg-3_armhf.deb
sudo apt install --fix-broken
```

#### libqt5webenginewidgets5 (GUI)

Original Debian-Paket: <https://packages.debian.org/bullseye/libqt5webenginewidgets5>

```sh Paket libqt5webenginewidgets5 installieren
wget http://ftp.de.debian.org/debian/pool/main/q/qtwebengine-opensource-src/libqt5webenginewidgets5_5.15.2+dfsg-3_armhf.deb
sudo dpkg -i libqt5webenginewidgets5_5.15.2+dfsg-3_armhf.deb
sudo apt install --fix-broken
```

#### nextcloud-desktop (GUI)

Original Debian-Paket: <https://packages.debian.org/bullseye/nextcloud-desktop>

```sh Paket nextcloud-desktop installieren
wget http://ftp.de.debian.org/debian/pool/main/n/nextcloud-desktop/nextcloud-desktop_3.1.1-2+deb11u1_armhf.deb
sudo dpkg -i nextcloud-desktop_3.1.1-2+deb11u1_armhf.deb
sudo apt install --fix-broken
```

#### Test der Installation

Damit ist die Installation auf RaspOS bzw. Raspbian Bullseye auch schon abgeschlossen und wir können den Client verwenden:

```sh Nextcloud Client testen
nextcloudcmd -v
Nextcloud version 3.1.1-2+deb11u1
Using Qt 5.15.2, built against Qt 5.15.2
Using 'OpenSSL 1.1.1k  25 Mar 2021'
Running on Raspbian GNU/Linux 11 (bullseye), arm
```

Weiter unten findet ihr noch ein paar Informationen zur Verwendung.

</details>

### Alternative: Selbst kompilieren

Als Alternative zu den bereitgestellten Paketen kann man den Nextcloud Client auch selbst kompilieren. Dabei können wir auch wählen, welche genau Version wir installieren möchten.

Diese Variante kann zudem verwendet werden, wenn für die genutzte Architektur keine Pakete verfügbar sind.

> [!NOTE]
> Das Kompilieren kann auf einem Raspberry Pi je nach Modell durchaus sehr lange dauern.

#### Vorbereitungen

Wir gehen hier von einem aktuellen *Raspberry Pi OS Bookworm* aus. Bei älteren Versionen können die benötigten Pakete unter Umständen anders heißen oder nicht verfügbar sein.

Zunächst installieren wir die für den Build benötigten Pakete:

```sh Für den Build benötigten Pakete installieren
sudo apt update
sudo apt install cmake extra-cmake-modules git inkscape libc6 libgcc-s1 \
  libglib2.0-0 libkf5archive-dev libkf5archive5 libkf5kio-dev libqt5core5a \
  libqt5dbus5 libqt5gui5 libqt5keychain1 libqt5network5 libqt5qml5 \
  libqt5qmlmodels5 libqt5quick5 libqt5quickcontrols2-5 libqt5sql5 libqt5sql5-sqlite \
  libqt5svg5 libqt5svg5-dev libqt5webchannel5-dev libqt5webengine-data \
  libqt5webenginecore5 libqt5webenginewidgets5 libqt5websockets5 libqt5websockets5-dev \
  libqt5widgets5 libqt5xml5 libsqlite3-0 libsqlite3-dev libssl-dev libssl3 \
  libstdc++6 libzip-dev qt5keychain-dev qtbase5-private-dev qtdeclarative5-dev \
  qtpositioning5-dev qtquickcontrols2-5-dev qttools5-dev qtwebengine5-dev \
  texlive-latex-base zlib1g zlib1g-dev
```

#### Quellen herunterladen und kompilieren

Jetzt können wir den aktuellen Quellcode von GitHub herunterladen (klonen), die Version auswählen und den Client kompilieren.

Bei der letzten Aktualisierung dieser Anleitung war die Version 3.12.3 die aktuellste stabile Version, welche wir hier auch verwenden.

Durch Angabe von `-DCMAKE_INSTALL_PREFIX=/usr/local/` wird der Nextcloud Client später global im System unter `/usr/local/` installiert. Dieser Pfad kann auch geändert werden, wenn man wo anders hin installieren möchte.

```sh Quellcode herunterladen, Version auswählen und zum Kompilieren vorbereiten
git clone https://github.com/nextcloud/desktop.git nextcloud-desktop-src
cd nextcloud-desktop-src
git checkout v3.12.3
mkdir build
cd build
cmake .. -DCMAKE_INSTALL_PREFIX=/usr/local/ -DCMAKE_BUILD_TYPE=Release
```

> [!TIP]
> Zeit für den ersten Kaffee! ☕️  
> Da hier u.a. schon einige Grafiken erstellt werden, dauert dieser Schritt etwas.

Wenn dies erfolgreich durchgelaufen ist, dann sind wir bereit für das eigentliche Kompilieren, wobei wir `-j4` mit angeben, damit bis zu 4 CPU-Kerne gleichzeitig genutzt werden.

```sh Nextcloud Client kompilieren
make -j4
```

> [!TIP]
> Zeit für den zweiten Kaffee! ☕️  
> Das Kompilieren auf dem Raspberry Pi kann je nach Modell bis zu einer Stunde (oder sogar noch länger) dauern.

Um den Nextcloud Client nun im System zu installieren rufen wir folgendes auf:

```sh Installation des kompilieren Clients
sudo make install
```

Wenn wir nun versuchen den Nextcloud Client zu starten erhalten wir diese Fehlermeldung:

```sh Nextcloud Client Startversuch
nextcloudcmd -v
nextcloudcmd: error while loading shared libraries: libnextcloudsync.so.0: cannot open shared object file: No such file or directory
```

Diesen Fehler beheben wir wie folgt, wobei nur die Einträge hinzugefügt werden, die noch fehlen:

```sh Fehler mit shares libraries beheben
echo 'LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib' | sudo tee -a /etc/environment
grep '/usr/local/lib' /etc/ld.so.conf.d/usr-local-lib.conf >/dev/null 2>&1 || echo '/usr/local/lib' | sudo tee -a /etc/ld.so.conf.d/usr-local-lib.conf
sudo ldconfig
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib
```

Anschließend können wir den Nextcloud Client aufrufen.

```sh Version vom Nextcloud Client prüfen
nextcloudcmd -v
Nextcloud version 3.12.3git
Git revision e4ad64aa1950ed482485be416d50296bc2130e20
Using Qt 5.15.8, built against Qt 5.15.8
Using 'OpenSSL 3.0.11 19 Sep 2023'
Running on Debian GNU/Linux 12 (bookworm), arm64
```

#### Aufräumen nach der manuellen Installation

Haben wir alles fertig installiert, dann können wir optional auch einige Pakete wieder entfernen und das Verzeichnis mit dem Quellcode löschen:

```sh Aufräumen
sudo apt remove cmake extra-cmake-modules libkf5archive-dev libkf5kio-dev \
  libqt5svg5-dev libqt5webchannel5-dev libqt5websockets5-dev libsqlite3-dev \
  libssl-dev libzip-dev qt5keychain-dev qtbase5-private-dev qtdeclarative5-dev \
  qtpositioning5-dev qtquickcontrols2-5-dev qttools5-dev qtwebengine5-dev zlib1g-dev
sudo apt autoremove
cd
rm -rf nextcloud-desktop-src
```

Dies gibt knapp 1,5&nbsp;Gb an Speicherplatz wieder frei.

## GUI-Client

Der normale grafische Client kann über das Anwendungsmenü oder über ein Terminal mittels nextcloud gestartet werden.

Möchtet ihr den Nextcloud Client automatisch beim Start des Raspberry Pi mit starten lassen (Autostart), dann erstellen wir einen symbolischen Link aus dem autostart-Verzeichnis des aktuellen Nutzers auf den Nextcloud desktop-Starter.

```sh Autostart des GUI-Clients aktivieren
mkdir -p .config/autostart
cd .config/autostart
ln -s /usr/share/applications/com.nextcloud.desktopclient.nextcloud.desktop nextcloud.desktop
```

Damit wird dann der Client automatisch nach dem Login des Benutzers gestartet.

## CMD-Client

Zusätzlich zu dem GUI-Client gibt es noch den CMD-Client `nextcloudcmd`. Über diesen kann die Synchronisation über ein Terminal durchgeführt werden und es wird keine grafische Oberfläche benötigt.

Anders als der GUI-Client führt der CMD-Client nur ein mal die Synchronisation durch und beendet sich anschließend wieder. Für eine regelmäßige Synchronisation müssen wir also zum Beispiel einen CRON-Job verwenden.

Der Aufruf des CMD-Clients ist eigentlich ganz einfach:

```sh Nextcloud CMD-Client Aufruf Syntax
nextcloudcmd [Optionen] <lokales_Verzeichnis> <Server_URL>
```

Als Optionen können Benutzername und Passwort mit angegeben werden, was jedoch nicht besonders sicher ist. Besser ist es hier die Option `-n` zu verwenden, wodurch `netrc` für den Login beim Server verwendet wird. Netrc ist denkbar einfach. Wir erstellen einfach im Home-Verzeichnis eine Datei namens `.netrc`, welche den Server, Benutzername und Passwort nach folgendem Muster enthält und passen die Dateirechte an:

```sh Datei ~/.netrc erstellen
nano ~/.netrc
```

```plain Inhalt von ~/.netrc
machine mein.server.de
        login benutzername
        password passwort
```

```sh Dateirechte anpassen
chmod 0600 ~/.netrc
```

Hier noch ein Beispiel zur Nutzung des CMD-Clients mit `netrc`. Das lokale Verzeichnis ist hierbei `/var/data/cloud`. Vom Server wird die WebDAV-URL benötigt.

```sh Nextcloud CMD-Client Beispielaufruf
nextcloudcmd --non-interactive -n /var/data/cloud/ https://mein.server.de/
```

### Mögliche Parameter für den CMD-Client

| Parameter | Beschreibung |
|---|---|
| `--user [Name]`, `-u [Name]` | [Name] als Benutzernamen für den Login verwenden. |
| `--password [Passwort]`, `-p [Passwort]` | [Passwort] für den Login verwenden. |
| `-n` | Netrc (Datei `~/.netrc`) für den Login verwenden. |
| `--non-interactive` | Nicht nachfragen, sondern eine nicht interaktive Ausführung erlauben. |
| `--slient`, `-s` | Unterdrückt gesprächige Logmeldungen. |
| `--logdebug` | Zeigt zusätzliche Logmeldungen. |
| `--httpproxy [Proxy]` | Einen HTTP-Proxyserver nach dem Muster `http://server:port` verwenden. |
| `--trust` | Auch ungültigen oder selbst signierten SSL-Zertifikaten vertrauen. |
| `--exclude [Datei]` | Eine Datei mit einer Liste von Dateien und Verzeichnissen angeben, die nicht vom Client zum Server synchronisiert werden sollen. |
| `--unsyncedfolders [Datei]` | Eine Datei mit einer Liste von Dateien und Verzeichnissen angeben, die nicht vom Server zum Client synchronisiert werden sollen. |
| `--path` | Pfad zu einem Verzeichnis auf dem Server. |
| `--max-sync-retries [n]` | Maximale Anzahl an wiederholten Synchronisationsversuchen. Standard ist 3. |
| `-h` | Auch versteckte Dateien (die mit einem `.` beginnen) mit Synchronisieren. |
| `--uplimit [n]` | Bandbreite beim Upload begrenzen in KB/s. |
| `--downlimit [n]` | Bandbreite beim Download begrenzen in KB/s. |
| `--version`, `-v` | Die Version des Nextcloud Clients anzeigen und dann beenden. |

### Automatische Synchronisation mit dem CMD-Client

Für eine automatische Synchronisation mittels CRON-Job erstellen wir uns zuerst ein kleines Bash-Skript unter `/home/pi/nextcloudcmd-sync.sh` mit folgendem Inhalt, wobei das lokale Verzeichnis und die Serveradresse, sowie gegebenenfalls die Parameter noch angepasst werden müssen:

{% codefile sh nextcloudcmd-sync.sh Sync-Skript für den Nextcloud CMD-Client %}

Diese Datei machen wir dann ausführbar und fügen einen Eintrag in der `crontab` hinzu.

```sh Skript ausführbar machen und Crontab bearbeiten
chmod +x /home/pi/nextcloudcmd-sync.sh
crontab -e
```

```plain Crontab Eintrag
# [...]
# m h  dom mon dow   command
0 4 * * * /home/pi/nextcloudcmd-sync.sh >/dev/null &
```

Hier in dem Beispiel wird die Synchronisation jeden Tag nachts um 4 Uhr gestartet.

Das Ergebnis der Synchronisation kann jederzeit in der Log-Datei `/var/log/nextcloudcmd-sync.log` eingesehen werden.

Damit die Log-Datei auch vom Nutzer *pi* geschrieben werden kann, müssen wir diese noch einmalig anlegen und die Rechte entsprechend anpassen:

```sh Log-Datei für den Benutzer pi beschreibbar machen
sudo touch /var/log/nextcloudcmd-sync.log
sudo chown pi:pi /var/log/nextcloudcmd-sync.log
```

#### Logrotate einrichten

Damit die Log-Datei `/var/log/nextcloudcmd-sync.log` mit der Zeit nicht endlos groß wird und unnötig Speicherplatz belegt, legen wir noch eine Konfiguration für Logrotate für diese Datei an.

```sh Logrotate Konfigurationsdatei erstellen
sudo nano /etc/logrotate.d/nextcloudcmd-sync
```

{% codefile logrotate-nextcloudcmd-sync Logrotate Konfiguration %}

Mit dieser Konfiguration führt der Logrotate vom System dann wöchentlich eine Rotation der Log-Datei durch, wobei immer die letzten vier Kopien gespeichert werden. Die ältesten drei Kopien werde zudem gepackt um Speicherplatz zu sparen.
