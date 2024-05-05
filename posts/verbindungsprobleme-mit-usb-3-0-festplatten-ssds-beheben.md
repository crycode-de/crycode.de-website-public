---
title: Verbindungsprobleme mit USB 3.0 Festplatten/SSDs beheben
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
categories:
  - Linux
tags:
  - Dateisystem
  - Debian
  - Fehlerbehebung
  - Festplatte
  - Software
  - Ubuntu
  - USB
abbr:
  USB: Universal Serial Bus
  SSD: Solid State Drive
  SATA: Serial ATA (Schnittstelle für Speichergeräte)
  SCSI: Small Computer System Interface
date: 2024-05-05 11:01:17
---


Viele {% abbr USB %} 3.0 Festplatten oder {% abbr SSD %}s werden inzwischen als *USB Attached Storage* (UAS) im System eingebunden. Dies führt jedoch bei manchen Geräten zu Problemen, wobei beispielsweise die Verbindung zum USB-Gerät mittendrin verloren geht und auch nicht automatisch wiederhergestellt wird. Manche Geräte werden im UAS-Modus auch erst gar nicht richtig erkannt.

In diesem Beitrag beschreibe ich eine mögliche Lösung das Problem.

<!-- more -->

## Was ist UAS?

*USB Attached Storage* ist ein Kommunikationsprotokoll zur Anbindung von Massenspeichern über USB und wurde mit USB 3.0 eingeführt.

Es soll besonders schnelle Datenübertragungen zwischen dem Speichermedium (z.B. einer SSD) und dem jeweiligen System ermöglichen.

Im UAS-Modus werden u.a. die Steuerkommandos der {% abbr SATA %} oder {% abbr SCSI %}-Schnittstellen der Geräte direkt über die USB-Schnittstelle geleitet, was eine bessere/direktere Kommunikation mit dem Speichermedium ermöglicht.

## Fehlerbild

Wie oben bereits erwähnt, kommt es im UAS-Modus jedoch auch öfters zu Problemen und Fehlern auf dem USB-System. Dies hat Verbindungsabbrüche des jeweiligen Gerätes, oder sogar Restes des gesamten USB zur Folge.

