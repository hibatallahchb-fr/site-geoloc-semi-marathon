
let coureurActuel = null;
let mapCoureur    = null;
let mapSpect      = null;
let markerCoureur = null;
let markersSpect  = {};
let timerInterval = null;
let gpsInterval   = null;
let majInterval   = null;
let secondes      = 0;
let posActuelle   = null;
let aiOpen        = false;

// ============================================================
//  NAVIGATION
// ============================================================
function goTo(page) {
  // Cacher tous les écrans
  document.getElementById('screen-home').style.display = 'none';
  ['auth-coureur','coureur','carte','spectateur'].forEach(s => {
    document.getElementById('screen-' + s).classList.remove('active');
  });
  document.getElementById('ai-panel').style.display = 'none';
  document.getElementById('site-header').style.display = 'none';

  // Arrêter la mise à jour spectateur
  if (majInterval) { clearInterval(majInterval); majInterval = null; }

  if (page === 'home') {
    document.getElementById('screen-home').style.display = 'flex';
    document.getElementById('site-header').style.display = 'block'; // Header seulement sur Home

  } else if (page === 'auth-coureur') {
    document.getElementById('screen-auth-coureur').classList.add('active');
    clearAuthForms();

  } else if (page === 'coureur') {
    document.getElementById('screen-coureur').classList.add('active');
    afficherInfoCoureur();

  } else if (page === 'carte') {
    document.getElementById('screen-carte').classList.add('active');
    document.getElementById('ai-panel').style.display = 'block';
    setTimeout(initMapCoureur, 100);

  } else if (page === 'spectateur') {
    document.getElementById('screen-spectateur').classList.add('active');
    chargerCoureurs();
    majInterval = setInterval(chargerCoureurs, 5000);
    setTimeout(initMapSpect, 100);
  }
}


document.getElementById('screen-home').style.display = 'flex';
document.getElementById('site-header').style.display = 'block';

// ============================================================
//  AUTHENTIFICATION 
// ============================================================
function switchTab(mode) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));

  if (mode === 'officiel') {
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.getElementById('panel-officiel').classList.add('active');
  } else {
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
    document.getElementById('panel-libre').classList.add('active');
  }
  clearAuthForms();
}

function clearAuthForms() {
  ['auth-error','auth-success'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('show');
    el.textContent = '';
  });
}

function showAlert(type, msg) {
  clearAuthForms();
  const el = document.getElementById('auth-' + type);
  el.textContent = msg;
  el.classList.add('show');
}

// ============================================================
//  AUTH OFFICIELLE : dossard + PIN
// ============================================================
function authOfficiel() {
  const dossard = document.getElementById('off-dossard').value.trim();
  const pin     = document.getElementById('off-pin').value.trim();

  if (!dossard || !pin) {
    showAlert('error', 'Merci de renseigner ton dossard et ton code PIN.');
    return;
  }

  fetch('api/auth.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'officiel', dossard, pin })
  })
  .then(r => r.json())
  .then(data => {
    if (data.erreur) { showAlert('error', data.message); return; }
    showAlert('success', data.message);
    coureurActuel = data.coureur;
    setTimeout(() => goTo('coureur'), 1000);
  })
  .catch(() => showAlert('error', 'Erreur serveur. Vérifie que XAMPP est démarré.'));
}

// ============================================================
//  AUTH LIBRE : nom + prénom + DDN
// ============================================================
function authLibre() {
  const prenom = document.getElementById('lib-prenom').value.trim();
  const nom    = document.getElementById('lib-nom').value.trim();
  const ddn    = document.getElementById('lib-ddn').value;
  const club   = document.getElementById('lib-club').value.trim();

  if (!prenom || !nom || !ddn) {
    showAlert('error', 'Prénom, nom et date de naissance sont obligatoires.');
    return;
  }

  fetch('api/auth.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'libre', prenom, nom, date_naissance: ddn, club })
  })
  .then(r => r.json())
  .then(data => {
    if (data.erreur) { showAlert('error', data.message); return; }
    showAlert('success', data.message);
    coureurActuel = data.coureur;
    setTimeout(() => goTo('coureur'), 1200);
  })
  .catch(() => showAlert('error', 'Erreur serveur. Vérifie que XAMPP est démarré.'));
}

