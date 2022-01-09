// Fahrbahnversuch zum 2. Newtonschen Gesetz
// Java-Applet (23.12.1997) umgewandelt
// 20.09.2016 - 17.12.2018

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// ****************************************************************************

// Sprachabh�ngige Texte sind einer eigenen Datei (zum Beispiel newtonlaw2_de.js) abgespeichert.

// Farben:

var colorBackground = "#FFFFFF";                           // Hintergrundfarbe
var colorTrack = "#ffc040";                                // Farbe f�r Fahrbahn
var colorStop = "#ED553B";                                 // Farbe f�r Prellbock
var colorGlider = "#20639B";                               // Farbe f�r Gleiter
var colorScale1 = "#000000";                               // Farbe 1 f�r Lineal
var colorScale2 = "#F6D55C";                               // Farbe 2 f�r Lineal
var colorLB = "#000000";                                   // Farbe f�r Lichtschranke
var colorClock1 = "#173F5F";                               // Farbe f�r Uhr (Geh�use)
var colorClock2 = "#000000";                               // Farbe f�r Uhr (Anzeige)
var colorClock3 = "#ffffff";                               // Farbe f�r Uhr (Ziffern)

// Sonstige Konstanten:

var G = 9.81;                                              // Fallbeschleunigung (m/s�)
var DEG = Math.PI/180;                                     // Grad (Bogenma�)
var FONT1 = "normal normal bold 12px sans-serif";          // Normaler Zeichensatz
var FONT2 = "normal normal bold 16px monospace";           // Zeichensatz f�r Digitaluhr
var X0 = 50;                                               // Startposition (Pixel)
var LENGTH = 200;                                          // Maximale Messstrecke (1 m in Pixel)
var PIX_T = 20;                                            // Umrechnungsfaktor (Pixel pro s)

// Attribute:

var canvas, ctx;                                           // Zeichenfl�che, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfl�che (Pixel)
var bu1, bu2, bu3;                                         // Schaltkn�pfe
var ip1, ip2, ip3;                                         // Eingabefelder
var ta;                                                    // Textbereich

var on;                                                    // Flag f�r Bewegung
var t0;                                                    // Bezugszeitpunkt
var t;                                                     // Zeitvariable (s)
var timer;                                                 // Timer f�r Animation

var drag;                                                  // Flag f�r Zugmodus
var state;                                                 // Zustand (0 ... vor dem Start, 1 ... Start bis Lichtschranke,
                                                           // 2 ... Lichtschranke bis Prellbock oder 3 ... am Prellbock)
var diagr;                                                 // Flag f�r Zeit-Weg-Diagramm
var m1;                                                    // Masse des Gleiters (kg)
var m2;                                                    // Masse des W�gest�cks (kg)
var my;                                                    // Reibungszahl
var a;                                                     // Beschleunigung (m/s�)
var ls;                                                    // Position der Lichtschranke (Pixel)
var xLB;                                                   // Messstrecke (m)
var tLB;                                                   // Zeit f�r Messstrecke (s)
var x;                                                     // Aktuelle Position (m)
var list;                                                  // Liste der Messstrecken

// Element der Schaltfl�che (aus HTML-Datei):
// id ..... ID im HTML-Befehl
// text ... Text (optional)

function getElement (id, text) {
  var e = document.getElementById(id);                     // Element
  if (text) e.innerHTML = text;                            // Text festlegen, falls definiert
  return e;                                                // R�ckgabewert
  }

// Start:

