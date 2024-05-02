---
title: USB-Festplatte am Raspberry Pi
author:
  name: Peter Müller
  link: https://crycode.de
date: 2015-10-03 12:00:00
updated: 2024-05-02 17:07:00
categories:
  - Raspberry Pi
tags:
  - Dateisystem
  - Linux
  - Partitionen
  - Raspberry Pi
---

Da eine SD-Karte nur eine begrenzte Lebensdauer (ca. 100.000 Schreibzyklen) hat, kann es sinnvoll sein anstelle der SD-Karte eine externe USB-Festplatte einzusetzen. Damit beugen wir dem Ausfall des Systems durch Versagen der Speicherkarte vor.

<!-- more -->

Auf die SD-Karte können wir dennoch nicht vollständig verzichten, da diese beim Booten benötigt wird. Nach dem Bootvorgang läuft das gesamte System dann aber auf der Festplatte.

> [!NOTE]
> Ab dem Raspberry Pi 3 ist es durch das Setzen spezieller Parameter möglich direkt von USB zu booten.  
> Der hier beschriebene Weg über eine Boot-Partition auf der SD-Karte funktioniert jedoch weiterhin problemlos.

<!-- toc Inhalt -->

## Vorbereitungen

Abhängig von der USB-Festplatte und dem Raspberry Pi benötigen wir gegebenenfalls eine USB-Festplatte mit einer externen Stromversorgung oder einen zusätzlichen aktiven USB-Hub. Dies ist notwendig, da der Strom, den ältere Raspberry Pis über die USB-Ports liefern, für einige Festplattentypen nicht ausreicht. Im Zweifelsfall einfach ausprobieren, ob die Festplatte beim Anstecken an den Pi richtig anläuft (hörbar) und vom System erkannt wird.

Auf der Festplatte sollten sich keine Daten befinden (zumindest keine die man aufheben möchte), da diese bei den folgenden Schritten gelöscht werden.

Die USB-Festplatte wird an den Raspberry Pi angeschlossen und sollte als `/dev/sda1` erkannt werden, was wir wie folgt prüfen können:

```sh Erkannte Festplatte prüfen
ls -l /dev/sd*
brw-rw---- 1 root disk 8, 0 Sep 11 16:03 /dev/sda
brw-rw---- 1 root disk 8, 1 Sep 11 16:03 /dev/sda1
```

Dabei ist `/dev/sda` die gesamte Festplatte und `/dev/sda1` die erste Partition auf der Festplatte.

> [!TIP]
> Zur Sicherheit sollten bei dem gesamten Prozess keine weiteren Speichermedian an den Raspberry Pi angeschlossen sein.

## Dateisystem anlegen

> [!WARNING]
> Dieser Schritt löscht alle Daten auf der Festplatte unwiderruflich!

Als erstes müssen alle Partitionen von der Festplatte entmountet werden:

```sh Unmount aller Partitionen der Festplatte
umount /dev/sda?
```

Anschließend legen wir das Dateisystem wie folgt mit `fdisk` auf der Festplatte neu an:

```sh Dateisystem mit fdisk anlegen
sudo fdisk /dev/sda
Welcome to fdisk (util-linux 2.33.1).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Command (m for help):
```

Mit `p` können wir uns die aktuellen Partitionen anzeigen lassen:

```sh Aktuelle Partitionen anzeigen lassen
Command (m for help): p
Disk /dev/sda: 76,3 GiB, 81964302336 bytes, 160086528 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x245b245a

Device Boot Start End Sectors Size Id Type
/dev/sda1 2048 160086527 160084480 76,3G 83 Linux
```

Um die vorhandene Partition zu löschen drücken wir `d` und prüfen anschließend den Vorgang mit `p`:

```sh Partition löschen
Command (m for help): d
Selected partition 1
Partition 1 has been deleted.

Command (m for help): p
Disk /dev/sda: 76,3 GiB, 81964302336 bytes, 160086528 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x245b245a
```

Anschließend erstellen wir zwei neue Partitionen (für *Root* und *Swap*) mit der gewünschten Größe (hier *32&nbsp;Gb* und *4&nbsp;Gb*) mit `n` und prüfen daraufhin wieder mit `p`. Die neue Root-Partition muss dabei mindestens so groß sein, wie die alte auf der SD-Karte.

