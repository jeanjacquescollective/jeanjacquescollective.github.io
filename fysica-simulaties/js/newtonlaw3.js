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

let colorBackground = "#FFFFFF"; // Background color
let colorTrack = "#ffc040"; // color for the track
let colorStop = "#ED553B"; // Bumper color
let colorGlider = "#20639B"; // color for glider
let colorScale1 = "#000000"; // color 1 for ruler
let colorScale2 = "#F6D55C"; // color 2 for ruler
let colorLB = "#000000"; // color for light barrier
let colorClock1 = "#173F5F"; // color for clock (case)
let colorClock2 = "#000000"; // color for clock (display)
let colorClock3 = "#ffffff"; // color for clock (digits)


// Other constants:

let G = 9.81; // acceleration due to gravity (m/s�)
let DEG = Math.PI / 180; // Degree (Bogenma�)
let FONT1 = "normal normal bold 12px sans-serif"; // Normal character set
let FONT2 = "normal normal bold 16px monospace"; // Character set for digital clocks
let X0 = 50; // Start position (pixel)
let LENGTH = 200; // Maximum measuring distance (1 m in pixels)
let PIX_T = 20; // Conversion factor (pixels per s)





// Attributes:

let canvas, ctx; // drawing area, graphic context
let width, height; // dimensions of the drawing area (pixels)
let bu1, bu2, bu3; // buttons
let ip1, ip2, ip3; // input fields
let ta; // text area

let on; // flag for movement
let t0; // reference time
let t; // time variable (s)
let timer; // Timer for animation

let drag; // Flag for drag mode
let state; // state (0 ... before start, 1 ... Start until light barrier,
// 2 ... light barrier to buffer stop or 3 ... at the bumper)
let diagr; // flag for time-distance diagram
let m1; // mass of the slider (kg)
let m2; // mass of the bumper (kg)
let my; // friction coefficient
let a; // acceleration (m/s�)
let ls; // position of the light barrier (pixel)
let xLB; // Measuring distance (m)
let tLB; // Time for measuring distance (s)
let x; // Current position (m)
let list; // List of measuring distances

// element of the button (from HTML file):
// id ..... ID in HTML command
// text ... Text (optional)


function getElement(id, text) {
  let e = document.getElementById(id); // Element
  if (text) e.innerHTML = text; // set text, if defined
  return e; // return value
}

// Start:

function start() {
  canvas = getElement("cv"); // drawing area
  width = canvas.width;
  height = canvas.height; // dimensions (pixels)
  ctx = canvas.getContext("2d"); // graphics context
  bu1 = getElement("bu1", text01); // button (delete results)
  bu1.disabled = false; // button first activated
  bu2 = getElement("bu2", text02[0]); // button (start/register)
  bu2.disabled = false; // switch button activated for the time being
  bu3 = getElement("bu3", text03); // button (diagram)
  bu3.disabled = true; // switch button initially deactivated
  getElement("ip1a", text04); // Explanatory text (mass of the glider)
  getElement("ip1b", symbolMass1 + " = "); // Symbol (mass of the glider) and equal sign
  ip1 = getElement("ip1c"); // Input field (mass of the glider)
  getElement("ip1d", gram); // Unit (mass of the glider)
  getElement("ip2a", text05); // Explanatory text (mass of the object)
  getElement("ip2b", symbolMass2 + " = "); // Symbol (mass of the object) and equal sign
  ip2 = getElement("ip2c"); // input field (mass of the object)
  getElement("ip2d", gram); // unit (mass of the object)
  getElement("ip3a", text06); // Explanatory text (friction coefficient)
  getElement("ip3b", symbolCoefficientFriction + " = "); // Symbol (friction coefficient) and equal sign
  ip3 = getElement("ip3c"); // Input field (friction coefficient)
  getElement("lbM", text07); // Explanatory text (measured values)
  ta = getElement("ta"); // Text area (measured values)
  ta.readOnly = true; // Text area for reading only
  getElement("author", author); // Author (and translator)

  m1 = 0.1; // Mass of the glider (kg)
  m2 = 0.001; // mass of the piece (kg)
  my = 0; // friction coefficient
  updateInput(); // Update input fields (default values)
  enableInput(true); // enable input first
  drag = false; // train mode deactivated for the time being
  newSeries(); // New series (calculations)
  paint(); // Draw
  bu1.onclick = reactionButton1; // Reaction to button 1 (delete measurement series)
  bu2.onclick = reactionButton2; // Reaction to button 2 (start/register)
  bu3.onclick = reactionButton3; // Reaction to button 3 (diagram)
  ip1.onkeydown = reactionEnter; // Reaction to enter button (mass of the slider)
  ip2.onkeydown = reactionEnter; // Reaction to enter button (accelerating mass)
  ip3.onkeydown = reactionEnter; // Reaction to enter key (friction number)
  canvas.onmousedown = reactionMouseDown; // reaction to pressing the mouse button
  canvas.ontouchstart = reactionTouchStart; // reaction on touching
  canvas.onmouseup = reactionMouseUp; // reaction to releasing the mouse button
  canvas.ontouchend = reactionTouchEnd; // reaction to the end of the touch
  canvas.onmousemove = reactionMouseMove; // reaction to moving the mouse
  canvas.ontouchmove = reactionTouchMove; // Reaction to moving the finger
} // End of the method start