function start () {
  canvas = getElement("cv");                               // Zeichenfl�che
  width = canvas.width; height = canvas.height;            // Abmessungen (Pixel)
  ctx = canvas.getContext("2d");                           // Grafikkontext
  bu1 = getElement("bu1",text01);                          // Schaltknopf (Ergebnisse l�schen)
  bu1.disabled = false;                                    // Schaltknopf zun�chst aktiviert
  bu2 = getElement("bu2",text02[0]);                       // Schaltknopf (Start/Registrieren)
  bu2.disabled = false;                                    // Schaltknopf zun�chst aktiviert
  bu3 = getElement("bu3",text03);                          // Schaltknopf (Diagramm)
  bu3.disabled = true;                                     // Schaltknopf zun�chst deaktiviert
  getElement("ip1a",text04);                               // Erkl�render Text (Masse des Gleiters)
  getElement("ip1b",symbolMass1+" = ");                    // Symbol (Masse des Gleiters) und Gleichheitszeichen
  ip1 = getElement("ip1c");                                // Eingabefeld (Masse des Gleiters)
  getElement("ip1d",gram);                                 // Einheit (Masse des Gleiters)
  getElement("ip2a",text05);                               // Erkl�render Text (Masse des W�gest�cks)
  getElement("ip2b",symbolMass2+" = ");                    // Symbol (Masse des W�gest�cks) und Gleichheitszeichen
  ip2 = getElement("ip2c");                                // Eingabefeld (Masse des W�gest�cks)
  getElement("ip2d",gram);                                 // Einheit (Masse des W�gest�cks)
  getElement("ip3a",text06);                               // Erkl�render Text (Reibungszahl)
  getElement("ip3b",symbolCoefficientFriction+" = ");      // Symbol (Reibungszahl) und Gleichheitszeichen
  ip3 = getElement("ip3c");                                // Eingabefeld (Reibungszahl)
  getElement("lbM",text07);                                // Erkl�render Text (Messwerte)
  ta = getElement("ta");                                   // Textbereich (Messwerte)
  ta.readOnly = true;                                      // Textbereich nur zum Lesen
  getElement("author",author);                             // Autor (und �bersetzer)

  m1 = 0.1;                                                // Masse des Gleiters (kg)
  m2 = 0.001;                                              // Masse des W�gest�cks (kg)
  my = 0;                                                  // Reibungszahl
  updateInput();                                           // Eingabefelder aktualisieren (Defaultwerte)
  enableInput(true);                                       // Eingabe zun�chst m�glich
  drag = false;                                            // Zugmodus zun�chst deaktiviert
  newSeries();                                             // Neue Messreihe (Berechnungen)
  paint();                                                 // Zeichnen
  bu1.onclick = reactionButton1;                           // Reaktion auf Schaltknopf 1 (Messreihe l�schen)
  bu2.onclick = reactionButton2;                           // Reaktion auf Schaltknopf 2 (Start/Registrieren)
  bu3.onclick = reactionButton3;                           // Reaktion auf Schaltknopf 3 (Diagramm)
  ip1.onkeydown = reactionEnter;                           // Reaktion auf Entertaste (Masse des Gleiters)
  ip2.onkeydown = reactionEnter;                           // Reaktion auf Entertaste (beschleunigende Masse)
  ip3.onkeydown = reactionEnter;                           // Reaktion auf Entertaste (Reibungszahl)
  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Dr�cken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Ber�hrung
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Ber�hrung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers
  } // Ende der Methode start

// Aktivierung bzw. Deaktivierung der Eingabefelder:
// p ... Flag f�r m�gliche Eingabe

function enableInput (p) {
  ip1.readOnly = !p;                                       // Eingabefeld f�r Masse des Gleiters
  ip2.readOnly = !p;                                       // Eingabefeld f�r beschleunigende Masse
  ip3.readOnly = !p;                                       // Eingabefeld f�r Reibungszahl
  }

// Reaktion auf Schaltknopf 1 (Messreihe l�schen):
// Seiteneffekt on, timer, list, state, diagr, t, ls, m1, m2, my, a, xLB, tLB, t0, x
// Wirkung auf Schaltfl�che

function reactionButton1 () {
  bu2.disabled = false;                                    // Startknopf aktivieren
  bu3.disabled = true;                                     // Schaltknopf 3 (Diagramm) deaktivieren
  enableInput(true);                                       // Eingabefelder aktivieren
  stopAnimation();                                         // Animation abschalten
  newSeries();                                             // Neue Messreihe
  reaction();                                              // Eingegebene Werte �bernehmen und rechnen
  paint();                                                 // Neu zeichnen
  }

// Reaktion auf Schaltknopf 2 (Start/Registrieren):
// Seiteneffekt state, on, timer, t0, t, list, ta, x
// Wirkung auf Schaltfl�che