// ============================================================
//  AFFICHER LES INFOS DU COUREUR CONNECTÉ
// ============================================================
function afficherInfoCoureur() {
  if (!coureurActuel) return;

  const dossardEl = document.getElementById('ci-dossard');
  const nomEl     = document.getElementById('ci-nom');
  const epreuveEl = document.getElementById('ci-epreuve');
  const statutEl  = document.getElementById('ci-statut');

  dossardEl.textContent = coureurActuel.dossard ? '#' + coureurActuel.dossard : '?';
  nomEl.textContent     = coureurActuel.prenom + ' ' + coureurActuel.nom.toUpperCase();
  epreuveEl.textContent = coureurActuel.epreuve_nom
    ? coureurActuel.epreuve_nom + ' (' + coureurActuel.distance_km + ' km)'
    : 'Épreuve non définie';

  statutEl.textContent  = coureurActuel.statut === 'inscrit' ? '✅ Inscrit' : '⚪ Non inscrit';
  statutEl.className    = 'statut-pill statut-' + coureurActuel.statut;
}

function deconnecterCoureur() {
  coureurActuel = null;
  posActuelle   = null;
  goTo('home');
}

// ============================================================
//  GPS
// ============================================================
function activerGPS() {
  document.getElementById('gps-spinner').style.display = 'block';
  document.getElementById('gps-label').textContent = 'Localisation en cours...';

  if (!navigator.geolocation) { useFallbackGPS(); return; }

  navigator.geolocation.getCurrentPosition(
    pos => {
      posActuelle = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      afficherGPSOk(posActuelle.lat, posActuelle.lng, false);
    },
    () => useFallbackGPS()
  );
}

function useFallbackGPS() {
  posActuelle = { lat: 44.5194, lng: 3.4985 };
  afficherGPSOk(posActuelle.lat, posActuelle.lng, true);
}

function afficherGPSOk(lat, lng, simul) {
  document.getElementById('gps-spinner').style.display = 'none';
  document.getElementById('gps-label').innerHTML =
    '<span class="dot-blink"></span> GPS actif' + (simul ? ' (simulé)' : '');
  document.getElementById('gps-coords').textContent =
    lat.toFixed(5) + '° N, ' + lng.toFixed(5) + '° E';
  document.getElementById('gps-btn').style.borderColor = '#16A34A';
}

// ============================================================
//  LANCER LA COURSE
// ============================================================
function lancerCourse() {
  if (!coureurActuel) { alert('Tu dois être connecté.'); return; }
  if (!posActuelle)   { alert('Active d\'abord le GPS.'); return; }

  document.getElementById('hud-name').textContent =
    coureurActuel.prenom + ' ' + coureurActuel.nom.toUpperCase();
  document.getElementById('hud-dossard').textContent =
    coureurActuel.dossard ? coureurActuel.dossard : '—';

  coureurActuel.dist = 0;
  secondes = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(tickChrono, 1000);
  clearInterval(gpsInterval);
  gpsInterval = setInterval(envoyerPosition, 5000);

  goTo('carte');
}

// ============================================================
//  CHRONO
// ============================================================
function tickChrono() {
  secondes++;
  const m = Math.floor(secondes / 60).toString().padStart(2, '0');
  const s = (secondes % 60).toString().padStart(2, '0');
  document.getElementById('hud-time').textContent = m + ':' + s;

  const paceS = secondes / Math.max(coureurActuel.dist, 0.01);
  const pm    = Math.floor(paceS / 60);
  const ps    = Math.floor(paceS % 60).toString().padStart(2, '0');
  document.getElementById('hud-pace').textContent = pm + ':' + ps;

  if (secondes % 30 === 0) mettreAJourAI();
}

