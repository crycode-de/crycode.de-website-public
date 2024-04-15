---
title: Promise Queue in TypeScript
author:
  name: Peter Müller
  link: https://crycode.de
date: 2021-03-18 12:00:00
categories:
  - Node.js
tags:
  - Promise
  - Promise Chain
  - Promise Queue
  - TypeScript
---

Die Verwendung von [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise?retiredLocale=de)s ist inzwischen bei asynchronem TypeScript beziehungsweise JavaScript Code gang und gäbe.

Möchte man nun mehrere Promises nacheinander abarbeiten, so kann man diese einfach Mittels `.then(...)` aneinander hängen und damit eine sogenannte *Promise Chain*, also eine Kette von Promises, erstellen.

<!-- more -->

```ts Promise Chain Beispiel
new Promise((resolve, reject) => {
  // ...
})
.then(() => new Promise((resolve, reject) => {
  // ...
}))
.then(() => new Promise((resolve, reject) => {
  // ...
}))
```

Für einfache Anwendungsfälle, in denen diese Kette erstellt und abgearbeitet wird, ist dies oft auch ausreichend.

Etwas komplizierter wird es aber, wenn wir diese *Promise Chain* zur Laufzeit immer wieder dynamisch erweitern wollen. Der oben genannte Mechanismus funktioniert dann zwar grundlegend noch, jedoch kann es hier aber schnell zu einem **Memory Leak**, also einem immer größer werdenden Bedarf an Arbeitsspeicher, kommen. Der Grund ist relativ einfach: Da die Kette immer nur erweitert, aber nie vollständig erledigt wird, werden alle Referenzen auf die enthaltenen (eigentlich abgearbeiteten) Promises im Speicher gehalten.

Abhilfe schafft hier die Verwendung einer einfachen Warteschlange, auch Queue genannt. In dieser werden die abzuarbeitenden Promises eingereiht und nacheinander abgearbeitet, aber ohne eine quasi endlose Promise Chain zu erzeugen.

Auf [NPM](https://www.npmjs.com/) sind einige solcher Implementierungen als Pakete verfügbar, jedoch ist mit folgendem Code auch eine einfache Implementierung ohne zusätzliche Abhängigkeiten möglich:

{% codefile ts promise-queue.ts Promise Queue Klasse in TypeScript %}

In dieser einfachen *Promise Queue* werden die eingereihten Promises in einem Array gespeichert und dann nacheinander einzeln abgearbeitet. Dabei kann beim Einreihen eines Promise jeweils auch auf die fertige Abarbeitung gewartet werden.

{% codefile ts promise-queue-beispiel.ts Beispiel zur Nutzung in TypeScript %}

Der *Promise Queue* können von beliebigen Stellen im Code Promises hinzugefügt und bei Bedarf auf die fertige Ausführung gewartet werden. Zudem können die Rückgabewerte der einzelnen Promises weiter genutzt werden und es ist möglich auf Fehler entsprechend zu reagieren.

## Lizenz

Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

Copyright (c) 2021-2024 Peter Müller
