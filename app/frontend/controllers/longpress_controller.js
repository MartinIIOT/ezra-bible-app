/* This file is part of Ezra Bible App.

   Copyright (C) 2019 - 2021 Ezra Bible App Development Team <contact@ezrabibleapp.net>

   Ezra Bible App is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 2 of the License, or
   (at your option) any later version.

   Ezra Bible App is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with Ezra Bible App. See the file LICENSE.
   If not, see <http://www.gnu.org/licenses/>. */

const LONG_PRESS_DELAY = 1500;
const MAX_TOUCH_SHIFT = 10;

var startX = 0; // mouse x position when timer started
var startY = 0; // mouse y position when timer started
var timer = null;
var longPressCallback = () => {};

// check if we're using a touch screen
var hasPointerEvents = (('PointerEvent' in window) || (window.navigator && 'msPointerEnabled' in window.navigator));
var isTouch = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));

// switch to pointer events or touch events if using a touch screen
var mouseDown = hasPointerEvents ? 'pointerdown' : isTouch ? 'touchstart' : 'mousedown';
var mouseUp = hasPointerEvents ? 'pointerup' : isTouch ? 'touchend' : 'mouseup';
var mouseMove = hasPointerEvents ? 'pointermove' : isTouch ? 'touchmove' : 'mousemove';

document.addEventListener('wheel', clearLongPressTimer);
document.addEventListener('scroll', clearLongPressTimer);

/**
 * Starts the timer on mouse down and logs current position
 * @param {MouseEvent} event - browser event object
 * @returns {void}
 */
module.exports.subscribe = function (element, callback) {
  longPressCallback = callback;
  console.log('LONG PRESS: subscribe', element, mouseDown);

  element.addEventListener(mouseDown, mouseDownHandler); // <- start
  
  element.addEventListener(mouseMove, mouseMoveHandler);

  element.addEventListener(mouseUp, clearLongPressTimer);
  
};

function mouseDownHandler(event) {
  console.log('LONG PRESS: mouseDown', event);
  startX = event.clientX;
  startY = event.clientY;

  clearLongPressTimer();

  // start the timer
  timer = startTimer(event.currentTarget);
}

/**
 * If the finger moves MAX_TOUCH_SHIFT pixels during long-press, cancel the timer
 * @param {MouseEvent} event - browser event object
 */
function mouseMoveHandler(event) {
  if (!timer) {
    return;
  }

  // calculate total number of pixels the pointer has moved
  var diffX = Math.abs(startX - event.clientX);
  var diffY = Math.abs(startY - event.clientY);

  console.log('LONG PRESS: mouseMove', diffX, diffY);

  // if pointer has moved more than allowed, cancel the long-press timer and therefore the event
  if (diffX >= MAX_TOUCH_SHIFT || diffY >= MAX_TOUCH_SHIFT) {
    clearLongPressTimer();
  }
}


/**
 * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
 * @returns {object} handle to the timeout object
 */
function startTimer(element) {
  console.log('LONG PRESS: startTimer');

  var start = new Date().getTime();
  var handle = {};

  var loop = function () {
    var current = new Date().getTime();
    var delta = current - start;

    if (delta >= LONG_PRESS_DELAY) { // It's time to run the callback!
      clearLongPressTimer();
      console.log('LONG PRESS: fire callback!');
      longPressCallback(element);
    }
    else {
      handle.value = window.requestAnimationFrame(loop);
    }
  };

  handle.value = window.requestAnimationFrame(loop);

  return handle;
}

/**
 * method responsible for clearing a pending long press timer
 */
function clearLongPressTimer() {
  if (timer) {
    console.log('LONG PRESS: clearTimer');
    window.cancelAnimationFrame(timer.value);
    timer = null;
  }
}