// Activation or deactivation of the input fields:
// p ... Flag for possible input

function enableInput(p) {
  ip1.readOnly = !p; // input field for mass of the slider
  ip2.readOnly = !p; // Input field for accelerating mass
  ip3.readOnly = !p; // Input field for friction coefficient
}

// Reaction to button 1 (delete measurement series):
// Side effect on, timer, list, state, diagr, t, ls, m1, m2, my, a, xLB, tLB, t0, x
// Effect on button surface

function reactionButton1() {
  bu2.disabled = false; // activate start button
  bu3.disabled = true; // disable button 3 (diagram)
  enableInput(true); // enable input fields
  stopAnimation(); // switch off animation
  newSeries(); // Create a new series of measurements
  reaction(); // Take over entered values and calculate them
  paint(); // Draw new
}

// Reaction to button 2 (start/register):
// Page effect state, on, timer, t0, t, list, ta, x
// Effect on button surface

function reactionButton2() {
  reaction(); // accept input and calculate
  if (state == 0) { // If state before start ...
    enableInput(false); // deactivate input fields
    state = 1; // state between start and light barrier
    bu2.disabled = true; // disable start button
    startAnimation(); // start animation
  }
  if (state >= 2) { // If so far state after light barrier ...
    updateList(); // Update the list of measurement sections and text area
    if (list.length > 2) bu3.disabled = false; // If enough measurements, activate diagram button
    state = 0; // New state: before the start
    bu2.innerHTML = text02[0]; // Text for button: start
    stopAnimation(); // Stop animation
    t = 0; // reset time variable
    paint(); // Redraw
  }
}

// Reaction to button 3 (diagram):
// side effect diagr, t, t0, state, x

function reactionButton3() {
  diagr = true; // set flag for diagram
  if (!on) paint(); // if animation is switched off, draw again
}

// Auxiliary routine: accept input and calculate
// Side effect m1, m2, my, a, xLB, tLB

function reaction() {
  input(); // accept input values (possibly corrected)
  calculation(); // Calculations
}

// Reaction to keystroke (only to Enter key):
// Side effect m1, m2, my, a, xLB, tLB, t, t0, state, x

function reactionEnter(e) {
  if (e.key && String(e.key) == "Enter" // If Enter key (Firefox/Internet Explorer) ...
    ||
    e.keyCode == 13) // If Enter key (Chrome) ...
    reaction(); // ... Take over data and calculate
  paint(); // Redraw
}

// Reaction to pressing the mouse button:
// side effect drag

function reactionMouseDown(e) {
  reactionDown(e.clientX, e.clientY); // call help routine
}

// Reaction to touch:
// drag page effect

function reactionTouchStart(e) {
  let obj = e.changedTouches[0]; // list of touch points
  reactionDown(obj.clientX, obj.clientY); // call help routine
  if (drag) e.preventDefault(); // if drag mode is activated, prevent default behaviour
}