```sh Neue Partitionen erstellen
Command (m for help): n
Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p): p
Partition number (1-4, default 1): 1
First sector (2048-160086527, default 2048): 2048
Last sector, +sectors or +size{K,M,G,T,P} (2048-160086527, default 160086527): +32G

Created a new partition 1 of type 'Linux' and of size 32 GiB.

Command (m for help): n
Partition type
   p   primary (1 primary, 0 extended, 3 free)
   e   extended (container for logical partitions)
Select (default p): p
Partition number (2-4, default 2): 2
First sector (67110912-160086527, default 67110912):
Last sector, +sectors or +size{K,M,G,T,P} (67110912-160086527, default 160086527): +4G

Created a new partition 2 of type 'Linux' and of size 4 GiB.

Command (m for help): p
Disk /dev/sda: 76,3 GiB, 81964302336 bytes, 160086528 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x245b245a

Device     Boot    Start      End  Sectors Size Id Type
/dev/sda1           2048 67110911 67108864  32G 83 Linux
/dev/sda2       67110912 75499519  8388608   4G 83 Linux
```

Bis hier wurden noch keine Veränderungen an der Festplatte vorgenommen und wir könnten mit *STRG+C* noch Abbrechen. Um die Änderungen auf die Platte zu schreiben verwenden wir nun `w`:

```sh Änderungen auf die Festplatte schreiben
Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

Sobald dies abgeschlossen ist beendet sich `fdisk` und wir sind wieder normal im Terminal.

Nun fehlt noch das Anlegen der Dateisysteme. Diese erstellen wir wie folgt:

```sh Dateisystem für Root anlegen
sudo mkfs.ext4 /dev/sda1
mke2fs 1.42.12 (29-Aug-2014)
Ein Dateisystems mit 8388608 (4k) Blöcken und 2097152 Inodes wird erzeugt.
UUID des Dateisystems: 901b7dd2-2342-4084-a604-8fee265fe64b
Superblock-Sicherungskopien gespeichert in den Blöcken:
        32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632, 2654208,
        4096000, 7962624

beim Anfordern von Speicher für die Gruppentabellen: erledigt
Inode-Tabellen werden geschrieben: erledigt
Das Journal (32768 Blöcke) wird angelegt: erledgt
Die Superblöcke und die Informationen über die Dateisystemnutzung werden
geschrieben: erledigt
```

```sh Dateisystem für SWAP anlegen
sudo mkswap /dev/sda2
Setting up swapspace version 1, size = 4194300 KiB
no label, UUID=61d81069-faf5-4c7f-a913-10ccef275609
```

## Dateien auf die Festplatte kopieren

Die Daten der Root-Partition auf der SD-Karte (`/dev/mmcblk0p2`) müssen nun auf die neue Root-Partition auf der Festplatte (`/dev/sda1`) kopiert werden.

Hierfür verwenden wir `dd`. Der Kopiervorgang kann einige Zeit dauern und `dd` gibt keine Fortschrittsanzeige aus. Da heißt es also nur Kaffee trinken und abwarten.

```sh Dateisystem der Root-Partition kopieren
sudo dd if=/dev/mmcblk0p2 of=/dev/sda1 bs=32M conv=noerror,sync
```

Ist der Kopiervorgang abgeschlossen überprüfen wir das Dateisystem noch auf mögliche Fehler und lassen diese gegebenenfalls reparieren:

```sh Dateisystem prüfen und reparieren
sudo e2fsck -f /dev/sda1
e2fsck 1.42.12 (29-Aug-2014)
/dev/sda1: Journal wird wiederhergestellt
Wird bereinigt verwaister Inode (uid=1000, gid=1000, mode=0100600, size=65536)
Wird bereinigt verwaister Inode (uid=1000, gid=1000, mode=0100600, size=1504)
Wird bereinigt verwaister Inode (uid=1000, gid=1000, mode=0100600, size=6802)
Wird bereinigt verwaister Inode (uid=1000, gid=1000, mode=0100600, size=536)
Durchgang 1: Inodes, Blöcke und Größen werden geprüft
Durchgang 2: Verzeichnisstruktur wird geprüft
Durchgang 3: Verzeichnisverknüpfungen werden geprüft
Durchgang 4: Referenzzähler werden überprüft
Durchgang 5: Zusammengefasste Gruppeninformation wird geprüft
Die Anzahl freier Blöcke ist falsch (208440, gezählt=208747).
Reparieren<j>? ja
Die Anzahl freier Inodes ist falsch (131758, gezählt=131877).
Reparieren<j>? ja

