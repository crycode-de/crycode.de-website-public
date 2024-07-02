---
title: OpenVPN Server einrichten
author:
  name: Peter Müller
  link: https://crycode.de
#banner: banner.webp
date: 2017-03-19 12:00:00
updated: 2024-07-02 20:26:00
categories:
  - [Linux]
  - [Netzwerk]
  - [Server]
tags:
  - IP-Adressen
  - Linux
  - Netzwerk
  - OpenVPN
---

[OpenVPN](https://openvpn.net/) ist eine Software zur Erstellung von virtuellen privaten Netzwerken (VPN).

Mit *OpenVPN* ist es möglich sichere Netzwerkverbindungen über unsichere Netzwerke (z.B. das Internet oder öffentliche WLANs) aufzubauen. Verwendet wird hierfür das Verschlüsselungsprotokoll SSL/TLS.

<!-- more -->

Zur Authentifizierung der einzelnen Clients werden Zertifikate und Schlüssel verwendet, wobei jeder Client sein eigenes Zertifikat und seinen eigenen privaten Schlüssel bekommt. Zur einfachen Erstellung und der Verwaltung der Zertifikate und Schlüssel verwenden wir *EasyRSA*.

<!-- toc Inhalt -->

## OpenVPN und EasyRSA installieren

Als erstes installieren wir *OpenVPN* und *EasyRSA*. Da die in den Paketquellen enthaltene Version von *EasyRSA* veraltet ist, laden wir die aktuelle Version von den [EasyRSA Releases auf GitHub](https://github.com/OpenVPN/easy-rsa/releases) und entpacken diese.

```sh Installation von OpenVPN und EasyRSA
sudo apt install openvpn

cd /etc/openvpn

sudo wget https://github.com/OpenVPN/easy-rsa/releases/download/v3.1.7/EasyRSA-3.1.7.tgz
sudo tar -xf EasyRSA-3.1.7.tgz
sudo mv EasyRSA-3.1.7 easyrsa3
```

Zur Erhöhung der Sicherheit legen wir auf unserem Server zusätzlich einen neuen Benutzer und eine neue Gruppe für den OpenVPN Server an. Diese werden dem Server später über die Config mitgeteilt.

```sh Gruppe und Benutzer anlegen
sudo addgroup --system --no-create-home --disabled-login --group openvpn
sudo adduser --system --no-create-home --disabled-login --ingroup openvpn openvpn
```

## Konfiguration von EasyRSA

EasyRSA lädt standardmäßig die Konfiguration aus der Datei `/etc/openvpn/easyrsa3/vars`. Diese erstellen wir zunächst durch kopieren der Beispielkonfiguration:

```sh Konfiguration erstellen
cd /etc/openvpn/easyrsa3
sudo cp vars.example vars
```

Anschließend können wir die Datei bearbeiten und die Variablen unseren Bedürfnissen entsprechend anpassen.

Für einen reibungslosen Betrieb über einen längeren Zeitraum empfehle ich folgende Einstellungen zu setzen:

```sh Empfohlene Einstellungen in &#47;etc/openvpn/easyrsa3/vars
# Schlüssellänge auf 4096 Bit
set_var EASYRSA_KEY_SIZE 4096

# Gültigkeit der CRL 10 Jahre
set_var EASYRSA_CRL_DAYS 3650
```

## Zertifizierungsstelle (CA) erstellen

Zur Verwaltung der Server- und Client-Zertifikate benötigen wir eine Zertifizierungsstelle, oder auch CA (certificate authority) genannt. Diese können wir dank EasyRSA sehr einfach erstellen und verwalten.

```sh CA erstellen
cd /etc/openvpn/easyrsa3
sudo ./easyrsa init-pki
sudo ./easyrsa build-ca
```

Dies erstellt für unseren OpenVPN Server eine neue Public-Key-Infrastruktur (pki) und erzeugt in dieser eine neue CA. Dabei muss für die CA ein Passwort angegeben werden. Dieses Passwort sollte sicher irgendwo aufbewahrt werden, da es für jedes Signieren eines Server- oder Client-Zertifikates benötigt wird.

Jeder Client benötigt später zusätzlich zu seinen eigenen Zertifikaten das öffentliche Zertifikat der CA (`/etc/openvpn/easyrsa/pki/ca.crt`).

Zusätzlich erstellen wir noch die CRL-Datei für den Server, welche für widerrufene Zertifikate benötigt wird.

```sh CRL-Datei erzeugen
sudo ./easyrsa gen-crl
```

Damit der Server, welcher später unter dem Nutzer und der Gruppe *openvpn* läuft, auch auf die CRL-Datei zugreifen kann, ändern wir den Eigentümer des Verzeichnisses `/etc/openvpn/easyrsa3` auf `root:openvpn` und passen die Rechte an, dass die Gruppe Lesezugriff auf die CRL-Datei hat.

```sh Rechte anpassen
sudo chown -R root:openvpn /etc/openvpn/easyrsa3
sudo chmod g+x /etc/openvpn/easyrsa3/pki
sudo chmod g+r /etc/openvpn/easyrsa3/pki/crl.pem
```

## Server-Zertifikat erstellen

Der Server benötigt ein eigenes Zertifikat und zusätzlich die Diffie-Hellman-Parameter. Diese sind nötig, um kryptografische Schlüssel sicher über unsichere Kanäle auszuhandeln.

```sh Diffie-Hellman-Parameter und Server-Zertifikat erstellen
sudo ./easyrsa gen-dh
sudo ./easyrsa build-server-full server nopass
```

Dabei muss zum Signieren des Server-Zertifikates das Passwort des CA-Zertifikates eingegeben werden.

Zudem ist es ratsam TLS-Auth zu verwenden, was jedem Paket bei der Schlüsselaushandlung zwischen Server und Client eine spezielle Signatur hinzufügt. Hierfür erstellen wir einen TA-Schlüssel.

```sh TA-Schlüssel erzeugen
sudo openvpn --genkey --secret ./pki/ta.key
```

Dieser TA-Schlüssel muss später, genauso wie das CA-Zertifikat, jedem Client bekannt sein.

## Server-Config

Im Folgenden eine Beispiel-Config für den OpenVPN Server, welche unter `/etc/openvpn/server.conf` gespeichert wird.

{% codefile ini server.conf /etc/openvpn/server.conf %}

## OpenVPN-Server manuell starten

Nachdem die Zertifikate und die Server-Config erstellt sind kann der OpenVPN Server gestartet werden.

```sh OpenVPN Server manuell starten
sudo openvpn /etc/openvpn/server.conf
```

Dies startet den Server im aktuellen Terminal und zeigt die Log-Meldungen direkt an. Für Testzwecke sicherlich hilfreich, für den Produktivbetrieb jedoch eher weniger.

## OpenVPN Server als SystemD-Service

Damit der OpenVPN Server permanent läuft nutzen wir einen SystemD-Service.

Schaut man sich den standardmäßig aktivierten Service `openvpn.service` an, so stellt man fest, dass dieser lediglich als *oneshot* `/bin/true` aufruft. Das ist auf den ersten Blick nicht was wir wollen.

OpenVPN bringt ein besonderes Service-Template mit, welches unter `/lib/systemd/system/openvpn@.service` zu finden ist. Auf dieses Template muss ein Symlink erstellt werden, welcher den Namen der Server-Config im Verzeichnis `/etc/openvpn/` beinhaltet. Im folgenden Beispiel wird von einer Server-Config in der Datei `server.conf` ausgegangen.

```sh Symlink für den OpenVPN SystemD-Service erstellen
sudo ln -s /lib/systemd/system/openvpn@.service /etc/systemd/system/openvpn@server.service
```

Der Service erkennt dann automatisch, anhand des Namens hinter dem `@`, welche Config für OpenVPN geladen werden soll.

Aktiviert werden braucht dieser Service nicht extra, da es ein Teil des `openvpn.service` ist und über diesen gesteuert wird.

Zum Starten des OpenVPN Servers als Service starten wir einfach den `openvpn.service` neu und schauen uns anschließend den Status an.

```sh Neustart vom OpenVPN Service und Ansehen des Status
sudo systemctl restart openvpn.service
sudo systemctl status openvpn@server.service
● openvpn@server.service - OpenVPN connection to server
   Loaded: loaded (/lib/systemd/system/openvpn@.service; enabled; vendor preset: enabled)
   Active: active (running) since So 2017-03-19 13:11:04 CET; 1s ago
```

It’s magic!

## Client-Zertifikat erstellen

Für jeden Client muss ein eigenes Zertifikat erstellt werden.

```sh Client Zertifikat erstellen
cd /etc/openvpn/easyrsa3
sudo ./easyrsa build-client-full clientname
```

Dabei muss ein neues Passwort für das Client-Zertifikat und zum Signieren wieder das Passwort des CA-Zertifikates eingegeben werden.

Das Client-Zertifikat liegt nun unter `/etc/openvpn/easyrsa3/pki/issued/clientname.crt` und der zugehörige private Schlüssel unter `/etc/openvpn/easyrsa3/pki/private/clientname.key`.

> [!IMPORTANT]
> Das Zertifikat und vor allem der private Schlüssel sollten ***NIEMALS*** über eine ungesicherte Verbindung vom Server zum Client übertragen werden!  
> Jeder der über den privaten Schlüssel verfügt kann sich als der Client ausgeben.

## Client-Config

Die Client-Config wird als `.ovpn` oder `.conf` Datei bereitgestellt und kann dann von jedem aktuellen OpenVPN-Client verarbeitet werden.

In der folgenden Beispiel-Config müssen noch die entsprechenden Zertifikate, wie weiter unten beschrieben, eingefügt werden.

{% codefile ini client.ovpn Beispiel einer Client-Config %}

Die benötigten Zertifikate und Schlüssel sind auf dem Server vorhanden und können zum Beispiel über eine SSH-Verbindung mittels `cat` angezeigt und in die Client-Config kopiert werden. *Auch hier nochmals der Hinweis, dass die Zertifikate und Schlüssel niemals über eine ungesicherte Verbindung übertragen werden sollten!*

Jeweils die Zeilen zwischen `BEGIN` und `END` müssen 1:1 in die Client-Config kopiert werden.

```sh Schlüssel für Client-Config vom Server erhalten
cd /etc/openvpn/easyrsa3

# tls-auth
sudo cat pki/ta.key
#
# 2048 bit OpenVPN static key
#
-----BEGIN OpenVPN Static key V1-----
19963f30698663ad6b3600c220f750ad
[...]
8b826236190dc7dfb97f3abd56701a5a
-----END OpenVPN Static key V1-----

# ca
sudo cat pki/ca.crt
-----BEGIN CERTIFICATE-----
MIIFqjCCAyagAwIBAgIJAIeJvH+ho4QLMA0GCSqGSIb3xQEBCwUAMBkxFzAVBgNV
[...]
QYh4m167feMm6ICptfGrOSgE2QT76yANDJgUuXx9oGh4sdufhBXXtJolqMX7SzEI
3Hg=
-----END CERTIFICATE-----

# cert
sudo cat pki/issued/clientname.crt
Certificate:
[...]
-----BEGIN CERTIFICATE-----
MIIFQDXCAyigAwIBAgIBBD7NBgkqhkiG9w0BAQsFADAZMRcwFQYDVQ6DDA5jcnlI
[...]
OjYq8ILb08I/GpaEkCSPLO7PkaDtbiEc3ypSrLTRoWXQn0vNyByd1aKUr7RrA6cT
C0rXsA==
-----END CERTIFICATE-----

# key
sudo cat pki/private/clientname.key
-----BEGIN ENCRYPTED PRIVATE KEY-----
MIIJQwIBA0ANBgkqhkiG5w0BAQEFAASCCS0wggkpAgEAaoICA7Cpd4eI9jYFYLK0
[...]
1G60lge7bHXvXcTrhqv+jhRfRPBTyV2qY6TKZ+WZ/KpcyNOyNl/ynJ5aChpbLy4C
LLYTuZu6ZauZteX8pKjRS7RUel3bQk4=
-----END ENCRYPTED PRIVATE KEY-----
```

## Feste IP-Adresse für bestimmte Clients

Standardmäßig erhält jeder Client eine zufällige IP-Adresse aus dem virtuellen IP-Bereich des Servers. Möchte man einem bestimmtem Client eine feste IP-Adresse zuweisen, so kann man dies über eine eigene Config für diesen Client auf dem Server erledigen.

Sofern noch nicht vorhanden erstellen wir zuerst auf dem Server das Verzeichnis für die Client-spezifischen Configs und fügen der Server-Config den entsprechenden Eintrag hinzu.

```sh Verzeichnis für die Client-spezifischen Configs erstellen
cd /etc/openvpn
sudo mkdir ccd
```

```ini Eintrag in der Server-Config zur Aktivierung der Client-spezifischen Configs
# Verzeichnis für die Client-Configs
client-config-dir ccd
```

Nun legen wir für den entsprechenden Client die Config-Datei im Verzeichnis `/etc/openvpn/ccd/` an, wobei die Datei genauso heißen muss, wie der Client bei der Erstellung des Zertifikates genannt wurde. Im folgenden Beispiel soll der Client client50 die feste IP 10.8.0.50 erhalten.

```ini Eintrag für die Client-Config-Datei
# Feste IP für den Client (Client-IP Subnet)
ifconfig-push 10.8.0.50 255.255.255.0
```

## Weiterleitung ins Internet

Standardmäßig haben OpenVPN Clients vom VPN aus keinen Zugriff auf das Internet. Dies kann man recht einfach auf dem Server einrichten, indem man IP-Forwarding aktiviert und ein NAT einrichtet.

```sh IP-Forwarding am Server aktiveren und NAT einrichten
sudo sysctl -w net/ipv4/ip_forward=1
sudo iptables -t nat -F POSTROUTING
sudo iptables -t nat -A POSTROUTING -o eth0 -s 10.8.0.0/24 -j MASQUERADE
```

Hierbei müssen natürlich ggf. `eth0` und der IP-Bereich des VPN angepasst werden.

Möchte man dies bei einem Neustart des Systems automatisch aktivieren lassen, so fügt man zuerst einmal der *sysctl*-Konfiguration einen entsprechenden Eintrag in einer eigenen Konfigurationsdatei hinzu:

```sh sysctl Konfigurationsdatei anlegen
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.d/70-openvpn.conf
```

Für die *iptables*-Regeln nutzen wir *iptables-persistent*, welches wir zuerst installieren, falls noch nicht vorhanden.

```sh Installation von iptables-persistent
sudo apt install iptables-persistent
```

Bei der Installation fragt *iptables-persistent*, ob man die aktuellen Regeln speichern möchte. Beantworten wir dies mit *ja*, so ist die Arbeit auch schon erledigt und die Regeln werden beim Systemstart automatisch geladen. Andernfalls muss in der Datei `/etc/iptables/rules.v4` die Regel im Bereich `*nat` hinzugefügt werden, sodass es dann wie folgt aussieht:

```plain Bereich *nat in &#47;etc/iptables/rules.v4
*nat
:PREROUTING ACCEPT [0:0]
:INPUT ACCEPT [0:0]
:POSTROUTING ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
-A POSTROUTING -o eth0 -s 10.8.0.0/24 -j MASQUERADE
COMMIT
```

Nachträglich alle aktuellen *iptables*-Regeln speichern kann man zudem über den folgenden Befehl:

```sh Aktuelle iptables-Regeln nachträglich speichern
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

Zur Vollständigkeit halber: Regeln für IPv6 über `ip6tables` werden in der Datei `/etc/iptables/rules.v6` gespeichert bzw. aus dieser geladen.

## Allen Traffic über den VPN-Tunnel leiten

Normalerweise wird nur der Traffic über den VPN-Tunnel geleitet, der entweder für den VPN-IP-Bereich bestimmt ist, oder über spezielle Routen zu diesem geleitet wird.

Möchte man nun allen Traffic eines Clients durch den Tunnel leiten, so kann man in der Client-Config (`clientname.ovpn`) den folgenden Eintrag hinzufügen:

```ini Eintrag in der Client-Config (auf dem Client) um allen Traffic über das VPN zu leiten
# Erzwingen, dass jeglicher Traffic über das VPN läuft
redirect-gateway
```

Weiterhin ist es möglich vom Server aus diese Option an alle Clients zu übermitteln, sodass der Traffic von jedem Client vollständig durch den Tunnel geleitet wird. Hierzu fügt man der Server-Config den folgenden Eintrag hinzu:

```ini Eintrag in der Server-Config um allen Traffic aller Clients über das VPN zu leiten
# Erzwingen, dass jeglicher Traffic aller Clients durch den Tunnel geleitet wird
push "redirect-gateway"
```

Ebenso könnte diese Zeile auch einer Client-Config im ccd-Verzeichnis auf dem Server hinzugefügt werden, um dies für einen Client zu erzwingen.

> [!NOTE]
> Damit wird dem Client gesagt, dass er dies machen soll. Letztendlich könnte der Client mit entsprechender Konfiguration oder manuellem Eingriff dies aber auch ignorieren.

## Zertifikat widerrufen

Ein ausgestelltes und signiertes Zertifikat kann von der CA widerrufen werden. Dies ist beispielsweise notwendig, wenn das Zertifikat in die falschen Hände gelangt ist und man nicht mehr sicher sein kann, dass es nur den berechtigten Personen vorliegt.

Der Widerruf eines Zertifikates sperrt den entsprechenden Client am OpenVPN Server.

Zuerst muss das entsprechende Zertifikat widerrufen und anschließend die CRL-Datei (neu) erstellt werden. Hierfür wird wieder das Passwort der CA benötigt. Damit die CRL-Datei vom Server gelesen werden kann müssen auch wieder die Dateirechte angepasst werden.

```sh Zertifikat widerrufen und CRL-Datei neu erstellen
cd /etc/openvpn/easyrsa3
sudo ./easyrsa revoke clientname
sudo ./easyrsa gen-crl
sudo chown root:openvpn ./pki/crl.pem
sudo chmod g+r ./pki/crl.pem
```

Sofern noch nicht vorhanden muss zudem der folgende Eintrag in der Server-Config hinzugefügt beziehungsweise aktiviert werden, damit die CRL-Datei auch gelesen wird:

```ini Eintrag in der Server-Config für die CRL-Datei
# CRL-Datei für widerrufene Zertifikate
crl-verify /etc/openvpn/easyrsa3/pki/crl.pem
```

## Private Key für die “OpenVPN Connect” Android-/iOS-App

> [!CAUTION]
> Die folgenden Infos sind Versionsabhängig und die gezeigte Konvertierung wird bei neueren Versionen der App nicht mehr benötigt beziehungsweise kann sogar zu Fehlern führen.  
> Im Zweifelsfall sollte immer zuerst der original Schlüssel getestet werden.

Unter Verwendung des "encrypted private key" meldet die [Android-App OpenVPN Connect](https://play.google.com/store/apps/details?id=net.openvpn.openvpn) den Fehler `OpenVPN core error : PolarSSL: error parsing config private key : PK - Bad input parameters to function`.

Die [iOS-App OpenVPN Connect](https://apps.apple.com/de/app/openvpn-connect-openvpn-app/id590379981) meldet `CORE_ERROR mbed TLS: error parsing config private key : PK - Bad input parameters to function`.

Dies kann behoben werden, indem man den Schlüssel in das DES3-Format konvertiert und anschließend den konvertierten Schlüssel in die Client-Config einfügt.

```sh Schlüssel in DES3-Format konvertieren
cd /etc/openvpn/easyrsa3
openssl rsa -in pki/private/clientname.key -des3 -out pki/private/clientname.des3.key
```
