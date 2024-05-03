---
title: Fail2Ban
author:
  name: Peter Müller
  link: https://crycode.de
date: 2016-12-26 12:00:00
updated: 2024-05-03 12:05:33
categories:
  - [Linux]
  - [Server]
tags:
 - Fail2Ban
 - IP-Adressen
 - Linux
 - Log
 - Netzwerk
 - Server
 - Sicherheit
---

Häufig kommt es vor, dass einzelne Benutzer oder automatisierte Scripts an einem Server verschiedene Kombinationen aus Benutzernamen und Passwörtern "ausprobieren" (das sogenannte [Brute-Force](https://de.wikipedia.org/wiki/Brute-Force)) mit dem Ziel einen funktionierenden Login zu finden. Dies wollen wir natürlich verhindern und die Verursacher wirkungsvoll aussperren, wobei uns das Tool [Fail2Ban](https://github.com/fail2ban/fail2ban) behilflich ist.

*Fail2Ban* ist ein kleines Programm auf [Python](https://de.wikipedia.org/wiki/Python_%28Programmiersprache%29)-Basis, welches die Logdateien der Server durchsucht und IP-Adressen, die zu viele fehlgeschlagene Loginversuche haben, blockiert. Das Blockieren der IP-Adressen geschieht dabei in der Regel über Firewallregeln, welche von *Fail2Ban* entsprechend angepasst werden.

<!-- more -->

In dieser Anleitung werden wir die, bei Linux üblichen, [iptables](https://de.wikipedia.org/wiki/iptables) verwenden. Weiterhin bringt *Fail2Ban* aber auch Unterstützung für z.B. *Shorewall* mit und lässt sich beliebig an die auf dem System eingesetzte Firewall anpassen.

> [!TIP]
> Ab Version 0.10 kann *Fail2Ban* von Hause aus mit IPv6 Adressen umgehen und diese ggf. blockieren.  
> Es sollte also bei einer Installation darauf geachtet werden mindestens die Version 0.10.x einzusetzen. In aktuellen Linux Distributionen sollten inzwischen überall neuere Versionen enthalten sein.

## Installation

Unter Debian und Ubuntu Linux ist die Installation von *Fail2Ban* gewohnt einfach und ggf. fehlende Abhängigkeiten werden automatisch mit installiert:

```sh Installation von Fail2Ban
sudo apt update
sudo apt install fail2ban
```

Damit ist die Installation auch schon vollständig und *Fail2Ban* wurde bereits gestartet.

```sh Status von Fail2Ban anzeigen
sudo systemctl status fail2ban
● fail2ban.service - Fail2Ban Service
     Loaded: loaded (/lib/systemd/system/fail2ban.service; enabled; vendor preset: enabled)
     Active: active (running) since [...]
```

## Konfiguration

Die gesamten Einstellungen von *Fail2Ban* befindet sich im Verzeichnis `/etc/fail2ban/`.

Die grundlegende Konfiguration erfolgt in der Datei `jail.local`, welche eine Kopie der `jail.conf` darstellt. Anpassungen könnten auch in der `jail.conf` vorgenommen werden, jedoch wird diese bei einem Update eventuell überschrieben. Sobald die Datei `jail.local` vorhanden ist wird diese von *Fail2Ban* verwendet und unsere Konfiguration bleibt auch bei einem Update erhalten. Zuerst müssen wir also die `jail.conf` als `jail.local` kopieren und anschließend passen wir die `jail.local` nach unsern Vorstellungen an.

```sh Konfiguration kopieren und bearbeiten
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

Die Konfigurationsdateien sind in verschiedene Sektionen unterteilt. Eine Sektion wird durch eckige Klammern gekennzeichnet (z.B. `[ssh]`).

Die *DEFAULT*-Sektion stellt dabei eine Besonderheit dar. Die hier vorgenommenen Einstellungen gelten für alle anderen Sektionen, sofern ein Wert nicht in einer Sektion erneut gesetzt wird. Ansonsten sind die Einstellungen nur für die jeweils aktuelle Sektion gültig.

### Die DEFAULT-Sektion

Bei `ignoreip` können IP-Adressen oder IP-Bereiche angegeben werden, die nie geblockt werden sollen. Mehrere Einträge sind mit Leerzeichen zu trennen. Es empfiehlt sich hier zumindest während der Konfiguration seine eigene IP hinzuzufügen.

Unter `bantime` wird die Bannzeit in Sekunden angegeben. Wir belassen es hier bei dem voreingestellten Wert von 600 (entspricht 10 Minuten).

`maxretry` gibt die Anzahl der Fehlversuche an, ab der er eine Aktion ausgelöst wird.

`findtime` bestimmt das Zeitfenster in Sekunden für die Anzahl an Fehlversuchen.

Bei `destemail` kann eine E-Mail Adresse angegeben werden, an die Benachrichtigungen gesendet werden, wenn *Fail2Ban* eine IP-Adresse blockiert.

`banaction` legt fest, welche Aktion zum Blockieren einer IP angewendet werden soll. Wir belassen diese bei `iptables-multiport`, da damit gleich mehrere Ports gesperrt werden können.

Den Eintag bei `action` ändern wir auf `%(action_mwl)s` damit wir beim Blockieren einer IP-Adresse eine E-Mail mit ein paar Informationen zugesendet bekommen.

### Andere Sektionen, die sogenannten Jails

In jeder Sektion kann eine Einstellung aus der *DEFAULT*-Sektion (z.B. `bantime`) überschieben werden.

> [!NOTE]
> Nicht benötigte Jails sollten deaktiviert werden.

Erforderlich sind in den Sektionen die folgenden Einstellungen:

* `enabled` legt fest, ob die Sektion aktiviert ist oder nicht. Standardmäßig sind seit v0.9.0 alle Jails deaktiviert.
* `port` gibt den Port oder die Ports an die für die IP gesperrt werden sollen.
* `filter` definiert den verwendeten Filter für diese Sektion. Alle verfügbaren Filter befinden sich im Verzeichnis `/etc/fail2ban/filter.d/`.
* `logpath` legt die Logdatei fest, welche überwacht werden soll.

### Ein Sonderfall, die recidive-Sektion

Dieses Jail stellt eine Besonderheit dar. Hier überwacht *Fail2Ban* seine eigene Log-Datei und erkennt somit mehrfach gesperrte IP-Adressen.

Dies ist sinnvoll, damit IP-Adressen, die häufiger auffällig werden, für einen längeren Zeitraum gesperrt werden können. Wurde beispielsweise eine IP 5 mal in Folge innerhalb kurzer Zeit gesperrt, so wird diese für eine Woche komplett gesperrt.

Im Folgenden Beispiel ist diese Sektion ab Zeile 748 zu finden.

### Beispiel einer jail.local

{% codefile ini jail.local Beispielkonfiguration %}

### Neustart von Fail2Ban

Zum Schluss starten wir *Fail2Ban* neu um alle Anpassungen zu aktivieren.

```sh Neustart von Fail2Ban
sudo systemctl restart fail2ban
```

Nun ist *Fail2Ban* aktiv und überwacht pausenlos die in der Datei `jail.local` eingestellten Logdateien.

## Entsperren von IP-Adressen

Im Normalfall entsperrt *Fail2Ban* die IP-Adressen automatisch wieder nach der jeweils vorgegebenen Zeit.

Zudem ist es möglich die Sperren auch manuell über den `fail2ban-client` wieder aufzuheben.

```sh Einzelne IP-Adresse in allen Jails entsperren
sudo fail2ban-client unban 10.0.0.42
```

```sh Alle IP-Adressen in allen Jails entsperren
sudo fail2ban-client unban --all
```