In meinem Fall handelt es sich um eine externe *WD My Passport* SSD mit 4&nbsp;Tb Speicherplatz.  
Die SSD ist als Speicher für TV-Aufnahmen in einem [Proxmox](https://www.proxmox.com/de/)-System eingebunden und mit einer [zfs](https://de.wikipedia.org/wiki/ZFS_(Dateisystem))-Partition formatiert.

Besonders bei intensiven gleichzeitigen Lese- und Schreibzugriffen hatte ich immer mal wieder scheinbar zufällige Verbindungsabbrüche dieser SSD. Dabei verschwand die SSD komplett aus dem System und ließ sich erst durch einen Neustart des kompletten Systems wiederbeleben.

Im Log wurden dabei die folgenden Zeilen aufgezeichnet:

```plain Logeinträge beim Auftreten des Fehlers
10:45:50 pve kernel: usb 3-2: USB disconnect, device number 2
10:45:50 pve kernel: zio pool=mypassport vdev=/dev/sdc1 error=5 type=1 offset=270336 size=8192 flags=721601
10:45:50 pve kernel: zio pool=mypassport vdev=/dev/sdc1 error=5 type=1 offset=4000742645760 size=8192 flags=721601
10:45:50 pve kernel: zio pool=mypassport vdev=/dev/sdc1 error=5 type=1 offset=4000742907904 size=8192 flags=721601
10:45:50 pve kernel: WARNING: Pool 'mypassport' has encountered an uncorrectable I/O failure and has been suspended.
10:45:50 pve zed[1413526]: eid=187 class=data pool='mypassport' priority=3 err=28 flags=0x4000 bookmark=0:0:-1:0
10:45:50 pve kernel: sd 6:0:0:0: [sdc] Synchronizing SCSI cache
10:45:50 pve zed[1413527]: eid=184 class=data pool='mypassport' priority=3 err=28 flags=0x4000 bookmark=0:61:0:0
10:45:50 pve zed[1413528]: eid=185 class=data pool='mypassport' priority=3 err=28 flags=0x4000 bookmark=0:0:0:1
10:45:50 pve zed[1413529]: eid=188 class=io_failure pool='mypassport'
10:45:50 pve zed[1413525]: eid=186 class=data pool='mypassport' priority=3 err=28 flags=0x4000 bookmark=0:0:1:0
10:45:51 pve kernel: sd 6:0:0:0: [sdc] Synchronize Cache(10) failed: Result: hostbyte=DID_ERROR driverbyte=DRIVER_OK
10:45:55 pve pvestatd[1321]: zfs error: cannot open 'mypassport': pool I/O is currently suspended
10:46:12 pve pvedaemon[1116109]: zfs error: cannot open 'mypassport': pool I/O is currently suspended
```

## Prüfen, ob UAS verwendet wird

Zuerst einmal sollte geprüft werden, ob das Gerät überhaupt im UAS-Modus angesprochen wird.

Dies erfolgt ganz einfach mittels `lsusb -t`, was uns alle angeschlossen USB-Geräte auflistet.

```sh Modus prüfen
lsusb -t
/:  Bus 04.Port 1: Dev 1, Class=root_hub, Driver=xhci_hcd/4p, 5000M
    |__ Port 2: Dev 2, If 0, Class=Mass Storage, Driver=uas, 5000M
```

Steht hier für das Gerät `Driver=uas`, so wird aktuell der UAS-Modus genutzt.  
Bei `Driver=usb-storage` hingegen ist UAS nicht aktiv.

## Deaktivieren des UAS-Modus

Zur Lösung des Problems deaktivieren wir den UAS-Modus für dieses Gerät, wodurch es im herkömmlichen *Bulk-Only Transport* (BOT) Modus angesteuert wird, was in der Regel deutlich zuverlässiger funktioniert.

> [!NOTE]
> Wie oben bereits erwähnt, soll der UAS-Modus teils deutlich schnellere Übertragungsgeschwindigkeiten ermöglichen als der BOT-Modus.
> Ich habe in meinem Fall in beiden Modi einen Test der Schreib-/Lesegeschwindigkeit meiner SSD gemacht und konnte dabei *keinen* nennenswerten Unterschied feststellen.

### Ermitteln der USB Geräte-ID

Zunächst benötigen wir die genaue Geräte-ID des Speichergerätes. Diese ermitteln wir per `lsusb`, dieses Mal ohne Parameter.

```sh USB-Geräte auflisten (gekürzte Ausgabe)
lsusb
Bus 004 Device 002: ID 1058:264f Western Digital Technologies, Inc. My Passport 264F
```

In diesem Beispiel hat die SSD also die ID `1058:264f`.

### USB-Storage Optionen anpassen

Um für dieses Gerät nun den UAS-Modus zu deaktivieren, muss dem Kernel-Modul `usb-storage` ein sogenannter `quirk` als Option mitgegeben werden.

Hierfür erstellen wir die Datei `/etc/modprobe.d/disable-uas.conf` mit folgendem Inhalt:

```plain &#47;etc/modprobe.d/disable-uas.conf
options usb-storage quirks=1058:264f:u
```

Hierbei ist `1058:264f` die oben ermittelte Geräte-ID und `u` das Flag, welches dem Kernel-Modul sagt UAS nicht zu verwenden.

Anschließend müssen noch das `initramfs` neu generieren, damit die gesetzte Option beim Booten des Systems aktiv wird:

```sh initramfs neu generieren
sudo update-initramfs -u
```

Abschließend noch ein Neustart des Systems:

```sh Neustart des Systems
sudo reboot
```

<!-- markdownlint-disable MD051 -->
Nun sollte UAS deaktiviert sein, was wie oben unter [Prüfen, ob UAS verwendet wird](#prufen-ob-uas-verwendet-wird) beschrieben, überprüft werden kann.
<!-- markdownlint-enable MD051 -->

## Fazit

Mit dieser kleinen Änderung läuft meine SSD nun bereits einige Zeit äußerst zuverlässig und ohne Aussetzer.

Nachteile konnte ich bislang *keine* feststellen. Sogar die Übertagungsgeschwindigkeit ist unverändert.
