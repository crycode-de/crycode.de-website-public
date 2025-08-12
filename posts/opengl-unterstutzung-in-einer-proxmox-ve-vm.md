---
title: OpenGL-Unterstützung in einer Proxmox VE VM
author:
  name: Peter Müller
  link: https://crycode.de
banner: banner.webp
date: 2025-08-11 20:40:00
updated: 2025-08-12 11:00:00
categories:
  - [Linux]
  - [Software]
tags:
  - GPU
  - OpenGL
  - Proxmox VE
  - Virtuelle Maschine
  - VirGL
  - WebGL
abbr:
  VM: Virtuelle Maschine
---

Manche Anwendungen benötigen OpenGL-Unterstützung, um performant zu laufen. Das ist beispielsweise bei Browser-Spielen in Form von WebGL der Fall. In diesem Artikel wird gezeigt, wie man OpenGL-Unterstützung in einer Proxmox VE {% abbr VM %} einrichtet, ohne echtes GPU-Passthrough zu verwenden. Stattdessen wird die virtuelle GPU *VirGL* verwendet, die OpenGL-Beschleunigung bietet.

Standardmäßig ist in VMs unter Proxmox VE eine OpenGL-Unterstützung nur softwareseitig über `llvmpipe` verfügbar. Das ist für viele Anwendungen zu langsam.

Mit den richtigen Einstellungen für die VM kann in der VM die hardwarebeschleunigtes OpenGL des Host-Systems genutzt werden (sofern der Host eine entsprechende GPU hat).

<!-- more -->

<!-- toc 2 -->

## Vorbereitungen am PVE-Host

Als Grundlage wird hier ein Proxmox VE 9 Host verwendet, der auf Debian 13 (Trixie) basiert. Bei anderen Versionen kann es zu Abweichungen kommen, aber die grundlegenden Schritte sollten ähnlich sein.

Zunächst müssen auf dem Host zwei Pakete installiert werden, die für die OpenGL-Unterstützung in der VM benötigt werden. Andernfalls lässt sich die VM nicht starten:

```sh Pakete auf dem Host installieren
apt install libgl1 libegl1
```

## VM erstellen

Beim Erstellen der VM ist die Auswahl der virtuellen Grafikkarte entscheidend, um OpenGL-Beschleunigung zu aktivieren. Hier muss **VirGL GPU** ausgewählt werden. Das ist die einzige Option, die Hardware-beschleunigtes OpenGL in der VM ermöglicht.
Die anderen Optionen für die VM können auf der Standard-Einstellung belassen werden.

* Grafikkarte: **VirGL GPU**
* Maschinentyp: *i440fx* (*q35* geht auch)
* BIOS: *SeaBIOS* (*OVMF* für UEFI)

Der Rest kann nach Belieben angepasst werden.

## Installation und Anpassung der VM

In der VM installieren wir hier ein Debian 13 (Trixie) mit normalen Parametern und *XFCE* als Desktop-Umgebung.
Andere Linux-Distributionen sollten ähnlich funktionieren.

Nach der Debian-Installation müssen die Pakete `mesa-utils` und `mesa-vulkan-drivers` installiert werden, um OpenGL und Vulkan-Unterstützung zu aktivieren. Diese Pakete sind notwendig, damit die VirGL-Grafikbeschleunigung korrekt funktioniert.

```sh Pakete in der VM installieren
sudo apt install mesa-utils mesa-vulkan-drivers
```

Anschließend können wir testen, ob *VirGL* aktiv ist:

```sh Prüfen, ob VirGL aktiv ist
glxinfo | grep "OpenGL renderer"
OpenGL renderer string: virgl (AMD Radeon Graphics (radeonsi, raven, ACO, DRM 3.61,...))
```

> [!NOTE]
> Hier sollte nun `virgl` stehen und nicht `llvmpipe`.

Damit haben wir nun unter Proxmox die bestmögliche Grafikleistung ohne GPU-Passthrough.

## Remote-Verbindungen zur VM mit Sunshine und Moonlight

> [!IMPORTANT]
> Wichtig ist anzumerken, dass die OpenGL-Beschleunigung nur funktioniert, wenn die aktive Sitzung in der VM mit grafischer Oberfläche direkt auf dem virtuellen Display (*Konsole* in der PVE-Oberfläche) läuft.
> Bei RDP-Verbindungen beispielsweise wird immer `llvmpipe` verwendet und somit keine Hardware-Beschleunigung unterstützt.

