---
title: Zuletzt installierte Pakete auflisten (Ubuntu/Debian)
author:
  name: Peter Müller
  link: https://crycode.de
date: 2017-01-03 12:00:00
categories:
  - [Software]
  - [Linux]
tags:
  - Debian
  - dpkg
  - Linux
  - Ubuntu
---

Möchte man sehen, welche Pakete unter Ubuntu oder Debian zuletzt installiert wurden, kann man sich mit folgendem Befehl behelfen:

```sh Zuletzt installierte Pakete auflisten
ls -cltr /var/lib/dpkg/info/ | grep \.list$
```

<!-- more -->

Die Ausgabe ist eine lange Liste mit Dateien, welche den Paketnamen widerspiegeln, zusammen mit dem Zeitpunkt/Datum an dem die Datei (und somit auch das Paket) zuletzt geändert wurde.

```sh Beispielausgabe
-rw-r--r-- 1 root root    4430 Jan 12  2016 adduser.list
-rw-r--r-- 1 root root     705 Jan 12  2016 bzip2.list
-rw-r--r-- 1 root root     945 Jan 12  2016 gzip.list
[...]
-rw-r--r-- 1 root root   52952 Dez 23 08:01 linux-firmware.list
-rw-r--r-- 1 root root     180 Dez 23 08:01 linux-image-extra-virtual.list
-rw-r--r-- 1 root root   72034 Dez 23 08:01 linux-image-4.4.0-57-generic.list
-rw-r--r-- 1 root root  317392 Dez 23 08:02 linux-image-extra-4.4.0-57-generic.list
-rw-r--r-- 1 root root     144 Dez 23 08:02 linux-generic.list
-rw-r--r-- 1 root root     162 Dez 23 08:02 linux-image-generic.list
-rw-r--r-- 1 root root     168 Dez 23 08:02 linux-headers-generic.list
-rw-r--r-- 1 root root       0 Jan  3 09:20 linux-image-extra-4.2.0-42-generic.list
-rw-r--r-- 1 root root       0 Jan  3 09:20 linux-image-4.2.0-42-generic.list
```

Pakete, deren Dateien eine Größe von 0 Byte haben, wurden vom System entfernt.