/dev/sda1: ***** DATEISYSTEM WURDE VERÄNDERT *****
/dev/sda1: 128731/260608 Dateien (0.2% nicht zusammenhängend), 831893/1040640 Blöcke
```

Anschließend passen wir noch die Größe des kopierten Dateisystems auf die tatsächliche Größe der Partition an:

```sh Größe des kopierten Dateisystems auf Größe der Partition anpassen
sudo resize2fs /dev/sda1
resize2fs 1.42.12 (29-Aug-2014)
Die Größe des Dateisystems auf /dev/sda1 wird auf 8388608 (4k) Blöcke geändert.
The filesystem on /dev/sda1 is now 8388608 (4k) blocks long.
```

## Boot-Einstellungen anpassen

Bis hier wird die Festplatte noch nicht weiter vom System beachtet. Damit beim Booten die Root-Partition der Festplatte anstelle der SD-Karte verwendet wird, müssen wir die Boot-Konfigurationsdatei auf der Boot-Partition der SD-Karte anpassen, wobei wir aber zuerst eine Sicherheitskopie anlegen.

```sh Sicherheitskopie der Boot-Konfigurationsdatei anlegen
sudo cp /boot/firmware/cmdline.txt /boot/firmware/cmdline.org
```

> [!NOTE]
> Bei älteren Installationen befindet sich die Datei direkt unter `/boot/cmdline.txt`.

In der Datei muss dann der Eintrag `root=PARTUUID=157b1ec8-02` angepasst werden. Die aktuelle *PARTUUID* kennzeichnet dabei die zweite Partition auf der SD-Karte.

Um die neue *PARTUUID* für die Festplatte herauszufinden verwenden wir `blkid`:

```sh PARTUUID herausfinden
blkid
/dev/mmcblk0p1: LABEL_FATBOOT="boot" LABEL="boot" UUID="0C61-73F5" TYPE="vfat" PARTUUID="157b1ec8-01"
/dev/mmcblk0p2: LABEL="rootfs" UUID="43f2d0bb-83be-464f-94d0-9a751f376c64" TYPE="ext4" PARTUUID="157b1ec8-02"
/dev/sda1: LABEL="rootfs" UUID="901b7dd2-2342-4084-a604-8fee265fe64b" TYPE="ext4" PARTUUID="d45af006-01"
/dev/sda2: UUID="61d81069-faf5-4c7f-a913-10ccef275609" TYPE="swap" PARTUUID="d45af006-02"
```

Die neue *PARTUUID* lautet somit `d45af006-01`. Diese tragen wir nun in der Datei `/boot/firmware/cmdline.txt` als `root=PARTUUID=d45af006-01` ein und ersetzen damit den alten Eintrag.

```sh cmdline.txt bearbeiten
sudo nano /boot/firmware/cmdline.txt
```

```plain Neuer Inhalt der Datei cmdline.txt
console=serial0,115200 console=tty1 root=PARTUUID=d45af006-01 rootfstype=ext4 fsck.repair=yes rootwait
```

Anschließend passen wir noch die Konfiguration des Dateisystems auf die neue Root-Partition an und fügen die neue Swap-Partition hinzu. Dies müssen wir aber auf der neuen Root-Partition auf der Festplatte machen, weshalb wir diese zuerst temporär mounten und abschließend wieder unmounten.

```sh Dateisystem der Festplatte mounten und Dateisystemkonfiguration anpassen
sudo mount /dev/sda1 /mnt
sudo nano /mnt/etc/fstab
```

```ini Beispielinhalt der fstab Datei
proc                  /proc           proc    defaults          0       0
PARTUUID=157b1ec8-01  /boot           vfat    defaults          0       2
PARTUUID=d45af006-01  /               ext4    defaults,noatime  0       1
PARTUUID=d45af006-02  none            swap    sw                0       0

# a swapfile is not a swap partition, no line here
#   use  dphys-swapfile swap[on|off]  for that
```

```sh Dateisystem der Festplatte unmounten
sudo umount /mnt
```

Zum Abschluss sollte das Dateisystem synchronisiert werden, um sicherzustellen, dass alle Änderungen auf die Festplatte geschrieben wurden:

```sh Dateisystem synchronisieren
sync
```

Dies kann einen Moment dauern, wenn noch Daten aus dem Puffer auf die Festplatte geschrieben werden müssen.

## Neustart

Es ist an der Zeit für einen Neustart des Systems:

```sh Neustart des Systems
sudo reboot
```

Nach dem Neustart sollte der Raspberry Pi das System von der Festplatte laden. Dies können wir mit Hilfe von `dmesg` und `mount` überprüfen:

```sh Überprüfen ob das System von der Festplatte gestartet hat
dmesg | grep "root=\|root device\|sda1\|sda2"
[    0.000000] Kernel command line: coherent_pool=1M 8250.nr_uarts=1 cma=64M cma=256M video=HDMI-A-1:1920x1080@60 smsc95xx.macaddr=DC:A6:32:**:**:** vc_mem.mem_base=0x3ec00000 vc_mem.mem_size=0x40000000  dwc_otg.lpm_enable=0 console=ttyAMA0,115200 console=tty1 root=PARTUUID=d45af006-01 rootfstype=ext4 elevator=deadline fsck.repair=yes rootwait quiet splash plymouth.ignore-serial-consoles
[    0.913897] Waiting for root device PARTUUID=d45af006-01...
[    2.606338]  sda: sda1 sda2
[    2.635290] EXT4-fs (sda1): mounted filesystem with ordered data mode. Opts: (null)
[    7.982923] EXT4-fs (sda1): re-mounted. Opts: (null)
[   12.583175] Adding 4194300k swap on /dev/sda2.  Priority:-2 extents:1 across:4194300k FS