// Reaction on releasing the mouse button:

function reactionMouseUp(e) {
  reactionUp(); // Call auxiliary routine
}

// Reaction to the end of the touch:

function reactionTouchEnd(e) {
  reactionUp(); // call auxiliary routine
}

// Reaction to moving the mouse:

function reactionMouseMove(e) {
  if (!drag) return; // cancel if drag mode is not activated
  reactionMove(e.clientX, e.clientY); // Determine position, calculate and redraw
}

function reactionMouseMove(e) {
  if (!drag) return; // cancel if drag mode is not activated
  reactionMove(e.clientX, e.clientY); // Determine position, calculate and redraw
}

// Reaction to movement of the finger:

function reactionTouchMove(e) {
  if (!drag) return; // cancel if drag mode is not activated
  let obj = e.changedTouches[0]; // list of new finger positions
  reactionMove(obj.clientX, obj.clientY); // get position, calculate and redraw
  e.preventDefault(); // prevent default behaviour
}

// Auxiliary routine: Reaction to mouse click or touching with the finger (selection):
// u, v ... Screen coordinates regarding viewport
// Page effect drag

function reactionDown(u, v) {
  let re = canvas.getBoundingClientRect(); // position of the drawing area in relation to the viewport
  u -= re.left;
  v -= re.top; // coordinates of the drawing area (pixels)
  let du = Math.abs(u - ls),
    dv = Math.abs(v - 40); // Horizontal and vertical deviation (pixels)
  if (du < 40 && dv < 40) drag = true; // activate drag mode if necessary
}

// Reaction to movement of mouse or finger (�nding):
// u, v ... Screen coordinates regarding viewport
// Side effect ls, xLB, tLB, t, t0, state, x

function reactionMove(u, v) {
  let re = canvas.getBoundingClientRect(); // position of the drawing area in relation to the viewport
  u -= re.left;
  v -= re.top; // coordinates of the drawing area (pixel)
  ls = Math.round(u); // Position of the light barrier (pixel)
  if (ls < X0 + LENGTH / 20) ls = X0 + LENGTH / 20; // if position is too far to the left, correct it
  if (ls > X0 + LENGTH) ls = X0 + LENGTH; // If position is too far to the right, correct it
  calcST(); // calculate xLB and tLB
  if (!on) paint(); // If animation stopped, draw again
}

// Reaction on releasing the mouse button or end of touch:
// side effect drag, xLB, tLB, t, t0, state, x

function reactionUp() {
  drag = false; // switch off drag mode
  calcST(); // calculate xLB and tLB
  if (!on) paint(); // If animation stopped, draw again
}

// start or continue animation:
// page effect on, timer, t0

function startAnimation() {
  on = true; // animation switched on
  timer = setInterval(paint, 40); // activate timer with interval 0.040 s
  t0 = new Date(); // New reference time
}

// Stop animation:
// Page effect on, timer

function stopAnimation() {
  on = false; // animation turned off
  clearInterval(timer); // deactivate timer
}

//-------------------------------------------------------------------------------------------------

// Calculations for single measurement:
// side effect xLB, tLB

function calcST() {
  xLB = (ls - X0) / LENGTH; // position of the light barrier or distance (m)
  tLB = Math.sqrt(2 * xLB / a); // Time from start to passing the light barrier (s)
}

// Calculations for new measurement series:
// Side effect a, xLB, tLB

function calculation() {
  if (m1 + m2 > 0) a = (m2 - my * m1) * G / (m1 + m2); // acceleration (m/s�)
  else a = 0; // exception (m1+m2 == 0)
  if (a < 0) a = 0; // if friction too great, acceleration 0
  calcST(); // calculate xLB and tLB
}

// New measurement series:
// Side effect list, state, bu2, diagr, t, ls, a, xLB, tLB, ta

