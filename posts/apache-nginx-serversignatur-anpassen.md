---
title: Apache/Nginx Serversignatur anpassen
author:
  name: Peter Müller
  link: https://crycode.de
date: 2014-12-15 12:00:00
updated: 2024-05-03 10:19:18
categories:
  - [Linux]
  - [Server]
tags:
  - Apache2
  - Linux
  - Nginx
  - PHP
  - Server
  - Sicherheit
---

Wer kennt es nicht? Man ruft eine Seite auf, die es nicht (mehr) gibt und erhält eine Fehlermeldung wie zum Beispiel *Not Found*. Zusammen mit dieser Meldung auch gleich noch jede Menge an Informationen über den Webserver sowie die verwendeten Erweiterungen.

{% img not-found-full.webp 404 Meldung eines "gesprächigen" Apache Webservers %}

<!-- more -->

Diese Angaben können für potentielle Angreifer wichtige Informationen sein und auf mögliche Bugs hinweisen. Aus diesem Grund sollte man die Ausgabe des Servers deaktivieren oder zumindest einschränken.

## Apache2 Webserver

Hierfür gibt es zwei Einstellungen in der Konfiguration des *Apache*-Webservers:

* `ServerSignature On | Off` - Bestimmt ob die Serversignatur angezeigt wird.
* `ServerTokens Full | OS | Minimal | Minor | Major | Prod` - Bestimmt die Art der Serversignatur, wobei *Full* die meisten und *Prod* die wenigsten Informationen ausgibt. Es empfiehlt sich die Standardeinstellung *Full* auf *Prod* zu ändern.

Bei Ubuntu Linux sind diese beiden Einstellungen in der Datei `/etc/apache2/conf-available/security.conf` zu finden. Je nach System können sie aber auch in den Dateien `/etc/apache2/conf.d/security`, `/etc/apache2/apache2.conf` oder `/etc/apache2/httpd.conf` enthalten sein.

Nachdem die Konfiguration wunschgemäß angepasst ist, reicht dem Apache ein kurzer `reload` um die Änderungen zu übernehmen: `sudo systemctl reload apache2.service` bzw. `sudo service apache2 reload`

Anschließend sollte die Fehlerseite (bei der Einstellung ServerTokens Prod) nun so aussehen:

{% img not-found-prod.webp 404 Meldung eines "ruhigen" Apache Webservers %}

## Nginx Webserver

Für den *Nginx*-Webserver verhält es sich ähnlich. Hier ist es jedoch nur eine Option:

* `server_tokens on | off` - Aktiviert oder deaktiviert die Ausgabe der Nginx-Version auf Fehlerseiten und im "Server" Header von Antworten. Es empfiehlt sich die Standardeinstellung *on* auf *off* zu ändern.

Diese Einstellung ist auf den meisten Systemen in der Datei `/etc/nginx/nginx.conf` zu finden und muss im Bereich `http { ... }` stehen.

Anschließend reicht ein `reload` vom Nginx: `sudo systemctl reload nginx`

## Der Header X-Powered-By

Der Apache/Nginx sind schon mal ruhig gestellt. Wenn man sich nun aber die HTTP-Header, die der Webserver bei einer PHP-Datei mitliefert, ansieht, dann fällt der Eintrag `X-Powered-By: PHP/x.y.z-...` auf.

Dieser Header wird von PHP selbst eingefügt und kann in der `php.ini` über die Einstellung `expose_php` deaktiviert werden. Je nach System befindet sich die Datei an verschiedenen Orten wie zum Beispiel `/etc/php5/apache2/php.ini` oder `/etc/php.ini`. Bei Verwendung von *ISPConfig* existiert ggf. für jede Webseite eine eigene Datei unter `/var/www/conf/webX/php.ini`.

In der `php.ini` sucht man einfach nach `expose_php On` (was die Standardeinstellung ist) und ersetzt diese Zeile dann durch `expose_php Off`.

Nach einem reload vom Apache/Nginx sollte der Header dann verschwunden sein.