function reactionButton2 () {
  reaction();                                              // Eingabe �bernehmen und rechnen
  if (state == 0) {                                        // Falls bisher Zustand vor dem Start ...
    enableInput(false);                                    // Eingabefelder deaktivieren
    state = 1;                                             // Zustand zwischen Start und Lichtschranke
    bu2.disabled = true;                                   // Startknopf deaktivieren
    startAnimation();                                      // Animation starten
    }
  if (state >= 2) {                                        // Falls bisher Zustand nach Lichtschranke ...
    updateList();                                          // Liste der Messstrecken und Textbereich aktualisieren
    if (list.length > 2) bu3.disabled = false;             // Falls gen�gend viele Messungen, Diagramm-Schaltknopf aktivieren
    state = 0;                                             // Neuer Zustand: vor dem Start
    bu2.innerHTML = text02[0];                             // Text f�r Schaltknopf: Start
    stopAnimation();                                       // Animation stoppen
    t = 0;                                                 // Zeitvariable zur�cksetzen
    paint();                                               // Neu zeichnen
    }
  }

// Reaktion auf Schaltknopf 3 (Diagramm):
// Seiteneffekt diagr, t, t0, state, x

function reactionButton3 () {
  diagr = true;                                            // Flag f�r Diagramm setzen
  if (!on) paint();                                        // Falls Animation abgeschaltet, neu zeichnen
  }

// Hilfsroutine: Eingabe �bernehmen und rechnen
// Seiteneffekt m1, m2, my, a, xLB, tLB

function reaction () {
  input();                                                 // Eingegebene Werte �bernehmen (eventuell korrigiert)
  calculation();                                           // Berechnungen
  }

// Reaktion auf Tastendruck (nur auf Enter-Taste):
// Seiteneffekt m1, m2, my, a, xLB, tLB, t, t0, state, x

function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten �bernehmen und rechnen
  paint();                                                 // Neu zeichnen
  }

// Reaktion auf Dr�cken der Maustaste:
// Seiteneffekt drag

function reactionMouseDown (e) {
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen
  }

// Reaktion auf Ber�hrung:
// Seiteneffekt drag