function newSeries() {
  list = []; // New list of measurement series (empty)
  state = 0; // State before start
  bu2.innerHTML = text02[0]; // Text "start
  diagr = false; // Flag for deleting the diagram
  t = 0; // reset time variable
  ls = X0 + LENGTH / 2; // light barrier first in the middle
  calculation(); // Calculations
  let s = symbolDisplacement + "           "; // start of the string for the text area (measuring distance)
  s += symbolTime + "\n"; // Add string (time)
  for (let i = 1; i <= 24; i++) s += "\u2015"; // add string (separator line)
  s += "\n"; // add character string (line break)
  ta.value = s; // update text area
}

// Convert a number into a string:
// n ..... Given number
// d ..... Number of digits
// fix ... Flag for decimal places (as opposed to valid digits)

function ToString(n, d, fix) {
  let s = (fix ? n.toFixed(d) : n.toPrecision(d)); // string with decimal point
  return s.replace(".", decimalSeparator); // replace dot with comma if necessary
}

// String consisting of number and designation:
// n ... Number
// d ... number of decimal places
// u ... Unit

function value(n, d, u) {
  return ToString(n, d, true) + " " + u;
}

// input a number
// ef .... Input field
// d ..... Number of digits
// fix ... Flag for decimal places (in contrast to valid digits)
// min ... Minimum of the allowed range
// max ... Maximum of the allowed range
// return value: number or NaN

function inputNumber(ef, d, fix, min, max) {
  let s = ef.value; // character string in the input field
  s = s.replace(",", "."); // Possibly convert comma into point
  let n = Number(s); // Convert to number, if possible
  if (isNaN(n)) n = 0; // Interpret senseless input as 0
  if (n < min) n = min; // if number is too small, correct it
  if (n > max) n = max; // If the number is too large, correct it
  ef.value = ToString(n, d, fix); // correct input field if necessary
  return n; // return value
}

// Total input:
// Side effect m1, m2, my

function input() {
  m1 = inputNumber(ip1, 0, true, 0, 1000) / 1000; // Mass of the glider (kg)
  m2 = inputNumber(ip2, 1, true, 0, 100) / 1000; // mass of the object (kg)
  my = inputNumber(ip3, 3, true, 0, 1); // coefficient of friction
}

// Update the input fields:

function updateInput() {
  ip1.value = ToString(1000 * m1, 0, true); // mass of the slider (g)
  ip2.value = ToString(1000 * m2, 1, true); // Mass of the piece (g)
  ip3.value = ToString(my, 3, true); // friction coefficient
}

// Extend the list of measured distances:
// side effect list, ta

function updateList() {
  list.push(xLB); // add the current measured distance to the list
  let s = ta.value; // Previous content of the text area
  s += value(xLB, 3, meter) + ";    "; // Add distance to list
  s += value(tLB, 3, second) + "\n"; // add time
  ta.value = s; // update text area
}

//-------------------------------------------------------------------------------------------------

// New graphic path with default values:

function newPath() {
  ctx.beginPath(); // New graphic path
  ctx.strokeStyle = "#000000"; // Line color black
  ctx.lineWidth = 1; // Line thickness 1
}

// draw line:
// x1, y1 ... starting point
// x2, y2 ... End point
// c ........ color (optional, default value black)

function line(x1, y1, x2, y2, c) {
  newPath(); // New graphic path (default values)
  if (c) ctx.strokeStyle = c; // set line color, if specified
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2); // prepare line
  ctx.stroke(); // draw line
}

// Rectangle with black border:
// (x,y) ... Coordinates of the top left corner (pixels)
// w ....... Width (pixels)
// h ....... Height (pixel)
// c ....... Fill color (optional)

function rectangle(x, y, w, h, c) {
  if (c) ctx.fillStyle = c; // fill color
  newPath(); // New path
  ctx.fillRect(x, y, w, h); // fill rectangle
  ctx.strokeRect(x, y, w, h); // draw border
}

// Circular slice with black border:
// (x,y) ... Centre coordinates (pixels)
// r ....... Radius (pixels)
// c ....... Fill color (optional)

function circle(x, y, r, c) {
  if (c) ctx.fillStyle = c; // fill color
  newPath(); // New path
  ctx.arc(x, y, r, 0, 2 * Math.PI, true); // prepare circle
  if (c) ctx.fill(); // fill circle if desired
  ctx.stroke(); // draw border
}

