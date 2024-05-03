---
title: Kein Netzwerk nach Bereitschaft
author:
  name: Peter Müller
  link: https://crycode.de
date: 2014-12-09 12:00:00
updated: 2024-05-03 12:00:00
categories:
  - Linux
tags:
  - Debian
  - Linux
  - Netzwerk
  - Ubuntu
---

Bei manchen Ubuntu- und Debian-Systemen kommt es nach dem Bereitschaftsmodus vor, dass keine Netzwerkverbindung mehr aufgebaut wird.

Das Problem lässt sich dann meistens mit einem einfachen `sudo systemctl restart NetworkManager` beheben.

<!-- more -->

Um das Problem dauerhaft zu lösen kann man die Datei `/etc/pm/sleep.d/99_network-manager` mit folgendem Inhalt anlegen:

{% codefile sh 99_network-manager &#47;etc/pm/sleep.d/99_network-manager %}

Die Datei muss dann noch ausführbar gemacht werden:

```sh Datei ausführbar machen
sudo chmod +x /etc/pm/sleep.d/99_network-manager
```

Nun wird bei jedem "Aufwachen" aus dem Bereitschaftsmodus der *NetworkManager* automatisch neu gestartet und die Netzwerkverbindungen werden wiederhergestellt.

> [!NOTE]
> Bei älteren Systemen heißt der Service ggf. noch `network-manager` anstatt `NetworkManager`.

## Siehe auch

* [Diskussion dazu im Ubuntuusers-Forum](https://forum.ubuntuusers.de/topic/kein-internet-nach-standby/)
