---
title: ioBroker Skripte
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2019-09-19 12:00:00
updated: 2024-04-21 15:54:39
categories:
  - [ioBroker]
  - [HomePi]
tags:
  - ioBroker
  - Skripte
  - JavaScript
  - TypeScript
  - Blockly
---

*ioBroker* bietet die Möglichkeit eigene Skripte auszuführen, welche dann beispielsweise bei der Änderung eines States eine bestimmte Aktion auslösen.

Die eigenen Skripte können dabei in *JavaScript*, *TypeScript*, *Blockly* oder *Rules* erstellt werden.  
Blockly ist dabei sicherlich vor allem für diejenigen unter euch interessant, die bislang über wenig bis gar keine Programmiererfahrung verfügen.  
Über *Rules* ist es zudem möglich sehr einfache Regeln nach dem falls...dann Muster zu erstellten.

<!-- more -->

<!-- toc Inhalt -->

## Adapter Skriptausführung

Als Grundlage muss der Adapter [Skriptausführung (ioBroker.javascript)](https://github.com/ioBroker/ioBroker.javascript) installiert werden. Dies geschieht wie gewohnt über die Administrationsoberfläche von *ioBroker*.

{% grid 2 %}
{% img adapter-javascript-suche.webp thumb: Suche nach dem Skriptausführung Adapter %}
{% img adapter-javascript-installation.webp thumb: Installation vom Skriptausführung Adapter %}
{% endgrid %}

Die Adapterkonfiguration zur Instanz `javascript.0` kann fürs Erste einfach mit den Standardeinstellungen bestätigt werden.

Nach der erfolgreichen Installation des Adapters ist links in der Menüleiste der neue Punkt *Skripte* verfügbar, über den wir zur Verwaltung der Skripte kommen.

{% img iobroker-skripte.webp thumb: Skripte-Menüpunkt in der ioBroker Adminoberfläche %}

## Anlegen eines Skripts

Zum Anlegen eines neuen Skripts klicken wir oben links auf den `+`-Button, woraufhin sich eine Auswahl zwischen *Rules*, *Blockly*, *JavaScript* und *TypeScript* öffnet.

{% grid 3 %}
{% img skripte-auswahl.webp thumb: Auswahl des Typs beim Anlegen eines neuen Skriptes %}
{% img skripte-name-vergeben.webp thumb: Name für das neue Skript %}
{% img skripte-beispiel-1.webp thumb: Beispielskript %}
{% endgrid %}

Ich selbst verwende am liebsten TypeScript, aber letztendlich ist das Geschmackssache. 🙂

## Einfaches Beispielskript

Dieses einfache Beispielskript reagiert auf jede Veränderung des States `0_userdata.0.toggle` und schaltet dann den State von `0_userdata.0.value` entsprechend um. Zudem werden jeweils der alte und neue Wert im Log ausgegeben.

### JavaScript / TypeScript

```js Beispielskript in JavaScript
on({ id: '0_userdata.0.toggle', change:'any'}, async (obj) => {
  const oldState = await getStateAsync('0_userdata.0.value');
  log(`alt: ${oldState.val}`);

  const newVal = !oldState.val;
  log(`neu: ${newVal}`);

  await setStateAsync('0_userdata.0.value', newVal);
});
```

### Blockly

In Blockly wird das Skript durch einfaches Drag&Drop von verschieden Blöcken erstellt, was dann so aussieht:

{% img blockly-beispiel.webp thumb: Blockly Beispiel %}

Dazu der Javascript Code, den *Blockly* daraus erzeugt:

```js Von Blockly erzeugter JavaScript Code
var newVal;

on({ id: [].concat(['0_userdata.0.trigger']), change: 'ne' }, async (obj) => {
  let value = obj.state.val;
  let oldValue = obj.oldState.val;
  console.log(('alt: ' + String(getState('0_userdata.0.value').val)));
  newVal = !getState('0_userdata.0.value').val;
  console.log(('neu: ' + String(newVal)));
  setState('0_userdata.0.value' /* value */, newVal, true);
});
```

### Rules

Bei Nutzung der *Rules* werden einfache *falls...dann* Regeln erstellt indem aus dem linken Menü Blöcke an die entsprechenden Stellen gezogen werden.

{% img rules-beispiel.webp thumb: Rules Beispiel %}

Im Hintergrund wir dann von *Rules* wieder JavaScript Code generiert, der allerdings etwas kryptischer aussieht als bei *Blockly*.

```js Von Rules erzeugter JavaScript Code
let cond0 = false;

on({id: "0_userdata.0.trigger", change: "ne"}, async function (obj) {
  _sendToFrontEnd(1713711075698, {val: obj.state.val, ack: obj.state.ack, valOld: obj.oldState && obj.oldState.val, ackOld: obj.oldState && obj.oldState.ack});

  const _cond = true;

  if (_cond) {
    // set state 0_userdata.0.value to toggle 
    const subActionVar1713711108244 = !(await getStateAsync("0_userdata.0.value")).val;
    _sendToFrontEnd(1713711108244, {val: subActionVar1713711108244, ack: false});
    await setStateAsync("0_userdata.0.value", subActionVar1713711108244, false);
  } else {

  }
});
```

## Nutzung von Node.js Modulen

Zusätzlich zu den Standardfunktionen in den Skripten ist auch möglich nahezu jedes beliebige Node.js Modul von [NPM](https://www.npmjs.com/) zu nutzen.  
Dies macht allerdings nur bei Verwendung von *JavaScript* oder *TypeScript* wirklich Sinn.

Hierfür tragen wir in den Adaptereinstellungen unter *Zusätzliche NPM-Module* ein. Bei Verwendung von TypeScript empfiehlt es sich auch die Module für die *Syntaxhilfe* mit einzutragen, damit man im Editor die korrekten Typen etc. angezeigt bekommt.

{% img adapter-javascript-npm-module.webp thumb: NPM-Module in den Adaptereinstellungen hinzufügen %}

Beim *Speichern und Schließen* startet dann wie gewohnt die Adapterinstanz neu. Die ausgewählten Module werden automatisch installiert und stehen dann in den Skripten zur Verfügung.

```js Beispiel zur Einbindung eine Node.js Moduls
const serialport = require('serialport');
```

## Mehrere Instanzen der Skriptausführung

Wenn man viel mit Skripten arbeitet und auch gerne etwas herumexperimentiert, empfiehlt es sich zwei oder mehr Instanzen des Skriptausführung-Adapters anzulegen.

Der Grund dafür ist recht einfach: Kommt es in einem Skript zu einem unbehandelten Fehler, so kann es durchaus passieren, dass die gesamte Instanz der Skriptausführung inklusive aller Skripte dieser Instanz neu gestartet wird. Dies ist vermutlich selten gewollt.

Daher empfehle ich zumindest zwei Instanzen anzulegen, wobei eine für alle stabil laufenden Skripte ist und die andere zum Testen neuer Skripte und ggf. Skripte, die weniger wichtig sind.

Sobald mindestens zwei Instanzen der Skriptausführung vorhanden sind, lässt sich für jedes Skript über den Stift-Button die zugeordnete Instanz auswählen. Somit ist auch problemlos möglich ein Skript zwischen den Instanzen hin und her zu schieben.

{% img skripte-instanzauswahl.webp thumb: Auswahl der Instanz für ein Skript %}

## Schlusswort

Die Möglichkeit eigene Skripte zu verwenden ist ein sehr mächtiges Werkzeug und eröffnet jede Menge Möglichkeiten.

Alle Funktionen und Optionen der Skripte zu erklären, würde den Rahmen dieses Beitrags deutlich sprengen, weshalb ich abschließend einfach noch auf zwei Links zu dem Thema verweisen möchte.

* [Ausführliche Beschreibung der Funktionen](https://github.com/ioBroker/ioBroker.javascript/blob/master/docs/en/javascript.md) (in Englisch)
* [Beschreibung zu Blockly](https://github.com/ioBroker/ioBroker.javascript/blob/master/docs/de/blockly.md)

Zudem ist bei Fragen oder Probleme immer das offizielle [ioBroker Forum](https://forum.iobroker.net/) ein guten Anlaufpunkt. 😎