// draw arrow:
// x1, y1 ... Start point
// x2, y2 ... End point
// w ........ Line thickness (optional)
// To note: The color is determined by ctx.strokeStyle.

function arrow(x1, y1, x2, y2, w) {
  if (!w) w = 1; // If line thickness not defined, default value
  let dx = x2 - x1,
    dy = y2 - y1; // vector coordinates
  let length = Math.sqrt(dx * dx + dy * dy); // length
  if (length == 0) return; // abort, if length 0
  dx /= length;
  dy /= length; // unit vector
  let s = 2.5 * w + 7.5; // length of the arrowhead
  let xSp = x2 - s * dx,
    ySp = y2 - s * dy; // auxiliary point for arrowhead
  let h = 0.5 * w + 3.5; // half width of the arrowhead
  let xSp1 = xSp - h * dy,
    ySp1 = ySp + h * dx; // Corner of the arrowhead
  let xSp2 = xSp + h * dy,
    ySp2 = ySp - h * dx; // Corner of the arrowhead
  xSp = x2 - 0.6 * s * dx;
  ySp = y2 - 0.6 * s * dy; // Recessed corner of the arrowhead
  ctx.beginPath(); // New path
  ctx.lineWidth = w; // Line thickness
  ctx.moveTo(x1, y1); // Starting point
  if (length < 5) ctx.lineTo(x2, y2); // If short arrow, continue to end point, ...
  else ctx.lineTo(xSp, ySp); // ... otherwise continue to the recessed corner
  ctx.stroke(); // draw line
  if (length < 5) return; // If short arrow, no tip
  ctx.beginPath(); // New path for arrowhead
  ctx.fillStyle = ctx.strokeStyle; // fill color like line color
  ctx.moveTo(xSp, ySp); // Starting point (recessed corner)
  ctx.lineTo(xSp1, ySp1); // Continue to the point on one side
  ctx.lineTo(x2, y2); // Continue to the tip
  ctx.lineTo(xSp2, ySp2); // Continue to the point on the other side
  ctx.closePath(); // Back to the starting point
  ctx.fill(); // Draw the arrowhead
}

// Align text (font FONT1):
// s ....... string
// t ....... Type (0 for left-aligned, 1 for centred, 2 for right-aligned)
// (x,y) ... Position (pixel)
// f ....... Character set (optional, default FONT1)

function alignText(s, t, x, y, f) {
  ctx.font = (f ? f : FONT1); // character set
  if (t == 0) ctx.textAlign = "left"; // Depending on the value of t more left...
  else if (t == 1) ctx.textAlign = "centre"; // ... or more centred ...
  else ctx.textAlign = "right"; // ... or right-bordered text
  ctx.fillText(s, x, y); // output text
}

// track with bumper:

function track() {
  let x0 = X0 + LENGTH; // end position (pixel)
  newPath(); // New graphic path (default values)
  ctx.fillStyle = colorTrack; // fill color
  ctx.moveTo(10, 60); // Starting point (top left)
  ctx.lineTo(x0 + 20, 60); // Further to the right (upper border)
  ctx.arc(x0 + 20, 70, 10, 270 * DEG, 90 * DEG, false); // Continue downwards with right semicircle
  ctx.lineTo(10, 80); // Continue left (bottom margin)
  ctx.lineTo(10, 60); // Back to the starting point
  ctx.fill();
  ctx.stroke(); // Fill road and draw border
  rectangle(x0, 52, 5, 18, colorStop); // bumper
}

// glider with string and weight:

function glider() {
  let xEnd = X0 + LENGTH; // end position (pixel)
  let dx = x * LENGTH; // Current position relative to the starting point (pixel)
  rectangle(X0 + dx - 40, 50, 40, 20, colorGlider); // Glider
  newPath(); // New graphic path (default values)
  ctx.moveTo(X0 + dx, 57); // Starting point (left end of the line)
  ctx.lineTo(xEnd + 20, 57); // Continue to the right (horizontal part of the string)
  ctx.arc(xEnd + 17, 70, 13, 270 * DEG, 0, false); // Continue with quarter circle (curved part of the string)
  ctx.lineTo(xEnd + 30, 100 + dx); // Continue downwards (vertical part of the line)
  ctx.stroke(); // Draw the line
  rectangle(xEnd + 28, 100 + dx, 4, 6, colorGlider); // W�gest�ck
  circle(X0 + dx, 57, 2, "#ff0000"); // reference point (front)
}

