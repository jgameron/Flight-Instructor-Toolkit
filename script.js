
document.addEventListener("DOMContentLoaded", function () {
  function round2(val) {
    return Math.round(val * 100) / 100;
  }
  let timerInterval;
  let startTime = parseInt(localStorage.getItem('startTime')) || null;
  let isRunning = localStorage.getItem('isRunning') === 'true';
  let startClock = localStorage.getItem('startClock') || '--:--';

  function updateFlightTimer() {
    if (!startTime) return;
    let flightSeconds = Math.floor((Date.now() - startTime) / 1000);
    let h = Math.floor(flightSeconds / 3600);
    let m = Math.floor((flightSeconds % 3600) / 60);
    let s = flightSeconds % 60;
    let hours = flightSeconds / 3600;
    let floored = round2(hours);
    document.getElementById('flightTime').innerText = floored.toFixed(2) + ' hrs | ' + h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
  }

  window.startTimer = function () {
    if (!startTime) {
      startTime = Date.now();
      localStorage.setItem('startTime', startTime);
      const now = new Date();
      startClock = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      localStorage.setItem('startClock', startClock);
    }
    localStorage.setItem('isRunning', 'true');
    document.getElementById('startClockDisplay').innerText = 'Start Time: ' + startClock;
    timerInterval = setInterval(updateFlightTimer, 1000);
  }

  window.stopTimer = function () {
    clearInterval(timerInterval);
    localStorage.setItem('isRunning', 'false');
  }

  window.handleTimeInput = function(el) {
    let digits = el.value.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) {
      el.value = digits.slice(0, 2) + ':' + digits.slice(2);
    } else {
      el.value = digits;
    }
  }

  function restoreInputs() {
    ['hobbsStart','hobbsEnd','tachStart','tachEnd','startTime','endTime'].forEach(id => {
      const val = localStorage.getItem(id);
      if (val !== null) {
        const el = document.getElementById(id);
        el.value = val;
        if (id === 'startTime' || id === 'endTime') {
          handleTimeInput(el);
        }
      }
    });
    document.getElementById('studentLandings').innerText = `Student Landings: ${localStorage.getItem('studentLandings') || 0}`;
    document.getElementById('instructorLandings').innerText = `Instructor Landings: ${localStorage.getItem('instructorLandings') || 0}`;
    document.getElementById('startClockDisplay').innerText = 'Start Time: ' + startClock;
  }

  window.saveInput = function (el) {
    localStorage.setItem(el.id, el.value);
  }

  window.calculateHobbs = function () {
    let start = parseFloat(document.getElementById('hobbsStart').value) || 0;
    let end = parseFloat(document.getElementById('hobbsEnd').value) || 0;
    let res = round2(end - start);
    document.getElementById('hobbsResult').innerText = `Hobbs Time: ${res.toFixed(2)} hrs`;
  }

  window.calculateTach = function () {
    let start = parseFloat(document.getElementById('tachStart').value) || 0;
    let end = parseFloat(document.getElementById('tachEnd').value) || 0;
    let res = round2(end - start);
    document.getElementById('tachResult').innerText = `Tach Time: ${res.toFixed(2)} hrs`;
  }

  window.calculateElapsedTime = function () {
    let s = document.getElementById('startTime').value.replace(/\D/g, '').slice(0,4);
    let e = document.getElementById('endTime').value.replace(/\D/g, '').slice(0,4);
    let start = (parseInt(s.slice(0,2) || 0) * 60) + parseInt(s.slice(2) || 0);
    let end = (parseInt(e.slice(0,2) || 0) * 60) + parseInt(e.slice(2) || 0);
    if (end < start) end += 1440;
    let total = (end - start) / 60;
    let rounded = round2(total);
    document.getElementById('elapsedResult').innerText = `Elapsed Time: ${rounded.toFixed(2)} hrs`;
  }

  window.addLanding = function (type) {
    let key = type + 'Landings';
    let val = parseInt(localStorage.getItem(key)) || 0;
    localStorage.setItem(key, ++val);
    document.getElementById(key).innerText = `${type.charAt(0).toUpperCase() + type.slice(1)} Landings: ${val}`;
  }

  window.subtractLanding = function (type) {
    let key = type + 'Landings';
    let val = parseInt(localStorage.getItem(key)) || 0;
    if (val > 0) val--;
    localStorage.setItem(key, val);
    document.getElementById(key).innerText = `${type.charAt(0).toUpperCase() + type.slice(1)} Landings: ${val}`;
  }

  window.confirmClearTimer = function () {
    if (confirm("Reset flight timer?")) {
      clearInterval(timerInterval);
      startTime = null;
      localStorage.removeItem('startTime');
      localStorage.removeItem('isRunning');
      localStorage.removeItem('startClock');
      document.getElementById('flightTime').innerText = '0.00 hrs | 00:00:00';
      document.getElementById('startClockDisplay').innerText = 'Start Time: --:--';
    }
  }

  window.confirmClearLandings = function () {
    if (confirm("Reset all landings?")) {
      localStorage.removeItem('studentLandings');
      localStorage.removeItem('instructorLandings');
      document.getElementById('studentLandings').innerText = 'Student Landings: 0';
      document.getElementById('instructorLandings').innerText = 'Instructor Landings: 0';
    }
  }

  window.confirmClearHobbs = function () {
    if (confirm("Reset Hobbs fields?")) {
      localStorage.removeItem('hobbsStart');
      localStorage.removeItem('hobbsEnd');
      document.getElementById('hobbsStart').value = '';
      document.getElementById('hobbsEnd').value = '';
      document.getElementById('hobbsResult').innerText = 'Hobbs Time: 0.00 hrs';
    }
  }

  window.confirmClearTach = function () {
    if (confirm("Reset Tach fields?")) {
      localStorage.removeItem('tachStart');
      localStorage.removeItem('tachEnd');
      document.getElementById('tachStart').value = '';
      document.getElementById('tachEnd').value = '';
      document.getElementById('tachResult').innerText = 'Tach Time: 0.00 hrs';
    }
  }

  window.confirmClearElapsed = function () {
    if (confirm("Reset Elapsed Time fields?")) {
      ['startTime','endTime'].forEach(id => {
        localStorage.removeItem(id);
        document.getElementById(id).value = '';
      });
      document.getElementById('elapsedResult').innerText = 'Elapsed Time: 0.00 hrs';
    }
  }

  window.confirmResetAll = function () {
    if (confirm("Reset ALL data?")) {
      localStorage.clear();
      location.reload();
    }
  }

  restoreInputs();
  if (isRunning && startTime) {
    timerInterval = setInterval(updateFlightTimer, 1000);
  }
  updateFlightTimer();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('service-worker.js');
    });
  }
});
