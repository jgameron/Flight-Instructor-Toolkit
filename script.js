
document.addEventListener("DOMContentLoaded", function () {
  let timerInterval;

  // Migrate old elapsed time keys if present
  (function migrateElapsedKeys() {
    const oldStart = localStorage.getItem('startTime');
    if (!localStorage.getItem('elapsedStart') && /^\d{1,2}:\d{2}$/.test(oldStart)) {
      localStorage.setItem('elapsedStart', oldStart);
      localStorage.removeItem('startTime');
    }
    const oldEnd = localStorage.getItem('endTime');
    if (!localStorage.getItem('elapsedEnd') && /^\d{1,2}:\d{2}$/.test(oldEnd)) {
      localStorage.setItem('elapsedEnd', oldEnd);
      localStorage.removeItem('endTime');
    }
  })();

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
    let floored = Math.floor(hours * 100) / 100;
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

  window.calculateHobbs = function () {
    let start = parseFloat(document.getElementById('hobbsStart').value) || 0;
    let end = parseFloat(document.getElementById('hobbsEnd').value) || 0;
    let res = Math.floor((end - start) * 100) / 100;
    document.getElementById('hobbsResult').innerText = `Hobbs Time: ${res.toFixed(2)} hrs`;
  }

  window.calculateTach = function () {
    let start = parseFloat(document.getElementById('tachStart').value) || 0;
    let end = parseFloat(document.getElementById('tachEnd').value) || 0;
    let res = Math.floor((end - start) * 100) / 100;
    document.getElementById('tachResult').innerText = `Tach Time: ${res.toFixed(2)} hrs`;
  }

  window.calculateElapsedTime = function () {
    let s = document.getElementById('elapsedStart').value.split(':');
    let e = document.getElementById('elapsedEnd').value.split(':');
    let start = parseInt(s[0] || 0) * 60 + parseInt(s[1] || 0);
    let end = parseInt(e[0] || 0) * 60 + parseInt(e[1] || 0);
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
