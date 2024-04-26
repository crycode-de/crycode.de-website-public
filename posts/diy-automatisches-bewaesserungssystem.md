---
title: DIY Automatisches Bewässerungssystem
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2018-06-02 12:00:00
updated: 2024-04-26 18:00:00
categories:
  - [Elektronik]
  - [Garten]
tags:
  - Arduino
  - DIY
  - Eigenentwicklung
  - Elektronik
  - Heimautomatisierung
  - ioBroker
  - Mikrocontroller
  - Node.js
  - RadioHead
---

Tag für Tag die Pflanzen im heimischen Gewächshaus per Hand gießen? Das muss nicht sein! 😉

Im Folgenden beschreibe ich den Selbstbau eines automatischen Bewässerungssystems auf Basis eines *Arduino Pro Mini*, kapazitiven *Bodenfeuchtigkeitssensoren* und *Magnetventilen*. Als Stromversorgung dienen *Li-Ion Akkus* und eine kleine *Solarzelle*, wodurch das System ohne externe Stromversorgung völlig autark laufen kann.

<!-- more -->

Das Bewässerungssystem misst eigenständig in regelmäßigen Abständen die Bodenfeuchtigkeit und bewässert bei Bedarf den Boden durch das Öffnen von Magnetventilen. Es sind ein bis vier getrennt gesteuerte Kanäle möglich. Zusätzlich können über einen *DHT22* oder *DHT11* Sensor die Temperatur und Luftfeuchtigkeit gemessen werden. Alternativ ist es auch möglich einen *DS18B20* Sensor zur Messung der Temperatur zu verwenden.