function reactionTouchStart (e) {
  var obj = e.changedTouches[0];                           // Liste der Ber�hrpunkte
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen
  if (drag) e.preventDefault();                            // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }

// Reaktion auf Loslassen der Maustaste:

function reactionMouseUp (e) {
  reactionUp();                                            // Hilfsroutine aufrufen
  }

// Reaktion auf Ende der Ber�hrung:

function reactionTouchEnd (e) {
  reactionUp();                                            // Hilfsroutine aufrufen
  }

// Reaktion auf Bewegen der Maus:

function reactionMouseMove (e) {
  if (!drag) return;                                       // Abbrechen, falls Zugmodus nicht aktiviert
  reactionMove(e.clientX,e.clientY);                       // Position ermitteln, rechnen und neu zeichnen
  }

// Reaktion auf Bewegung des Fingers:

function reactionTouchMove (e) {
  if (!drag) return;                                       // Abbrechen, falls Zugmodus nicht aktiviert
  var obj = e.changedTouches[0];                           // Liste der neuen Fingerpositionen
  reactionMove(obj.clientX,obj.clientY);                   // Position ermitteln, rechnen und neu zeichnen
  e.preventDefault();                                      // Standardverhalten verhindern
  }

// Hilfsroutine: Reaktion auf Mausklick oder Ber�hren mit dem Finger (Auswahl):
// u, v ... Bildschirmkoordinaten bez�glich Viewport
// Seiteneffekt drag

function reactionDown (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfl�che bez�glich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bez�glich Zeichenfl�che (Pixel)
  var du = Math.abs(u-ls), dv = Math.abs(v-40);            // Horizontale und vertikale Abweichung (Pixel)
  if (du < 40 && dv < 40) drag = true;                     // Gegebenenfalls Zugmodus aktivieren
  }

// Reaktion auf Bewegung von Maus oder Finger (�nderung):
// u, v ... Bildschirmkoordinaten bez�glich Viewport
// Seiteneffekt ls, xLB, tLB, t, t0, state, x

function reactionMove (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfl�che bez�glich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bez�glich Zeichenfl�che (Pixel)
  ls = Math.round(u);                                      // Position der Lichtschranke (Pixel)
  if (ls < X0+LENGTH/20) ls = X0+LENGTH/20;                // Falls Position zu weit links, korrigieren
  if (ls > X0+LENGTH) ls = X0+LENGTH;                      // Falls Position zu weit rechts, korrigieren
  calcST();                                                // xLB und tLB berechnen
  if (!on) paint();                                        // Falls Animation gestoppt, neu zeichnen
  }

// Reaktion auf Loslassen der Maustaste oder Ende der Ber�hrung:
// Seiteneffekt drag, xLB, tLB, t, t0, state, x

function reactionUp () {
  drag = false;                                            // Zugmodus abschalten
  calcST();                                                // xLB und tLB berechnen
  if (!on) paint();                                        // Falls Animation gestoppt, neu zeichnen
  }

// Animation starten oder fortsetzen:
// Seiteneffekt on, timer, t0

function startAnimation () {
  on = true;                                               // Animation angeschaltet
  timer = setInterval(paint,40);                           // Timer mit Intervall 0,040 s aktivieren
  t0 = new Date();                                         // Neuer Bezugszeitpunkt
  }

// Animation stoppen:
// Seiteneffekt on, timer

function stopAnimation () {
  on = false;                                              // Animation abgeschaltet
  clearInterval(timer);                                    // Timer deaktivieren
  }

//-------------------------------------------------------------------------------------------------

// Berechnungen f�r einzelne Messung:
// Seiteneffekt xLB, tLB

function calcST () {
  xLB = (ls-X0)/LENGTH;                                    // Position der Lichtschranke bzw. Weg (m)
  tLB = Math.sqrt(2*xLB/a);                                // Zeit vom Start bis zum Passieren der Lichtschranke (s)
  }

// Berechnungen f�r neue Messreihe:
// Seiteneffekt a, xLB, tLB

function calculation () {
  if (m1+m2 > 0) a = (m2-my*m1)*G/(m1+m2);                 // Beschleunigung (m/s�)
  else a = 0;                                              // Ausnahme (m1+m2 == 0)
  if (a < 0) a = 0;                                        // Falls Reibung zu gro�, Beschleunigung 0
  calcST();                                                // xLB und tLB berechnen
  }

// Neue Messreihe:
// Seiteneffekt list, state, bu2, diagr, t, ls, a, xLB, tLB, ta

function newSeries () {
  list = [];                                               // Neue Liste der Messstrecken (leer)
  state = 0;                                               // Zustand vor dem Start
  bu2.innerHTML = text02[0];                               // Text "Start"
  diagr = false;                                           // Flag f�r Diagramm l�schen
  t = 0;                                                   // Zeitvariable zur�cksetzen
  ls = X0+LENGTH/2;                                        // Lichtschranke zun�chst in der Mitte
  calculation();                                           // Berechnungen
  var s = symbolDisplacement+"           ";                // Anfang der Zeichenkette f�r den Textbereich (Messstrecke)
  s += symbolTime+"\n";                                    // Zeichenkette erg�nzen (Zeit)
  for (var i=1; i<=24; i++) s += "\u2015";                 // Zeichenkette erg�nzen (Trennlinie)
  s += "\n";                                               // Zeichenkette erg�nzen (Zeilenumbruch)
  ta.value = s;                                            // Textbereich aktualisieren
  }

// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }

// Zeichenkette, bestehend aus Zahl und Benennung:
// n ... Zahl
// d ... Zahl der Nachkommastellen
// u ... Einheit

function value (n, d, u) {
  return ToString(n,d,true)+" "+u;
  }

// Eingabe einer Zahl
// ef .... Eingabefeld
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)
// min ... Minimum des erlaubten Bereichs
// max ... Maximum des erlaubten Bereichs
// R�ckgabewert: Zahl oder NaN

function inputNumber (ef, d, fix, min, max) {
  var s = ef.value;                                        // Zeichenkette im Eingabefeld
  s = s.replace(",",".");                                  // Eventuell Komma in Punkt umwandeln
  var n = Number(s);                                       // Umwandlung in Zahl, falls m�glich
  if (isNaN(n)) n = 0;                                     // Sinnlose Eingaben als 0 interpretieren
  if (n < min) n = min;                                    // Falls Zahl zu klein, korrigieren
  if (n > max) n = max;                                    // Falls Zahl zu gro�, korrigieren
  ef.value = ToString(n,d,fix);                            // Eingabefeld eventuell korrigieren
  return n;                                                // R�ckgabewert
  }

