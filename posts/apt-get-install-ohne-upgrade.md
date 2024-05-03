---
title: apt-get install ohne upgrade
author:
  name: Peter Müller
  link: https://crycode.de
date: 2014-12-08 12:00:00
updated: 2017-04-16 12:00:00
categories:
  - Linux
tags:
  - apt
  - deb
  - Debian
  - Linux
---

Manchmal kommt es vor, dass man ein neues Paket installieren, aber verfügbare Updates für andere Pakete erst später anwenden möchte.

Normalerweise würden bei Debian bei der Installation über `apt-get install` alle ausstehenden Updates mit installiert werden. Um dies zu vermeiden gibt es den Schalter `--no-upgrade`.

```sh Beispiel
apt-get --no-upgrade install nano
```