mount -l | grep sda
/dev/sda1 on / type ext4 (rw,noatime) [rootfs]
```

Wie wir sehen, wird sda1 als Root und sda2 als Swap verwendet.

## Swap anpassen

Raspberry Pi OS verwendet standardmäßig keine Swap-Partition, sondern eine Swap-Datei auf der Root-Partition.

Da wir nun aber eine eigene Swap-Partition haben, können wir die Datei deaktivieren und das System noch einmal neu starten:

```sh Aktuellen Swap anzeigen lassen
swapon -s
Filename                                Type            Size    Used    Priority
/dev/sda2                               partition       4194300 0       -1
/var/swap                               file            102396  0       -2
```

```sh Swap-Datei deaktivieren
sudo systemctl disable dphys-swapfile.service
```

```sh System neu starten
sudo reboot
```

Nach dem Neustart überprüfen wir, dass die Partition als Swap verwendet wird und löschen anschließend die Datei:

```sh Aktuellen Swap anzeigen lassen
swapon -s
Filename                                Type            Size    Used    Priority
/dev/sda2                               partition       4194300 0       -1
```

```sh Alte Swap-Datei löschen
sudo rm -f /var/swap
```

## Automount der Partition 2 der SD-Karte deaktivieren

Ab Raspbian Jessie wird die nun nicht mehr benötigte zweite Partition der SD-Karte automatisch immer wieder unter `/media/pi/xxx` gemountet. Da wir diese nicht mehr benötigen können wir einen entsprechenden Eintrag in der Datei `/etc/fstab` hinzufügen und wieder den Pi neu starten.

```sh Gemountete Dateisysteme ansehen
df
Dateisystem    1K-Blöcke Benutzt Verfügbar Verw% Eingehängt auf
/dev/root       32965488 3200872  28070512   11% /
devtmpfs          469756       0    469756    0% /dev
tmpfs             474060       0    474060    0% /dev/shm
tmpfs             474060    6452    467608    2% /run
tmpfs               5120       4      5116    1% /run/lock
tmpfs             474060       0    474060    0% /sys/fs/cgroup
/dev/mmcblk0p1     57288   20240     37048   36% /boot
tmpfs              94812       0     94812    0% /run/user/1000
/dev/mmcblk0p2   4031552 3196576    610464   84% /media/pi/43f2d0bb-83be-464f-94d0-9a751f376c64
```

```sh fstab bearbeiten
sudo nano /etc/fstab
```

```sh Beispielinhalt der fstab
proc                  /proc           proc    defaults          0       0
PARTUUID=157b1ec8-01  /boot           vfat    defaults          0       2
PARTUUID=157b1ec8-02  /var/mmcblk0p2  ext4    defaults,noatime,noauto  0       1
PARTUUID=d45af006-01  /               ext4    defaults,noatime  0       1
PARTUUID=d45af006-02  none            swap    sw                0       0

# a swapfile is not a swap partition, no line here
#   use  dphys-swapfile swap[on|off]  for that
```

Nach dem Neustart wird die Partition nicht mehr automatisch gemountet.

```sh Gemountete Dateisysteme ansehen
df
Dateisystem    1K-Blöcke Benutzt Verfügbar Verw% Eingehängt auf
/dev/root       32965488 3098620  28172764   10% /
devtmpfs          469756       0    469756    0% /dev
tmpfs             474060       0    474060    0% /dev/shm
tmpfs             474060    6452    467608    2% /run
tmpfs               5120       4      5116    1% /run/lock
tmpfs             474060       0    474060    0% /sys/fs/cgroup
/dev/mmcblk0p1     57288   20240     37048   36% /boot
tmpfs              94812       0     94812    0% /run/user/1000
```

Alternativ wäre es auch möglich die Partition `/dev/mmcblk0p2` einfach von der SD-Karte zu löschen, da diese durch unsere Änderungen nicht mehr benötigt wird.

Es ist somit auch möglich eine deutlich kleinere SD-Karte zu verwenden, auf der sich dann lediglich die recht kleine Boot-Partition befindet.

> [!IMPORTANT]
> Beim Tausch der SD-Karte muss in der Datei `/etc/fstab` auf der Root-Partition der Festplatte die neue *PARTUUID* der Boot-Partition auf der SD-Karte angepasst werden.
