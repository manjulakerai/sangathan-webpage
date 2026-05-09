// Mobile navigation toggle
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');

  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var isOpen = links.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a nav link is tapped
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

// Countdown timer to Sangathan Parva
(function () {
  var target = new Date('2026-07-04T00:00:00+10:00').getTime();
  var daysEl = document.getElementById('cd-days');
  var hoursEl = document.getElementById('cd-hours');
  var minsEl = document.getElementById('cd-mins');
  var secsEl = document.getElementById('cd-secs');

  if (!daysEl) return;

  function pad(n) { return n < 10 ? '0' + n : n; }

  function update() {
    var now = Date.now();
    var diff = target - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent = pad(mins);
    secsEl.textContent = pad(secs);
  }

  update();
  setInterval(update, 1000);
})();
