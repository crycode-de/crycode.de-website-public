---
title: Dateifreigaben mit Samba
author:
  name: Peter Müller
  link: https://crycode.de
date: 2016-06-27 12:00:00
updated: 2024-05-02 16:48:12
categories:
  - [Software]
  - [Linux]
  - [Netzwerk]
tags:
  - Dateisystem
  - Linux
  - Netzwerk
  - Raspberry Pi
  - Samba
  - Server
abbr:
  CUPS: Common Unix Printing System
---

*Samba* ermöglicht es Verzeichnisse auf einem Linux-Rechner freizugeben, sodass auf diese von anderen Computern im lokalen Netzwerk aus zugegriffen werden kann.

Durch den Samba-Server und entsprechende Freigaben wird beispielsweise ein Raspberry Pi zu einem NAS (Network Attached Storage, engl. netzgebundener Speicher).

<!-- more -->

<!-- toc Inhalt -->

## Installation

Installiert wird Samba ganz einfach über die Paketverwaltung:

```sh Installation von Samba
sudo apt update
sudo apt install samba samba-common-bin
```

Das wars auch schon. 🙂

## Konfiguration

Die Konfiguration von Samba erfolgt in der Datei `/etc/samba/smb.conf`.

Zusätzlich zu den Einstellungen müssen noch die entsprechenden Samba-Benutzer angelegt werden. Dazu aber im nächsten Abschnitt mehr.
Den gesamten oberen Teil der Konfiguration können wir so lassen.

Den unteren Teil passen wir an, indem wir den `[homes]`-Bereich auskommentieren und unsere eigenen Freigaben ganz unten hinzufügen. Wenn wir {% abbr CUPS %} für die Druckverwaltung verwenden, dann passen wir den Eintrag `path` im Bereich `[print$]` dementsprechend an.

Der untere Teil der `smb.conf` könnte dann Beispielsweise so aussehen:

{% codefile ini smb.conf Samba Konfigurationsbeispiel &#47;etc/samba/smb.conf %}

Dabei erstellen wir eine Freigabe namens *Austausch* für das Verzeichnis `/var/daten/austausch/`. Auf diese Freigabe dürfen die Benutzer *peter*, *kristin* und *siegbert* zugreifen und Gäste sind auch erlaubt. Die Anweisung `force user = pi` sorgt dafür, dass im Dateisystem die Dateien und Ordner unabhängig vom Samba-Benutzer dem System-Benutzer *pi* gehören.

Außerdem erstellen wir eine Freigabe mit dem Namen *Fotos* für `/var/daten/fotos/`, auf die nur die Samba-Benutzer *peter* und *kristin* Zugriff haben.

Nachdem wir die Konfiguration angepasst haben müssen wir den Samba-Server neu starten, damit die Änderungen übernommen werden.

```sh Samba-Server neu starten
sudo systemctl restart smbd
```

## Samba-Benutzer

Damit die Freigabe funktioniert, müssen wir noch die entsprechenden Samba-Benutzer anlegen.

Für jeden Samba-Benutzer muss auch auf dem System ein Benutzer vorhanden sein. Diesen System-Benutzer können wir wie folgt anlegen, wobei wir ihm keine weitere Rechte einräumen, da er ja nur für Samba benötigt wird. Die Nachfragen nach *Vollständer Name* etc. können dabei einfach durch drücken der Enter-Taste übersprungen werden.

```sh Systembenutzer anlegen
sudo adduser --no-create-home --disabled-login --shell /bin/false <benutzername>
```

Ist der System-Benutzer vorhanden beziehungsweise neu angelegt, können wir mittels `smbpasswd` zu einem Samba-Benutzer machen und dabei sein Samba-Passwort festlegen.

```sh Samba-Benutzer zu einem System-Benutzer anlegen und Passwort setzen
sudo smbpasswd -a <benutzername>
```

Möchten wir nur das Passwort für einen bestehenden Samba-Benutzer ändern lassen wir einfach das `-a` weg.
