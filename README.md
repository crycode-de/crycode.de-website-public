# cryCode.de Webseite

[![Logo](cryCode.svg)](https://crycode.de)

Dieses Repository beinhaltet alle öffentlichen Teile der [cryCode.de Webseite](https://crycode.de).

Zudem sind in den [Diskussionen die Kommentare zu den einzelnen Beiträgen](https://github.com/crycode-de/crycode.de-website-public/discussions/categories/kommentare) auf der Webseite zu finden.

## Etwas beitragen oder ändern

Grundsätzlich steht es jedem frei Änderungswünsche über [Pull-Requests](https://github.com/crycode-de/crycode.de-website-public/pulls) einzubringen.

Ebenso dürfen gerne aufgefallene Fehler oder Probleme über die [Issues](https://github.com/crycode-de/crycode.de-website-public/issues) gemeldet werden.

## Technik

Die cryCode.de Webseite basiert auf [Hexo](https://hexo.io/).

Das Theme wurde von mir eigens angepasst und erweitert.

Der Quellcode für das Theme, sowie einige allgemeine Seiten sind aktuell nicht öffentlich.

Spezielle Front-Matter Optionen und Tags sind weiter unten erklärt.

Gehosted wird die Webseite auf den Servern von [cryHost](https://cryhost.de) in Deutschland.

## Beiträge

Alle Beiträge liegen im Verzeichnis `posts` in Form von Markdown-Dateien.  
Jede Datei ist ein Beitrag, wobei der Dateiname die Beitrags-URL wird, sofern nicht anders im Front-Matter angegeben.

Zusätzliche Dateien zu einem Beitrag, wie beispielsweise Bilder, werden in einem Verzeichnis mit dem Dateinamen der Markdown-Datei (ohne `.md`) am Ende abgelegt. Dies ist das sogenannte Asset-Verzeichnis des Beitrags.

Bilder sollten wenn möglich das `webp`-Format verwenden.

Entwürfe können im Verzeichnis `drafts` erstellt werden.

## Front-Matter

Über den sogenannten Front-Matter werden grundlegende Optionen für den jeweiligen Beitrag gesetzt.

Der Front-Matter befindet sich am Anfang jeder Datei. Er beginnt/endet mit je drei Bindestrichen `---` und ist im `yml`-Format.

### `title`

Der Titel des Beitrags.

```yml
title: Neue Webseite 2024
```

### `slug`

Optional ein vom Dateinamen abweichender Slug (Adressteil) für den Beitrag.

```yml
slug: tolle-seite
```

### `date` / `updated`

Zeitstempel, an dem der Beitrag erstmalig veröffentlicht / zuletzt aktualisiert wurde.

```yml
date: 2022-01-10 12:00:00
updated: 2024-03-31 16:00:00
```

### `banner`

Optional der Dateiname eines Bildes im Asset-Verzeichnis des Beitrags, welches als Beitragsbanner verwendet werden soll.

```yml
banner: banner.webp
```

### `excerpt`

Optional eine manuelle Angabe des Auszugs des Beitrags. Normalerweise wird der Auszug automatisch ermittelt.

`updated` ist optional.

### `author`

Optionale Angaben zum Author des Posts.

```yml
author: Peter Müller

author:
  name: Peter Müller
  link: https://crycode.de
```

### `categories`

Eine oder mehrere Kategorien, denen der Beitrag zugeordnet werden soll.

Gleichwertige Kategorien:

```yml
categories:
  - [Linux]
  - [Netzwerk]
  - [Software]
```

Unterkategorien:

```yml
categories:
  - Linux
  - Netzwerk
  - Software
```

### `tags`

Liste an Tags (Schlagwörtern), die dem Beitrag zugeordnet werden sollen.

```yml
tags:
  - Fehlerbehebung
  - VS Code
```

### `abbr` / `abbr_auto`

`abbr` kann eine Liste von Abkürzungen und deren Bedeutung enthalten, die im Beitrag erläutert werden sollen. Dabei wird Groß- und Kleinschreibung beachtet.

Standardmäßig muss dafür im Text das Tag `{% abbr ABK %}` genutzt werden, wobei `ABK` die zu erläuternde Abkürzung wäre.

Wenn `abbr_auto` auf `true` gesetzt wird, dann werden automatisch alle in `abbr` definierten Abkürzungen im Text mit den Erklärungen versehen.

```yml
abbr:
  DSGVO: Datenschutzgrundverordnung
  HTTPS: HyperText Transfer Protocol Secure
  z.B.: zum Beispiel
  d.h.: das heißt
  D.h.: Das heißt
abbr_auto: true
```

### `sticky`

Einen Beitrag oben anpinnen. Je höher die Zahl ist, desto weiter oben wird der Beitrage bei mehreren angepinnten Posts angezeigt.

```yml
sticky: 10
```

### `comments`

Wenn auf `false` gesetzt, wird die Kommentarfunktion zu diesem Beitrag deaktiviert.

### `dates`

Wenn auf `false` gesetzt, werden keine Datumsangaben zu diesem Beitrag angezeigt.

### `github_edit`

Wenn auf `false` gesetzt, werden die Links zum Ansehen/Bearbeiten dieses Beitrags auf GitHub nicht angezeigt.

### `indexing`

Wenn auf `false` gesetzt, wird dieser Beitrag nicht in die Suchfunktion der Seite aufgenommen.

### `share`

Wenn auf `false` gesetzt, werden die Teilen-Links zu diesem Beitrag deaktiviert.

### `sitemap`

Wenn auf `false` gesetzt, wird der Beitrag nicht in der Sitemap aufgenommen.

### `class`

Name(n) von CSS-Klassen, die dem Artikel hinzugefügt werden sollen.

```yml
class: center
```

## Beitragsinhalt

In den Beiträgen kann [GitHub Flavored Markdown](https://docs.github.com/de/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) (kurz GFM) verwendet werden.  
Ebenso ist die direkte Nutzung von HTML-Code möglich. Markdown sollte aber der Leserlichkeit halber bevorzugt werden.

### Auszug / Mehr lesen

Um den Auszug des Beitrags vom restlichen Beitrag zu trennen, sollte an entsprechender Stelle im Beitrag (nach wenigen Absätzen) der folgende Code eingefügt werden.

```html
<!-- more -->
```

Damit Endet an dieser Stelle der automatisch generierte Auszug des Beitrags und auf den Index-Seiten wird dann der *Mehr lesen* Button angezeigt.

### Inhaltsverzeichnisse

Inhaltsverzeichnisse einer Seite können automatisch über die Verwendeten Überschriften erstellt werden.

Dazu muss der folgende Code an der gewünschten Stelle eingefügt werden:

```html
<!-- toc -->
```

Optional können zudem ein Titel und/oder die enthaltenen Überschriftslevel angegeben werden.

```html
Mit Titel (als h2):
<!-- toc Inhalt -->

Bis einschließlich h3:
<!-- toc 3 -->

Alles h3 bis h6:
<!-- toc 3:6 -->

Mit Titel h2 bis h3:
<!-- toc Inhalt 2:3 -->
```

### Hinweis-/Warnmeldungen

Hinweis- und Warnmeldungen werden wie auf GitHub unterstützt.

```md
> [!NOTE]
> Nützliche Hinweise.

> [!TIP]
> Hilfestellungen oder Tipps.

> [!IMPORTANT]
> Wichtige zu beachtende Informationen.

> [!WARNING]
> Warnungen, die beachtet werden sollten.

> [!CAUTION]
> Auf besonders wichtige Sachen hinweisen.
```

> [!NOTE]
> Nützliche Hinweise.

> [!TIP]
> Hilfestellungen oder Tipps.

> [!IMPORTANT]
> Wichtige zu beachtende Informationen.

> [!WARNING]
> Warnungen, die beachtet werden sollten.

> [!CAUTION]
> Auf besonders wichtige Sachen hinweisen.

### Code-Highlight

Zur Hervorhebung von Code ist die Standard-Markdown-Syntax zu nutzen.

Optional können dabei ein Titel, eine URL und ein Link-Text mit angegeben werden.

Eine Liste der verfügbaren Sprachen ist [hier](https://highlightjs.readthedocs.io/en/latest/supported-languages.html) zu finden.

````md
```[Sprache] [Titel] [URL] [Link-Text]
// code
```
````

Beispiel:

````md
```sh Mein tolles Bash Script
#!/bin/bash
# [...]
```
````

### Nunjucks-Tags

Es können spezielle Nunjucks-Tags genutzt werden, um bestimmte Funktionen einzubinden. Diese werden im folgenden beschrieben.

Allgemeine Beispiele sind [hier](https://hexo.io/docs/tag-plugins) zu finden.

#### `{% abbr ... %}`

Erzeugt einen `abbr`-HTML-Tag um den eingegeben Begriff mit der im Front-Matter zu dem Begriff hinterlegten Erklärung.

Optional kann die Erklärung auch direkt als zweites Argument mit angegeben werden.

```md
{% abbr "VS Code" %}
{% abbr "VS Code" "Visual Studio Code" %}
```

#### `{% img ... %}`

Bindet ein Bild oder andere Medien ein und aktiviert dafür den Lightbox-Effekt (Bild/Galerie größer als Overlay anzeigen).

Das erste Argument ist immer der Pfad zum Bild etc.. Bei relativen Pfaden wird die Datei im Asset-Verzeichnis des Beitrags erwartet.

Als weitere Argumente kann ein Titel für das Bild angegeben werden.

Zusätzliche optionale Argumente sind mit einem Prefix versehen:

* `thumb:...` - Thumbnail Bild, welches direkt im Beitrag eingebunden wird. Bei Angabe von `thumb:` ohne Dateiname wird dem Dateinamen des originalen Bildes vor der Endung `-thumb` hinzugefügt.
* `group:abc` - Gruppenname/Gruppen-ID zur Gruppierung mehrere Bilder in einem Beitrag. (Standardmäßig der Slug des Beitrags.)
* `type:video` - Typ der einzubindenden Medien, wenn es kein Bild ist. (`video`, `iframe`, `ajax`)
* `maxwidth:300px` - Maximale Breite in der Lightbox-Ansicht.
* `autoplay:true` -  Autoplay für Videos aktivieren.
* `left:true`/`right:true` - Im Beitrag nicht zentriert, sondern links/rechts um den Inhalt herum ausrichten.

```md
{% img screenshot.webp Screenshot von irgendetwas %}
{% img screenshot.webp group:gruppe1 right:true Screenshot von irgendetwas %}
```

#### `{% grid ... %}` / `{% endgrid %}`

Ein Grid Layout mit 2 bis 5 Spalten für Bilder, die den `{% img ... %}` Tag verwenden.

Als Argument wird die gewünschte Anzahl an Spalten angegeben.

```md
{% grid 2 %}
{% img bild1.webp Bild 1}
{% img bild2.webp Bild 2}
{% endgrid %}
```

#### `{% codefile ... %}`

Code aus einer Datei des Asset-Verzeichnisses des Beitrags als Codeblock einbinden.

Das erste Argument ist optional die Sprache, die für den Coder verwendet werden soll.  
Das zweit Argument ist der Dateiname. Alle weiteren Argumente werden als Titel genutzt.

```md
{% codefile js script.js Ein tolles Script %}
{% codefile text.log Log-Text %}
```

#### `{% svgicon ... %}`

Ein SVG-Icon einfügen.

Als erstes und einziges Argument muss der Name des Icons angegeben werden.

Alternativ kann auch `<svgicon ... />` verwendet werden, wodurch das Icon beispielsweise auch innerhalb von Tags eingefügt werden kann.

```md
{% svgicon download %}
<svgicon download />
<svgicon github>
```

## Prüfung der Markdown-Dateien

Die Markdown-Dateien können mittels [markdownlint](https://github.com/DavidAnson/markdownlint) automatisch überprüft werden.

Hierzu müssen zuerst die Node.js-Module installiert werden.
Anschließend kann das `lint`-Script aufgerufen werden.

```sh
npm install
npm run lint
```

Erkannte Probleme in Dateien im `drafts`-Verzeichnis werden als Warnung angezeigt.
Probleme in Dateien im `posts`-Verzeichnis werden als Fehler angezeigt und das Script mit Exit-Code 1 beendet.

## Lizenz

[CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/), sofern nicht abweichend in den Beiträgen angegeben.

Copyright (c) 2005-2024 Peter Müller <peter@crycode.de>
