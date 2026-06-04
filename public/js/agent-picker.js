// public/js/agent-picker.js
// Language + voice picker controller for /agent.
// Loaded from layouts/agent.ejs (NOT from the page view) because
// express-ejs-layouts extractScripts:true silently drops inline scripts
// found inside the rendered view body.

(function () {
  'use strict';

  function init() {
    var pickerEl = document.getElementById('agentLangPicker');
    if (!pickerEl) { return; /* picker not on this page */ }

    console.log('[picker] init');

    var voiceSection = document.getElementById('alpVoiceSection');
    var selectEl    = document.getElementById('alpVoiceSelect');
    var continueBtn = document.getElementById('alpContinue');
    var hintEl      = document.getElementById('alpVoiceHint');
    var labelTextEl = document.getElementById('alpVoiceLabelText');
    var chosenLang  = null;

    if (!voiceSection || !selectEl || !continueBtn) {
      console.warn('[picker] required elements missing');
      return;
    }

    var EN_RECOMMENDED = [
      'Daniel',                  // iOS/Mac en-GB male (Jarvis tone)
      'Microsoft Mark',          // Windows en-US male
      'Google UK English Male',  // Android
      'Microsoft David',         // Windows
      'Alex',                    // Mac en-US premium
      'Google US English'        // Android default
    ];
    var ID_RECOMMENDED = [
      'Microsoft Andika',        // Windows id-ID MALE (best native)
      'Google bahasa Indonesia', // Android — gender depends on device
      'Damayanti',               // iOS/Mac id-ID female (native, accepted)
      'Microsoft Gadis'          // Windows id-ID female
    ];

    function scoreVoice(voice, recList) {
      var name = (voice.name || '');
      for (var i = 0; i < recList.length; i++) {
        if (name.indexOf(recList[i]) !== -1) return i;
      }
      return 999;
    }

    function getVoicesNow() {
      try { return window.speechSynthesis ? (window.speechSynthesis.getVoices() || []) : []; }
      catch (e) { return []; }
    }

    function populateVoices(lang) {
      var prefix = lang === 'id' ? 'id' : 'en';
      var recList = lang === 'id' ? ID_RECOMMENDED : EN_RECOMMENDED;
      var voices = getVoicesNow();
      var matching = voices.filter(function (v) {
        return v.lang && v.lang.toLowerCase().indexOf(prefix) === 0;
      });

      selectEl.innerHTML = '';

      if (matching.length) {
        matching.sort(function (a, b) { return scoreVoice(a, recList) - scoreVoice(b, recList); });
        matching.forEach(function (v, i) {
          var opt = document.createElement('option');
          opt.value = v.name;
          opt.textContent = v.name + ' (' + v.lang + ')' + (i === 0 ? ' — Recommended' : '');
          selectEl.appendChild(opt);
        });
        hintEl.textContent = lang === 'id'
          ? 'Catatan: di iOS/macOS, suara Bahasa Indonesia hanya tersedia dalam suara perempuan (Damayanti).'
          : 'For a "Jarvis"-style consultant tone, Daniel (British male) is recommended where available.';
        return true;
      }

      var opt = document.createElement('option');
      opt.value = '';
      opt.textContent = lang === 'id' ? 'Suara browser default' : 'Browser default voice';
      selectEl.appendChild(opt);
      hintEl.textContent = lang === 'id'
        ? 'Tidak ada suara Bahasa Indonesia di perangkat ini — pakai default browser.'
        : 'No matching voices on this device — using browser default.';
      return false;
    }

    function pickLang(lang) {
      console.log('[picker] lang clicked:', lang);
      chosenLang = lang;
      labelTextEl.textContent = lang === 'id' ? 'Pilih suara Jarvis' : 'Choose a voice';
      continueBtn.textContent = lang === 'id' ? 'Lanjutkan' : 'Continue';

      var btns = document.querySelectorAll('.alp-lang-btn');
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].dataset.lang === lang) btns[i].classList.add('selected');
        else btns[i].classList.remove('selected');
      }

      voiceSection.hidden = false;
      voiceSection.style.display = 'block';
      hintEl.textContent = 'Loading voices…';

      var ok = populateVoices(lang);
      if (!ok) {
        var tries = 0;
        var retry = setInterval(function () {
          tries++;
          if (populateVoices(lang) || tries >= 5) clearInterval(retry);
        }, 300);
      }

      if (continueBtn.scrollIntoView) {
        try { continueBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
        catch (e) {}
      }
    }

    // Wire language buttons
    var langBtns = document.querySelectorAll('.alp-lang-btn');
    console.log('[picker] found', langBtns.length, 'language buttons');
    for (var i = 0; i < langBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          pickLang(btn.dataset.lang);
        });
      })(langBtns[i]);
    }

    // Continue button
    continueBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!chosenLang) return;
      var voiceName = selectEl.value || '';
      try {
        if (voiceName) localStorage.setItem('jarvisVoice_' + chosenLang, voiceName);
        else localStorage.removeItem('jarvisVoice_' + chosenLang);
      } catch (e) {}
      console.log('[picker] continue → /agent?lang=' + chosenLang + ' (voice=' + voiceName + ')');
      window.location.href = '/agent?lang=' + chosenLang;
    });

    // Trigger voice load
    if (window.speechSynthesis) {
      getVoicesNow();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.addEventListener('voiceschanged', function () {
          if (chosenLang) populateVoices(chosenLang);
        });
      }
    }

    // Hide the agent loader / canvas / UI behind the picker so they don't
    // bleed through the translucent backdrop. agent.js will run its init
    // after the user navigates away from the picker.
    document.body.classList.add('picker-active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