// ============================================================
//  ENVOI POSITION GPS (toutes les 5s)
// ============================================================
function envoyerPosition() {
  if (!coureurActuel || !posActuelle) return;

  navigator.geolocation.getCurrentPosition(
    pos => { posActuelle = { lat: pos.coords.latitude, lng: pos.coords.longitude }; envoyerVersServeur(); },
    ()  => envoyerVersServeur()
  );
}

function envoyerVersServeur() {
  coureurActuel.dist += 0.005;
  document.getElementById('hud-dist').textContent = coureurActuel.dist.toFixed(2);

  if (markerCoureur) {
    markerCoureur.setLatLng([posActuelle.lat, posActuelle.lng]);
    mapCoureur.panTo([posActuelle.lat, posActuelle.lng], { animate: true, duration: 1 });
  }

  fetch('api/position.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      coureur_id:  coureurActuel.id,
      lat:         posActuelle.lat,
      lng:         posActuelle.lng,
      distance_km: coureurActuel.dist,
      temps_s:     secondes
    })
  }).catch(err => console.error('Erreur GPS :', err));
}

// ============================================================
//  STOP COURSE
// ============================================================
function stopCourse() {
  clearInterval(timerInterval);
  clearInterval(gpsInterval);

  if (coureurActuel) {
    fetch('api/terminer.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coureur_id: coureurActuel.id })
    });
  }
  goTo('coureur');
}

// ============================================================
//  CARTE COUREUR
// ============================================================
function initMapCoureur() {
  if (mapCoureur) { mapCoureur.invalidateSize(); return; }
  const sp = posActuelle || { lat: 44.5194, lng: 3.4985 };
  mapCoureur = L.map('map-coureur', { zoomControl: false }).setView([sp.lat, sp.lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapCoureur);
  L.control.zoom({ position: 'bottomright' }).addTo(mapCoureur);
  const icon = L.divIcon({
    className: '',
    html: '<div style="width:38px;height:38px;background:#E8521A;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.2rem;box-shadow:0 2px 8px rgba(0,0,0,0.35);">🏃</div>',
    iconSize: [38,38], iconAnchor: [19,19]
  });
  markerCoureur = L.marker([sp.lat, sp.lng], { icon }).addTo(mapCoureur);
}

// ============================================================
//  CARTE SPECTATEUR
// ============================================================
function initMapSpect() {
  if (mapSpect) { mapSpect.invalidateSize(); return; }
  mapSpect = L.map('map-spectateur').setView([44.525, 3.500], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapSpect);
}

// ============================================================
//  CHARGER COUREURS DEPUIS PHP
// ============================================================
function chargerCoureurs() {
  fetch('api/coureurs.php')
  .then(r => r.json())
  .then(coureurs => {
    const dos = document.getElementById('s-dossard').value.trim();
    const nom = document.getElementById('s-nom').value.trim().toLowerCase();
    const filtres = coureurs.filter(c => {
      const matchDos = !dos || (c.dossard && c.dossard.toString().includes(dos));
      const matchNom = !nom || (c.nom + ' ' + c.prenom).toLowerCase().includes(nom);
      return matchDos && matchNom;
    });
    rendreListeCoureurs(filtres);
    document.getElementById('no-results').style.display = filtres.length === 0 ? 'block' : 'none';
    mettreAJourMarqueurs(coureurs);
  })
  .catch(err => console.error('Erreur chargement :', err));
}

function filtrerCoureurs() { chargerCoureurs(); }

function mettreAJourMarqueurs(coureurs) {
  if (!mapSpect) return;
  coureurs.forEach(c => {
    if (!c.lat || !c.lng) return;
    const couleur = c.live ? '#16A34A' : '#6B7280';
    if (markersSpect[c.id]) {
      markersSpect[c.id].setLatLng([c.lat, c.lng]);
    } else {
      const label = c.dossard ? '#' + c.dossard : c.prenom[0] + c.nom[0];
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:${couleur};color:white;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.75rem;padding:4px 7px;border-radius:6px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);white-space:nowrap;">${label}</div>`,
        iconSize: [42,28], iconAnchor: [21,14]
      });
      const statut = c.statut === 'inscrit' ? '✅ Inscrit' : '⚪ Non inscrit';
      const popup = `<b>${c.prenom} ${c.nom}</b><br>${c.dossard ? 'Dossard #' + c.dossard + '<br>' : ''}${c.epreuve_nom || ''}<br>Distance : ${parseFloat(c.dist).toFixed(1)} km<br>${statut}<br>${c.live ? '🟢 En course' : '⚫ Terminé'}`;
      markersSpect[c.id] = L.marker([c.lat, c.lng], { icon }).addTo(mapSpect).bindPopup(popup);
    }
  });
}

