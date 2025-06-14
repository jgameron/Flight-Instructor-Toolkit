
document.addEventListener("DOMContentLoaded", function () {
  function round2(val) {
    return Math.round(val * 100) / 100;
  }
  let timerInterval;
  let stored = localStorage.getItem('flightStartTime');
  if (!stored && localStorage.getItem('startTime')) {
    stored = localStorage.getItem('startTime');
    localStorage.setItem('flightStartTime', stored);
    localStorage.removeItem('startTime');
  }
  let startTime = stored && !isNaN(parseInt(stored, 10)) ? parseInt(stored, 10) : null;
  let runningFlag = localStorage.getItem('flightIsRunning');
  if (runningFlag === null && localStorage.getItem('isRunning') !== null) {
    runningFlag = localStorage.getItem('isRunning');
    localStorage.setItem('flightIsRunning', runningFlag);
    localStorage.removeItem('isRunning');
  }
  let isRunning = runningFlag === 'true';

  (function validateTimerStore() {
    const now = Date.now();
    const invalid = !startTime || startTime < 1000000000000 || startTime > now;
    const tooLong = startTime && now - startTime > 86400000 * 3; // 3 days
    if (invalid || tooLong) {
      // handle corrupted or unrealistic start time data
      startTime = null;
      isRunning = false;
      ['flightStartTime', 'startTime'].forEach(k => localStorage.removeItem(k));
      localStorage.setItem('flightIsRunning', 'false');
      localStorage.removeItem('isRunning');
      localStorage.removeItem('startClock');
    }
  })();
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
      localStorage.setItem('flightStartTime', startTime);
      const now = new Date();
      startClock = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      localStorage.setItem('startClock', startClock);
    }
    localStorage.setItem('flightIsRunning', 'true');
    document.getElementById('startClockDisplay').innerText = 'Start Time: ' + startClock;
    timerInterval = setInterval(updateFlightTimer, 1000);
  }

  window.stopTimer = function () {
    clearInterval(timerInterval);
    localStorage.setItem('flightIsRunning', 'false');
  }


  function restoreInputs() {
    ['hobbsStart','hobbsEnd','tachStart','tachEnd','elapsedStart','elapsedEnd'].forEach(id => {
      let val = localStorage.getItem(id);
      if (val !== null) {
        const el = document.getElementById(id);
        if ((id === 'elapsedStart' || id === 'elapsedEnd') && /^\d{3,4}$/.test(val)) {
          val = val.padStart(4, '0');
          val = val.slice(0, 2) + ':' + val.slice(2);
        }
        el.value = val;
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
    const sVal = document.getElementById('elapsedStart').value;
    const eVal = document.getElementById('elapsedEnd').value;
    if (!sVal || !eVal) {
      document.getElementById('elapsedResult').innerText = 'Elapsed Time: 0.00 hrs';
      return;
    }
    const [sh, sm] = sVal.split(':').map(Number);
    const [eh, em] = eVal.split(':').map(Number);
    let start = sh * 60 + sm;
    let end = eh * 60 + em;
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
      ['flightStartTime','startTime'].forEach(k => localStorage.removeItem(k));
      ['flightIsRunning','isRunning'].forEach(k => localStorage.removeItem(k));
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
      ['elapsedStart','elapsedEnd'].forEach(id => {
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
