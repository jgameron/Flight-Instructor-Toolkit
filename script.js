
document.addEventListener("DOMContentLoaded", function () {
  let timerInterval;
  let flightStart = parseInt(localStorage.getItem('flightStart')) || null;
  let isRunning = localStorage.getItem('isRunning') === 'true';
  let startClock = localStorage.getItem('startClock') || '--:--';

  function updateFlightTimer() {
    if (!flightStart) return;
    let flightSeconds = Math.floor((Date.now() - flightStart) / 1000);
    let h = Math.floor(flightSeconds / 3600);
    let m = Math.floor((flightSeconds % 3600) / 60);
    let s = flightSeconds % 60;
    let hours = flightSeconds / 3600;
    let floored = Math.floor(hours * 100) / 100;
    document.getElementById('flightTime').innerText = floored.toFixed(2) + ' hrs | ' + h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
  }

  window.startTimer = function () {
    if (!flightStart) {
      flightStart = Date.now();
      localStorage.setItem('flightStart', flightStart);
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

  function restoreInputs() {
    ['hobbsStart','hobbsEnd','tachStart','tachEnd','elapsedStart','elapsedEnd'].forEach(id => {
      const val = localStorage.getItem(id);
      if ((id === 'elapsedStart' || id === 'elapsedEnd') && /^\d{1,2}:\d{2}$/.test(val)) {
        document.getElementById(id).value = val;
      } else if (id !== 'elapsedStart' && id !== 'elapsedEnd') {
        document.getElementById(id).value = val || '';
      }
    });
    document.getElementById('studentLandings').innerText = `Student Landings: ${localStorage.getItem('studentLandings') || 0}`;
    document.getElementById('instructorLandings').innerText = `Instructor Landings: ${localStorage.getItem('instructorLandings') || 0}`;
    document.getElementById('startClockDisplay').innerText = 'Start Time: ' + startClock;
  }

  window.saveInput = function (el) {
    localStorage.setItem(el.id, el.value);
  }

  window.handleTimeInput = function (el) {
    let digits = el.value.replace(/[^0-9]/g, '');
    if (digits.length > 4) digits = digits.slice(0, 4);
    if (digits.length > 2) {
      el.value = digits.slice(0, 2) + ':' + digits.slice(2);
    } else {
      el.value = digits;
    }
    saveInput(el);
  }

  window.calculateHobbs = function () {
    let startVal = document.getElementById('hobbsStart').value.replace(/[^0-9.]/g, '');
    let endVal = document.getElementById('hobbsEnd').value.replace(/[^0-9.]/g, '');
    let start = parseFloat(startVal) || 0;
    let end = parseFloat(endVal) || 0;
    let res = Math.floor((end - start) * 100) / 100;
    document.getElementById('hobbsResult').innerText = `Hobbs Time: ${res.toFixed(2)} hrs`;
  }

  window.calculateTach = function () {
    let startVal = document.getElementById('tachStart').value.replace(/[^0-9.]/g, '');
    let endVal = document.getElementById('tachEnd').value.replace(/[^0-9.]/g, '');
    let start = parseFloat(startVal) || 0;
    let end = parseFloat(endVal) || 0;
    let res = Math.floor((end - start) * 100) / 100;
    document.getElementById('tachResult').innerText = `Tach Time: ${res.toFixed(2)} hrs`;
  }

  window.calculateElapsedTime = function () {
    const format = val => {
      let digits = val.replace(/[^0-9]/g, '');
      let h = parseInt(digits.slice(0, 2) || 0);
      let m = parseInt(digits.slice(2, 4) || 0);
      return h * 60 + m;
    }
    let start = format(document.getElementById('elapsedStart').value);
    let end = format(document.getElementById('elapsedEnd').value);
    if (end < start) end += 1440;
    let total = (end - start) / 60;
    let floored = Math.floor(total * 100) / 100;
    document.getElementById('elapsedResult').innerText = `Elapsed Time: ${floored.toFixed(2)} hrs`;
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
      flightStart = null;
      localStorage.removeItem('flightStart');
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
      localStorage.removeItem('elapsedStart');
      localStorage.removeItem('elapsedEnd');
      document.getElementById('elapsedStart').value = '';
      document.getElementById('elapsedEnd').value = '';
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
  if (isRunning && flightStart) {
    timerInterval = setInterval(updateFlightTimer, 1000);
  }
  updateFlightTimer();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('service-worker.js');
    });
  }
});
