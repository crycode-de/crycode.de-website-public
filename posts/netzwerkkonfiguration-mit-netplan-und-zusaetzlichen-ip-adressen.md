---
title: Netzwerkkonfiguration mit Netplan und zusätzlichen IP-Adressen
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2020-10-15 12:00:00
updated: 2024-04-17 15:35:00
abbr:
  CIDR: Classless Inter-Domain Routing
  DNS: Domain Name System
  SPF: Sender Policy Framework
categories:
  - [Linux]
  - [Netzwerk]
  - [Server]
tags:
  - IPv6
  - IPv4
  - Netplan
  - Netzwerk
  - Ubuntu
---

Bei aktuellen Ubuntu-Versionen (seit Version 17.10) kommt für die Netzwerkkonfiguration [Netplan](https://netplan.io/) zum Einsatz und ersetzt damit die bisherige Konfiguration über die Datei `/etc/network/interfaces`.

Dadurch hat sich unter anderem auch die Syntax der Konfiguration verändert.

<!-- more -->

> [!NOTE]
> Bei Nutzung von Ubuntu-Desktop wird die Netzwerkkonfiguration standardmäßig vom *NetworkManager* verwaltet, welcher dazu von *Netplan* eingebunden wird.

## Konfiguration

Die Konfiguration erfolgt über Dateien im [YAML](https://de.wikipedia.org/wiki/YAML)-Format im Verzeichnis `/etc/netplan/`. Dort können eine oder mehrere Konfigurationsdateien mit nahezu beliebigem Namen angelegt werden. Lediglich die Dateiendung muss `.yaml` lauten. Sind mehrere Dateien vorhanden, so werden diese in lexikalischer Reihenfolge geladen.

Im Standard-Installimage von [Hetzner](https://www.hetzner.com/de/) beispielsweise findet sich die Konfiguration in der Datei `/etc/netplan/01-netcfg.yaml` bzw. `/etc/netplan/50-cloud-init.yaml` bei Hetzner Cloud Servern.

Wichtig bei den yaml-Dateien ist die korrekte Einrückung der Einträge mit Leerzeichen.

## Beispiel

Hier eine Beispielkonfiguration mit lokalen IPv4 und IPv6 Adressen, sowie den Cloudflare {% abbr DNS %} Servern:

```yaml Netplan Beispielkonfiguration
network:
  version: 2
  ethernets:
    enp2s0:
      addresses:
        - 192.168.0.42/32
        - fddd:dead:beef:babe::1337/64
      routes:
        - on-link: true
          to: 0.0.0.0/0
          via: 192.168.0.1
      gateway6: fe80::1
      nameservers:
        addresses:
          - 1.1.1.1
          - 1.0.0.1
          - 2606:4700:4700::1111
          - 2606:4700:4700::1001
```

`enp2s0` ist dabei unser Netzwerkinterface, welches konfiguriert werden soll.

Im Bereich `addresses` können mehrere IPv4 und IPv6 Adressen mit der jeweiligen Subnetzmaske bzw. Prefixlänge in {% abbr CIDR %}-Notation angegeben werden.

> [!CAUTION]
> Mehrere gleichberechtigte IPs der gleichen Art (IPv4/IPv6) können zu Problemen führen. Mehr dazu weiter unten.

## Anwenden der Konfiguration

Zum Anwenden der Konfiguration gibt es die beiden Befehle `netplan apply` und `netplan try`.

> [!TIP]
> In den meisten Fällen sollte `netplan try` verwendet werden.

Mit `netplan apply` sollte man bei remote Systemen vorsichtig sein, da hiermit die Änderungen direkt übernommen werden und Fehler in der Konfiguration zu einem nicht mehr erreichbaren System führen können.

`netplan try` hingegen lädt die neue Konfiguration und erwartet eine Bestätigung durch den Nutzer innerhalb von (standardmäßig) 2 Minuten. Erfolgt keine Bestätigung, so wird die vorherige Konfiguration wiederhergestellt und man ist auf der (nahezu) sicheren Seite.

## Zusätzliche IP-Adressen

Wenn wir über die Netplan Konfiguration zusätzliche IP-Adressen der gleichen Art (IPv4/IPv6) im `addresses`-Bereich hinzufügen, dann sind diese gleichberechtigt und einzelne Dienste (Programme) können (und werden) eine der IP-Adressen für ausgehenden Traffic nutzen.

Dies führt spätestens dann zu Problemen, wenn beispielsweise ein E-Mail Server nicht die IP-Adresse Mails versendet, die dem [{% abbr SPF %}-Record](https://de.wikipedia.org/wiki/Sender_Policy_Framework) nach für eine Domain erlaubt ist.

Um nun festlegen zu können, dass eine IP-Adresse nicht für ausgehenden Datenverkehr genutzt werden soll, muss für die IP die Option `preferred_lft` (lft = lifetime) auf `0` gesetzt werden. Diese Option gibt in Sekunden an, wie lange eine IP-Adresse als Quelladresse für ausgehenden Datenverkehr genutzt werden darf. Ist die 0 erreicht (oder direkt gesetzt), so wird die IP als *deprecated* (veraltet) markiert und kann dann nur noch für eingehenden Datenverkehr genutzt werden.

### Ab Netplan Version 0.100

Ab Version 0.100 (Ubuntu 22.04 und höher) unterstützt Netplan das Setzen der Lifetime direkt in den Konfigurationsdateien.

Hierzu werden die IP-Adressen wie im folgenden Beispiel definiert:

```yaml Netplan Konfiguration mit lifetime für bestimmte Adressen
addresses:
  - fddd:dead:beef:babe::1337/64
  - fddd:dead:beef:babe::c0de/64:
      lifetime: 0
  - fddd:dead:beef:babe::42/64:
      lifetime: 0
```

### Bis Netplan Version 0.99

Die in Ubuntu 20.04 enthaltene Version 0.99 von Netplan unterstützt das Setzen der Lifetime noch nicht, weshalb wir hier die zusätzlichen IP-Adresse nicht direkt in der Konfiguration von Netzplan hinzufügen können.

<details>
<summary>Details zu alten Versionen einblenden</summary>

Stattdessen weichen wir auf Hooks des [networkd-dispatcher](https://gitlab.com/craftyguy/networkd-dispatcher) aus. Dieser ist Standardmäßig bei Ubuntu zusammen mit Netplan installiert.

Zum Hinzufügen von IP-Adressen nach dem Start eines Netzwerkinterfaces erstellen wir die Datei `/etc/networkd-dispatcher/routable.d/50-ifup-hooks` mit folgendem Inhalt:

```sh networkd-dispatcher ifup Hook
#!/bin/bash

ETH_IFACE=enp2s0

if [ "$IFACE" == "$ETH_IFACE" ]; then
  ip -6 addr add fddd:dead:beef:babe::c0de dev $ETH_IFACE preferred_lft 0
  ip -6 addr add fddd:dead:beef:babe::42 dev $ETH_IFACE preferred_lft 0
fi
```

Damit die IP-Adressen beim Stoppen des Interfaces auch wieder entfernt werden, erstellen wir zusätzlich die Datei `/etc/networkd-dispatcher/off.d/50-ifdown-hooks` mit folgendem Inhalt:

```sh networkd-dispatcher ifdown Hook
#!/bin/bash

ETH_IFACE=enp2s0

if [ "$IFACE" == "$ETH_IFACE" ]; then
  ip -6 addr del fddd:dead:beef:babe::c0de dev $ETH_IFACE
  ip -6 addr del fddd:dead:beef:babe::42 dev $ETH_IFACE
fi
```

Diese beiden Dateien müssen dem Nutzer root gehören und ausführbar sein (`chmod u+x`).

Der Name des Interfaces und die IP-Adressen müssen natürlich entsprechend angepasst werden.

Zusätzlich empfehle ich, in der Konfiguration (z.B. `/etc/netplan/01-netcfg.yaml`) von Netplan die folgenden Kommentarzeilen hinzuzufügen, damit man sich beim Bearbeiten dieser direkt wieder daran erinnert, dass/wo die zusätzlichen IP-Adressen konfiguriert sind:

```yaml Hinweis in der Netplan Konfiguration
# additional IPs are added/removed by networkd-dispatcher
# hooks in the files
# /etc/networkd-dispatcher/routable.d/50-ifup-hooks
# /etc/networkd-dispatcher/off.d/50-ifdown-hooks
```

Mit diesen Hooks werden dann beim Starten/Stoppen des Netzwerkinterfaces automatisch die zusätzlichen IP-Adressen mit den entsprechenden Lifetimes hinzugefügt bzw. wieder entfernt.

</details>

## Prüfen der zusätzlichen IP-Adressen

Ist alles soweit konfiguriert und die Konfiguration mit `netplan try` erfolgreich übernommen, so können wir mittels `ip addr show` (oder kurz `ip a`) prüfen, ob die Lifetime für die IP-Adressen richtig gesetzt wurde.

In der Ausgabe sollten die zusätzlichen IP-Adressen jetzt mit *deprecated* markiert sein:

```plain Auszug der Ausgabe von ip a
    inet6 fddd:dead:beef:babe::c0de/128 scope global deprecated
       valid_lft forever preferred_lft 0sec
    inet6 fddd:dead:beef:babe::42/128 scope global deprecated
       valid_lft forever preferred_lft 0sec
    inet6 fddd:dead:beef:babe::1337/64 scope global
       valid_lft forever preferred_lft forever
```

Damit sollte nur noch die unterste IP-Adresse mit `preferred_lft forever` für ausgehenden Datenverkehr genutzt werden.
