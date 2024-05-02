---
title: CardDAV in Roundcube Webmail
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2016-05-05 12:00:00
updated: 2024-05-02 18:01:00
categories:
  - [Server]
  - [Webseiten]
tags:
  - CardDAV
  - E-Mail
  - NextCloud
  - Roundcube
  - Server
  - Webseiten
---

[Roundcube Webmail](https://roundcube.net/) bringt von Hause aus ein eigenes Adressbuch mit, in dem man seine Kontakte ablegen kann. Über das Plugin [RCMCardDAV](https://github.com/blind-coder/rcmcarddav) ist es außerdem möglich Adressbücher über *CardDAV* einzubinden und so beispielsweise sein Adressbuch von NextCloud auch in Roundcube zu nutzen.

Diese Anleitung beschreibt die Vorgehensweise bei der Einrichtung des Plugins in Roundcube und geht dabei von einer bereits laufenden aktuellen Roundcube-Version (hier 1.6.6) aus.

## Vorbereitungen

* Wie eigentlich immer: Backup der Dateien und der Datenbank erstellen.
* In Roundcube abmelden, falls man eingeloggt ist. Dies ist wichtig, da es sonst später zu Datenbankfehlern kommt!
* Auf dem Server `curl` und `php-curl` (ggf. z.b. `php8.2-curl` für PHP 8.2) installieren, falls nicht schon vorhanden: `sudo apt install curl php-curl`

## Installation des Plugins

Zuerst wechseln wir in das `plugins`-Verzeichnis von Roundcube, laden das Plugin von GitHub herunter und entpacken es. Im Beispiel ist Roundcube unter `/var/www/roundcube` installiert.

```sh RCMCardDAV Plugin herunterladen und entpacken
cd /var/www/roundcube/plugins
wget https://github.com/blind-coder/rcmcarddav/archive/master.zip
unzip master.zip
mv rcmcarddav-master carddav
rm master.zip
```

Wichtig ist das Verzeichnis des Plugins in `carddav` umzubenennen, da sonst das Plugin nicht richtig funktioniert.

Anschließend wechseln wir in das Verzeichnis des Plugins und installieren die benötigten Abhängigkeiten mit Hilfe von *composer*, was einen Moment dauern kann.

```sh Abhängigkeiten installieren
cd carddav
curl -sS https://getcomposer.org/installer | php
php composer.phar install
```

Sobald dies erledigt ist kopieren wir noch die `config.inc.php.dist` nach `config.inc.php` und bearbeiten diese anschließend.

```sh Konfiguration kopieren und bearbeiten
cp config.inc.php.dist config.inc.php
nano config.inc.php
```

Die einzige Einstellung die wir in der Konfiguration des Plugins ändern bzw. einfügen müssen ist `$prefs['_GLOBAL']['pwstore_scheme'] = 'des_key';`.

> [!IMPORTANT]
> Es dürfen keine `//` am Anfang der Zeile stehen! Standardmäßig werden die CradDAV-Passwörter nur in Base64-Kodierung gespeichert, was recht unsicher ist. Durch die Anpassung auf `des_key` wird der globale `des_key` von Roundcube verwendet um die Passwörter verschlüsselt zu speichern.

Zuletzt aktivieren in der Konfiguration von Roundcube (nicht dem Plugin) noch das Plugin indem wir dem Array `$config['plugins']` den Eintrag `carddav` hinzufügen.

```sh Plugin aktivieren
cd ../../
nano config/config.inc.php
```

Der Eintag könnte dann wie folgt aussehen, wobei hier noch ein anderes Plugin namens *jqueryui* aktiv ist.

```php Beispiel aus der Roundcube Konfiguration
$config['plugins'] = array('jqueryui', 'carddav');
```

## Einrichtung eines CardDAV-Adressbuches in der Weboberfläche

Sobald das Plugin aktiviert ist können wir uns in der Weboberfläche von Roundcube wieder ganz normal anmelden. Bei der ersten Anmeldung werden die vom Plugin benötigten Datenbanktabellen automatisch erstellt.

Unter *Einstellungen*->*Einstellungen*->*CardDAV* können nun für den aktuellen Benutzer beliebige Adressbücher über die entsprechende CardDAV-URL mit den dazugehörigen Logindaten angelegt werden.

Der *Aktualisierungsintervall* gibt dabei an, die oft Roundcube Änderungen vom CardDAV-Server abruft. Nimmt man in Roundcube eine Änderung an den Kontakten vor, so werden diese Änderungen immer *direkt* zum CardDAV-Server übertragen.

Alle angelegten CardDAV-Adressbücher sind dann im ganz normalen Roundcube Adressbuch verfügbar.
