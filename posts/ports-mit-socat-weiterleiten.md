---
title: Ports mit socat als Proxy weiterleiten
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2025-07-21
categories:
  - [Linux]
  - [Software]
tags:
  - Portweiterleitung
  - socat
  - Proxy
---

Mit dem Tool `socat` ("SOcket CAT") lassen sich Netzwerkverbindungen flexibel weiterleiten und als Proxy nutzen. Das ist besonders praktisch, wenn Dienste auf anderen Hosts oder Ports erreichbar gemacht werden sollen, ohne die eigentliche Anwendung zu verändern.

<!-- more -->
<!-- toc -->

## Warum braucht man das?

* **Netzwerkdienste zugänglich machen:** Dienste, die nur lokal oder in einem privaten Netz laufen, können so einfach erreichbar gemacht werden.
* **Port-Konflikte umgehen:** Wenn ein Port bereits belegt ist, kann ein anderer Port als Proxy genutzt werden.
* **Protokoll- oder Port-Übersetzung:** Ermöglicht die Weiterleitung zwischen verschiedenen Protokollen oder Ports.

`socat` ist ein sehr mächtiges Werkzeug für Netzwerkadministratoren und Entwickler, um flexibel mit Ports und Verbindungen zu arbeiten.

> [!NOTE]
> Für einen produktiven Einsatz sollte sofern möglich immer auf eine dedizierte Proxy-Lösung wie `nginx` oder `haproxy` zurückgegriffen werden. `socat` ist eher für einfache, temporäre Lösungen gedacht.

## TCP-Port weiterleiten

Um beispielsweise alle eingehenden Verbindungen auf Port 8080 lokal an einen anderen Server (z.B. 192.168.1.100:80) weiterzuleiten:

```sh TCP-Portweiterleitung mit socat
socat TCP-LISTEN:8080,reuseaddr,fork TCP:192.168.1.100:80
```

* `TCP-LISTEN:8080`: Lauscht auf Port 8080 (lokal)
* `reuseaddr,fork`: Erlaubt mehrfaches Binden an den Port und parallele Verbindungen
* `TCP:192.168.1.100:80`: Zieladresse und -port

Im Normalfall wird `socat` weiterlaufen, bis es manuell gestoppt wird. Ausgaben sind dabei in der Regel nicht zu sehen.

Mit `Strg+C` kann der Prozess beendet werden.

## UDP-Port weiterleiten

Für UDP funktioniert es ähnlich, z.B. um Port 5353 weiterzuleiten:

```sh UDP-Portweiterleitung mit socat
socat UDP-LISTEN:5353,reuseaddr,fork UDP:192.168.1.100:5353
```

* `UDP-LISTEN:5353`: Lauscht auf Port 5353 (lokal)
* `UDP:192.168.1.100:5353`: Zieladresse und -port

## Permanenter Betrieb als SystemD-Service

Möchte man `socat` dauerhaft im Hintergrund laufen lassen, kann man es als SystemD-Service einrichten.

Dazu wird eine neue Service-Datei mit folgendem Inhalt erstellt:

```sh SystemD Service für socat erstellen
sudo nano /etc/systemd/system/socat-port-forward-8080.service
```

```ini /etc/systemd/system/socat-port-forward-8080.service
[Unit]
Description=Socat Port Forwarding Service Port 8080
After=network.target

[Service]
ExecStart=/usr/bin/socat TCP-LISTEN:8080,reuseaddr,fork TCP:192.168.1.100:80
Restart=always
RestartSec=3s
User=nobody
Group=nogroup

[Install]
WantedBy=multi-user.target
```

Anschließend den Service aktivieren und starten:

```sh Aktivieren und Starten des Services
sudo systemctl daemon-reload
sudo systemctl enable socat-port-forward-8080.service
sudo systemctl start socat-port-forward-8080.service
```

Nun läuft `socat` als Hintergrunddienst und leitet Port 8080 permanent weiter.

## Alternativen

Neben `socat` gibt es weitere Tools, die für Portweiterleitungen und Proxy-Funktionalitäten genutzt werden können:

* **iptables / nftables**  
  Ermöglichen auf Systemebene das Weiterleiten von Ports (Port-Forwarding) und Netzwerkpaketen. Besonders geeignet für permanente und performante Weiterleitungen.
* **ssh (Port-Forwarding)**  
  Mit `ssh -L` (lokal) oder `ssh -R` (remote) lassen sich Ports sicher über SSH-Tunnel weiterleiten. Praktisch für verschlüsselte Verbindungen und temporäre Weiterleitungen.
* **nginx / haproxy**  
  Leistungsfähige Proxy-Server, die für komplexe Weiterleitungen, Lastverteilung und Protokollumwandlung eingesetzt werden können. Besonders für produktive Umgebungen geeignet.
* **rinetd**  
  Einfache und ressourcensparende Lösung für TCP-Portweiterleitungen, ideal für minimalistische Setups.
