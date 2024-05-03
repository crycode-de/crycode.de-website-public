---
title: X-Programme mit sudo
author:
  name: Peter Müller
  link: https://crycode.de
date: 2014-12-09 12:00:00
updated: 2017-04-17 12:00:00
categories:
  - Linux
tags:
  - Linux
  - Desktop
---

Versucht man ein Programm (z.B. `gedit`) mit grafischer Oberfläche per sudo (eventuell auch noch über eine SSH-Verbindung) zu starten, so erhält man meistens die Fehlermeldung

```sh Versuch gedit mit sudo zu öffnen
benutzer@meinrechner:~$ sudo gedit
X11 connection rejected because of wrong authentication.
Anzeige kann nicht geöffnet werden:
```

<!-- more -->

Dieses Problem lässt sich auf zwei Wege lösen:

## Der Parameter -E

Durch die Verwendung des Parameters `-E` wird die vorhandene Umgebung des Benutzers in die sudo-Session mit übernommen und alles sollte reibungslos laufen.

```sh sudo mit Parameter -E
benutzer@meinrechner:~$ sudo -E gedit
```

Es kann jedoch vorkommen, dass der Benutzer nicht die nötigen Rechte hat die Umgebung zu übernehmen. In diesem Fall sollte aber der folgende Weg funktionieren.

## X-Authentifizierung übernehmen

Über den diesen Weg ist es möglich die X-Authentifizierung mit in die sudo-Session zu übernehmen, sodass alle X-Programme wie gewohnt laufen sollten.

```sh X-Authentifizierung übernehmen
# in eine Root-Shell wechseln
benutzer@meinrechner:~$ sudo su -

# xauth übernehmen
root@meinrechner:~$ su - benutzer -c 'xauth list' | grep `echo $DISPLAY | cut -d ':' -f 2 | cut -d '.' -f 1 | sed -e s/^/:/`  | xargs -n 3 xauth add

# Programm staren
root@meinrechner:~$ gedit
```

Hierbei ist darauf zu achten, dass bei `su - benutzer [...]` der Benutzername des ursprünglichen Benutzers angegeben werden muss.
