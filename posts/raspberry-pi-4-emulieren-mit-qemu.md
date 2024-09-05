---
title: Raspberry Pi 4 emulieren mit QEMU
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
categories:
  - - Raspberry Pi
  - - Software
tags:
  - Raspberry Pi
  - QEMU
  - Emulation
  - WSL
date: 2024-06-08 07:50:27
updated: 2024-09-05 12:59:00
---


Mancher kennt das vielleicht: Man möchte Software für einen Raspberry Pi testen, hat aber gerade keinen Raspi zur Hand, oder möchte nicht sein laufendes System gefährden.

Eine (relativ) einfache Lösung kann hier sein auf einem normalen Rechner eine Raspberry Pi zu emulieren.

Hierfür nutzen wir ein aktuelles Ubuntu-System (24.04) und die freie Virtualisierungssoftware [QEMU](https://www.qemu.org/).

<!-- more -->

> [!NOTE]
> Wir emulieren hier ein laufendes Raspberry Pi OS in einer virtuellen QEMU ARM Umgebung.  
> Da dies eine vollständige Hardware-Emulation ist, sind möglicherweise nicht alle Hardware-Features des echten Raspberry Pi verfügbar.

<!-- toc Inhalt -->

## Vorbereitungen

Zur Vorbereitung benötigen wir zuerst ein aktuelles Raspberry Pi OS Image, welches wir von der [offiziellen Downloadseite](https://www.raspberrypi.com/software/operating-systems/) herunterladen können.

Möglich ist die Verwendung der 64-bit und der 32-bit Version. Wir verwenden hier die 64-bit Variante.

Dabei sollten wir auf die dort angegebene *Kernel-Version* achten, da wir gleich den Kernel selbst kompilieren müssen.

> [!NOTE]
> Bei Erstellung dieser Anleitung war `2024-07-04-raspios-bookworm` mit Kernel 6.6 aktuell.  
> Wir nutzen hier zur Demonstration die 64-bit Lite-Variante.

Zunächst installieren wir uns noch die benötigten Softwarepakete:

```sh Benötigte Softwarepakete installieren
sudo apt install gcc-aarch64-linux-gnu g++-aarch64-linux-gnu \
  qemubuilder qemu-system-gui qemu-system-arm qemu-utils qemu-system-data qemu-system \
  bison flex guestfs-tools libssl-dev telnet xz-utils
```

Das Image `2024-07-04-raspios-bookworm-arm64-lite.img` und alle weiteren Dateien legen wir Ordner `~/rpi-emu/` ab.

```sh Verzeichnis erstellen und Image hinein kopieren und entpacken
mkdir ~/rpi-emu
cd ~/rpi-emu
cp ~/Downloads/2024-07-04-raspios-bookworm-arm64-lite.img.xz ./
unxz 2024-07-04-raspios-bookworm-arm64-lite.img.xz
```

## Kernel kompilieren

Wir benötigen einen für QEMU passenden Kernel, welchen wir uns aus den offiziellen Quellen des Linux-Kernels selbst kompilieren.

Zuerst brauchen wir die aktuelle Kernel-Version, welche wir uns von [kernel.org](https://www.kernel.org/) besorgen können.

Im Idealfall nutzen wir die Version, die auf der Download-Seite von Raspberry Pi OS angegeben ist. Beim Erstellen diese Beitrags war dies die Version *6.6* bzw. *6.6.49*.

Um den Prozess zu vereinfachen erstellen wir das Skript `build-qemu-kernel.sh` mit folgendem Inhalt und führen es anschließend aus:

{% codefile sh build-qemu-kernel.sh Skript zum Bau des Kernel %}

> [!NOTE]
> Das Kompilieren des Kernels dauert etwas, ist aber in der Regel nur einmalig notwendig.

```sh Kernel über das Skript kompilieren
chmod +x build-qemu-kernel.sh
./build-qemu-kernel.sh
```

Der selbst gebaute Kernel liegt anschließend als `kernel` in unserem Verzeichnis.  
Damit ist das Schlimmste auch schon geschafft. 😉

## Raspberry Pi OS Image anpassen

Damit wir das Raspberry Pi OS Image mit QEMU nutzen können, müssen wir es zuerst noch etwas anpassen.

### Image vergrößern

Ein normaler Raspberry Pi vergrößert beim ersten Start automatisch das Dateisystem auf den auf der SD-Karte verfügbaren Speicherplatz.
Da dies hier nicht automatisch passiert, müssen wir das Image manuell vergrößern, wobei wir es auch gleichzeitig in eine neue Datei speichern.

Im folgenden speichern wir das neue Image als `disk.img` und vergrößern es um 20Gb

```sh Image kopieren und vergrößern
cp 2024-07-04-raspios-bookworm-arm64-lite.img disk.img
truncate -s +20G disk.img
sudo virt-resize --expand /dev/sda2 2024-07-04-raspios-bookworm-arm64-lite.img disk.img
```

> [!TIP]
> Das hier angegebene `/dev/sda2` bezieht sich auf die Partition 2 in dem Image. Bitte nicht mit eine ggf. vorhandenen sda2 Partition auf dem eigenen Rechner verwechseln.

### Konfiguration von Benutzer und Passwort und aktivieren von SSH

Bei den neueren Raspberry Pi OS Images gibt es keinen Standardbenutzer mehr. Darum müssen wir das Image bearbeiten, um diesen zu erstellen.

Hierzu lassen wir uns zuerst die Partitionen im Image anzeigen.

```sh Partitionen im Image anzeigen lassen
fdisk -l disk.img

Festplatte disk.img: 22,58 GiB, 24243077120 Bytes, 47349760 Sektoren
Einheiten: Sektoren von 1 * 512 = 512 Bytes
Sektorgröße (logisch/physikalisch): 512 Bytes / 512 Bytes
E/A-Größe (minimal/optimal): 512 Bytes / 512 Bytes
Festplattenbezeichnungstyp: dos
Festplattenbezeichner: 0xfb33757d

Gerät      Boot  Anfang     Ende Sektoren Größe Kn Typ
disk.img1          8192  1056767  1048576  512M  c W95 FAT32 (LBA)
disk.img2       1056768 47349375 46292608 22,1G 83 Linux
```

Von der Ausgabe benötigen wir den *Anfang* von *disk.img1* (hier 8192) und die Sektorgröße (hier 512).  
Diese beiden Werte multiplizieren wir, um den *offset* zum Einbinden der Partition zu erhalten.  
`8192 * 512 = 4194304`

Anschließend erstellen wir uns ein Verzeichnis und mounten die Partition aus dem Image unter Angabe des eben berechneten *offset* in dieses.

> [!CAUTION]
> Bitte unbedingt auf die korrekte Angabe des *offset* achten.

```sh Partition aus dem Image mounten
mkdir mnt
sudo mount -o loop,offset=4194304 disk.img ./mnt
```

Nun erstellen wir eine Datei `userconf.txt` in der gemounteten Partition. Diese Datei beinhaltet den Benutzernamen und das Passwort für den Login.

Das Passwort wird interaktiv abgefragt.

```sh Datei userconf.txt erstellen
PW=$(openssl passwd -6)
echo "pi:$PW" | sudo tee mnt/userconf.txt
```

Damit auch SSH in unserem emulierten System aktiviert wird, erstellen wir zudem eine `ssh` Datei.

```sh ssh-Datei erstellen, um den SSH-Server zu aktivieren
sudo touch mnt/ssh
```

Anschließend unmounten wir die Partion vom Image wieder.

```sh Unmount der Partition
sudo umount mnt
```

## Starten des emulierten Systems

Nun haben wir alles soweit vorbereitet, um das Emulierte Raspberry Pi OS zu starten.

Um den Start zu vereinfachen, erstellen wir zunächst ein kurzes Startskript `rpi-emu-start.sh`.

{% codefile sh rpi-emu-start.sh Startskript zum Starten des emulierten Raspberry Pi OS %}

Dieses Skript machen wir ausführbar und starten es anschließend.

```sh Emuliertes Raspberry Pi OS starten
chmod +x rpi-emu-start.sh
./rpi-emu-start.sh
```

Der erste Start kann etwas länger dauern. Weitere Starts aus dem selben Image sollten dann schneller sein.

{% img qemu-fenster.webp QEMU-Fenster nach dem Start des emulierten Raspberry Pi OS %}

> [!TIP]
> Durch das erstellen mehrere Images und Angabe des jeweiligen Images im Startskript können auch mehrere unterschiedliche Systeme gestartet werden.
>
> Zudem kann bei nicht laufendem Emulator auch die Image-Datei einfach kopiert werden, um beispielsweise ein Backup zu erstellen.

## Login in das System

Da wir den SSH-Server aktiviert und den SSH-Port durchgereicht haben, können wir per SSH wie folgt auf unser emuliertes System zugreifen:

```sh SSH-Zugriff auf das emulierte System
ssh -p 2222 pi@localhost
```

Nach dem Login werden wir wie gewohnt begrüßt und können wie gewohnt Befehle ausführen.

```sh Nach dem SSH-Login
Linux raspberrypi 6.6.49 #1 SMP PREEMPT Thu Sep  5 12:19:57 CEST 2024 aarch64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
pi@raspberrypi:~ $ uname -a
Linux raspberrypi 6.6.49 #1 SMP PREEMPT Thu Sep  5 12:19:57 CEST 2024 aarch64 GNU/Linux
pi@raspberrypi:~ $ 
```

## Stoppen des emulierten Systems

Um das emulierte Raspberry Pi OS zu beenden gehen wir wie bei einem rechten Raspberry Pi auch vor.

Wir loggen in das System ein und fahren es anschließend per Befehl sauber herunter.

```sh Emuliertes System herunterfahren
sudo shutdown -h now
```

> [!CAUTION]
> Es ist auch möglich durch einfaches Schließen des Fensters QEMU zu beenden.
> Dies gleicht aber dem Steckerziehen bei einem echten Raspberry Pi und kann zu Fehlern im Dateisystem führen.

## Fehlerbehandlung

### Start im WSL

Im *Windows Subsystem for Linux* kann QEMU ebenso genutzt werden. Hierbei ist jedoch keine grafische Oberfläche möglich (jedenfalls nicht so ohne Weiteres) und beim Start muss zusätzlich das Argument `-nographic` angegeben werden.

### Monitor-Konsole

Die QEMU Monitor-Konsole kann per `telnet localhost 5555` erreicht werden. Hierrüber ist es beispielsweise möglich Befehle an die QEMU Instanz zu senden.