Damit der Desktop inkl. OpenGL-Beschleunigung auf anderen Geräten angezeigt werden kann, installieren wir [Sunshine](https://docs.lizardbyte.dev/projects/sunshine/latest/) in der VM und [Moonlight](https://moonlight-stream.org/) auf dem jeweiligen Client.

### Installation von Sunshine in der VM

Da zum aktuellen Zeitpunkt Sunshine noch nicht von Debian Trixie als deb-Paket unterstützt wird, nutzen wir das AppImage.

```sh Sunshine in der VM installieren
cd ~
wget https://github.com/LizardByte/Sunshine/releases/latest/download/sunshine.AppImage
chmod +x sunshine.AppImage
sudo mv sunshine.AppImage /usr/local/bin/sunshine.AppImage
sunshine.AppImage --install
```

Durch den Aufruf von `sunshine.AppImage --install` werden ein paar udev-Regeln angelegt, die für eine korrekte Funktion von Sunshine sinnvoll sind.

Um nun Sunshine zu starten rufen wir einfach `sunshine.AppImage` auf. Das AppImage kann auch in den Autostart gelegt werden, damit es beim Start der VM automatisch gestartet wird (siehe weiter unten).

Sobald Sunshine läuft, kann über die angezeigte URL (`http://localhost:47990`) die Weboberfläche aufgerufen werden, um die Einstellungen vorzunehmen. Das dabei angezeigte Sicherheitsrisiko wegen einem selbstsignierten Zertifikat ist normal und kann ignoriert werden, da Sunshine nur lokal läuft.

Beim ersten Login legen wir einen Benutzernamen und ein Passwort fest, worüber wir uns anschließend in Sunshine einloggen können.

### Installation von Moonlight auf dem Client

Von Moonlight laden wir die passende Version für das jeweilige Betriebssystem direkt aus den offiziellen [Releases](https://github.com/moonlight-stream/moonlight-qt/releases) herunter und installieren dieses wie gewohnt.

Sobald Moonlight gestartet ist und Sunshine in der VM läuft, sollte die VM automatisch in der Liste der verfügbaren Geräte in Moonlight auftauchen.

Bei der ersten Verbindung müssen wir in Sunshine die Verbindung autorisieren. Dazu wird in Moonlight eine vierstellige PIN angezeigt, welche in der Sunshine-Weboberfläche unter dem Menüpunkt *PIN* zusammen mit einem Namen für den Client eingegeben werden muss.
Nach der Autorisierung sollte die Verbindung zur VM hergestellt werden können und die in Sunshine als *Applications* definierten Anwendungen auswählbar sein. Standardmäßig sind dies der Desktop, der Desktop in niedriger Auflösung und Steam.

> [!TIP]
> Eine aktive Verbindung von Moonlight kann mit der Tastenkombination `Strg` + `Alt` + `Shift` + `Q` verlassen werden.

> [!TIP]
> In den Einstellungen von Moonlight können u.a. die Auflösung und die Bildwiederholrate angepasst und auch ein Fenstermodus aktiviert werden.
> Abhängig von der Anwendung, die man nutzen möchte, kann es sinnvoll sein, die Option *Optimiere die Maus für Remotedesktop* zu aktivieren, wodurch sich die Maus einfach zwischen lokalen Anwendungen und der Remote-VM bewegen lässt.

### Autostart von Sunshine in der VM

Damit beim Start der VM Sunshine automatisch gestartet wird und wir uns direkt verbinden können, aktivieren wir zunächst den automatischen Login in der VM.

Da wir *XFCE* zusammen mit *LightDM* nutzen, erstellen wir die Datei `/etc/lightdm/lightdm.conf.d/90-autologin.conf` mit folgendem Inhalt:

```sh
sudo mkdir -p /etc/lightdm/lightdm.conf.d
sudo nano /etc/lightdm/lightdm.conf.d/90-autologin.conf
```

```ini /etc/lightdm/lightdm.conf.d/90-autologin.conf
[Seat:*]
# autologin
autologin-user = username
autologin-user-timeout = 10
# disable screen blanking on login screen
xserver-command=X -s 0 -dpms
```

`username` muss durch den tatsächlichen Benutzernamen ersetzt werden, mit dem der automatische Login erfolgen soll.
Der Timeout von 10 Sekunden sorgt dafür, dass der automatische Login nicht sofort erfolgt, sondern eine kurze Verzögerung hat. Das ist nützlich, falls man sich mal mit einem anderen Nutzer anmelden möchte.

Für den Autostart von Sunshine erstellen wir eine `.desktop`-Datei im Autostart-Verzeichnis des Benutzers:

```sh Sunshine Autostart-Datei erstellen
mkdir -p ~/.config/autostart
cat <<EOF > ~/.config/autostart/sunshine.desktop
[Desktop Entry]
Type=Application
Exec=/usr/local/bin/sunshine.AppImage
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=Sunshine
Comment=Start Sunshine Remote Desktop
EOF
```

> [!NOTE]
> Zusätzlich zum Autologin sollte noch das automatische Ausschalten des Displays deaktiviert werden, damit der virtuelle Bildschirm nicht bei Inaktivität abgeschaltet wird. Dies führt sonst nämlich dazu, dass man in Moonlight später nur einen schwarzen Bildschirm sieht.

Dazu erstellen wir noch eine zweite `.desktop`-Datei, die DPMS (Display Power Management Signaling) und den Bildschirmschoner deaktiviert:

```sh Autostart-Datei für DPMS erstellen
cat <<EOF > ~/.config/autostart/disable-dpms.desktop
[Desktop Entry]
Type=Application
Exec=/usr/bin/xset s off -dpms s noblank
Name=DPMS und Bildschirmschoner deaktivieren
X-GNOME-Autostart-enabled=true
EOF
```

Nach einem Neustart der VM sollte der Benutzer nun direkt (nach 10 Sekunden) angemeldet werden und Sunshine sollte automatisch starten und im Hintergrund laufen.

Ob Sunshine läuft, können wir in einem Terminal mit dem Befehl `ps aux | grep sunshine` überprüfen. Dort sollte eine Zeile mit dem Prozess `sunshine.AppImage` angezeigt werden.

## Einstellungen in Firefox für WebGL-lastige Browseranwendungen

Hier noch ein paar Einstellungen für Firefox, um die Leistung von WebGL-lastigen Anwendungen wie Browser-Games zu verbessern.
Diese Einstellungen können in der Adresszeile von Firefox unter `about:config` vorgenommen werden.

> [!CAUTION]
> Falsche oder fehlerhafte Einstellungen in `about:config` können zu Instabilität oder unerwartetem Verhalten des Browsers führen. Änderungen sollten mit Vorsicht vorgenommen werden.

### WebRender erzwingen

* `gfx.webrender.all` auf `true` setzen

Das sorgt dafür, dass das Rendering direkt auf der GPU über *VirGL* läuft.

### WebGL-Hardwarebeschleunigung einschalten

* `webgl.disabled` auf `false`
* `webgl.force-enabled` auf `true`
* `webgl.msaa-samples` auf `4` (für Kantenglättung)

Spiele sehen damit besser aus und laufen glatter.

## FPS in WebGL-Anwendungen anzeigen

Manchmal möchte man vielleicht die Framerate (FPS) in WebGL-Anwendungen anzeigen, um die Leistung zu überwachen. Dies kann nützlich sein, um zu sehen, ob die OpenGL-Beschleunigung korrekt funktioniert und ob die Leistung ausreichend ist.

Dazu einfach die Browser-Konsole (F12) öffnen und folgenden Code ausführen, um die FPS-Anzeige zu aktivieren:

```js FPS Overlay in einer Webseite hinzufügen
(function(){
  let last = performance.now();
  let frames = 0;
  let fps = 0;
  const div = document.createElement('div');
  Object.assign(div.style, {
    position: 'fixed', top: '5px', right: '5px',
    background: 'rgba(0,0,0,0.7)', color: '#0f0',
    padding: '5px', font: 'bold 14px monospace', zIndex: 99999
  });
  document.body.appendChild(div);
  function loop(){
    frames++;
    const now = performance.now();
    if (now - last >= 1000) {
      fps = frames;
      frames = 0;
      last = now;
      div.textContent = fps + ' FPS';
    }
    requestAnimationFrame(loop);
  }
  loop();
})();
```

Damit sollte in der rechten oberen Ecke der Webseite die aktuelle Framerate angezeigt werden, bis die Seite geschlossen oder neu geladen wird.