// length scale:

function scale() {
  rectangle(X0, 85, LENGTH, 10, colorScale1); // scale in total
  for (let i = 1; i < 10; i += 2) // For every second field ...
    rectangle(X0 + i * 20, 85, 20, 10, colorScale2); // Rectangle with different fill color
}

// light barrier with double arrow above it:

function lightbarrier() {
  rectangle(ls - 3, 40, 6, 20, colorLB); // lightbarrier
  line(ls - 20, 30, ls + 20, 30); // line for double arrow above the light barrier
  if (ls > X0 + 10) arrow(ls, 30, ls - 20, 30); // arrowhead to the left
  if (ls < X0 + LENGTH) arrow(ls, 30, ls + 20, 30); // arrowhead to the right
  alignText(text08, 1, ls + 15, 50); // caption
}

// Digital clock:

function clock() {
  let u0 = 140,
    v0 = 165; // centre point (pixel)
  rectangle(u0 - 50, v0 - 15, 100, 30, colorClock1); // enclosure
  rectangle(u0 - 40, v0 - 10, 80, 20, colorClock2); // display
  ctx.fillStyle = colorClock3; // color for digits
  let s = value((t < tLB ? t : tLB), 3, second); // string for time
  alignText(s, 1, u0 - 35, v0 + 5, FONT2); // display character string
}

// Auxiliary routine for time-distance diagram: coordinate system
// (u0,v0) ... Origin (pixel)

function axes(u0, v0) {
  ctx.font = FONT1; // character set
  ctx.fillStyle = "#000000"; // font color
  arrow(u0 - 10, v0, u0 + 130, v0); // Horizontal axis (time)
  alignText(symbolTime, 1, u0 + 125, v0 + 15); // Symbol for time
  alignText(text09, 1, u0 + 125, v0 + 27); // Unit (s)
  for (let i = 1; i <= 5; i++) { // For all ticks of the time axis ...
    let u = u0 + i * PIX_T; // Horizontal coordinate (pixel)
    line(u, v0 - 3, u, v0 + 3); // draw tick
    alignText("" + i, 1, u, v0 + 15); // Label tick
  }
  arrow(u0, v0 + 10, u0, v0 - 230); // Vertical axis (location coordinate)
  alignText(symbolDisplacement, 1, u0 - 20, v0 - 225); // Symbol for measuring distance
  alignText(text10, 1, u0 - 40, v0 - 213); // Unit (m)
  for (i = 1; i <= 10; i++) { // For all ticks of the path axis ...
    let v = v0 - i * 20; // Vertical coordinate (pixel)
    line(u0 - 3, v, u0 + 3, v); // draw tick
    alignText(ToString(i / 10, true, 1), 2, u0 - 5, v + 5); // label tick
  }
}

// Auxiliary routine for time-distance diagram: mark measurement result in diagram
// (u0,v0) ... Origin (pixel)
// x ......... Distance (m)

function dataPoint(u0, v0, x) {
  let t = Math.sqrt(2 * x / a); // time (s)
  let u = u0 + t * PIX_T; // Horizontal coordinate (pixel)
  let v = v0 - x * LENGTH; // Vertical coordinate (pixel)
  rectangle(u - 2, v - 2, 4, 4, "#000000"); // marker
}

// Auxiliary routine for time-distance diagram: parabola
// (u0,v0) ... Origin (pixel)

function parabola(u0, v0) {
  let u = u0,
    v = v0; // take coordinates of the origin (pixel)
  newPath(); // New graphic path (default values)
  ctx.moveTo(u, v); // Start point of parabola (pixel)
  for (u = u0; u < u0 + 140; u++) { // From left to right ...
    let t = (u - u0) / PIX_T; // Time (s)
    v = v0 - (a / 2) * t * t * LENGTH; // Vertical coordinate (pixel)
    if (v < v0 - 220) {
      v = v0 - 220;
      break;
    } // If upper edge is exceeded, cancel
    ctx.lineTo(u, v); // Add line to the graphic path
  }
  ctx.stroke(); // draw polygon line as approximation for parabola
}

