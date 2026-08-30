# IPTBe

Un gestor d'IPTV que corre al teu ordinador. Ordena els canals, pel·lícules i sèries del
teu proveïdor en una interfície navegable, i quan cliques una cosa **l'obre al VLC**.

No hi ha res al núvol: el programa corre a la teva màquina, les teves credencials no
surten d'allà, i quan tanques el navegador el servidor s'atura sol.

---

## Requisits

| Què | Per què | Com comprovar-ho |
|---|---|---|
| **macOS** | El traspàs al VLC fa servir `open -a` i `osascript` | — |
| **Python 3.7 o superior** | Fa córrer el servidor local | `python3 --version` |
| **VLC** a `/Applications` | És qui reprodueix el vídeo | `ls /Applications/VLC.app` |
| Un compte d'IPTV **Xtream Codes** | D'on surten les dades | Vegeu «El teu proveïdor» |

**No cal instal·lar cap paquet.** IPTBe només fa servir la biblioteca estàndard de Python:
res de `pip`, `npm`, entorns virtuals ni fitxers de dependències.

### Si et falta alguna cosa

**Python.** macOS 12 i posteriors ja porten `python3`. Si `python3 --version` et diu que
l'ordre no existeix, instal·la les eines de línia d'ordres d'Apple:

```bash
xcode-select --install
```

**VLC.** Descarrega'l de [videolan.org](https://www.videolan.org/vlc/) i arrossega'l a la
carpeta Aplicacions. Ha de quedar a `/Applications/VLC.app` exactament: si el poses en
una subcarpeta, IPTBe no el trobarà i t'ho dirà en arrencar.

---

## Posar-lo en marxa

1. Descarrega o clona aquest repositori en una carpeta qualsevol.
2. Doble clic a **`iptbe.command`**.
3. S'obre una finestra de Terminal i, tot seguit, el navegador a `http://127.0.0.1:8477/`.
4. El primer cop et demanarà les dades del teu proveïdor.

Si macOS et diu que *«no es pot obrir perquè prové d'un desenvolupador no identificat»*,
fes clic dret sobre el fitxer → **Obrir** → **Obrir**. Només cal el primer cop.

Si prefereixes el terminal:

```bash
python3 server.py
```

### El teu proveïdor

A la primera pantalla has d'omplir tres camps:

- **Servidor** — l'adreça amb el port, per exemple `https://el-teu-servidor.com:8443`
- **Usuari** i **Contrasenya**

Són les mateixes dades que fas servir a l'aplicació del mòbil o de la televisió. Si el que
tens és una URL de llista M3U, les tres dades hi són a dins:

```
https://EL-SERVIDOR:PORT/get.php?username=EL-USUARI&password=LA-CONTRASENYA&type=m3u_plus
```

El botó **Provar connexió** consulta el proveïdor i et diu a l'instant si les dades són
bones, quan et caduca el compte i quantes connexions simultànies tens.

---

## Com aturar-lo

Qualsevol de les tres, totes deixen l'ordinador net:

- El botó **Aturar IPTBe** al menú lateral — tanca el servidor i el VLC a l'instant.
- **Tancar la pestanya** i oblidar-se'n — es tanca sol al cap de 90 segons.
- **Ctrl+C** a la finestra de Terminal.

---

## Què fa

- **TV en directe** amb guia de programació: què fan ara a cada canal, la barra de progrés
  i què ve després. La guia surt del teu proveïdor, no d'una font externa.
- **Esports ara**: a la portada surten els partits que s'estan jugant en aquest moment.
  Si no n'hi ha cap, la secció no apareix.
- **Pel·lícules i sèries** amb caràtula, sinopsi, repartiment, nota i novetats del dia.
  Les sèries surten agrupades per temporada i episodi.
- **Cerca** general i dins de cada secció, insensible a majúscules i accents.
- **Favorits** i seguiment d'episodis vistos, desats al teu ordinador.

---

## Límits que has de conèixer

**No es reprodueix al navegador, i no és un descuit.** Els canals van en MPEG-TS i les
pel·lícules en MKV, formats que cap navegador sap desxifrar. Fer-ho possible exigiria
convertir el vídeo sobre la marxa, amb el consum i el retard que això comporta. Per això
IPTBe passa l'enllaç al VLC, que sí que ho reprodueix nadiu.

**Una connexió alhora.** La majoria de comptes en permeten una de sola. IPTBe tanca el
que estiguis veient abans d'obrir res nou, i la barra inferior t'ensenya sempre què sona.

**La guia depèn del proveïdor.** Alguns canals no n'envien gens. En aquests casos IPTBe
ho diu clarament en comptes d'inventar-se res. En categories com NBA o *Eventos*, on els
canals es diuen `NBA 01`, `NBA 02`…, no hi ha cap dada disponible de què hi fan.

**macOS només.** Obrir el VLC des del navegador fa servir ordres específiques d'Apple.
Portar-ho a Linux o Windows vol dir canviar tres línies de `server.py`, però no està fet.

---

## Les teves dades

| Fitxer | Què conté | Al repositori? |
|---|---|---|
| `.env` | Servidor, usuari i contrasenya | **No.** Ignorat, amb permisos `600` |
| `cache/` | Catàleg, guia, favorits, caràtules | **No.** Es regenera sol |

El catàleg es refresca automàticament un cop al mes i la guia cada mitja hora. El botó
**Actualitzar** de cada secció força una descàrrega nova quan la vulguis.

> **Avís abans de compartir res.** Les URL dels canals contenen el teu usuari i la teva
> contrasenya en clar. Mai enganxis una línia d'una llista M3U ni una captura on es vegi
> una d'aquestes adreces: qui la tingui té la teva subscripció.

---

## Com està fet

```
iptbe.command      llançador de doble clic
server.py          servidor local: proveïdor, memòria cau, traspàs al VLC
app/               interfície (HTML, CSS i JavaScript sense cap framework)
cache/             dades descarregades (generat, ignorat)
```

Uns 1.400 línies en total. Sense build, sense empaquetador, sense dependències: edites un
fitxer, recarregues el navegador i ja ho veus.

IPTBe parla amb el proveïdor pel protocol **Xtream Codes** (`player_api.php` per al
catàleg i `xmltv.php` per a la guia), que és el que fan servir la immensa majoria de
serveis d'IPTV. La memòria cau a disc evita tornar a demanar el que ja s'ha demanat: les
caràtules, per exemple, passen de 85 mil·lisegons a menys d'un.

---

## Si alguna cosa falla

IPTBe distingeix els errors i et diu què fer en cada cas: sense connexió, adreça mal
escrita, credencials rebutjades, proveïdor caigut o massa lent, VLC no instal·lat. Tots
porten un botó per tornar-ho a provar.

Si veus una **barra vermella** dient que IPTBe no respon, la pestanya és d'una arrencada
antiga o has aturat el servidor. Torna a obrir `iptbe.command`.

Si el proveïdor no contesta, no és culpa teva ni de l'app: prova-ho al cap d'una estona.
Pots comprovar si el servei està viu obrint el mateix compte des de l'aplicació del mòbil.

---

## Llicència

Ús personal. IPTBe no proporciona cap contingut: és un client que necessita que ja tinguis
una subscripció a un proveïdor d'IPTV.