// Gesamte Eingabe:
// Seiteneffekt m1, m2, my

function input () {
  m1 = inputNumber(ip1,0,true,0,1000)/1000;                // Masse des Gleiters (kg)
  m2 = inputNumber(ip2,1,true,0,100)/1000;                 // Masse des W�gest�cks (kg)
  my = inputNumber(ip3,3,true,0,1);                        // Reibungszahl
  }

// Aktualisierung der Eingabefelder:

function updateInput () {
  ip1.value = ToString(1000*m1,0,true);                    // Masse des Gleiters (g)
  ip2.value = ToString(1000*m2,1,true);                    // Masse des W�gest�cks (g)
  ip3.value = ToString(my,3,true);                         // Reibungszahl
  }

// Liste der Messstrecken erweitern:
// Seiteneffekt list, ta

function updateList () {
  list.push(xLB);                                          // Aktuelle Messstrecke zur Liste hinzuf�gen
  var s = ta.value;                                        // Bisheriger Inhalt des Textbereichs
  s += value(xLB,3,meter)+";    ";                         // Wegl�nge hinzuf�gen
  s += value(tLB,3,second)+"\n";                           // Zeit hinzuf�gen
  ta.value = s;                                            // Textbereich aktualisieren
  }

//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke 1
  }

// Linie zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// c ........ Farbe (optional, Defaultwert schwarz)

function line (x1, y1, x2, y2, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  if (c) ctx.strokeStyle = c;                              // Linienfarbe festlegen, falls angegeben
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);                    // Linie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  }

// Rechteck mit schwarzem Rand:
// (x,y) ... Koordinaten der Ecke links oben (Pixel)
// w ....... Breite (Pixel)
// h ....... H�he (Pixel)
// c ....... F�llfarbe (optional)

function rectangle (x, y, w, h, c) {
  if (c) ctx.fillStyle = c;                                // F�llfarbe
  newPath();                                               // Neuer Pfad
  ctx.fillRect(x,y,w,h);                                   // Rechteck ausf�llen
  ctx.strokeRect(x,y,w,h);                                 // Rand zeichnen
  }

// Kreisscheibe mit schwarzem Rand:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... F�llfarbe (optional)

function circle (x, y, r, c) {
  if (c) ctx.fillStyle = c;                                // F�llfarbe
  newPath();                                               // Neuer Pfad
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  if (c) ctx.fill();                                       // Kreis ausf�llen, falls gew�nscht
  ctx.stroke();                                            // Rand zeichnen
  }

// Pfeil zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// w ........ Liniendicke (optional)
// Zu beachten: Die Farbe wird durch ctx.strokeStyle bestimmt.

function arrow (x1, y1, x2, y2, w) {
  if (!w) w = 1;                                           // Falls Liniendicke nicht definiert, Defaultwert
  var dx = x2-x1, dy = y2-y1;                              // Vektorkoordinaten
  var length = Math.sqrt(dx*dx+dy*dy);                     // L�nge
  if (length == 0) return;                                 // Abbruch, falls L�nge 0
  dx /= length; dy /= length;                              // Einheitsvektor
  var s = 2.5*w+7.5;                                       // L�nge der Pfeilspitze
  var xSp = x2-s*dx, ySp = y2-s*dy;                        // Hilfspunkt f�r Pfeilspitze
  var h = 0.5*w+3.5;                                       // Halbe Breite der Pfeilspitze
  var xSp1 = xSp-h*dy, ySp1 = ySp+h*dx;                    // Ecke der Pfeilspitze
  var xSp2 = xSp+h*dy, ySp2 = ySp-h*dx;                    // Ecke der Pfeilspitze
  xSp = x2-0.6*s*dx; ySp = y2-0.6*s*dy;                    // Einspringende Ecke der Pfeilspitze
  ctx.beginPath();                                         // Neuer Pfad
  ctx.lineWidth = w;                                       // Liniendicke
  ctx.moveTo(x1,y1);                                       // Anfangspunkt
  if (length < 5) ctx.lineTo(x2,y2);                       // Falls kurzer Pfeil, weiter zum Endpunkt, ...
  else ctx.lineTo(xSp,ySp);                                // ... sonst weiter zur einspringenden Ecke
  ctx.stroke();                                            // Linie zeichnen
  if (length < 5) return;                                  // Falls kurzer Pfeil, keine Spitze
  ctx.beginPath();                                         // Neuer Pfad f�r Pfeilspitze
  ctx.fillStyle = ctx.strokeStyle;                         // F�llfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                                     // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                                   // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                                       // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                                   // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                                         // Zur�ck zum Anfangspunkt
  ctx.fill();                                              // Pfeilspitze zeichnen
  }