// time-distance diagram:

function diagram() {
  let u0 = 330,
    v0 = 360; // origin (pixel)
  axes(u0, v0); // coordinate system
  for (let i = 0; i < list.length; i++) // For all previous measurement results ...
    dataPoint(u0, v0, list[i]); // marker
  if (state >= 2) // If light barrier has already passed ...
    dataPoint(u0, v0, xLB); // marker for new measurement result
  if (diagr) parabola(u0, v0); // If desired, draw parabola
  let tt = Math.min(t, Math.sqrt(2 / a)); // Time (s) for current measurement result
  let u = u0 + tt * PIX_T; // Horizontal coordinate (pixel)
  let v = v0 - (a / 2) * tt * tt * LENGTH; // Vertical coordinate (pixel)
  circle(u, v, 2.5, "#ff0000"); // marker for current measurement result
}

// numerical data (distance s, time t, acceleration a):

function writeValues() {
  let u0 = 100,
    v0 = 300; // initial position (pixel)
  ctx.fillStyle = "#000000"; // font color
  let str = symbolDisplacement + " = " + value(xLB, 3, meter); // string for distance s
  alignText(str, 0, u0, v0); // output character string
  str = symbolTime + " = "; // start of string for time t
  if (state >= 2) str += value(tLB, 3, second); // If measurement is carried out, add character string
  alignText(str, 0, u0, v0 + 20); // Output character string
  str = symbolAcceleration + " = "; // Start of string for acceleration a
  alignText(str, 0, u0, v0 + 45); // Output previous string
  let w0 = ctx.measureText(str).width; // length of the previous string
  line(u0 + w0, v0 + 40, u0 + 20 + w0, v0 + 40, "#000000", 2); // fraction bar
  alignText("2" + symbolDisplacement, 1, u0 + 5 + w0, v0 + 37); // Counter 2s
  alignText(symbolTime + "\u00B2", 1, u0 + 10 + w0, v0 + 53); // Denominator t�
  if (state <= 1) return; // if measurement has not yet been carried out, cancel
  str = " = " + value(a, 3, meterPerSecond2); // String for value of acceleration
  alignText(str, 0, u0 + 20 + w0, v0 + 45); // Output character string
}

// graphic output:
// side effect t, t0, state, x

function paint() {
  ctx.fillStyle = colorBackground; // background color
  ctx.fillRect(0, 0, width, height); // fill background
  if (on) { // If animation is running ...
    let t1 = new Date(); // Current time
    t += (t1 - t0) / 1000; // update time variable
    t0 = t1; // update reference time
  }
  if (state == 1 && x > xLB) { // If light barrier happens in the meantime ...
    state = 2; // New state after light barrier
    bu2.innerHTML = text02[1]; // Change text of the second button (register)
    bu2.disabled = false; // reactivate the start/register button
  }
  if (state == 2 && x > 1) state = 3; // If bumper reached, new state
  switch (state) { // Calculation of x: Depending on state ...
    case 0:
      x = 0;
      break; // glider in start position
    case 1:
    case 2:
      x = a / 2 * t * t;
      break; // glider in motion
    case 3:
      x = 1;
      break; // glider at the buffer stop
  }
  track(); // track with buffer stop
  glider(); // glider with weight and string
  scale(); // length scale
  lightbarrier(); // light barrier
  clock(); // digital clock
  diagram(); // time-distance diagram
  writeValues(); // numerical values (s, t, a)
  if (a == 0) { // If acceleration equals 0 ...
    ctx.fillStyle = "#ff0000"; // font color
    ctx.fillText(text11, 80, 120); // Error message
  }
}
canvas = document.getElementById("cv");
// canvas.width = window.innerWidth/2;
// canvas.height = window.innerHeight/2;
canvas.width = '500';
canvas.height = '440';

document.addEventListener("DOMContentLoaded", start, false); // Nach dem Laden der Seite Start-Methode aufrufen
