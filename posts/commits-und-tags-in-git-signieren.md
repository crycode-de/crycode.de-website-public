---
title: Commits und Tags in Git signieren
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2024-09-16 11:45:41
categories:
  - [Linux]
  - [Software]
tags:
  - Git
  - Versionierung
  - Signierung
---

Wer mit der Versionierungssoftware [Git](https://git-scm.com/) arbeitet und beispielsweise auf [GitHub](https://github.com/crycode-de) unterwegs ist, hat bestimmt schon mal das grüne Label *verified* bei den Commits, oder auch Tags gesehen.

*TODO: Screenshot*

Damit wird angezeigt, dass der im Commit angegebene Autor auch wirklich derjenige ist, für den er sich ausgibt.  
Theoretisch könnte man nämlich beliebigen Text in das Autor-Feld eines Commits rein schreiben.

<!-- more -->

Für diese Prüfung des Authors ist es nötig die Commits und Tags mit einem GPG (GNU Privacy Guard) Schlüssel zu signieren.
Da das Signieren erfolgt dabei mit einem privaten Schlüssel des Autors. Somit kann zusammen mit dem öffentlichen Teil des Schlüssels die Echtheit bestätigt werden.

## Erzeugen eines GPG-Schlüssels

Bevor ein Schlüssel zur Signierung verwendet werden kann, muss dieser natürlich erstellt werden.

Hierfür prüfen wir zunächst, das GPG in Version 2.1.17 oder höher installiert ist:

```sh GPG Version prüfen
gpg --version
# gpg (GnuPG) 2.4.4
```

Um nun einen neuen Schlüssel zu erzeugen rufen wir `gpg --full-gen-key` auf.  
In den folgenden Abfragen wählen `RSA und RSA`, eine Schlüssellänge von `4096` Bit und eine unbegrenzte Gültigkeit aus.  
Für die *User-ID* werd der eigene Name und die E-Mail Adresse angegeben. Kommentar kann leer bleiben.

```sh Neuen GPG Schlüssel erzeugen
gpg --full-gen-key

gpg (GnuPG) 2.4.4; Copyright (C) 2024 g10 Code GmbH
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Bitte wählen Sie, welche Art von Schlüssel Sie möchten:
   (1) RSA und RSA
   (2) DSA und Elgamal
   (3) DSA (nur signieren)
   (4) RSA (nur signieren)
   (9) ECC (signieren, verschlüsseln) *standard*
  (10) ECC (nur signieren)
  (14) Vorhandener Schlüssel auf der Karte
Ihre Auswahl? 1
RSA-Schlüssel können zwischen 1024 und 4096 Bit lang sein.
Welche Schlüssellänge wünschen Sie? (3072) 4096
Die verlangte Schlüssellänge beträgt 4096 Bit
Bitte wählen Sie, wie lange der Schlüssel gültig bleiben soll.
         0 = Schlüssel verfällt nie
      <n>  = Schlüssel verfällt nach n Tagen
      <n>w = Schlüssel verfällt nach n Wochen
      <n>m = Schlüssel verfällt nach n Monaten
      <n>y = Schlüssel verfällt nach n Jahren
Wie lange bleibt der Schlüssel gültig? (0) 0
Schlüssel verfällt nie
Ist dies richtig? (j/N) j

GnuPG erstellt eine User-ID, um Ihren Schlüssel identifizierbar zu machen.

Ihr Name: Peter Müller
Email-Adresse: peter@crycode.de
Kommentar: 
Sie benutzen den Zeichensatz `utf-8'
Sie haben diese User-ID gewählt:
    "Peter Müller <peter@crycode.de>"

Ändern: (N)ame, (K)ommentar, (E)-Mail oder (F)ertig/(A)bbrechen?
```

Zum Abschluss kontrollieren wir noch mal die Eingaben und bestätigen anschließend mit `F` für *Fertig*.

Anschließend wird nach einem Passwort für den Schlüssel gefragt. Dieses kann frei gewählt werden.

> [!IMPORTANT]
> Dieses Passwort wird später zum Signieren benötigt.

## Private GPG-Schlüssel anzeigen

Zum Anzeigen der vorhandenen privaten GPG-Schlüssel rufen wir folgendes auf:

```sh Private GPG Schlüssel auflisten
gpg --list-secret-keys --keyid-format LONG

/home/peter/.gnupg/pubring.kbx
------------------------------
sec   rsa4096/4919811825B5C8F5 2024-09-16 [SC]
      C988B1713D198CF0AB33BD084919811825B5C8F5
uid              [uneingeschränkt] Peter Müller <peter@crycode.de>
ssb   rsa4096/C66F265B308E84B9 2024-09-16 [E]
```

Unter `sec` ist die ID des Schlüssels zu sehen, hier `4919811825B5C8F5`. Diese benötigen wir im Folgenden.

## Git für die Signierung konfigurieren

Damit Git den Schlüssel zur Signierung nutzt, muss dies entsprechend eingerichtet werden.

Dies ist entweder global (für alle Repositories auf dem System) oder für einzelne Repositories möglich.
Wir nehmen hier die Einstellungen global vor. Für ein einzelnes Repo einfach `--global` weg lassen.

```sh Git für die Signierung konfigurieren
git config --global user.signingkey 4919811825B5C8F5
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```

Damit werden der zu Nutzende Schlüssel über die ID festgelegt und die Signierung für Commits und Tags aktiviert.

Nun sollte bei jeder Erstellung eines Commits oder Tags dieser automatisch signiert werden.

## Git Log mit Signaturen anzeigen

Um sich in `git log` die Signaturen anzeigen zu lassen, nutzen wir den `--show-signature` Parameter:

```sh Git Log mit Signaturen
git log --show-signature


```

> [!NOTE]
> Auf dem System unbekannt Signaturen werden hier dann besonders hervorgehoben.  
> Dies heißt nur, dass die jeweilige Signatur nicht kontrolliert werden konnte, aber nicht zwangsläufig, dass etwas manipuliert wurde.

## Öffentlichen Schlüsselteil auf GitHub hinterlegen

Damit nun auf GitHub die entsprechend signierten Commits auch als *Verified* angezeigt werden, muss im eigenen GitHub Profil noch der öffentliche Schlüsselteil hinterlegt werden.

Dazu lassen wir uns diesen zunächst anzeigen, wobei wir wieder die ID des Schlüssels benötigen:

```sh Öffentlichen Schlüsselteil anzeigen
gpg --armor --export 4919811825B5C8F5

-----BEGIN PGP PUBLIC KEY BLOCK-----

mQINBGboC44BEADrNrYKHAopc394ADmYqv+5uiar0gPxUby8eF+DEBrXHjQc5Yi4
JTKH1vIQl9QkE1f0McSeqBTl3lRfS4haI9pwWcVIQu+7+NlcIpvWqRy14sXrU8fK
[...]
hAjbXe7Y5mZE5ffiRLCCxdjeFXarqqzMXF8rAWXlO2OAFuuTzPF2mxNcDOsQyzo=
=sgtg
-----END PGP PUBLIC KEY BLOCK-----
```

Diesen gesamten Schlüssel inclusive der `-----BEGIN` und `-----END` Zeilen kopieren wir uns.

Auf GitHub gehen wir in die Einstellungen unseres Profils und dort auf [SSH and GPG keys](https://github.com/settings/keys).

Im unteren Abschnitt *GPG Keys* fügen wir dann über den Button *New GPG key* unseren öffentlichen Schlüssel hinzu.  
Als *Title* empfehle ich hier einen aussagekräftigen Titel, über den man später direkt weiß zu welchem Rechner dieser Schlüssel gehört.

Über den Button *Add GPG key* wird der Schlüssel schließlich gespeichert und von nun an kann GitHub darüber verifizieren, dass unsere Commits wirklich von uns stammen. 😎
