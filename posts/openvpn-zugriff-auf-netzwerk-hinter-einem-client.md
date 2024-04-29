---
title: OpenVPN - Zugriff auf Netzwerk hinter einem Client
author:
  name: Peter Müller
  link: https://crycode.de
#banner: banner.webp
date: 2017-03-19 12:00:00
updated: 2024-04-29 15:46:55
categories:
  - [Linux]
  - [Netzwerk]
tags:
  - Linux
  - Netzwerk
  - OpenVPN
  - Gateway
---

Ziel ist, über einen eigenen [OpenVPN](https://openvpn.net/)-Server, der auf einem dedizierten Server betrieben wird, Zugriff auf das lokale Netzwerk Zuhause (Heimnetz) zu erlangen. Es soll möglich sein, sich von überall mit dem VPN zu verbinden (z.B. über ein Smartphone) und dann auf das Heimnetzwerk zuzugreifen.

<!-- more -->

Als Gateway zwischen dem VPN und dem Heimnetz verwenden wir einen Raspberry Pi.

Im Folgenden wird davon ausgegangen, dass bereits ein OpenVPN Server eingerichtet ist und sich mehrere Clients mit diesem verbinden können. Die Einrichtung ist in einem [anderen Beitrag](/openvpn-server-einrichten/) ausführlich beschrieben.

Im Beispiel verwendete IP-Bereiche und Adressen:

* 10.8.0.0/24 VPN
  * 10.8.0.50 Raspberry Pi VPN-Gateway
* 192.168.1.0/24 Heimnetz
  * 192.168.1.1 Router mit DNS-Server
  * 192.168.1.50 Raspberry Pi VPN-Gateway

> [!IMPORTANT]
> Es muss immer sichergestellt sein, dass alle Netze, die miteinander verbunden werden sollen, jeweils einen eigenen IP-Bereich haben.
> Ansonsten wird es zu Problemen beim Routing kommen und es ist kein Zugriff auf das jeweils andere Netz möglich.

Das Client-Zertifikat ist bereits als `pi-vpn-gw` ausgestellt und die Client-Config liegt auf dem Raspberry Pi im Home-Verzeichnis als `~/pi-vpn-gw.ovpn` vor.

## Einrichtung auf dem Raspberry Pi

Zuerst installieren wir OpenVPN und kopieren die Client-Config, wobei wir die Dateiendung auf `.conf` ändern.

```sh Installation von OpenVPN und kopieren der Client-Config
sudo apt install openvpn
sudo cp ~/pi-vpn-gw.ovpn /etc/openvpn/pi-vpn-gw.conf
```

Anschließend aktivieren wir das IP-Forwarding und die NAT-Regeln.

```sh IP-Forwarding aktivieren und Firewall einrichten
sudo sysctl -w net/ipv4/ip_forward=1
sudo iptables -t nat -F POSTROUTING
sudo iptables -t nat -A POSTROUTING -o eth0 -s 10.8.0.0/24 -j MASQUERADE
```

Damit dies in Zukunft automatisch beim Systemstart passiert, erstellen wir dazu kurzes Skript `/usr/local/sbin/openvpn-gateway-init.sh` sowie einen SystemD-Service `/etc/systemd/system/openvpn-gateway-init.service`:

{% codefile sh openvpn-gateway-init.sh /usr/local/sbin/openvpn-gateway-init.sh %}

{% codefile ini openvpn-gateway-init.service /etc/systemd/system/openvpn-gateway-init.service %}

Anschließend machen wir das Skript noch ausführbar und aktivieren den SystemD-Service:

```sh Skript ausführbar machen und SystemD-Service aktivieren
sudo chmod +x /usr/local/sbin/openvpn-gateway-init.sh
sudo systemctl daemon-reload
sudo systemctl enable openvpn-gateway-init.service
```

Nun erstellen wir noch einen Symlink für den OpenVPN SystemD-Service und starten diesen:

```sh Symlink für OpenVPN SystemD-Service und Start des Services
sudo ln -s /lib/systemd/system/openvpn@.service /etc/systemd/system/openvpn@pi-vpn-gw.service
sudo systemctl start openvpn@pi-vpn-gw.service
```

Damit läuft der OpenVPN-Client nun permanent im Hintergrund und stellt die VPN-Verbindung wieder her falls diese abbrechen sollte.

## Anpassung auf dem OpenVPN Server

Bei dem OpenVPN Server fügen wir der Server-Config die folgenden Einträge hinzu, sofern noch nicht vorhanden:

```ini Zusätzliche Einträge für die OpenVPN Server-Konfiguration
# Verzeichnis für die Client-Configs
client-config-dir ccd

# Route zum Heimnetz auf dem Host-System des OpenVPN Servers anlegen (optional)
;route 192.168.1.0 255.255.255.0

# Route zum Heimnetz allen Clients mitteilen
push "route 192.168.1.0 255.255.255.0"

# DNS-Server den Clients mitteilen
push "dhcp-option DNS 192.168.1.1"
push "dhcp-option DNS 1.1.1.1"
push "dhcp-option DNS 1.0.0.1"
```

Die Route zum Heimnetz in Zeile 5 ist optional und sollte nur aktiviert werden, wenn man von dem Host-System des OpenVPN Servers direkten Zugriff auf das Heimnetz benötigt, oder in der Config des OpenVPN Servers die Anweisung `client-to-client` nicht enthalten ist.

Als 1. DNS-Server wird die IP des Routers im Heimnetz verwendet, wodurch es möglich wird über das VPN auch die Hostnamen der Geräte im Heimnetz zu verwenden. Als 2. und 3. DNS-Server nehmen wir die Cloudflare-DNS-Server, für den Fall dass der 1. DNS-Server mal nicht erreichbar ist.

Weiterhin legen wir eine Client-spezifische Config für unseren Client unter `/etc/openvpn/ccd/pi-vpn-gw` auf dem Server an beziehungsweise ergänzen diese:

```ini Client-spezifische Konfiguration auf dem OpenVPN Server
# Feste IP für den Client (Client-IP Subnet)
ifconfig-push 10.8.0.50 255.255.255.0

# Internes Routing zum Heimnetz über diesen Client
iroute 192.168.1.0 255.255.255.0
```

Abschließend noch ein Neustart des OpenVPN Servers.

```sh Neustart des OpenVPN Servers
sudo systemctl restart openvpn
```

## Fertig!

Nachdem sich unser Raspberry Pi VPN Gateway nun mit dem OpenVPN Server verbunden hat, sollte es von jedem VPN-Client aus möglich sein jedes Gerät im Heimnetz zu erreichen.

Zum Testen kann man beispielsweise versuchen von einem Smartphone (mit ausgeschaltetem WLAN und aktivierten VPN) den Raspberry Pi (192.168.1.50) oder den Router im eigenen Heimnetz (192.168.1.1) zu erreichen.
