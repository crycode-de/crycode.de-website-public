---
title: SocketCAN über Ethernet mit Cannelloni
author:
  name: Peter Müller
  link: https://crycode.de
date: 2021-05-07 12:00:00
updated: 2024-04-11 13:58:00
abbr:
  CAN: Controller Area Network
  UDP: User Datagram Protocol
  SCTP: Stream Control Transmission Protocol
categories:
  - Linux
tags:
  - CAN-Bus
  - Linux
  - Netzwerk
  - Raspberry Pi
  - SocketCAN
---

Unter Linux erfolgt die Anbindung von {% abbr CAN %}-Bus Hardware meistens per [SocketCAN](https://de.wikipedia.org/wiki/SocketCAN) über den Kernel. Dabei wird im System dann ein CAN-Interface bereitgestellt, zum Beispiel `can0`.

Mit der Software [*Cannelloni*](https://github.com/mguentner/cannelloni) von Maximilian Güntner ist es möglich dieses CAN-Interface über eine Ethernetverbindung an einen anderen Linux-Rechner weiterzuleiten. Hierbei wird auf dem zweiten Rechner ein virtuelles CAN-Interface, zum Beispiel `vcan0`, erzeugt. Die CAN-Nachrichten werden dann mittels {% abbr UDP %} zwischen beiden Systemen übertragen.

<!-- more -->

Dies ist beispielsweise dann sinnvoll, wenn man Software auf einem System testen möchte, das keine echte CAN-Hardware angeschlossen hat. So kann man sich dann beispielsweise das [CAN-Interface von einem Raspberry Pi](/can-bus-am-raspberry-pi/) auf seinen Development-PC holen und dort direkt mit dem virtuellen Interface arbeiten.

> [!IMPORTANT]
> *Cannelloni* ist nicht für den Produktiveinsatz vorgesehen und sollte nur dort verwendet werden, wo ein Paketverlust toleriert werden kann.
> Es gibt keine Garantie, dass die CAN-Nachrichten ihr Ziel (das jeweils andere System) erreichen, oder dass sie in der richtigen Reihenfolge ankommen.

<!-- toc Inhalt 2 -->

## Installation von Cannelloni

Für die Installation muss *Cannelloni* auf dem jeweiligen System kompiliert werden. Hierzu installieren wir zunächst die benötigten Tools:

```sh Installation der nötigen Tools
sudo apt install build-essential cmake git
```

Anschließend laden wir uns den aktuellen Quellcode von GitHub und kompilieren *Cannelloni*:

```sh Quellcode von Cannelloni laden und kompilieren
git clone https://github.com/mguentner/cannelloni.git
cd cannelloni
cmake -DCMAKE_BUILD_TYPE=Release
make
```

Nun können wir schon *Cannelloni* im aktuellen Verzeichnis mittels `./cannelloni [...]` ausführen, oder wir installieren es global im System:

```sh Cannelloni global im System installieren
sudo make install
```

## Beispiel zur Nutzung

In diesem Beispiel werden wir das physikalische CAN-Interface `can0` von einem Raspberry Pi mit der IP-Adresse *192.168.1.50* auf das virtuelle CAN-Interface `vcan0` eines Desktop-PCs mit der IP-Adresse *192.168.1.201* weiterleiten.

Zur Vorbereitung laden wir zunächst auf dem Desktop-PC das Kernelmodul `vcan` und legen das Interface `vcan0` an:

```sh Kernelmodul laden und Interface anlegen
sudo modprobe vcan
sudo ip link add name vcan0 type vcan
sudo ip link set dev vcan0 up
```

Da das virtuelle CAN-Interface `vcan0` im Normalfall immer schneller ist als das echte CAN-Interface, müssen wir die Bandbreite von `vcan0` auf dem Desktop-PC begrenzen. Hierzu nutzen wir die *Traffic Control* vom Linux Kernel.  
Idealerweise sollte die Bandbreite des virtuellen `vcan0` Interfaces der des echten `can0` Interfaces entsprechen. In diesem Beispiel sind es *500 kBit/s*.

```sh Bandbreite des vcan0 Interfaces beschränken
sudo tc qdisc add dev vcan0 root tbf rate 500kbit latency 100ms burst 1000
```

Anschließend starten wir *Cannelloni* auf dem Desktop-PC mit dem virtuellen CAN-Interface, der IP-Adresse des Raspberry Pi und der Ausgabe der CAN-Nachrichten.  
Optional könnten mit `-r` und `-l` noch der entfernte und der lokale Port mit angegeben werden. Ohne Angabe wird für beides der Standardport 20000 verwendet.

```sh Start von Cannelloni auf dem Desktop-PC
user@desktop-pc:~/cannelloni$ ./cannelloni -I vcan0 -R 192.168.1.50 -d c
INFO:udpthread.cpp[146]:run:UDPThread up and running
INFO:canthread.cpp[108]:run:CANThread up and running
```

Nun folgt noch der Start von *Cannelloni* auf dem Raspberry Pi nach dem gleichen Muster, nur dieses mal dem physikalischen CAN-Interface und der IP-Adresse des Desktop-PCs.

```sh Start von Cannelloni auf dem Raspberry Pi
pi@raspberrypi:~/cannelloni$ ./cannelloni -I can0 -R 192.168.1.201 -d c
INFO:ERROR:udpthread.cpp[146]:run:UDPThread up and running
canthread.cpp[88]:start:CAN_FD is not supported on >can0<
INFO:canthread.cpp[108]:run:CANThread up and running
```

Solange nun *Cannelloni* auf beiden Systemen läuft, werden die CAN-Nachrichten bidirektional über das Ethernet zwischen beiden CAN-Interfaces ausgetauscht. Das heißt Nachrichten, die am Raspberry Pi auf `can0` ankommen, kommen auch auf dem Desktop-PC auf `vcan0` an und Nachrichten, die am Desktop-PC an `vcan0` gesendet werden, werden auch am Raspberry Pi über `can0` gesendet.

Durch den Parameter `-d c` beim Start von *Cannelloni* werden zudem im jeweiligen Terminal die eingehenden und ausgehenden CAN-Nachrichten angezeigt:

```plain Anzeige der CAN-Nachrichten
LC|EFF Frame ID[83902468]        Length:8        0 0 f4 40 0 0 12 41
LC|EFF Frame ID[520093697]       Length:7        15 14 5 7 e 7 0
LC|EFF Frame ID[83902468]        Length:8        0 0 fc 40 0 0 12 41
LC|EFF Frame ID[83902468]        Length:8        0 0 f0 40 0 0 12 41
LC|EFF Frame ID[520093697]       Length:7        15 14 5 7 e 8 0
LC|EFF Frame ID[83902468]        Length:8        0 0 ec 40 0 0 12 41
LC|EFF Frame ID[83902468]        Length:8        0 0 ec 40 0 0 12 41
LC|EFF Frame ID[520093697]       Length:7        15 14 5 7 e 9 0
```

Das virtuelle CAN-Interface `vcan0` am Desktop-PC kann nun (nahezu) identisch dem physikalischen CAN-Interface `can0` das Raspberry Pi verwendet werden. Alle Daten werden zwischen beiden Interfaces quasi gespiegelt.

## Permanenter Betrieb über SystemD-Services

Das oben gezeigte Beispiel eignet sich hervorragend zum Testen oder für die zeitweise Nutzung. Möchten wir nun aber permanent das CAN-Interface an ein anderes System übertragen, so brauchen wir ein paar SystemD-Services. Zudem sollte *Cannelloni* dafür systemweit installiert sein, wie oben beschrieben.

### Auf dem System mit vcan0

Auf dem System mit der virtuellen Schnittstelle `vcan0` erstellen wir uns dafür zwei SystemD-Services.

Der erste Service sorgt als “Oneshot” dafür, dass das Interface beim Systemstart (oder manuellem Aufruf) angelegt und konfiguriert wird. Dazu benötigen wir noch ein einfaches Skript, welches von diesem Service gestartet wird.

Das Skript muss nur für den root-Nutzer verfügbar sein, weshalb wir es unter `/usr/local/sbin/` anlegen. Interfacename und Geschwindigkeit müssen gegebenenfalls angepasst werden.

```sh Script im Editor öffnen
sudo nano /usr/local/sbin/vcan0-setup.sh
```

```sh Skript "/usr/local/sbin/vcan0-setup.sh"
#!/bin/bash
set -e

IFACE=vcan0
RATE=500kbit

case "$1" in
  start)
    modprobe vcan
    ip link add name $IFACE type vcan
    ip link set dev $IFACE up
    tc qdisc add dev $IFACE root tbf rate $RATE latency 100ms burst 1000
    ;;
  stop)
    ip link del name $IFACE
    ;;
  *)
    echo "Usage: $0 <start|stop>" >&2
    exit 1
esac
```

Damit das Skript gestartet werden kann, machen wir es noch für den root-Nutzer ausführbar.

```sh Skript ausführbar machen
sudo chmod u+x /usr/local/sbin/vcan0-setup.sh
```

Dazu legen wir den zugehörigen SystemD-Service an.

```sh SystemD-Service im Editor öffnen
sudo nano /etc/systemd/system/vcan0-setup.service
```

```ini SystemD-Service &#47;etc/systemd/system/vcan0-setup.service
[Unit]
Description=Setup vcan0
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/vcan0-setup.sh start
ExecStop=/usr/local/sbin/vcan0-setup.sh stop
RemainAfterExit=true

[Install]
WantedBy=multi-user.target
```

Dann fehlt noch der zweite Service für *Cannelloni* selbst.

```sh SystemD-Service im Editor öffnen
sudo nano /etc/systemd/system/cannelloni-vcan0.service
```

```ini SystemD-Service &#47;etc/systemd/system/cannelloni-vcan0.service
[Unit]
Description=Cannelloni for vcan0
After=network.target
Requires=vcan0-setup.service

[Service]
ExecStart=/usr/local/bin/cannelloni -I vcan0 -R 192.168.1.50
Environment=LD_LIBRARY_PATH=/usr/local/lib
Restart=always
RestartSec=3s
User=nobody
Group=nogroup

[Install]
WantedBy=multi-user.target
```

Optional könnte bei `ExecStart` am Ende auch wieder `-d c` mit angegeben werden, um alle Datenpakete in das Log zu schreiben. Dies würde ich für den produktiven Betrieb aber nicht empfehlen.

Zu guter Letzt aktivieren wir die beiden Services noch, damit sie beim Systemstart automatisch gestartet werden und starten sie anschließend einmal per Hand.  
Hinweis: `vcan0-setup.service` würde auch automatisch vor dem Start von `cannelloni-vcan0.service` vom SystemD gestartet werden, da dieser als Abhängigkeit definiert ist. Zum Testen ist es aber sinnvoll beides einzeln zu starten.

```sh Aktivieren der SystemD-Services
sudo systemctl daemon-reload
sudo systemctl enable vcan0-setup.service
sudo systemctl enable cannelloni-vcan0.service
sudo systemctl start vcan0-setup.service
sudo systemctl start cannelloni-vcan0.service
```

Ebenso können natürlich beide Services auch per Hand gestoppt werden. Beim Stopp von `vcan0-setup.service` würde außerdem das `vcan0` Interface auch wieder entfernt werden.

### Auf dem System mit can0

Auf dem System mit der echten Schnittstelle `can0` benötigen wir nur einen SystemD-Service für *Cannelloni*. Dieser ist nahezu identisch mit dem Service auf dem anderen System.

```sh SystemD-Service im Editor öffnen
sudo nano /etc/systemd/system/cannelloni-can0.service
```

```ini SystemD-Service &#47;etc/systemd/system/cannelloni-can0.service
[Unit]
Description=Cannelloni for can0
After=network.target

[Service]
ExecStart=/usr/local/bin/cannelloni -I can0 -R 192.168.1.201
Environment=LD_LIBRARY_PATH=/usr/local/lib
Restart=always
RestartSec=3s
User=nobody
Group=nogroup

[Install]
WantedBy=multi-user.target
```

Auch diesen Service aktivieren und starten wir nun wieder.

```sh Aktivieren des SystemD-Services
sudo systemctl daemon-reload
sudo systemctl enable cannelloni-can0.service
sudo systemctl start cannelloni-can0.service
```

Wenn nun alle drei Services auf beiden Systemen laufen (bzw. gestartet wurden), sollten die CAN-Nachrichten zwischen den Beiden Interfaces `can0` und `vcan0` übertragen werden. Der SystemD kümmert sich darum, dass die Services laufen und gegebenenfalls bei Fehlern oder Systemneustarts automatisch neu gestartet werden.

## Weitere Informationen

Weitere Informationen zur genauen Funktionsweise von *Cannelloni*, möglichen Verzögerungen bei der Übertragung, Timeouts, oder der Nutzung von {% abbr SCTP %} anstelle von {% abbr UDP %} sind auf der [GitHub-Seite von Cannelloni](https://github.com/mguentner/cannelloni) zu finden.