// Text ausrichten (Zeichensatz FONT1):
// s ....... Zeichenkette
// t ....... Typ (0 f�r linksb�ndig, 1 f�r zentriert, 2 f�r rechtsb�ndig)
// (x,y) ... Position (Pixel)
// f ....... Zeichensatz (optional, Defaultwert FONT1)

function alignText (s, t, x, y, f) {
  ctx.font = (f ? f : FONT1);                              // Zeichensatz
  if (t == 0) ctx.textAlign = "left";                      // Je nach Wert von t linksb�ndiger ...
  else if (t == 1) ctx.textAlign = "center";               // ... oder zentrierter ...
  else ctx.textAlign = "right";                            // ... oder rechtsb�ndiger Text
  ctx.fillText(s,x,y);                                     // Text ausgeben
  }

// Fahrbahn mit Prellbock:

function track () {
  var x0 = X0+LENGTH;                                      // Endposition (Pixel)
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = colorTrack;                              // F�llfarbe
  ctx.moveTo(10,60);                                       // Anfangspunkt (links oben)
  ctx.lineTo(x0+20,60);                                    // Weiter nach rechts (oberer Rand)
  ctx.arc(x0+20,70,10,270*DEG,90*DEG,false);               // Weiter mit rechtem Halbkreis nach unten
  ctx.lineTo(10,80);                                       // Weiter nach links (unterer Rand)
  ctx.lineTo(10,60);                                       // Zur�ck zum Anfangspunkt
  ctx.fill(); ctx.stroke();                                // Fahrbahn ausf�llen und Rand zeichnen
  rectangle(x0,52,5,18,colorStop);                         // Prellbock
  }

// Gleiter mit Schnur und Gewicht:

function glider () {
  var xEnd = X0+LENGTH;                                    // Endposition (Pixel)
  var dx = x*LENGTH;                                       // Aktuelle Position relativ zum Startpunkt (Pixel)
  rectangle(X0+dx-40,50,40,20,colorGlider);                // Gleiter
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.moveTo(X0+dx,57);                                    // Anfangspunkt (linkes Ende der Schnur)
  ctx.lineTo(xEnd+20,57);                                  // Weiter nach rechts (waagrechter Teil der Schnur)
  ctx.arc(xEnd+17,70,13,270*DEG,0,false);                  // Weiter mit Viertelkreis (gekr�mmter Teil der Schnur)
  ctx.lineTo(xEnd+30,100+dx);                              // Weiter nach unten (senkrechter Teil der Schnur)
  ctx.stroke();                                            // Schnur zeichnen
  rectangle(xEnd+28,100+dx,4,6,colorGlider);               // W�gest�ck
  circle(X0+dx,57,2,"#ff0000");                            // Bezugspunkt (vorne)
  }

// L�ngenskala:

function scale () {
  rectangle(X0,85,LENGTH,10,colorScale1);                  // Skala insgesamt
  for (var i=1; i<10; i+=2)                                // F�r jedes zweite Feld ...
    rectangle(X0+i*20,85,20,10,colorScale2);               // Rechteck mit anderer F�llfarbe
  }

// Lichtschranke mit Doppelpfeil dar�ber:

function lightbarrier () {
  rectangle(ls-3,40,6,20,colorLB);                         // Lichtschranke
  line(ls-20,30,ls+20,30);                                 // Linie f�r Doppelpfeil �ber der Lichtschranke
  if (ls > X0+10) arrow(ls,30,ls-20,30);                   // Pfeilspitze nach links
  if (ls < X0+LENGTH) arrow(ls,30,ls+20,30);               // Pfeilspitze nach rechts
  alignText(text08,1,ls+15,50);                            // Beschriftung
  }

// Digital-Uhr:

function clock () {
  var u0 = 140, v0 = 165;                                  // Mittelpunkt (Pixel)
  rectangle(u0-50,v0-15,100,30,colorClock1);               // Geh�use
  rectangle(u0-40,v0-10,80,20,colorClock2);                // Anzeige
  ctx.fillStyle = colorClock3;                             // Farbe f�r Ziffern
  var s = value((t<tLB ? t : tLB),3,second);               // Zeichenkette f�r Zeit
  alignText(s,1,u0,v0+5,FONT2);                            // Zeichenkette anzeigen
  }

// Hilfsroutine f�r Zeit-Weg-Diagramm: Koordinatensystem
// (u0,v0) ... Ursprung (Pixel)

function axes (u0, v0) {
  ctx.font = FONT1;                                        // Zeichensatz
  ctx.fillStyle = "#000000";                               // Schriftfarbe
  arrow(u0-10,v0,u0+130,v0);                               // Waagrechte Achse (Zeit)
  alignText(symbolTime,1,u0+125,v0+15);                    // Symbol f�r Zeit
  alignText(text09,1,u0+125,v0+27);                        // Einheit (s)
  for (var i=1; i<=5; i++) {                               // F�r alle Ticks der Zeitachse ...
    var u = u0+i*PIX_T;                                    // Waagrechte Koordinate (Pixel)
    line(u,v0-3,u,v0+3);                                   // Tick zeichnen
    alignText(""+i,1,u,v0+15);                             // Tick beschriften
    }
  arrow(u0,v0+10,u0,v0-230);                               // Senkrechte Achse (Ortskoordinate)
  alignText(symbolDisplacement,1,u0-20,v0-225);            // Symbol f�r Messstrecke
  alignText(text10,1,u0-20,v0-213);                        // Einheit (m)
  for (i=1; i<=10; i++) {                                  // F�r alle Ticks der Wegachse ...
    var v = v0-i*20;                                       // Senkrechte Koordinate (Pixel)
    line(u0-3,v,u0+3,v);                                   // Tick zeichnen
    alignText(ToString(i/10,true,1),2,u0-5,v+5);           // Tick beschriften
    }
  }

// Hilfsroutine f�r Zeit-Weg-Diagramm: Messergebnis im Diagramm markieren
// (u0,v0) ... Ursprung (Pixel)
// x ......... Strecke (m)

function dataPoint (u0, v0, x) {
  var t = Math.sqrt(2*x/a);                                // Zeit (s)
  var u = u0+t*PIX_T;                                      // Waagrechte Koordinate (Pixel)
  var v = v0-x*LENGTH;                                     // Senkrechte Koordinate (Pixel)
  rectangle(u-2,v-2,4,4,"#000000");                        // Markierung
  }

// Hilfsroutine f�r Zeit-Weg-Diagramm: Parabel
// (u0,v0) ... Ursprung (Pixel)

function parabola (u0, v0) {
  var u = u0, v = v0;                                      // Koordinaten des Ursprungs �bernehmen (Pixel)
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.moveTo(u,v);                                         // Anfangspunkt Parabel (Pixel)
  for (u = u0; u<u0+140; u++) {                            // Von links nach rechts ...
    var t = (u-u0)/PIX_T;                                  // Zeit (s)
    v = v0-(a/2)*t*t*LENGTH;                               // Senkrechte Koordinate (Pixel)
    if (v < v0-220) {v = v0-220; break;}                   // Falls oberer Rand �berschritten, abbrechen
    ctx.lineTo(u,v);                                       // Linie zum Grafikpfad hinzuf�gen
    }
  ctx.stroke();                                            // Polygonzug als N�herung f�r Parabel zeichnen
  }

// Zeit-Weg-Diagramm:

function diagram () {
  var u0 = 330, v0 = 360;                                  // Ursprung (Pixel)
  axes(u0,v0);                                             // Koordinatensystem
  for (var i=0; i<list.length; i++)                        // F�r alle bisherigen Messergebnisse ...
    dataPoint(u0,v0,list[i]);                              // Markierung
  if (state >= 2)                                          // Falls Lichtschranke schon passiert ...
    dataPoint(u0,v0,xLB);                                  // Markierung f�r neues Messergebnis
  if (diagr) parabola(u0,v0);                              // Falls gew�nscht, Parabel zeichnen
  var tt = Math.min(t,Math.sqrt(2/a));                     // Zeit (s) f�r aktuelles Messergebnis
  var u = u0+tt*PIX_T;                                     // Waagrechte Koordinate (Pixel)
  var v = v0-(a/2)*tt*tt*LENGTH;                           // Senkrechte Koordinate (Pixel)
  circle(u,v,2.5,"#ff0000");                               // Markierung f�r aktuelles Messergebnis
  }

