---
title: CAN-Bus am Raspberry Pi
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2019-08-29 12:00:00
updated: 2025-05-24 21:24:00
categories:
  - [Raspberry Pi]
  - [HomePi]
tags:
  - CAN-Bus
  - Elektronik
  - MCP2515
  - MCP2562
  - Raspberry Pi
abbr:
  IC: Integrated Circuit / Integrierter Schaltkreis
  CAN: Controller Area Network
  Mb/s: Megabit pro Sekunde
  kb/s: Kilobit pro Sekunde
  SPI: Serial Peripheral Interface
  CS: Chip Select
  GPIO: General Purpose Input Output
  BRS: Bit Rate Switch
  ESI: Error State Indicator
---

Bei meinem [HomePi](/kategorie/homepi) ist der {% abbr CAN %}-Bus über einen {% abbr IC %} vom Typ [MCP2515](https://ww1.microchip.com/downloads/en/DeviceDoc/MCP2515-Stand-Alone-CAN-Controller-with-SPI-20001801J.pdf) direkt an einen Raspberry Pi angebunden. In diesem Beitrage zeige ich, wie der CAN-Bus hard- und softwaremäßig an den Raspberry Pi angebunden wird.

<!-- more -->

<!-- toc Inhalt -->

## Hardware

Für die Hardware werden der CAN-Controller [MCP2515](https://ww1.microchip.com/downloads/en/DeviceDoc/MCP2515-Stand-Alone-CAN-Controller-with-SPI-20001801J.pdf) und der CAN-Transceiver [MCP2562](https://ww1.microchip.com/downloads/en/devicedoc/20005167c.pdf) eingesetzt. Der *MCP2515* kümmert sich dabei um das Senden und Empfangen der Nachrichten im CAN-Protokoll. Der *MCP2562* ist ein Treiber, welcher (einfach ausgedrückt) die Signale des *MCP2515* für die Übertragung verstärkt.

Unter Verwendung dieser beiden {% abbr IC %}s sind Datenraten von bis zu 1 {% abbr Mb/s %} auf dem CAN-Bus möglich.

Die Beschaltung erfolgt gemäß dem folgenden Schaltplan:

{% img schaltplan.png thumb:schaltplan-thumb.webp Schaltplan %}

Der CAN-Controller *MCP2515* wird mit +3,3&nbsp;V als Betriebsspannung versorgt. Somit ist eine direkte Verbindung der Datenleitungen des {% abbr SPI %}-Bus zum Raspberry Pi möglich.

Der Treiber *MCP2562* wird mit +5&nbsp;V als Betriebsspannung versorgt. Zusätzlich wird er mit +3,3&nbsp;V versorgt, welche er als Basis für seine RXD und TXD Leitungen verwendet. Hier erfolgt somit automatisch durch den {% abbr IC %} die Pegelanpassung zwischen +5&nbsp;V und den +3,3&nbsp;V, die für den Raspberry Pi erforderlich sind.

> [!CAUTION]
> Es dürfen keine Leitungen mit +5&nbsp;V direkt mit dem Raspi verbunden werden, da dieser sonst beschädigt wird.

Als Taktquelle für den *MCP2515* dient ein 16&nbsp;MHz Quarz. Alternativ kann hier auch ein 8&nbsp;MHz Quarz verwendet werden.

Der Widerstand R2 dient als Abschlusswiderstand zur Terminierung des CAN-Bus. Dieser sollte nur jeweils einmal am Anfang und am Ende des gesamten CAN-Bus vorhanden sein. Bei Busteilnehmern "in der Mitte" darf dieser Widerstand nicht vorhanden sein!

## Installation der Software

Als Basissystem dient hier ein normales aktuelles [Raspberry Pi OS](https://www.raspberrypi.com/software/).

Die nötige Software ist in den Standard-Repositories vom OS bereits enthalten und muss nur noch installiert werden.

```sh Softwarepakete installieren
sudo apt update
sudo apt install can-utils
```

## Aktivieren der Hardware

Damit die Hardware verwendet wird, müssen die entsprechenden Overlays in der Datei `/boot/firmware/config.txt` konfiguriert werden. Hierfür werden am Ende der Datei die folgenden Zeilen hinzugefügt:

```ini Zusätzliche Einträge für die config.txt
dtparam=spi=on
dtoverlay=mcp2515-can0,oscillator=16000000,interrupt=6
```

Die `16000000` steht in dem Fall dafür, dass der *MCP2515* mit einem Takt von 16&nbsp;MHz arbeitet. Dies ist abhängig von dem verwendeten Quarz und muss gegebenenfalls angepasst werden.

Die `6` steht für den {% abbr GPIO %}-Pin (BCM), an dem die Interrupt-Leitung des *MCP2515* angeschlossen ist und muss ebenfalls an die eigene Hardware angepasst werden.

Zum Übernehmen der Änderungen ist ein Neustart das Raspberry Pis erforderlich.

> [!NOTE]
> Ein paar Informationen zu [anderen Hardwarekonfigurationen](#andere-hardwarekonfigurationen) habe ich am Ende dieses Beitrags aufgelistet.

## Prüfen ob die Hardware erkannt wurde

Ob die Hardware korrekt erkannt wurde kann wie folgt überprüft werden:

```sh Prüfen ob die Hardware erkannt wurde
pi@raspberrypi:~ $ ls /sys/bus/spi/devices/spi0.0
driver           modalias  of_node  statistics  supplier:platform:3f200000.gpio
driver_override  net       power    subsystem   uevent
pi@raspberrypi:~ $ ls /sys/bus/spi/devices/spi0.0/net
can0
pi@raspberrypi:~ $ ls /sys/bus/spi/devices/spi0.0/net/can0
addr_assign_type    dev_port           name_assign_type      speed
address             dormant            napi_defer_hard_irqs  statistics
[...]
device              link_mode          proto_down
dev_id              mtu                queues
pi@raspberrypi:~ $ ls /sys/class/net
can0  eth0  lo
```

Sieht die Ausgabe so aus, wie hier dargestellt, dann ist alles in Ordnung und der Raspberry Pi kann mit dem *MCP2515* kommunizieren. Sollte ein Problem vorliegen, dann liefert mindestens einer der Befehle einen Fehler zurück.

## Einrichtung des CAN-Interfaces

Der CAN-Bus erscheint auf dem Raspberry Pi als Netzwerkinterface. Ein Aufruf von `ip addr` sollte das Interface `can0` anzeigen, wobei es jedoch noch als `DOWN` markiert ist.

```sh Auszug der Ausgabe von ip addr
ip link show type can
3: can0: <NOARP,ECHO> mtu 16 qdisc noop state DOWN group default qlen 10
    link/can
```

Über den folgenden Befehl kann das Interface manuell aktiviert werden:

```sh CAN-Interface manuell aktivieren
sudo ip link set can0 up type can bitrate 500000
```

Hierbei wird eine Bitrate von 500&nbsp;{% abbr kb/s %} verwendet. Diese Bitrate kann bei Bedarf natürlich angepasst werden und sollte bei allen Busteilnehmern gleich sein.

Ein erneuter Aufruf von `ip addr` zeigt nun, dass das Interface aktiv ist.

```sh Auszug der Ausgabe von ip addr mit aktivem Interface
ip link show type can
3: can0: <NOARP,UP,LOWER_UP,ECHO> mtu 16 qdisc pfifo_fast state UP group default qlen 10
    link/can
```

## Automatisches Aktivieren des Interfaces beim Systemstart

Damit das `can0` Interface beim Systemstart automatisch aktiviert wird, muss ein SystemD Oneshot Service unter `/etc/systemd/system/setup-can0.service` erstellt werden. Dieser Service wird dann beim Booten des Systems einmalig ausgeführt und aktiviert das Interface mit der gewünschten Bitrate.

```ini SystemD Oneshot Service &#47;etc/systemd/system/setup-can0.service
[Unit]
Description=Setup can0
After=network.target

[Service]
Type=oneshot
ExecStart=/sbin/ip link set can0 up type can bitrate 500000
RemainAfterExit=true

[Install]
WantedBy=multi-user.target
```

Die *500000* ist hierbei wieder die zu verwendende Bitrate.

Anschließend muss der Service aktiviert werden, damit er beim Systemstart ausgeführt wird:

```sh Service aktivieren
sudo systemctl daemon-reload
sudo systemctl enable setup-can0.service
```

<details>
<summary>Auf älteren Systemen</summary>

Auf älteren Systemen können die folgenden Einträge in der Datei `/etc/network/interfaces` hinzugefügt werden. Dies funktioniert auch dann, wenn die "normalen" Netzwerkinterfaces vom *NetworkManager* oder *dhcpcd* verwaltet werden.

```ini CAN-Bus Einträge in &#47;etc/network/interfaces
# CAN-Bus
auto can0
iface can0 can static
  bitrate 500000
```

</details>

## Testen des CAN-Bus

Zum Testen des CAN-Bus können nun über ein Terminal Nachrichten gesendet oder empfangen werden.

> [!CAUTION]
> Es muss mindestens ein weiterer Teilnehmer am Bus sein. Sonst bleiben vom CAN-Controller erwartete Rückmeldungen auf dem Bus aus und der Controller geht somit in einen Fehlerzustand.
> Alternativ kann zum Testen der [Loopback-Modus](#loopback-modus) aktiviert werden.

### Senden von CAN-Nachrichten

Zum Senden von Nachrichten kann das Tool `cansend` verwendet werden, wobei Standard Frames mit 11-Bit Nachrichten-IDs und Extended Frames mit 29-Bit Nachrichten-IDs unterstützt werden.

Für **Standard Frames** sieht der Aufruf wie folgt aus:

```sh Senden einer Nachricht als Standard Frame
cansend can0 123#42ff
```

`123` ist in diesem Fall die ID der Nachricht in Hex-Schreibweise und muss immer 3 Zeichen lang sein. `42ff` sind die Daten, wiederum in Hex, mit einer Länge von 0 bis 8 Byte.

Bei **Extended Frames** besteht die ID aus 8 Zeichen. Der Rest verhält sich analog zu den Standard Frames.

```sh Senden einer Nachricht als Extended Frame
cansend can0 012EA567#42ff
```

Eine kurze Hilfe zu `cansend` erhält man über die Befehle `cansend --help` oder `man cansend`.

### Empfangen von CAN-Nachrichten

Über den Befehl `candump` könne empfange Nachrichten angezeigt werden.

```sh Empfangene Nachrichten anzeigen mittels Candump
pi@raspberrypi:~ $ candump can0
  can0  123   [2]  42 FF
  can0  012EA567   [2]  42 FF
  can0  1FFFFFFF   [8]  00 11 22 33 44 55 66 77
  can0       001   [0] 
  can0  00001337   [4]  DE AD BE EF
```

Optional können über die Angabe von beispielsweise `-tA -x` zusätzliche Informationen angezeigt werden:

```sh Empfangene Nachrichten anzeigen mittels Candump und zusätzlichen Infos
pi@raspberrypi:~ $ candump -tA -x can0
 (2024-04-25 11:48:30.715527)  can0  RX - -  05004004   [8]  00 00 08 41 00 00 00 41
 (2024-04-25 11:49:00.202991)  can0  TX - -  1F000001   [7]  14 18 04 19 0B 31 00
 (2024-04-25 11:49:00.715446)  can0  RX - -  05004004   [8]  00 00 08 41 00 00 00 41
 (2024-04-25 11:49:30.715394)  can0  RX - -  05004004   [8]  00 00 04 41 00 00 02 41
```

Dabei sind gesendete Nachrichten dann mit `TX` und empfangene mit `RX` gekennzeichnet. Dahinter folgen das {% abbr BRS %} und das {% abbr ESI %} Bit.  
Ist das {% abbr ESI %} Bit gesetzt, bedeutet dies, dass der Sender der Nachricht im *Error Passive* Zustand ist.

## Details zum Status des CAN-Interfaces anzeigen

Genaue Details zu dem `can0` Interface können wie folgt angezeigt werden:

```sh Details zum CAN-Interface anzeigen lassen
pi@raspberrypi:~ $ ip -details -statistics link show can0
3: can0: <NOARP,UP,LOWER_UP,ECHO> mtu 16 qdisc pfifo_fast state UP mode DEFAULT group default qlen 10
    link/can  promiscuity 0  allmulti 0 minmtu 0 maxmtu 0 
    can state ERROR-ACTIVE restart-ms 0 
    bitrate 500000 sample-point 0.875
    tq 125 prop-seg 6 phase-seg1 7 phase-seg2 2 sjw 1 brp 1
    mcp251x: tseg1 3..16 tseg2 2..8 sjw 1..4 brp 1..64 brp_inc 1
    clock 8000000
    re-started bus-errors arbit-lost error-warn error-pass bus-off
    0          0          0          0          0          0         numtxqueues 1 numrxqueues 1 gso_max_size 65536 gso_max_segs 65535 tso_max_size 65536 tso_max_segs 65535 gro_max_size 65536 parentbus spi parentdev spi0.0 
    RX:  bytes packets errors dropped  missed   mcast
             3       1      0       0       0       0
    TX:  bytes packets errors dropped carrier collsns
             3       1      0       0       0       0
```

Interessant sind hier vor allem der aktuelle Zustand in Zeile 4 (hier *ERROR-ACTIVE*), sowie die Anzahl der empfangenen und gesendeten Pakete in den letzten 4 Zeilen.

Über die Anzahl der empfangenen und gesendeten Pakete, besonders dabei den *errors* und *dropped* lässt sich schnell ein Überblick über eventuelle Probleme auf dem Bus gewinnen.

> [!TIP]
> Nicht von `clock 8000000` verwirren lassen. Ich nutze beispielsweise einen 16&nbsp;MHz Quarz, sowie die passenden Einträge in der `config.txt` und es werden hier trotzdem 8&nbsp;MHz angezeigt.

## Mögliche Zustände der Bus-Teilnehmer

Grundsätzlich gibt es beim CAN-Bus drei mögliche (Fehler-) Zustände für einen Teilnehmer:

* **Error-active**  
  Der Teilnehmer nimmt aktiv am Bus teil und kann Nachrichten und aktive Fehlernachrichten (*active error frames*) senden. Dies sollte der Normalzustand sein.
* **Error-passive**  
  Der Teilnehmer nimmt am Bus teil, aber sendet keine aktiven Fehlernachrichten mehr, sondern nur noch passive (*passive error frames*). Dieser Zustand tritt ein, wenn der Teilnehmer Fehler auf dem Bus erkannt hat und soll verhindern, dass er den Bus mit möglichweise falschen Nachrichten stört.
* **Bus-off**  
  Bei zu vielen Fehlern koppelt sich der Teilnehmer selbstständig vom Bus ab, um den Bus nicht zu stören. In diesem Zustand können keine Nachrichten empfangen oder gesendet werden.

## Loopback-Modus

Normalerweise sendet der CAN-Controller die Nachrichten an den Bus und erwartet eine entsprechende Rückmeldung. Bleibt diese aus, so geht der Controller von einem Fehler aus.

Möchte man nur lokal etwas testen so kann man den *Lookback-Modus* aktivieren. Dieser leitet die zu sendenden Nachrichten direkt wieder an den Controller zurück. Der Controller spricht quasi mit sich selbst, ohne etwas wirklich zu senden.

Aktiviert werden kann der *Loopback-Modus* durch Erweiterung des Befehls um `loopback on`. War das Interface bereits aktiv, so muss es zuvor gestoppt werden.

```sh Interface im Loopback-Modus aktivieren
sudo ip link set can0 down
sudo ip link set can0 up type can bitrate 500000 loopback on
```

In den Details zum Interface ist dies dann auch durch den Zusatz `<LOOPBACK>` deutlich gekennzeichnet:

```sh Details zum Interface bei aktivem Loopback-Modus
pi@raspberrypi:~ $ ip -details -statistics link show can0
3: can0: <NOARP,ECHO> mtu 16 qdisc pfifo_fast state DOWN mode DEFAULT group default qlen 10
    link/can  promiscuity 0  allmulti 0 minmtu 0 maxmtu 0 
    can <LOOPBACK> state STOPPED restart-ms 0 
[...]
```

Wieder deaktivieren lässt sich der *Loopback-Modus* durch `loopback off` am Ende des Befehls.

## Mögliche Leitungslängen

Die maximal mögliche Leitungslänge beim CAN-Bus hängt vor allem von der verwendeten Bitrate ab. Je höher die Bitrate, desto geringer die maximale Leitungslänge.

Selbstverständlich sollten bei größeren Längen immer entsprechend qualitativ hochwertige und geschirmte Kabel verwendet werden.

Die hier angegebenen Längen sind Richtwerte. Die tatsächlich erreichbare Länge hängt von vielen Faktoren ab.

| Bitrate | Leitungslänge |
|---|---|
| 10 {% abbr kb/s %} | 6,7 km |
| 20 {% abbr kb/s %} | 3,3 km |
| 50 {% abbr kb/s %} | 1,0 km |
| 125 {% abbr kb/s %} | 500 m |
| 250 {% abbr kb/s %} | 250 m |
| 500 {% abbr kb/s %} | 125 m |
| 1 {% abbr Mb/s %} | 25 m |

## Andere Hardwarekonfigurationen

Grundsätzlich ist zu beachten, welcher {% abbr GPIO %} und was für ein Quarz von der Hardware verwendet werden. Beides muss entsprechend in der `config.txt` angepasst werden.

Hier noch eine kurze Zusammenstellung der Einträge für andere Hardwarekonfigurationen und kaufbaren Module.

### Waveshare RS485 CAN HAT

Hier gibt es zwei Versionen, die über den aufgelöteten Quarz unterschieden werden können. Die ältere Version vor August 2019 hat einen 8&nbsp;MHz Quarz (Aufschrift 8.000) und die neuere Version einen 12&nbsp;MHz Quarz (Aufschrift 12.000).  
Beide Version nutzen den {% abbr GPIO %} 25 (BCM) als Interrupt.

```ini config.txt Einträge für Waveshare RS485 CAN HAT mit 8 MHz Quarz
dtparam=spi=on
dtoverlay=mcp2515-can0,oscillator=8000000,interrupt=25,spimaxfrequency=1000000
```

```ini config.txt Einträge für Waveshare RS485 CAN HAT mit 12 MHz Quarz
dtparam=spi=on
dtoverlay=mcp2515-can0,oscillator=12000000,interrupt=25,spimaxfrequency=2000000
```

### Zwei CAN-Controller (z.B. PiCAN Duo)

Für die gleichzeitige Nutzung von zwei *MCP2515* CAN-Controllern an einem {% abbr SPI %}-Bus könnten die Einträge in `/boot/config.txt` so aussehen:

```ini config.txt Einträge für zwei CAN-Controller
dtparam=spi=on
dtoverlay=spi0-2cs,cs0_pin=8,cs1_pin=7
dtoverlay=mcp2515-can0,oscillator=8000000,interrupt=25
dtoverlay=mcp2515-can1,oscillator=8000000,interrupt=24
```

Die erzeugt dann die Interfaces `can0` und `can1` im System.  
Die letzte Zeile aktiviert die Unterstützung von zwei {% abbr CS %}-Leitungen für den {% abbr SPI %}-Bus.

## Fehlersuche

Wenn die Datei `/boot/firmware/config.txt` nicht vorhanden ist, dann wird noch die alte Variante `/boot/config.txt` verwendet. Alle Overlay Einstellungen müssen dann dort hinein.

Bei Fehlern hilft oftmals in Blick in das Kernel Log.

```sh Kernel Log nach mcp2515 durchsuchen
sudo dmesg | grep mcp2515
```

Im Idealfall sollte hier `mcp251x spi0.0 can0: MCP2515 successfully initialized` stehen. Andernfalls gibt es Probleme bei der Kommunikation mit dem *MCP2515* CAN-Controller.

Bei älteren Installationen wird teilweise folgende Zeile zusätzlich in der `config.txt` benötigt:

```ini Zusätzlich benötigtes Overlay bei älteren Installationen
dtoverlay=spi-bcm2835-overlay
```

Bei Problemen kann es teilweise helfen die Geschwindigkeit vom {% abbr SPI %}-Bus zu reduzieren, indem dem man bei `dtoverlay=mcp2515-can0,...` am Ende noch `,spimaxfrequency=500000` hinzufügt.

## Weitere Informationen

Hier noch ein paar Links zu Hardware- und Softwarekomponenten von mir zum CAN-Bus:

* [CAN-Shield](/can-shield/) - CAN-Bus Platine mit MCP2515 für Raspberry Pi und Arduino
* [MCP-CAN-Boot](https://github.com/crycode-de/mcp-can-boot) - CAN-Bus Bootloader für AVR Mikrocontroller
* [ioBroker.canbus](https://github.com/crycode-de/ioBroker.canbus) - ioBroker Adapter zur Einbindung vom CAN-Bus
