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

```ts Promise Queue Klasse in TypeScript
/**
 * Interface zur Beschreibung eines eingereihten Promises in der `PromiseQueue`.
 */
interface QueuedPromise<T = any> {
  promise: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

/**
 * Eine einfache Promise Queue, die es ermöglicht mehrere Aufgaben in kontrollierter
 * Reihenfolge abzuarbeiten.
 * 
 * Lizenz: CC BY-NC-SA 4.0
 * (c) Peter Müller <peter@crycode.de> (https://crycode.de/promise-queue-in-typescript)
 */
export class PromiseQueue {

  /**
   * Eingereihte Promises.
   */
  private queue: QueuedPromise[] = [];

  /**
   * Indikator, dass aktuell ein Promise abgearbeitet wird.
   */
  private working: boolean = false;

  /**
   * Ein Promise einreihen.
   * Dies fügt das Promise der Warteschlange hinzu. Wenn die Warteschlange leer
   * ist, dann wird das Promise sofort gestartet.
   * @param promise Funktion, die das Promise zurückgibt.
   * @returns Ein Promise, welches eingelöst (oder zurückgewiesen) wird sobald das eingereihte Promise abgearbeitet ist.
   */
  public enqueue<T = void> (promise: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        promise,
        resolve,
        reject,
      });
      this.dequeue();
    });
  }

  /**
   * Das erste Promise aus der Warteschlange holen und starten, sofern nicht
   * bereits ein Promise aktiv ist.
   * @returns `true` wenn ein Promise aus der Warteschlange gestartet wurde oder `false` wenn bereits ein Promise aktiv oder die Warteschlange leer ist.
   */
  private dequeue (): boolean {
    if (this.working) {
      return false;
    }

    const item = this.queue.shift();
    if (!item) {
      return false;
    }

    try {
      this.working = true;
      item.promise()
        .then((value) => {
          item.resolve(value);
        })
        .catch((err) => {
          item.reject(err);
        })
        .finally(() => {
          this.working = false;
          this.dequeue()
        });

    } catch (err) {
      item.reject(err);
      this.working = false;
      this.dequeue();
    }

    return true;
  }
}
```

In dieser einfachen *Promise Queue* werden die eingereihten Promises in einem Array gespeichert und dann nacheinander einzeln abgearbeitet. Dabei kann beim Einreihen eines Promise jeweils auch auf die fertige Abarbeitung gewartet werden.

```ts Beispiel zur Nutzung in TypeScript
// Instanz erstellen
const queue = new PromiseQueue();

/**
 * Asynchrone Funktion zur Demonstration
 */
async function queueTest () {

  console.log('Enqueue promise 1');
  queue.enqueue(() => new Promise((resolve, reject) => {
    console.log('Promise 1 started');
    setTimeout(resolve, 2000);
  }));

  // Mit Rückgabewert
  console.log('Enqueue promise 2');
  queue.enqueue(() => new Promise((resolve, reject) => {
    console.log('Promise 2 started');
    setTimeout(() => resolve(42), 3000);
  }))
    .then((value) => {
      console.log(`Promise 2 returned ${value}`);
    });

  // Fehler in Promise 3 abfangen und auf Fertigstellung dieses Promises
  // in der Queue warten
  console.log('Enqueue promise 3');
  await queue.enqueue(() => new Promise((resolve, reject) => {
    console.log('Promise 3 started');
    setTimeout(() => reject(new Error('Test')), 1000);
  }))
    .catch((err) => {
      console.log('Catched error from promise 3:', err);
    });

  // Promise 4 wird erst nach Fertigstellung von Promise 3 eingereiht
  // und es wird ebenfalls auf die Fertigstellung gewartet
  console.log('Enqueue promise 4');
  await queue.enqueue(() => new Promise((resolve, reject) => {
    console.log('Promise 4 started');
    setTimeout(resolve, 3000);
  }));

  // Alles erledigt
  console.log('Done');
}

queueTest();
```

Der *Promise Queue* können von beliebigen Stellen im Code Promises hinzugefügt und bei Bedarf auf die fertige Ausführung gewartet werden. Zudem können die Rückgabewerte der einzelnen Promises weiter genutzt werden und es ist möglich auf Fehler entsprechend zu reagieren.

## Lizenz

Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

Copyright (c) 2021-2024 Peter Müller