Über 433&nbsp;MHz Funk kann das System aus der Ferne konfiguriert und gesteuert werden. Ebenso werden Statusinformationen und Messwerte gesendet. Hierfür kommt das Protokoll [RadioHead](http://www.airspayce.com/mikem/arduino/RadioHead/) zum Einsatz.

<!-- toc Inhalt 2 -->

## Neuerungen in Version 2

Mitte *Mai 2020* ist nun die überarbeitete Version 2 des Bewässerungssystems fertig. Die Änderungen betreffen hauptsächlich die Software des Systems.

* Unterstützung von *DS18B20* , *DS18S20*, *DS1820* und *DS1822* Sensoren zur Temperaturmessung als Alternative zum DHT-Sensor
* Aktives Abfragen der Daten (Polling Modus) und Deaktivierung des automatischen Sendens der Daten sind nun möglich
* Temperaturabhängiger Schalter zur Steuerung von beispielsweise einem Lüfter oder einer Heizung
* Möglichkeit die Messung der Batteriespannung zu deaktivieren, wenn das System mit einer anderen Spannungsversorgung betrieben wird
* Erweiterte Einstellungsmöglichkeiten über die Control-App
* Control-App in Deutsch und Englisch mit Erklärungen für die einzelnen Einstellungen
* Angepasste und erweiterte RadioHead Datenpakete

## Wichtigste Bauteile

* Ein **Arduino Pro Mini** 5&nbsp;V, 16&nbsp;MHz  
  Alternativ kann auch ein anderer Arduino verwendet werden, wobei der Pro Mini jedoch den geringsten Stromverbrauch hat.
* Ein bis vier **kapazitive Bodenfeuchtigkeitssensoren**
* Ein bis vier **12&nbsp;V Magnetventile**
* **Li-Ion/LiPo Akku(s)**  
  Zum Beispiel drei Akkus vom Typ 18650 mit je 2600&nbsp;mAh.
* **Li-Ion/LiPo** Laderegler *TP4056* mit integriertem Schutz vor Tiefentladung
* **5&nbsp;V Solarzelle**
* Zwei einstellbare **DC-Boost-Konverter** (StepUp)  
  Eingestellt auf 5&nbsp;V für die Steuerung beziehungsweise 12&nbsp;V für die Magnetventile.
* **433&nbsp;MHz Funksender und -empfänger**  
  Empfänger vom Typ *Superheterodyne* oder *3400RF* sollten vorzugsweise verwendet werdet werden, da diese eine deutlich höhere Reichweite als die *XY-MK-5V* ermöglichen.
* Gehäuse, Transistoren, Taster, Widerstände, Steckverbinder
* Optional: DHT22, DHT11 oder DS18x20 Sensor

Die Gesamtkosten der Bauteile belaufen sich auf etwa 50 bis 60 Euro.

## Aufbau der Hardware

Die Hardware wird nach folgendem Schema aufgebaut:

{% img schaltplan.webp thumb: Schaltplan %}

{% img steckplatine.webp thumb: Steckplatine %}

Fertig zusammengebaut und in ein kleines Gehäuse gesteckt könnte es dann so aussehen:

{% grid 3 %}
{% img steuerung-1.webp thumb: Das Gehäuse %}
{% img steuerung-2.webp thumb: Vorne %}
{% img steuerung-3.webp thumb: Hinten %}
{% img steuerung-4.webp thumb: Innen %}
{% img ventile.webp thumb: Ventile %}
{% img sensoren.webp thumb: Sensoren %}
{% endgrid %}

### Bodenspieße zur Bewässerung

Damit das Wasser nicht nur oberflächlich auf der Erde verteilt wird, sondern direkt an die Wurzeln der Pflanzen gelangt, habe ich ein 3D-Modell für Bodenspieße entworfen und mit einem 3D-Drucker ausgedruckt.

{% grid 2 %}
{% img bodenspiesse-3d-modell.webp thumb: 3D-Modell %}
{% img bodenspiesse.webp thumb: Ausgedruckte Bodenspieße %}
{% endgrid %}

Oben wird auf beiden Seiten ein 1/2” Schlauch angeschlossen. Durch die Hohlräume im Inneren wird das Wasser bis ca. 10 cm Tiefe direkt in Boden geleitet.

Die Vorlagen für den 3D-Druck habe ich auch auf Thingiverse veröffentlicht: [Watering Spikes](https://www.thingiverse.com/thing:2937504)  
Dort sind auch Versionen mit nur einem Schlauchanschluss oder nur einem Spieß zu finden.

## Software

Heruntergeladen werden kann die Software für den Mikrocontroller (Arduino Pro Mini) sowie die Control-App zur Konfiguration des fertigen Systems direkt aus dem [GitHub Repository](https://github.com/crycode-de/auto-watering-system) als [.zip](https://github.com/crycode-de/auto-watering-system/archive/refs/heads/main.zip) oder [.tar.gz](https://github.com/crycode-de/auto-watering-system/archive/refs/heads/main.tar.gz) Archiv.

Mögliche Anpassungen an die eigene Hardware etc. können in der Datei [src/config.h](https://github.com/crycode-de/auto-watering-system/blob/main/src/config.h) vorgenommen werden.

Einige Variablen können zur Laufzeit über Funk gelesen und angepasst werden. Siehe hierzu den Abschnitt [Konfiguration](#konfiguration) weiter unten. Änderungen an diesen einstellbaren Variablen können im EEPROM des Mikrocontrollers sicher gespeichert werden und werden dann bei einem Neustart wieder geladen.

### Mit PlatformIO (empfohlen)

Die Software für den Mikrocontroller basiert auf [PlatformIO](https://platformio.org/). PlatformIO ist ein Open Source Ecosystem für IoT-Anwendungen mit integrierter Verwaltung von verschiedensten Boards und Libraries. Als IDE kommt [Visual Studio Code](https://code.visualstudio.com/) zum Einsatz.

Beim Build und/oder Upload kümmert sich PlatformIO automatisch um alle benötigten Abhängigkeiten.

### Mit ArduinoIDE

Als Alternative zu PlatformIO kann auch die ArduinoIDE zum Programmieren des Mikrocontrollers genutzt werden.

Hierbei müssen jedoch die folgenden Bibliotheken per Hand zuvor in der ArduinoIDE installiert werden:

* [RadioHead](https://platformio.org/lib/show/124/RadioHead/installation) v1.113
* [DallasTemperature](https://platformio.org/lib/show/54/DallasTemperature/installation) v3.9.1
* [DHTStable](https://platformio.org/lib/show/1337/DHTStable/installation) v1.0.1
* [PinChangeInterrupt](https://platformio.org/lib/show/725/PinChangeInterrupt/installation) v1.2.9

In der ArduinoIDE muss dann die Datei `src/src.ino` geöffnet werden.

### Blink-Codes

Über die LED des Arduinos werden Fehler und Informationen über eine Blinkfolge von kurzen und langen Impulsen dargestellt. Die Bedeutungen der Blink-Codes können der folgenden Tabelle entnommen werden.

| Blink-Code | Bedeutung |
|---|---|
| kurz, kurz, kurz | EEPROM-Reset erfolgreich, Standardeinstellungen geladen |
| lang, kurz, kurz | Fehler bei Initialisierung des 433&nbsp;MHz Funk |
| lang, kurz, lang | Fehler beim Senden einer RadioHead-Nachricht (kein ACK empfangen) |
| lang, lang, kurz | Fehler beim Abfragen des DHT-Sensors |
| sehr kurz, sehr kurz | RadioHead-Nachricht empfangen |

## Interpretation der Messwerte

Die Bodenfeuchtigkeit und die Akkuspannung werden über den 10-Bit Analog-Digital-Converter (ADC) des Mikrocontrollers gelesen. Dabei ergeben sich Messwerte zwischen 0 (0&nbsp;V) und 1023 (5&nbsp;V).

Bei den Bodenfeuchtigkeitssensoren bedeutet ein höherer Messwert einen trockeneren Boden. Bei einem sehr trockenen Boden ergeben sich Werte von etwa 500, bei nassem Boden etwa 300.

Die aktuelle Batteriespannung kann aus dem ADC-Wert mittels `U = adc * 5 / 1023` berechnet werden.

Die Software des Mikrocontrollers berechnet intern direkt einen prozentualen Akkustatus.  
Dabei gilt (bei Standardconfig) `U <= 2,9 V ⇒ 0 %` und `U >= 4,2 V ⇒ 100 %`.

## Konfiguration mit der Control-App

Die gesamte Konfiguration des fertigen Systems ist über die 433&nbsp;MHz Funkverbindung möglich. Hierzu wird lediglich ein Arduino (z.B. Arduino Nano) mit 433&nbsp;MHz Funkmodulen benötigt, auf den der [Serial-Radio-Gateway](/radiohead-serial-radio-gateway/) Sketch aufgespielt wird.

Das Softwarepaket enthält im Verzeichnis `control` eine kleine Anwendung auf Basis von [Node.js](https://nodejs.org/), über die die gesamten Einstellungen komfortabel über einen Webbrowser vorgenommen werden können.

Die Control-App kann auf Windows- und Linux-Systemen verwendet werden.  
Einzige Voraussetzung ist, dass Node.js 16 oder höher installiert ist.

Vor dem ersten Start müssen hierfür die benötigten *Node.js Module* (node_modules) installiert werden, wobei eine Verbindung zum Internet benötigt wird:

```sh Node.js Module installieren
npm install
```

Anschließend kann die Anwendung auch ohne Internetverbindung gestartet werden:

```sh Control-App starten
npm start
```

Nun einfach im Browser die Adresse `http://localhost:3000/` aufrufen, den seriellen Port des Serial-Radio-Gateways auswählen und verbinden.

Die Control-App erkennt automatisch die Sprache des Nutzers über den Browser und stellt sich dementsprechend auf Deutsch oder Englisch ein. Alternativ kann vor dem Verbinden auch die Sprache manuell gewählt werden.

{% grid 2 %}
{% img control-app-1.webp thumb: Verbindungseinstellungen %}
{% img control-app-2.webp thumb: Aktuelle Daten %}
{% endgrid %}

{% img control-app-3.webp thumb: Systemeinstellungen %}

Jeder der vier verfügbaren Kanäle kann einzeln aktiviert oder deaktiviert werden. Zudem können pro Kanal der Triggerwert und die Bewässerungszeit einzeln eingestellt werden. Standardmäßig ist nur der Kanal 0 mit einem Triggerwert von 512 und einer Zeit von 5 Sekunden aktiviert.

Weiterhin können die folgenden Einstellungen einzeln angepasst werden:

* RadioHead Adressen
* Prüfintervall für die Bodenfeuchtigkeit (Standard 5 Minuten)
* Abfrageintervall für den Temperatursensor (Standard 1 Minute)
* Schaltschwelle für den temperaturabhängigen Schalter
* Senden der ADC-Werte
* Automatisches Senden der Daten (Push-Modus)

Eine Beschreibung zu jeder einzelnen Option ist über das blau ℹ️ verfügbar.

Geänderte Einstellungen können in den EEPROM des Mikrocontrollers gespeichert werden, wodurch sie auch bei einem Neustart wieder geladen werden.

Zum Zurücksetzen der gespeicherten Einstellungen muss der EEPROM-Reset-Taster beim Start des Controllers gedrückt gehalten werden, bis die LED drei Mal kurz blinkt.

### Betrieb ohne Zentrale

Für einen Betrieb des Bewässerungssystem ohne Zentrale (Headless Betrieb) sollte in den Einstellungen die Option Automatisches Senden der Daten deaktiviert werden. Andernfalls versucht das System regelmäßig seine aktuellen Daten erfolglos zu senden, wodurch unnötig Energie verbraucht wird und es außerdem zu Problemen mit den Wartezeiten kommen kann.

### Optimale Einstellungen

Die optimalen Einstellungen sind von mehreren Faktoren abhängig und sollten einfach ausprobiert werden.

Bei mir haben sich ein Triggerwert von 350 und eine Bewässerungsdauer von 8 Sekunden als gut herausgestellt.

## RadioHead Datenpakete

Die folgenden Datenpakete werden vom Bewässerungssystem gesendet beziehungsweise empfangen. Das jeweils erste Byte eines Datenpakets kennzeichnet dabei die Art.

Alle automatisch gesendeten Datenpakete werden an die in der Konfiguration hinterlegte Adresse gesendet.

Aktiv angefragte Daten, zum Beispiel durch eine Aktion oder Polling, werden immer an die Adresse des anfragenden gesendet. Somit ist beispielsweise möglich ein Bewässerungssystem, das als Zieladresse `0x01` definiert hat, über die Control-App mit der Adresse `0x02` zu bedienen.

### 0x00 Startmeldung

Dieses Datenpaket wird einmalig beim Start des Mikrocontrollers übertragen.

Es besteht aus nur einem Byte mit dem Wert `0x00`.

### 0x02 Batteriestatus

Dieses Datenpaket besteht aus 4 Byte, beginnend mit dem Code `0x02`, gefolgt vom Batteriestatus in Prozent (0 bis 100) und zwei Byte mit dem reinen ADC-Wert (0 bis 1023).

Beispiel: `0x02 0x4E 0x0F 0x03`

Dies entspricht 78%, einem ADC-Wert von `15 + (3*256) = 783` und umgerechnet `783 * 5V / 1023 = 3,82V` Batteriespannung.

### 0x10 Sensorwerte

Das Datenpaket für die Sensorwerte beinhaltet 9 Byte, beginnend mit dem Code `0x10`. Anschließend folgen die jeweils zwei Byte großen Sensorwerte für Sensor 0 bis 3, wobei es sich um die reinen ADC-Werte handelt. Bei deaktivierten Kanälen sind die beiden Bytes jeweils auf null gesetzt.

Das Datenpaket wird nur gesendet, wenn in der Konfiguration das Senden der ADC-Werte aktiviert ist.

Beispiel: `0x10 0x51 0x01 0xC7 0x02 0x00 0x00 0x00 0x00`

Für Kanal 0 wurde `0x51 0x01` übertragen, was in dezimaler Darstellung 81 und 3 entspricht. Umgerechnet ergibt dies `81 + (1*256) = 337` als ADC-Wert und `337 * 5V / 1023 = 1,647V` als Spannung am Ausgang des Sensors.

### 0x20 Temperatur, Luftfeuchtigkeit und temperaturabhängiger Schalter

Dieses Datenpaket wird nach jeder Messung der Temperatur und gegebenenfalls Luftfeuchtigkeit, sowie der Status des temperaturabhängigen Schalters übertragen.

Bei Verwendung eines DHT-Sensors besteht es aus 10 Byte: `0x20`, gefolgt von 4 Byte Temperatur und 4 Byte Luftfeuchtigkeit, jeweils als Float Zahl im Little-Endian Format und als letztes Byte `0x01` oder `0x00`, welches den Zustand des Schalters anzeigt.

Bei Verwendung eines DS18x20-Sensores besteht das Datenpaket aus nur 6 Byte: `0x20`, gefolgt von 4 Byte Temperatur als Float Zahl im Little-Endian Format und als letztes Byte `0x01` oder `0x00`, welches den Zustand des Schalters anzeigt.

`0x20 t t t t h h h h s` oder `0x20 t t t t s`

Beispiel DHT: `0x20 0xcd 0xcc 0xd0 0x41 0xcd 0xcc 0x4e 0x42 0x00`

Dies entspricht 26,1 °C, 51,7 % Luftfeuchtigkeit und einem nicht aktiven Schalter.

Beispiel DS18x20: `0x20 0xcd 0xcc 0xd0 0x41 0x01`

Dies entspricht 26,1 °C und einem aktiven Schalter.

### 0x21 Kanal ein / 0x22 Kanal aus

Bei jedem Ein- und Ausschalten (öffnen bzw. schließen des Ventils) wird für den entsprechenden Kanal dieses Datenpaket bestehend aus zwei Byte gesendet.

Beispiel: `0x21 0x00` Kanal 0 eingeschaltet; `0x22 0x01` Kanal 1 ausgeschaltet

### 0x25 Status der Kanäle

Bei jedem Ein- und Ausschalten (öffnen bzw. schließen des Ventils) wird dieses Datenpaket bestehend aus fünf Byte mit dem Status der Kanäle gesendet.

Das erste Byte ist dabei immer `0x25` und anschließend folgen die Kanäle 0 bis 3 mit jeweils einem Byte. Status `0x00` steht dabei für ausgeschaltet (geschlossen) und `0x01` für eingeschaltet (geöffnet).

Beispiel: `0x25 0x01 0x00 0x00 0x00 0x00`

Hierbei ist Kanal 0 eingeschaltet und Kanal 1 bis 3 sind ausgeschaltet.

### 0x50 Einstellungen

Dieses Datenpaket beinhaltet die aktuell auf dem System gesetzten Einstellungen. Es besteht aus insgesamt 28 Byte, beginnend mit `0x50`.

Das zweite Byte beinhaltet die aktivierten Kanäle in den Bits 0 bis 3. Bit 5 enthält ob der temperaturabhängige Schalter invertiert wird, Bit 6 ob das Pushen von Daten aktiviert ist und Bit 7 ob die ADC-Sensorwerte gesendet werden sollen.

Die Bytes drei bis zehn beinhalten die Triggerwerte der Kanäle 0 bis 3 mit jeweils zwei Byte als `uint16_t`.

Die Bytes 11 bis 18 beinhalten die Bewässerungszeit der Kanäle 0 bis 3 mit jeweils zwei Byte als `uint16_t`.

In Byte 19 und 20 ist das Intervall zum Prüfen der Bodenfeuchtigkeit als `uint16_t` enthalten.

Bytes 21 und 22 beinhalten das Intervall zur Abfrage des DHT- beziehungsweise DS18x20-Sensors als `uint16_t`.

Byte 23 ist die RadioHead Serveradresse und Byte 24 die RadioHead Adresse des Bewässerungssystems, jeweils als `uint8_t`.

Die Bytes 25 und 26 beinhalten die die Wartezeit nach dem Senden jeder RadioHead Nachricht als `uint16_t`.

Byte 27 ist der Schwellwert für den temperaturabhängigen Schalter als `int8_t` und Byte 28 die zugehörige Hysterese in Zehnteln als `uint8_t`.

Beispiel: `0x50 0xC1 0x00 0x02 0x00 0x02 0x00 0x02 0x00 0x02 0x05 0x00 0x05 0x00 0x05 0x00 0x05 0x00 0x2C 0x01 0x3C 0x00 0x02 0xDC 0x0A 0x00 0x1E 0x14`

### 0x51 Einstellungen lesen

Damit das Bewässerungssystem seine aktuellen Einstellungen sendet, muss ihm dieses Datenpaket von nur einem Byte mit dem Code `0x51` geschickt werden. Das System sendet daraufhin seine aktuellen Einstellungen.

### 0x52 Einstellungen setzen

Über dieses Datenpaket mit einer Länge von 28 Byte werden neue Einstellungen an das Bewässerungssystem gesendet. Der Aufbau des Datenpaketes ist identisch mit *0x50 Einstellungen*, jedoch beginnt es mit dem Code `0x52`.

Die neuen Einstellungen werden auf dem System sofort aktiv, jedoch noch *nicht* im EEPROM gespeichert. Somit sind beispielsweise nach einem Reset wieder die alten Einstellungen aktiv.

Beispiel: `0x52 0xC1 0x00 0x02 0x00 0x02 0x00 0x02 0x00 0x02 0x05 0x00 0x05 0x00 0x05 0x00 0x05 0x00 0x2C 0x01 0x3C 0x00 0x02 0xDC 0x0A 0x00 0x1E 0x14`

### 0x53 Einstellungen in den EEPROM speichern

Um die aktuellen Einstellungen des Bewässerungssystems in den EEPROM zu speichern, sodass diese auch nach einem Reset erhalten bleiben, muss dem System dieses Datenpaket von nur einem Byte mit dem Code `0x53` geschickt werden. Das System schreibt daraufhin seine aktuellen Einstellungen in seinen EEPROM.

### 0x60 Jetzt Prüfen

Durch ein Senden dieses Datenpaketes mit dem einen Byte `0x60` kann man das Bewässerungssystem dazu veranlassen sofort die Sensoren abzufragen und gegebenenfalls die nötigen Ventile zu öffnen. Dabei beginnt die Wartezeit bis zur nächsten automatischen Prüfung erneut zu zählen.

### 0x66 Daten holen (Polling)

Zum Abfragen der aktuellen Daten ohne eine erneutes Abfragen der Sensoren auszulösen kann dem Bewässerungssystem dieses Datenpakete mit dem einen Byte `0x66` gesendet werden.

Das System sendet daraufhin alle aktuellen Daten.

### 0x65 Kanäle ein- und ausschalten

Durch Senden dieses fünf Byte großen Datenpakets kann man das Bewässerungssystem dazu veranlassen unabhängig von der Automatik einen oder mehrere Kanäle einzuschalten (Ventil öffnen) beziehungsweise auszuschalten (Ventil schließen). Wird ein Kanal eingeschaltet, dann wird er automatisch nach seiner eingestellten Zeit auch wieder ausgeschaltet.

Das erste Byte ist immer `0x65`, gefolgt von je einem Byte pro Kanal für die Kanäle 0 bis 3. Zum Einschalten eines Kanals muss das entsprechende Byte auf `0x01` und zum Ausschalten auf `0x00` gesetzt werden. Andere Werte werden ignoriert, wodurch es möglich ist, beispielsweise den Status eines Kanals zu verändern, aber die anderen in ihrem aktuellen Status zu belassen.

Beispiel: `0x65 0x01 0x00 0x00 0x00` Kanal 0 einschalten, 1-3 ausschalten; `0x67 0xFF 0x00 0xFF 0xFF` Kanal 1 ausschalten, alle anderen nicht ändern

### 0x63, 0x64, 0x67 Pause und Fortsetzen

Zur Vermeidung von beispielsweise Ruhestörungen durch eine in der Nacht anspringende Pumpe, kann die Automatik des Bewässerungssystems über diese Datenpakete in einen Pause-Modus versetzt werden. Während der Pause werden die Bodenfeuchtigkeitssensoren nicht abgefragt. Sonstige Funktionen, wie beispielsweise die Temperaturmessung oder manuelle Bedienung bleiben weiterhin aktiv.

Bei beiden jeweils ein Byte großen Befehle `0x63` und `0x64` aktivieren beziehungsweise deaktivieren die Pause.

Der zwei Byte große Befehl `0x67` gefolgt von `0x01` oder `0x00` aktiviert oder deaktiviert die Pause, je nach zweitem Byte.

Beispiel: `0x63` Pause aktivieren; `0x64` Pause deaktivieren; `0x67 0x01` Pause aktivieren; `0x67 0x00` Pause deaktivieren

### 0x68 Temperaturabhängigen Schalter manuell schalten

Über diesen zwei Byte großen Befehl kann der temperaturabhängige Schalter auch manuell geschaltet werden.

Das erste Byte ist immer `0x68` gefolgt von `0x01` zum Einschalten oder `0x00` zum Ausschalten.

Beispiel: `0x68 0x01` einschalten; `0x68 0x00` ausschalten

### 0xF0 Version abrufen

Zum Abfragen der Softwareversion des Bewässerungssystems kann dem System dieses Datenpaket mit dem einen Byte `0xF0` gesendet werden. Das System sendet daraufhin seine Softwareversion.

### 0xF1 Version

Dieses Datenpaket beinhaltet die Softwareversion des Bewässerungssystems. Es besteht aus vier Byte, wobei das erste Byte der Code `0xF1` ist. Die Bytes zwei bis vier entsprechen in der Reihenfolge Major-, Minor- und Patch-Version.

Beispiel: `0xF1 0x02 0x03 0x00`

Dies entspricht der Version 2.3.0 auf dem Bewässerungssystem.

### 0xF2 Ping

Über dieses Datenpaket kann ein Ping an das Bewässerungssystem gesendet werden. Es besteht aus mindestens einem Byte, beginnend mit dem Code `0xF2`.

Auf einen Ping antwortet das System mit einem Pong.

Optional können dem Ping bis zu 27 Byte zusätzliche Daten mitgegeben werden. Diese Daten werden eins zu eins dem Pong angehängt.

Beispiel: `0xF2 0x13 0x37`

### 0xF3 Pong

Dieses Datenpaket ist die Antwort auf einen Ping. Es besteht aus mindestens einem Byte, beginnend mit dem Code `0xF3`.

Ein Pong hat immer dieselbe Länge wie der auslösende Ping. Die zusätzlichen Daten sind ebenfalls mit dem Ping identisch. Damit kann geprüft werden, ob zu einem Ping der richtige Pong empfangen wurde.

Beispiel: `0xF3 0x13 0x37`

## Das fertig installierte Bewässerungssystem

Das fertige Bewässerungssystem läuft nun völlig autark (bis auf die Wasserzuleitung) bei uns Zuhause im kleinen Gewächshaus im Garten.

Nach der anfänglichen Testphase, in der noch die passenden Triggerwerte ausgetestet werden mussten sind und die Tomaten- und Paprikapflanzen immer bestens versorgt. 🙂

{% grid 2 %}
{% img bewaesserungssystem.webp thumb: Bewässerungssystem in Gewächshaus %}
{% img bewaesserungssystem-steuerung.webp thumb: Solarzelle und Steuerung %}
{% img bewaesserungssystem-ventile.webp thumb: Ventile %}
{% img bewaesserungssystem-bodenspiesse.webp thumb: Bodenspieße %}
{% img bewaesserungssystem-sensor-und-bodenspiesse.webp thumb: Sensor und Bodenspieße im Boden %}
{% img bewaesserungssystem-sensor.webp thumb: Bodensensor wasserfest in Schrumpfschlauch %}
{% endgrid %}

## Einbindung in ioBroker

In die Smarthome Software [ioBroker](https://www.iobroker.net/) kann das Bewässerungssystem mit Hilfe meines Adapters [ioBroker.radiohead](https://github.com/crycode-de/ioBroker.radiohead) eingebunden werden.

Hardwareseitig wird hier wieder ein Arduino mit angeschlossenen 433&nbsp;MHz Funkmodulen und dem [Serial-Radio-Gateway](/radiohead-serial-radio-gateway/) Sketch benötigt.

In der Adapterkonfiguration in ioBroker können dann die einzelnen Datenpakete entsprechend eingetragen werden. Zur Erfassung der Batteriespannung in Volt kann der übertragene ADC-Wert mit dem Faktor `0.0048875855` verwendet werden.

{% grid 2 %}
{% img iobroker-radiohead-1.webp thumb: Eingehende Daten in ioBroker %}
{% img iobroker-radiohead-2.webp thumb: Ausgehende Daten in ioBroker %}
{% endgrid %}

{% img iobroker-radiohead-3.webp thumb: Objekte des Bewässerungssystems in ioBroker %}

## Nachbauten

Hier noch ein Foto vom Nachbau von *Kai Schillak* für vier Kanäle:

{% img nachbau-ks.webp thumb: Nachbau von Kai Schillak %}

Wer mag kann mir gerne Fotos von seinem Aufbau zukommen lassen, um diese dann hier zu ergänzen. 🙂

## Schlusswort

Auch nach inzwischen über 5 Jahren läuft das System bei mir noch immer sehr gut und versorgt Jahr für Jahr die Pflanzen in unserem Gewächshaus.
Lediglich die Bodenspieße musste ich bislang ein Mal austauschen, da diese abgebrochen waren.

Als ich dieses Projekt 2018 gestartet und veröffentlicht habe, hätte ich nie damit gerechnet dazu eine so positive Resonanz von vielen Nutzern zu bekommen.

Über die Jahre hinweg lässt sich immer wieder beobachten, dass zum Frühling hin das Interesse an meinem Bewässerungssystem steigt und es gibt immer wieder Rückfragen und auch teils Ideen für Verbesserungen.

**Vielen Dank dafür!**

## Lizenz

Lizenziert als Open Source unter [GPL Version 2](http://www.gnu.de/documents/gpl-2.0.de.html)

Copyright (c) 2018-2024 Peter Müller <peter@crycode.de>