// Zahlenangaben (Strecke s, Zeit t, Beschleunigung a):

function writeValues () {
  var u0 = 100, v0 = 300;                                  // Anfangsposition (Pixel)
  ctx.fillStyle = "#000000";                               // Schriftfarbe
  var str = symbolDisplacement+" = "+value(xLB,3,meter);   // Zeichenkette f�r Strecke s
  alignText(str,0,u0,v0);                                  // Zeichenkette ausgeben
  str = symbolTime+" = ";                                  // Anfang der Zeichenkette f�r Zeit t
  if (state >= 2) str += value(tLB,3,second);              // Falls Messung durchgef�hrt, Zeichenkette erg�nzen
  alignText(str,0,u0,v0+20);                               // Zeichenkette ausgeben
  str = symbolAcceleration+" =  ";                         // Anfang der Zeichenkette f�r Beschleunigung a
  alignText(str,0,u0,v0+45);                               // Bisherige Zeichenkette ausgeben
  var w0 = ctx.measureText(str).width;                     // L�nge der bisherigen Zeichenkette
  line(u0+w0,v0+40,u0+20+w0,v0+40,"#000000",2);            // Bruchstrich
  alignText("2"+symbolDisplacement,1,u0+10+w0,v0+37);      // Z�hler 2s
  alignText(symbolTime+"\u00B2",1,u0+10+w0,v0+53);         // Nenner t�
  if (state <= 1) return;                                  // Falls Messung noch nicht durchgef�hrt, abbrechen
  str = " = "+value(a,3,meterPerSecond2);                  // Zeichenkette f�r Wert der Beschleunigung
  alignText(str,0,u0+20+w0,v0+45);                         // Zeichenkette ausgeben
  }

// Grafikausgabe:
// Seiteneffekt t, t0, state, x

function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausf�llen
  if (on) {                                                // Falls Animation l�uft ...
    var t1 = new Date();                                   // Aktuelle Zeit
    t += (t1-t0)/1000;                                     // Zeitvariable aktualisieren
    t0 = t1;                                               // Bezugszeitpunkt aktualisieren
    }
  if (state == 1 && x > xLB) {                             // Falls Lichtschranke inzwischen passiert ...
    state = 2;                                             // Neuer Zustand nach Lichtschranke
    bu2.innerHTML = text02[1];                             // Text des zweiten Schaltknopfs �ndern (Registrieren)
    bu2.disabled = false;                                  // Schaltknopf Start/Registrieren wieder aktivieren
    }
  if (state == 2 && x > 1) state = 3;                      // Falls Prellbock erreicht, neuer Zustand
  switch (state) {                                         // Berechnung von x: Je nach Zustand ...
    case 0: x = 0; break;                                  // Gleiter in Startposition
    case 1: case 2: x = a/2*t*t; break;                    // Gleiter in Bewegung
    case 3: x = 1; break;                                  // Gleiter am Prellbock
    }
  track();                                                 // Fahrbahn mit Prellbock
  glider();                                                // Gleiter mit Gewicht und Schnur
  scale();                                                 // L�ngenskala
  lightbarrier();                                          // Lichtschranke
  clock();                                                 // Digitaluhr
  diagram();                                               // Zeit-Weg-Diagramm
  writeValues();                                           // Zahlenwerte (s, t, a)
  if (a == 0) {                                            // Falls Beschleunigung gleich 0 ...
    ctx.fillStyle = "#ff0000";                             // Schriftfarbe
    ctx.fillText(text11,80,120);                           // Fehlermeldung
    }
  }
  var canvas = document.getElementById("cv");
    // canvas.width = window.innerWidth/2;
    // canvas.height = window.innerHeight/2;
    canvas.width = '500';
    canvas.height = '440';

document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen
