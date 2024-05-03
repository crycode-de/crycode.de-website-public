---
title: Cron-Spam aus auth.log fernhalten
author:
  name: Peter Müller
  link: https://crycode.de
date: 2014-12-15 12:00:00
updated: 2024-05-03 12:45:00
categories:
  - Linux
tags:
  - Cron
  - Linux
  - Log
  - logrotate
  - rsyslog
---

Schon bei wenigen Cronjobs, die mehrfach pro Tag ausgeführt werden, wird die Logdatei `auth.log` mit Einträgen wie zum Beispiel den folgenden überflutet:

```plain Logbeispiele
Apr 29 10:21:01 meinserver CRON[19888]: pam_unix(cron:session): session opened for user root by (uid=0)
Apr 29 10:21:01 meinserver CRON[19888]: pam_unix(cron:session): session closed for user root
Apr 29 10:22:01 meinserver CRON[19891]: pam_unix(cron:session): session opened for user root by (uid=0)
Apr 29 10:22:01 meinserver CRON[19891]: pam_unix(cron:session): session closed for user root
```

Dies macht die Logdatei `auth.log` sehr unübersichtlich und es teilweise sogar unmöglich manuell nach bestimmten Vorkommnissen zu Suchen.

Mit Hilfe von *rsyslog*, welches bei Debian (ab Lenny) und Ubuntu standardmäßig zum Einsatz kommt, ist es ohne weiteres möglich die entsprechenden Logeinträge in eine andere Datei umzuleiten. Hierzu erstellen wir im Verzeichnis `/etc/rsyslog.d/` eine neue Datei namens `30-cron.conf` mit folgendem Inhalt:

```sh 30-cron.conf um die Einträge umzuleiten
# Cronjob-Spam umleiten
:msg, contains, "pam_unix(cron:session):" -/var/log/cronauth.log
& stop
```

> [!IMPORTANT]
> Wichtig ist dabei das `& stop` in der letzten Zeile, da sonst die Logeinträge in beiden Dateien ankommen.

> [!NOTE]
> Ältere Versionen des *rsyslog* verwenden hier noch `& ~` anstelle von `& stop`.

Alternativ könnte man auch die Logeinträge komplett verwerfen über folgenden Konfiguration:

```sh 30-cron.conf um die Einträge gar nicht zu loggen
# Cronjob-Spam nicht loggen
:msg, contains, "pam_unix(cron:session):" stop
```

Um die Änderungen zu Übernehmen müssen wir *rsyslog* noch neu starten:

`sudo systemctl restart rsyslog.service` bzw. `sudo /etc/init.d/rsyslog restart`

Jetzt sollten alle neuen Einträge der Conjobs aus der Logdatei `auth.log` verschwunden sein und in der `cronauth.log` auftauchen.

Sollte die Datei `/var/log/cronauth.log` nicht automatisch angelegt werden oder leer bleiben, dann kann diese per Hand angelegt und die Dateirechte entsprechend angepasst werden:

```sh cronauth.log manuell anlegen
sudo touch /var/log/cronauth.log
sudo chown syslog:adm /var/log/cronauth.log
sudo chmod 0640 /var/log/cronauth.log
```

Damit die neue Log-Datei auch beim automatischen *Logrotate* berücksichtigt wird legen wir noch die Datei `/etc/logrotate.d/cronauth` mit folgendem Inhalt an:

```plain &#47;etc/logrotate.d/cronauth
{
  rotate 4
  weekly
  missingok
  notifempty
  compress
  delaycompress
  sharedscripts
  postrotate
    invoke-rc.d rsyslog rotate > /dev/null
  endscript
}
```