function rendreListeCoureurs(liste) {
  const el = document.getElementById('results-list');
  el.innerHTML = '';
  liste.forEach(c => {
    const item = document.createElement('div');
    item.className = 'runner-item';
    item.dataset.id = c.id;
    const dossardLabel = c.dossard ? c.dossard : '?';
    const dossardClass = c.dossard ? 'dossard' : 'dossard no-dossard';
    item.innerHTML =
      `<div class="${dossardClass}">${dossardLabel}</div>` +
      `<div class="info">` +
        `<div class="name">${c.prenom} ${c.nom}</div>` +
        `<div class="details">${c.epreuve_nom || 'Libre'} · ${parseFloat(c.dist).toFixed(1)} km</div>` +
      `</div>` +
      `<div class="status-dot ${c.live ? 'live' : 'finished'}"></div>`;
    item.onclick = () => selectionnerCoureur(c, item);
    el.appendChild(item);
  });
}

function selectionnerCoureur(coureur, item) {
  document.querySelectorAll('.runner-item').forEach(el => el.classList.remove('selected'));
  item.classList.add('selected');
  if (mapSpect && markersSpect[coureur.id] && coureur.lat && coureur.lng) {
    mapSpect.flyTo([coureur.lat, coureur.lng], 15, { duration: 1 });
    markersSpect[coureur.id].openPopup();
  }
}

// ============================================================
//  COACHING IA
// ============================================================
const conseils = [
  { label: 'Allure',      msg: "Tu es légèrement en dessous de ton allure cible. Accélère progressivement sur les 2 prochains km." },
  { label: 'Hydratation', msg: "Ravitaillement dans 800m. Profites-en pour boire même si tu n'as pas soif." },
  { label: 'Effort',      msg: "Ton allure est excellente pour cette distance. Maintiens ton rythme régulier." },
  { label: 'Terrain',     msg: "Montée à venir dans 500m. Réduis légèrement l'allure pour préserver tes réserves." },
  { label: 'Mental',      msg: "Plus que 5km ! Tu es en bonne forme. Concentre-toi sur ta respiration." },
];

function mettreAJourAI() {
  if (!coureurActuel) return;
  const c    = conseils[Math.floor(Math.random() * conseils.length)];
  const dist = coureurActuel.dist.toFixed(2);
  const km   = (21.1 - parseFloat(dist)).toFixed(1);
  document.getElementById('ai-msg').innerHTML =
    `<strong>${dist} km</strong> parcourus. Il reste <strong>${km} km</strong> jusqu'à l'arrivée.`;
  document.getElementById('ai-tips').innerHTML =
    `<div class="ai-tip"><div class="ai-tip-label">💡 ${c.label}</div>${c.msg}</div>`;
}

function toggleAI() {
  aiOpen = !aiOpen;
  document.getElementById('ai-bubble').classList.toggle('open', aiOpen);
  if (aiOpen) mettreAJourAI();
}
