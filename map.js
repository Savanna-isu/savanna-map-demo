// ============================================================
// FIREBASE INIT
// ============================================================
firebase.initializeApp({
  apiKey: 'AIzaSyCNiRgNSRsji3mEnj-0A8IPnp9NfSjJE1g',
  authDomain: 'savanna-map-bbfc7.firebaseapp.com',
  projectId: 'savanna-map-bbfc7',
  storageBucket: 'savanna-map-bbfc7.firebasestorage.app',
  messagingSenderId: '427537993436',
  appId: '1:427537993436:web:4bc433fdd1b99edf266e19',
});
const db = firebase.firestore();

// ============================================================
// MAPBOX ACCESS TOKEN
// ============================================================
mapboxgl.accessToken = 'pk.eyJ1Ijoidmlja3l6ZW5neWoiLCJhIjoiY21vZ2xkNXdrMTJ2ZDJxb2syNjl1MXFjNCJ9.5B5fOEkKbwtD8ihe82fVvQ';

// ===== YEAR COLORS =====
// Route colors: teal (oldest, 2000) → blue → indigo → purple → orange (newest, 2025)
const YEAR_COLORS = {
  2000: '#004D40',  // very dark teal
  2001: '#006064',  // dark teal
  2003: '#007B83',  // teal
  2004: '#0097A7',  // cyan-teal
  2005: '#039BE5',  // light blue
  2006: '#0288D1',  // medium blue
  2007: '#0277BD',  // dark blue
  2008: '#014984',  // deep blue
  2010: '#013870',  // deeper blue
  2011: '#00277A',  // deep navy
  2012: '#01579b',  // ocean blue
  2013: '#0B52A0',  // navy blue
  2014: '#0C4DA8',  // dark navy
  2015: '#0d47a1',  // deep navy blue
  2016: '#1565c0',  // dark blue
  2017: '#1e88e5',  // medium blue
  2018: '#3949ab',  // indigo
  2019: '#512da8',  // deep indigo
  2021: '#4527a0',  // deep purple
  2022: '#7b1fa2',  // purple
  2023: '#9c27b0',  // violet
  2024: '#e65100',  // dark orange
  2025: '#ff6d00',  // vivid orange
};

const ALL_YEARS = [2000,2001,2003,2004,2005,2006,2007,2008,2010,2011,
                   2012,2013,2014,2015,2016,2017,2018,2019,2021,2022,2023,2024,2025];
// All years now have pre-built road-network GeoJSON in data/routes/
const YEARS_WITH_ROUTE_FILES = ALL_YEARS;
const YEARS_WITH_ROUTES = ALL_YEARS;

function closestRouteYear(year) {
  return YEARS_WITH_ROUTE_FILES.reduce((best, y) =>
    Math.abs(y - year) < Math.abs(best - year) ? y : best
  );
}

// ===== STRAIGHT-LINE FALLBACK COORDINATES [lng, lat] =====
// Used only if the pre-built road-network GeoJSON cannot be loaded.
const A = [-93.653213, 42.028359]; // Ames
const ROUTE_FALLBACK = {
  2000: {
    nw:    [A,[-95.102,43.422],[-96.057,43.004],[-96.318,44.002],[-103.43,46.936],[-100.062,48.992],[-100.04,50.66],[-97.138,49.895],[-95.188,47.232],[-93.272,44.98],A],
    south: [A,[-91.183,43.084],[-90.664,42.501],[-90.431,42.416],[-90.071,43.167],[-87.63,41.878],[-90.192,38.626],[-90.042,37.981],[-90.689,37.653],[-94.588,39.046],A,[-97.516,35.468],[-97.333,32.753],[-98.494,29.424],[-97.16,27.689],[-99.516,27.477],[-97.016,34.505],A],
  },
  2001: {
    nw:    [A,[-96.318,44.002],[-103.43,46.936],[-100.062,48.992],[-97.138,49.895],[-95.188,47.232],[-93.272,44.98],A],
    south: [A,[-90.664,42.501],[-90.431,42.416],[-87.63,41.878],[-87.052,41.653],A,[-97.516,35.468],[-97.333,32.753],[-98.821,30.506],[-98.494,29.424],[-99.516,27.477],[-97.016,34.505],A],
  },
  2003: {
    nw:    [A,[-98.03,43.71],[-103.508,44.41],[-108.5,45.783],[-111.502,45.928],[-110.588,44.428],[-106.956,44.799],[-103.47,43.9],[-102.352,43.846],[-100.351,44.368],[-98.035,42.758],A],
    south: [A,[-90.192,38.626],[-90.689,37.653],[-90.061691,35.137192],[-90.851,33.17],[-91.293,31.574],[-90.097316,29.985141],[-89.964,29.237],[-89.518,37.306],A],
  },
  2004: {
    nw:    [A,[-93.201,43.154],[-93.272,44.98],[-101.363,47.496],[-101.296,48.232],[-101.418,46.936],A],
    south: [A,[-90.192,38.626],[-90.524,37.84],[-90.878,37.557],A],
  },
  2005: {
    nw:    [A,[-93.201,43.154],[-95.188,47.232],[-94.881,47.474],[-93.272,44.98],A],
    south: [A,[-91.114,40.807],[-90.192,38.626],[-90.042,37.981],[-90.061691,35.137192],[-90.097316,29.985141],A],
  },
  2006: {
    nw:    [A,[-95.188,47.232],[-93.272,44.98],[-91.137,43.072],[-90.664,42.501],[-90.431,42.416],[-91.114,40.807],[-90.192,38.626],A],
    south: [A,[-90.878,37.557],[-90.061691,35.137192],[-90.571,34.2],[-91.293,31.574],[-90.097316,29.985141],[-90.719,29.596],[-89.964,29.237],[-89.518,37.306],A],
  },
  2007: {
    nw:    [A,[-96.197,43.706],[-97.138,49.895],[-91.867,47.903],[-93.272,44.98],[-89.73,43.407],[-87.63,41.878],A],
    south: [A,[-97.016,34.505],[-97.333,32.753],[-98.821,30.506],[-98.494,29.424],[-100.044,25.754],[-103.25,29.25],A],
  },
  2008: {
    nw:    [A,[-93.272,44.98],[-93.0,47.72],[-91.867,47.903],[-92.101,46.786],[-89.73,43.407],[-87.63,41.878],A],
    south: [A,[-94.588,39.046],[-94.157,36.063],[-92.29,34.746],[-94.376,34.699],[-96.797,32.776],[-98.821,30.506],[-98.494,29.424],[-94.4,30.45],[-97.016,34.505],A],
  },
  2010: {
    nw:    [A,[-93.272,44.98],[-102.352251,43.846843],[-103.45598,43.812219],[-110.588,44.428],[-110.681,43.79],[-104.944234,39.753266],A],
    south: [A,[-90.192,38.626],[-90.689,37.653],[-90.061691,35.137192],[-91.028,31.563],[-91.293,31.574],[-90.097316,29.985141],[-89.0,30.273],[-89.919,35.927],A],
  },
  2011: {
    nw:    [A,[-93.272,44.98],[-102.352251,43.846843],[-103.45598,43.812219],[-109.056,44.526],[-110.588,44.428],[-110.681,43.79],[-104.944234,39.753266],[-99.644,39.393],A],
    south: [A,[-97.516,35.468],[-97.016,34.505],[-96.797,32.776],[-98.821,30.506],[-104.021,30.309],[-103.25,29.25],[-98.494,29.424],[-97.319,27.015],[-97.516,35.468],A],
  },
  2012: {
    nw:    [A,[-93.272,44.98],[-95.188,47.232],[-91.867,47.903],[-92.101,46.786],[-89.73,43.407],[-87.63,41.878],[-90.431,42.416],A],
    south: [A,[-90.192,38.626],[-90.878,37.557],[-90.061691,35.137192],[-91.028,31.563],[-90.097316,29.985141],[-88.664,30.232],A],
  },
  2013: {
    nw:    [A,[-93.272,44.98],[-102.352251,43.846843],[-103.45598,43.812219],[-109.056,44.526],[-111.218,45.531],[-110.681,43.79],[-104.944234,39.753266],A],
    south: [A,[-85.921,39.202],[-86.228,37.291],[-83.489,35.611],[-82.551,35.575],[-84.17,33.809],[-81.418,31.074],[-85.309,35.046],[-90.192,38.626],A],
  },
  2014: {
    nw:    [A,[-93.09,44.954],[-102.352251,43.846843],[-103.45598,43.812219],[-108.5,45.783],[-110.558,45.663],[-110.681,43.79],[-104.944234,39.753266],[-95.901715,41.238051],A],
    south: [A,[-85.921,39.202],[-85.342,38.033],[-83.489,35.611],[-82.551,35.575],[-81.049,31.934],[-84.388,33.749],[-86.614,36.19],[-90.192,38.626],A],
  },
  2015: {
    nw:    [A,[-93.272,44.98],[-96.717982,43.552135],[-102.352251,43.846843],[-103.45598,43.812219],[-105.383,42.76],[-104.82,41.14],[-105.684,40.343],[-104.944234,39.753266],[-101.672,41.127],[-95.901715,41.238051],A],
    south: [A,[-90.192,38.626],[-90.878,37.557],[-90.061691,35.137192],[-90.851,33.17],[-91.293,31.574],[-90.097316,29.985141],[-89.964,29.237],[-89.518,37.306],A],
  },
  2016: {
    nw:    [A,[-93.272,44.98],[-96.717982,43.552135],[-102.352251,43.846843],[-103.45598,43.812219],[-105.383,42.76],[-104.82,41.14],[-105.684,40.343],[-104.944234,39.753266],[-101.672,41.127],[-95.901715,41.238051],A],
    south: [A,[-90.192,38.626],[-90.878,37.557],[-90.061691,35.137192],[-90.133,32.427],[-91.028,31.563],[-90.097316,29.985141],[-89.964,29.237],[-89.518,37.306],A],
  },
  2017: {
    nw:    [A,[-93.272,44.98],[-96.717982,43.552135],[-102.352251,43.846843],[-103.45598,43.812219],[-105.383,42.76],[-104.82,41.14],[-105.684,40.343],[-104.944234,39.753266],[-101.672,41.127],[-95.901715,41.238051],A],
    south: [A,[-90.192,38.626],[-90.878,37.557],[-90.061691,35.137192],[-90.133,32.427],[-91.028,31.563],[-90.097316,29.985141],[-89.964,29.237],[-89.588,36.876],A],
  },
  2018: {
    nw:    [A,[-93.272,44.98],[-96.717982,43.552135],[-102.352251,43.846843],[-103.45598,43.812219],[-105.383,42.76],[-104.82,41.14],[-105.684,40.343],[-104.944234,39.753266],[-101.672,41.127],[-95.901715,41.238051],A],
    south: [A,[-94.588,39.046],[-97.516,35.468],[-97.016,34.505],[-97.333,32.753],[-98.821,30.506],[-98.441,31.027],[-98.494,29.424],[-96.993,28.144],[-97.516,35.468],A],
  },
  2019: {
    nw:    [A,[-93.272,44.98],[-96.717982,43.552135],[-102.352251,43.846843],[-103.45598,43.812219],[-105.383,42.76],[-104.82,41.14],[-105.684,40.343],[-104.944234,39.753266],[-101.672,41.127],[-95.901715,41.238051],A],
    south: [A,[-94.588,39.046],[-95.993,36.154],[-97.016,34.505],[-97.333,32.753],[-98.821,30.506],[-99.748,29.593],[-98.494,29.424],[-97.16,27.689],[-97.516,35.468],A],
  },
  2021: {
    nw:    [A,[-96.717982,43.552135],[-102.352251,43.846843],[-103.45598,43.812219],[-102.977,41.143],[-105.684,40.343],[-104.944234,39.753266],[-101.672,41.127],[-95.901715,41.238051],A],
    south: [A,[-90.192,38.626],[-90.878,37.557],[-94.209,36.372],[-93.05,34.645],[-97.333,32.753],[-97.016,34.505],[-95.993,36.154],[-94.588,39.046],A],
  },
  2022: {
    nw:    [A,[-93.272,44.98],[-96.717982,43.552135],[-102.352251,43.846843],[-103.45598,43.812219],[-102.977,41.143],[-105.684,40.343],[-104.944234,39.753266],[-101.672,41.127],[-95.901715,41.238051],A],
    south: [A,[-94.588,39.046],[-94.145,36.411],[-95.993,36.154],[-97.016,34.505],[-97.333,32.753],[-99.748,29.593],[-98.494,29.424],[-97.16,27.689],[-97.144,34.175],[-96.572,39.183],A],
  },
  2023: {
    nw:    [A,[-96.717982,43.552135],[-102.352251,43.846843],[-103.45598,43.812219],[-105.383,42.76],[-106.831,40.485],[-105.512,37.733],[-104.999,38.881],[-104.944234,39.753266],[-95.901715,41.238051],A],
    south: [A,[-90.192,38.626],[-90.878,37.557],[-89.992,34.824],[-91.028,31.563],[-90.097316,29.985141],[-89.964,29.237],[-89.944,35.373],[-94.588,39.046],A],
  },
  2024: {
    nw:    [A,[-96.39966,42.487434],[-96.717982,43.552135],[-102.352251,43.846843],[-103.45598,43.812219],[-102.858739,42.141874],[-104.944234,39.753266],[-95.901715,41.238051],A],
    south: [A,[-91.414684,39.629011],[-90.199402,38.67003],[-90.688626,37.652907],[-90.87819462,37.55672328],[-90.061691,35.137192],[-91.129822,31.940439],[-91.293109,31.57414],[-90.097316,29.985141],[-89.964,29.237],[-94.5884,39.046],A],
  },
  2025: {
    nw:    [A,[-96.39966,42.487434],[-96.717982,43.552135],[-102.352251,43.846843],[-103.45598,43.812219],[-102.858739,42.141874],[-104.944234,39.753266],[-95.901715,41.238051],A],
    south: [A,[-91.414684,39.629011],[-90.199402,38.67003],[-90.688626,37.652907],[-90.87819462,37.55672328],[-90.061691,35.137192],[-91.129822,31.940439],[-91.293109,31.57414],[-90.097316,29.985141],[-89.964,29.237],[-94.5884,39.046],A],
  },
};

// ===== STATE =====
let sites = [];
let activeYear = 'all';
let selectedSiteId = null;
const siteMarkerEls = {};   // siteId -> pin DOM element
const ecoVisible   = { l1: false, l2: false };  // ecoregion layer toggle state

// ===== MAP INIT =====
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/vickyzengyj/cmmwch4sg008501qtdd31ap5t',
  center: [-96.5, 38.5],
  zoom: 4,
  projection: 'mercator',
});

map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
map.addControl(new mapboxgl.ScaleControl({ maxWidth: 120, unit: 'imperial' }), 'bottom-right');

// ===== LOAD DATA =====
map.on('load', async () => {
  try {
    const resp = await fetch('data/sites.json');
    sites = await resp.json();
  } catch (e) {
    console.error('Could not load sites.json:', e);
    return;
  }

  loadEcoregions();   // add below routes so routes render on top
  try { await addRoutes(); } catch (e) { console.warn('Routes failed to load:', e); }
  addSiteMarkers();
  addAmesMarker();
  setupFilters();
  setupKeyboardNav();
  setupLodgingToggle();
  setupFrequencyToggle();
  setupColorModeToggle();
  setupEcoButtons();
  setupBasemapToggle();
  setupMobilePanels();
});

// ===== ROUTES =====
function routeLayerId(year, leg) {
  return `route-${year}-${leg}`;
}

async function fetchRouteFile(year, leg) {
  const resp = await fetch(`data/routes/${year}-${leg}.json`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  if (data.routes && data.routes[0]) return data.routes[0].geometry;
  if (data.type === 'Feature') return data.geometry;
  throw new Error('Unexpected format');
}

async function loadRouteGeometry(year, leg) {
  // 1. Try the exact year's route file
  if (YEARS_WITH_ROUTE_FILES.includes(year)) {
    try {
      return await fetchRouteFile(year, leg);
    } catch (e) {
      console.warn(`Route ${year}-${leg}: exact file failed (${e.message})`);
    }
  }

  // 2. Try the closest year's road-network route
  const nearest = closestRouteYear(year);
  try {
    const geom = await fetchRouteFile(nearest, leg);
    console.info(`Route ${year}-${leg}: using road network from ${nearest}`);
    return geom;
  } catch (e) {
    console.warn(`Route ${year}-${leg}: closest-year fallback also failed (${e.message}); using straight lines`);
  }

  // 3. Absolute last resort: straight-line waypoints
  const coords = ROUTE_FALLBACK[year]?.[leg];
  if (coords) return { type: 'LineString', coordinates: coords };
  return { type: 'LineString', coordinates: [A, A] };
}

async function addRoutes() {
  const promises = [];
  for (const year of YEARS_WITH_ROUTES) {
    const color = YEAR_COLORS[year];
    for (const leg of ['nw', 'south']) {
      const id = routeLayerId(year, leg);
      promises.push(
        loadRouteGeometry(year, leg).then(geometry => {
          map.addSource(id, {
            type: 'geojson',
            data: { type: 'Feature', geometry, properties: {} },
          });
          map.addLayer({
            id,
            type: 'line',
            source: id,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': color,
              'line-width': 2.5,
              'line-opacity': 0.85,
            },
          });
        })
      );
    }
  }
  await Promise.all(promises);
}

function setRouteVisibility(year) {
  for (const y of YEARS_WITH_ROUTES) {
    const visible = (year === 'all' || y === year) ? 'visible' : 'none';
    for (const leg of ['nw', 'south']) {
      const id = routeLayerId(y, leg);
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', visible);
      }
    }
  }

  // Bring selected year's layers to front
  if (year !== 'all' && YEARS_WITH_ROUTES.includes(year)) {
    for (const leg of ['nw', 'south']) {
      const id = routeLayerId(year, leg);
      if (map.getLayer(id)) map.moveLayer(id);
    }
  }
}

// ===== SITE MARKERS (red pins) =====
function makePinEl(visitCount) {
  const el = document.createElement('div');
  el.className = 'site-pin visits-flat';
  el.innerHTML = `
    <svg viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
      <path class="pin-body"
        d="M14 0C6.268 0 0 6.268 0 14c0 9.333 12 26 14 26
           C16 40 28 23.333 28 14 28 6.268 21.732 0 14 0z"/>
      <circle cx="14" cy="14" r="5.5" fill="white" opacity="0.85"/>
    </svg>`;
  return el;
}

function addSiteMarkers() {
  sites
    .filter(s => s.id !== 'ames-ia')
    .forEach(site => {
      const el = makePinEl(site.visits.length);

      el.addEventListener('mouseenter', () => {
        if (!el.classList.contains('selected')) el.classList.add('hovered');
      });
      el.addEventListener('mouseleave', () => {
        el.classList.remove('hovered');
      });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        openPanel(site.id);
      });

      siteMarkerEls[site.id] = el;

      new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([site.lng, site.lat])
        .addTo(map);
    });
}

// Clicking the map background (not a pin) closes the panel
map.on('click', () => {
  if (selectedSiteId) closePanel();
});

function addAmesMarker() {
  const el = document.createElement('div');
  el.className = 'ames-marker';
  el.innerHTML = '&#9733;'; // ★
  el.title = 'Iowa State University — Ames, IA';

  const popup = new mapboxgl.Popup({ offset: 18, closeButton: false, className: 'ames-popup' })
    .setHTML('<strong>Iowa State University</strong><br>Ames, Iowa &mdash; Home base');

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    popup.addTo(map);
  });

  new mapboxgl.Marker({ element: el, anchor: 'center' })
    .setLngLat([-93.653213, 42.028359])
    .setPopup(popup)
    .addTo(map);
}

function setMarkerSelected(siteId) {
  Object.values(siteMarkerEls).forEach(el => {
    el.classList.remove('selected', 'hovered');
  });
  if (siteId && siteMarkerEls[siteId]) {
    siteMarkerEls[siteId].classList.add('selected');
  }
}

// ===== YEAR FILTER BUTTONS =====
// ── Lodging layer — swaps pin SVG in-place; no separate markers ───────────────
let lodgingVisible = false;
const originalPinHTML = {};  // siteId -> original pin innerHTML (restored when layer off)

// Pin-sized (18×26) SVGs for hotel and tent
const HOTEL_PIN_SVG = `<svg viewBox="0 0 18 26" xmlns="http://www.w3.org/2000/svg">
  <!-- ground -->
  <rect x="0" y="22" width="18" height="4" rx="1" fill="#b71c1c"/>
  <!-- buildings -->
  <rect x="1"  y="10" width="5" height="12" rx="0.5" fill="#c62828"/>
  <rect x="7"  y="6"  width="5" height="16" rx="0.5" fill="#e53935"/>
  <rect x="13" y="13" width="4" height="9"  rx="0.5" fill="#c62828"/>
  <!-- windows -->
  <rect x="2"  y="12" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.9"/>
  <rect x="4"  y="12" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.9"/>
  <rect x="2"  y="15" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.9"/>
  <rect x="4"  y="15" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.9"/>
  <rect x="8"  y="8"  width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.9"/>
  <rect x="10" y="8"  width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.9"/>
  <rect x="8"  y="11" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.9"/>
  <rect x="10" y="11" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.9"/>
  <rect x="14" y="15" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.9"/>
  <rect x="14" y="18" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.9"/>
</svg>`;

const TENT_PIN_SVG = `<svg viewBox="0 0 18 26" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="21" width="18" height="5" rx="2" fill="#1b5e20"/>
  <polygon points="9,1 0,22 18,22" fill="#2e7d32"/>
  <polygon points="9,5 6,22 12,22" fill="#1b5e20" opacity="0.5"/>
  <rect x="7" y="15" width="4" height="7" rx="1" fill="white" opacity="0.9"/>
</svg>`;

function getLodgingForYear(site, year) {
  if (year === 'all') {
    const found = [...site.visits].reverse().find(vi => vi.accommodation);
    return found ? found.accommodation : null;
  }
  const visit = site.visits.find(vi => vi.year === year);
  return visit ? (visit.accommodation || null) : null;
}

function applyLodgingIcons(year) {
  sites.filter(s => s.id !== 'ames-ia').forEach(site => {
    const el = siteMarkerEls[site.id];
    if (!el) return;
    const type = getLodgingForYear(site, year);
    if (!type) return;
    originalPinHTML[site.id] = el.innerHTML;
    el.innerHTML = type === 'Hotel' ? HOTEL_PIN_SVG : TENT_PIN_SVG;
    el.classList.add('lodging-mode', type === 'Hotel' ? 'lodging-hotel' : 'lodging-camp');
  });
}

function removeLodgingIcons() {
  sites.filter(s => s.id !== 'ames-ia').forEach(site => {
    const el = siteMarkerEls[site.id];
    if (!el || !originalPinHTML[site.id]) return;
    el.innerHTML = originalPinHTML[site.id];
    el.classList.remove('lodging-mode', 'lodging-hotel', 'lodging-camp');
    delete originalPinHTML[site.id];
  });
}

function syncMobileButtons() {
  document.getElementById('mob-lodging-btn')?.classList.toggle('active', lodgingVisible);
  document.getElementById('mob-freq-btn')?.classList.toggle('active',    colorMode === 'frequency');
  document.getElementById('mob-recency-btn')?.classList.toggle('active', colorMode === 'recency');
}

function setupLodgingToggle() {
  const handler = () => {
    lodgingVisible = !lodgingVisible;
    document.getElementById('lodging-btn').classList.toggle('active', lodgingVisible);
    document.getElementById('lodging-legend').style.display = lodgingVisible ? 'flex' : 'none';
    if (lodgingVisible) { applyLodgingIcons(activeYear); } else { removeLodgingIcons(); }
    syncMobileButtons();
  };
  document.getElementById('lodging-btn').addEventListener('click', handler);
  document.getElementById('mob-lodging-btn')?.addEventListener('click', handler);
}

// ===== COLOR MODE TOGGLE (default / frequency / recency) =====
let colorMode = 'default'; // 'default' | 'frequency' | 'recency'

function getRecencyClass(site) {
  const maxYear = Math.max(...site.visits.map(v => v.year));
  if (maxYear >= 2022) return 'recency-new';
  if (maxYear >= 2016) return 'recency-mid';
  if (maxYear >= 2010) return 'recency-old';
  return 'recency-ancient';
}

const ALL_COLOR_CLASSES = [
  'visits-flat', 'visits-1', 'visits-2', 'visits-many', 'visits-top',
  'recency-new', 'recency-mid', 'recency-old', 'recency-ancient'
];

function applyColorMode(mode) {
  sites.filter(s => s.id !== 'ames-ia').forEach(site => {
    const el = siteMarkerEls[site.id];
    if (!el) return;
    el.classList.remove(...ALL_COLOR_CLASSES);
    if (mode === 'recency') {
      el.classList.add(getRecencyClass(site));
    } else if (mode === 'frequency') {
      const count = site.visits.length;
      el.classList.add(count >= 10 ? 'visits-top' : count >= 5 ? 'visits-many' : count >= 2 ? 'visits-2' : 'visits-1');
    } else {
      el.classList.add('visits-flat');
    }
  });
}

function setupFrequencyToggle() {
  const handler = () => {
    const turningOn = colorMode !== 'frequency';
    colorMode = turningOn ? 'frequency' : 'default';
    document.getElementById('frequency-btn').classList.toggle('active', turningOn);
    document.getElementById('color-mode-btn').classList.remove('active');
    document.getElementById('frequency-legend').style.display = turningOn ? 'flex' : 'none';
    document.getElementById('recency-legend').style.display = 'none';
    applyColorMode(colorMode);
    syncMobileButtons();
  };
  document.getElementById('frequency-btn').addEventListener('click', handler);
  document.getElementById('mob-freq-btn')?.addEventListener('click', handler);
}

function setupColorModeToggle() {
  const handler = () => {
    const turningOn = colorMode !== 'recency';
    colorMode = turningOn ? 'recency' : 'default';
    document.getElementById('color-mode-btn').classList.toggle('active', turningOn);
    document.getElementById('frequency-btn').classList.remove('active');
    document.getElementById('recency-legend').style.display = turningOn ? 'flex' : 'none';
    document.getElementById('frequency-legend').style.display = 'none';
    applyColorMode(colorMode);
    syncMobileButtons();
  };
  document.getElementById('color-mode-btn').addEventListener('click', handler);
  document.getElementById('mob-recency-btn')?.addEventListener('click', handler);
}

function applyYearFilter(raw) {
  activeYear = raw === 'all' ? 'all' : parseInt(raw);
  document.querySelectorAll('.filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.year === raw)
  );
  const mobSel = document.getElementById('mobile-year-select');
  if (mobSel) mobSel.value = raw;
  setRouteVisibility(activeYear);
  setPinDimming(activeYear);
  if (lodgingVisible) { removeLodgingIcons(); applyLodgingIcons(activeYear); }
  ['l1', 'l2'].forEach(level => { if (ecoVisible[level]) applyEcoFilter(level); });
  if (activeYear === 'all') { closeYearPanel(); } else { openYearPanel(activeYear); }
}

function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => applyYearFilter(btn.dataset.year));
  });

  const mobSel = document.getElementById('mobile-year-select');
  if (mobSel) mobSel.addEventListener('change', function() { applyYearFilter(this.value); });
}

function setupKeyboardNav() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const btns = [...document.querySelectorAll('.filter-btn')];
    const years = btns.map(b => b.dataset.year === 'all' ? 'all' : parseInt(b.dataset.year));
    const cur = years.indexOf(activeYear);
    if (cur === -1) return;
    const next = e.key === 'ArrowRight' ? cur + 1 : cur - 1;
    if (next >= 0 && next < btns.length) btns[next].click();
  });
}

function setPinDimming(year) {
  sites.filter(s => s.id !== 'ames-ia').forEach(site => {
    const el = siteMarkerEls[site.id];
    if (!el) return;
    const dimmed = year !== 'all' && !site.visits.some(v => v.year === year);
    el.classList.toggle('dimmed', dimmed);
  });
}

// ===== FIREBASE PHOTOS TAB =====
let currentPhotoSiteId = null;

async function renderPhotosTab(siteId) {
  currentPhotoSiteId = siteId;
  const pane = document.getElementById('tab-photos');
  pane.innerHTML = '<p class="media-empty">Loading photos…</p>';

  let docs = [];
  try {
    const snapshot = await db.collection('photos')
      .where('siteId', '==', siteId)
      .where('status', '==', 'approved')
      .get();
    if (siteId !== currentPhotoSiteId) return;
    docs = snapshot.docs;
  } catch (e) {
    console.error('Failed to load photos:', e);
    if (siteId === currentPhotoSiteId) {
      pane.innerHTML = '<p class="media-empty">Could not load photos.</p>';
    }
    return;
  }

  if (docs.length === 0) {
    pane.innerHTML = '<p class="media-empty">No stories yet for this site.</p>';
    return;
  }

  pane.innerHTML = '';

  // Sort bar — icon-only button + dropdown
  const SORT_LABELS = { likes: 'Most Liked', year: 'By Year', recent: 'Recent Upload' };
  let currentSort = 'likes';

  const toolbar = document.createElement('div');
  toolbar.className = 'photos-sort-bar';
  toolbar.innerHTML = `
    <button class="lodging-btn sort-icon-btn" title="Sort stories">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 4h5M2 8h8M2 12h11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M13 2v9m0 0l-2-2.5M13 11l2-2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <div class="sort-dropdown">
      <button class="sort-option active" data-sort="likes">Most Liked</button>
      <button class="sort-option" data-sort="year">By Year</button>
      <button class="sort-option" data-sort="recent">Recent Upload</button>
    </div>
  `;
  pane.appendChild(toolbar);

  const iconBtn  = toolbar.querySelector('.sort-icon-btn');
  const dropdown = toolbar.querySelector('.sort-dropdown');

  iconBtn.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
    iconBtn.classList.toggle('active', dropdown.classList.contains('open'));
  });
  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    iconBtn.classList.remove('active');
  }, { capture: true, once: false });

  const grid = document.createElement('div');
  grid.className = 'photos-grid';
  pane.appendChild(grid);

  function sortedDocs(mode) {
    const arr = [...docs];
    if (mode === 'likes')  arr.sort((a, b) => (b.data().likeCount || 0) - (a.data().likeCount || 0));
    if (mode === 'year')   arr.sort((a, b) => (b.data().year || 0) - (a.data().year || 0));
    if (mode === 'recent') arr.sort((a, b) => {
      const ta = a.data().uploadedAt?.toMillis?.() ?? 0;
      const tb = b.data().uploadedAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
    return arr;
  }

  function renderCards(mode) {
    grid.innerHTML = '';
    const sorted = sortedDocs(mode);
    sorted.forEach((doc, idx) => {
      const d      = doc.data();
      const liked  = hasLiked(doc.id);
      const byline = [d.contributorName, d.year].filter(Boolean).join(', ');
      const card   = document.createElement('div');
      card.className = 'photo-card';
      card.innerHTML = `
        <img src="${escHtml(d.storageURL)}" alt="${escHtml(d.description || '')}" loading="lazy" style="cursor:zoom-in">
        ${d.description ? `<div class="photo-desc">${escHtml(d.description)}</div>` : ''}
        <div class="photo-meta">
          <span class="photo-byline">${escHtml(byline)}</span>
          <button class="like-btn${liked ? ' liked' : ''}" data-doc-id="${doc.id}"${liked ? ' disabled' : ''}>
            &#9829; <span class="like-count">${d.likeCount || 0}</span>
          </button>
        </div>`;
      card.querySelector('img').addEventListener('click', () => openLightbox(sorted, idx));
      const likeBtn = card.querySelector('.like-btn:not([disabled])');
      if (likeBtn) likeBtn.addEventListener('click', function() { likePhoto(this); });
      grid.appendChild(card);
    });
  }

  toolbar.querySelectorAll('.sort-option').forEach(opt => {
    opt.addEventListener('click', e => {
      e.stopPropagation();
      currentSort = opt.dataset.sort;
      toolbar.querySelectorAll('.sort-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      dropdown.classList.remove('open');
      iconBtn.classList.remove('active');
      renderCards(currentSort);
    });
  });

  renderCards('likes');
}

async function likePhoto(btn) {
  const docId = btn.dataset.docId;
  if (hasLiked(docId)) return;
  btn.disabled = true;
  btn.classList.add('liked');
  try {
    await db.collection('photos').doc(docId).update({
      likeCount: firebase.firestore.FieldValue.increment(1),
    });
    markLiked(docId);
    const countEl = btn.querySelector('.like-count');
    countEl.textContent = parseInt(countEl.textContent, 10) + 1;
  } catch (e) {
    console.error('Like failed:', e);
    btn.disabled = false;
    btn.classList.remove('liked');
  }
}

function hasLiked(docId) {
  return JSON.parse(localStorage.getItem('savanna_liked_photos') || '[]').includes(docId);
}

function markLiked(docId) {
  const liked = JSON.parse(localStorage.getItem('savanna_liked_photos') || '[]');
  liked.push(docId);
  localStorage.setItem('savanna_liked_photos', JSON.stringify(liked));
}

// ===== SIDE PANEL =====
async function openPanel(siteId) {
  // Mutually exclusive with year panel
  closeYearPanel();

  selectedSiteId = siteId;
  const site = sites.find(s => s.id === siteId);
  if (!site) return;

  setMarkerSelected(siteId);

  // Zoom to ~1"=50mi (zoom 7) and offset center so pin isn't behind the side panel
  const panelWidth = window.innerWidth > 639 ? 440 : 0;
  map.easeTo({
    center: [site.lng, site.lat],
    zoom: 7,
    offset: [-panelWidth / 2, 0],
    duration: 600,
  });

  renderPanelHeader(site);
  renderOverview(site);
  renderPhotosTab(siteId);

  switchTab('overview');
  document.getElementById('side-panel').classList.add('open');
}

function closePanel() {
  selectedSiteId = null;
  setMarkerSelected(null);
  const p = document.getElementById('side-panel');
  p.classList.remove('open');
  p.classList.remove('expanded');
}

document.getElementById('close-panel').addEventListener('click', closePanel);

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-pane').forEach(p => {
    p.classList.toggle('active', p.id === 'tab-' + tab);
  });
}

// ===== PANEL HEADER =====
function renderPanelHeader(site) {
  document.getElementById('panel-site-name').textContent = site.name;
  document.getElementById('panel-state').textContent = stateFullName(site.state);

  const years = site.visits.map(v => v.year).sort((a, b) => a - b);
  const first  = years[0];
  const last   = years[years.length - 1];

  document.getElementById('panel-chips').innerHTML = `
    <span class="chip">${years.length} visit${years.length !== 1 ? 's' : ''}</span>
    <span class="chip">First: ${first}</span>
    <span class="chip">Recent: ${last}</span>
  `;
}

// ===== OVERVIEW TAB =====
function renderOverview(site) {
  const sorted = [...site.visits].sort((a, b) => a.year - b.year);
  const description = site.visits[0]?.description || '';

  const yearRows = sorted.map(visit => `
    <div class="visit-block">
      <div class="visit-year">${visit.year}</div>
      <div class="visit-instructors">${visit.instructors.join(' &middot; ')}</div>
    </div>
  `).join('');

  document.getElementById('tab-overview').innerHTML = `
    <div class="site-description">${escHtml(description)}</div>
    ${yearRows}
  `;
}

// ===== HELPERS =====
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===== ECOREGIONS =====

// Natural color palette keyed by NA_L1CODE (string)
const ECO_L1_COLOR = [
  'match', ['get', 'NA_L1CODE'],
  '0',  '#a8c8e8',  // Water
  '1',  '#c8d8cc',  // Arctic Cordillera
  '2',  '#bdd4bc',  // Tundra
  '3',  '#4a7c59',  // Taiga
  '4',  '#7ab890',  // Hudson Plain
  '5',  '#5a9468',  // Northern Forests
  '6',  '#3d6b5e',  // Northwestern Forested Mountains
  '7',  '#5c8a5c',  // Marine West Coast Forest
  '8',  '#7aab6e',  // Eastern Temperate Forests
  '9',  '#d4c87a',  // Great Plains
  '10', '#d4a870',  // North American Deserts
  '11', '#b8c878',  // Mediterranean California
  '12', '#c8a860',  // Southern Semiarid Highlands
  '13', '#8898b8',  // Temperate Sierras
  '14', '#a8b870',  // Tropical Dry Forests
  '15', '#5a9460',  // Tropical Wet Forests
  '#aaaaaa'         // fallback
];

// Distinct color palette keyed by NA_L2CODE (string) — each L2 sub-region gets its own hue
const ECO_L2_COLOR = [
  'match', ['get', 'NA_L2CODE'],
  '0.0',  '#a8c8e8',  // Water
  // Arctic / Tundra (1–2) — icy blues
  '1.1',  '#daeaf5',  // Arctic Cordillera
  '2.1',  '#b8d4ec',  // Northern Arctic
  '2.2',  '#9ec4e4',  // Alaska Tundra
  '2.3',  '#84b4dc',  // Brooks Range Tundra
  '2.4',  '#6aa4d4',  // Southern Arctic
  // Taiga (3–4) — blue-greens
  '3.1',  '#7ab4c8',  // Alaska Boreal Interior
  '3.2',  '#5ea4b8',  // Taiga Cordillera
  '3.3',  '#4494a8',  // Taiga Plain
  '3.4',  '#2a8498',  // Taiga Shield
  '4.1',  '#4aa49a',  // Hudson Plain
  // Northern / Boreal Forests (5–7) — greens
  '5.1',  '#4a9470',  // Softwood Shield
  '5.2',  '#5aa880',  // Mixed Wood Shield
  '5.3',  '#6abc90',  // Atlantic Highlands
  '5.4',  '#7ad0a0',  // Boreal Plain
  '6.1',  '#3a8c60',  // Boreal Cordillera
  '6.2',  '#2a7850',  // Western Cordillera
  '7.1',  '#1a6440',  // Marine West Coast Forest
  // Eastern Temperate Forests (8) — warm olive-greens
  '8.1',  '#7ab04a',  // Mixed Wood Plains
  '8.2',  '#8ec058',  // Central USA Plains
  '8.3',  '#a2d066',  // Southeastern USA Plains
  '8.4',  '#b4dc7a',  // Ozark/Ouachita-Appalachian Forests
  '8.5',  '#90c460',  // Mississippi Alluvial & SE Coastal Plains
  // Great Plains (9) — golden yellows / tans
  '9.2',  '#d4c85a',  // Temperate Prairies
  '9.3',  '#deba44',  // West-Central Semiarid Prairies
  '9.4',  '#e8aa30',  // South Central Semiarid Prairies
  '9.5',  '#e09a48',  // Texas-Louisiana Coastal Plain
  '9.6',  '#d88a38',  // Tamaulipas-Texas Semiarid Plain
  // Deserts (10) — sandy oranges
  '10.1', '#cc7828',  // Cold Deserts
  '10.2', '#dc6418',  // Warm Deserts
  // Mediterranean CA (11) — yellow-green
  '11.1', '#c4d058',  // Mediterranean California
  // Southern Semiarid Highlands (12) — tan-browns
  '12.1', '#b87a3a',  // Western Sierra Madre Piedmont
  '12.2', '#c88c48',  // Mexican High Plateau
  // Temperate Sierras (13) — muted blue-purples
  '13.1', '#9870a0',  // Upper Gila Mountains
  '13.2', '#a880b0',  // Western Sierra Madre
  '13.3', '#b890c0',  // Eastern Sierra Madre
  '13.4', '#c8a0d0',  // Transversal Neo-Volcanic System
  '13.5', '#a070a0',  // Southern Sierra Madre
  '13.6', '#886090',  // Central American Ranges
  // Tropical Dry (14) — warm ochres
  '14.1', '#c89060',  // Dry Gulf of Mexico Coastal Plains
  '14.2', '#d4a070',  // NW Plain of Yucatan Peninsula
  '14.3', '#c07850',  // W Pacific Coastal Plain & Hills
  '14.4', '#b06840',  // Interior Depressions
  '14.5', '#c88050',  // S Pacific Coastal Plain & Hills
  '14.6', '#b87840',  // Sierra & Plains of El Cabo
  // Tropical Wet (15) — vivid greens
  '15.1', '#70b868',  // Humid Gulf of Mexico Coastal Plains
  '15.2', '#80c878',  // Plain & Hills of Yucatan Peninsula
  '15.3', '#509c48',  // Sierra Los Tuxtlas
  '15.4', '#60a858',  // Everglades
  '15.5', '#70b465',  // W Pacific Plain & Hills
  '15.6', '#5aa058',  // Coastal Plain & Hills of Soconusco
  '#aaaaaa'           // fallback
];

function loadEcoregions() {
  // ---- Level 1 ----
  map.addSource('eco-l1', { type: 'geojson', data: 'data/ecoregion_l1.geojson' });
  map.addLayer({
    id: 'eco-l1-fill', type: 'fill', source: 'eco-l1',
    layout: { visibility: 'none' },
    paint: { 'fill-color': ECO_L1_COLOR, 'fill-opacity': 0.35 },
  });
  map.addLayer({
    id: 'eco-l1-line', type: 'line', source: 'eco-l1',
    layout: { visibility: 'none' },
    paint: { 'line-color': '#555', 'line-width': 0.8, 'line-opacity': 0.6 },
  });

  // ---- Level 2 (distinct color per L2 sub-region) ----
  map.addSource('eco-l2', { type: 'geojson', data: 'data/ecoregion_l2.geojson' });
  map.addLayer({
    id: 'eco-l2-fill', type: 'fill', source: 'eco-l2',
    layout: { visibility: 'none' },
    paint: { 'fill-color': ECO_L2_COLOR, 'fill-opacity': 0.35 },
  });
  map.addLayer({
    id: 'eco-l2-line', type: 'line', source: 'eco-l2',
    layout: { visibility: 'none' },
    paint: { 'line-color': '#444', 'line-width': 0.5, 'line-opacity': 0.55 },
  });

  // Hover tooltip showing region name — appears after 0.5s of stillness
  const ecoPopup = new mapboxgl.Popup({
    closeButton: false, closeOnClick: false, className: 'eco-popup',
  });
  let ecoHoverTimer = null;

  ['eco-l1-fill', 'eco-l2-fill'].forEach(layerId => {
    const isL2 = layerId.includes('l2');
    map.on('mousemove', layerId, e => {
      map.getCanvas().style.cursor = 'crosshair';
      clearTimeout(ecoHoverTimer);
      ecoPopup.remove();
      const p = e.features[0].properties;
      const label = isL2
        ? `<strong>${titleCase(p.NA_L2NAME)}</strong><br><span>${titleCase(p.NA_L1NAME)}</span>`
        : `<strong>${titleCase(p.NA_L1NAME)}</strong>`;
      ecoHoverTimer = setTimeout(() => {
        ecoPopup.setLngLat(e.lngLat).setHTML(label).addTo(map);
      }, 500);
    });
    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
      clearTimeout(ecoHoverTimer);
      ecoPopup.remove();
    });
  });
}

// Track per-level filter state: 'visited' (default) | 'all'
const ecoFilter = { l1: 'visited', l2: 'visited' };

function setEcoVisibility(level, visible) {
  const fill = `eco-${level}-fill`;
  const line = `eco-${level}-line`;
  const v = visible ? 'visible' : 'none';
  if (map.getLayer(fill)) map.setLayoutProperty(fill, 'visibility', v);
  if (map.getLayer(line)) map.setLayoutProperty(line, 'visibility', v);
  ecoVisible[level] = visible;
  document.getElementById(`eco-btn-${level}`).classList.toggle('active', visible);
  // Show/hide hover submenu affordance by toggling class on wrapper
  const wrap = document.getElementById(`eco-wrap-${level}`);
  if (wrap) wrap.classList.toggle('layer-on', visible);
  // Reset to 'visited' when turning off
  if (!visible) {
    ecoFilter[level] = 'visited';
    document.getElementById(`eco-visited-${level}`).classList.remove('active');
    if (map.getLayer(fill)) map.setFilter(fill, null);
    if (map.getLayer(line)) map.setFilter(line, null);
  }
}

function applyEcoFilter(level) {
  if (!yearSummaries) return;
  const fill = `eco-${level}-fill`;
  const line = `eco-${level}-line`;
  const prop = level === 'l1' ? 'NA_L1NAME' : 'NA_L2NAME';
  const key  = level === 'l1' ? 'ecoregions' : 'ecoregions_l2';

  if (ecoFilter[level] === 'all') {
    if (map.getLayer(fill)) map.setFilter(fill, null);
    if (map.getLayer(line)) map.setFilter(line, null);
    return;
  }

  // Collect visited region names for current year (or all years)
  let visited;
  if (activeYear !== 'all') {
    visited = (yearSummaries[String(activeYear)] || {})[key] || [];
  } else {
    visited = [...new Set(Object.values(yearSummaries).flatMap(y => y[key] || []))];
  }

  const expr = ['in', ['get', prop], ['literal', visited]];
  if (map.getLayer(fill)) map.setFilter(fill, expr);
  if (map.getLayer(line)) map.setFilter(line, expr);
}

function setupEcoButtons() {
  // No ecoregion layers shown by default

  ['l1', 'l2'].forEach(level => {
    document.getElementById(`eco-btn-${level}`).addEventListener('click', () => {
      setEcoVisibility(level, !ecoVisible[level]);
      if (ecoVisible[level]) applyEcoFilter(level);
    });

    // Hover submenu: toggle between visited-only and all
    document.getElementById(`eco-visited-${level}`).addEventListener('click', () => {
      ecoFilter[level] = ecoFilter[level] === 'visited' ? 'all' : 'visited';
      const showingAll = ecoFilter[level] === 'all';
      const btn = document.getElementById(`eco-visited-${level}`);
      btn.classList.toggle('active', showingAll);
      btn.textContent = showingAll ? '✓ Show all regions' : 'Show all regions';
      applyEcoFilter(level);
    });
  });
}

function titleCase(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

// ===== BASEMAP TOGGLE (satellite overlay) =====
let satelliteMode = false;

function setupBasemapToggle() {
  // Add satellite as a raster underlay, inserted just below the first symbol layer
  map.addSource('mapbox-satellite', {
    type: 'raster',
    url: 'mapbox://mapbox.satellite',
    tileSize: 256,
  });
  const firstSymbolId = map.getStyle().layers.find(l => l.type === 'symbol')?.id;
  map.addLayer({
    id: 'satellite-raster',
    type: 'raster',
    source: 'mapbox-satellite',
    layout: { visibility: 'none' },
    paint: { 'raster-opacity': 1 },
  }, firstSymbolId);

  document.getElementById('basemap-btn').addEventListener('click', () => {
    satelliteMode = !satelliteMode;
    map.setLayoutProperty('satellite-raster', 'visibility', satelliteMode ? 'visible' : 'none');
    const btn = document.getElementById('basemap-btn');
    btn.classList.toggle('active', satelliteMode);
    btn.lastChild.textContent = satelliteMode ? 'Default' : 'Satellite';
  });
}

const STATE_NAMES = {
  AR:'Arkansas', CO:'Colorado', GA:'Georgia', IA:'Iowa', IL:'Illinois',
  IN:'Indiana',  KS:'Kansas',   KY:'Kentucky', LA:'Louisiana', MB:'Manitoba, Canada',
  MN:'Minnesota', MO:'Missouri', MS:'Mississippi', MT:'Montana', NC:'North Carolina',
  ND:'North Dakota', NE:'Nebraska', NL:'Nuevo León, Mexico', OK:'Oklahoma',
  SD:'South Dakota', TM:'Tamaulipas, Mexico', TN:'Tennessee', TX:'Texas',
  WI:'Wisconsin', WY:'Wyoming',
};
function stateFullName(abbr) {
  return STATE_NAMES[abbr] || abbr;
}

// ===== YEAR SUMMARY PANEL =====
let yearSummaries = null;
let lbCurrentDocId = null;

async function loadYearSummaries() {
  if (yearSummaries) return yearSummaries;
  try {
    const resp = await fetch('data/year_summaries.json');
    yearSummaries = await resp.json();
  } catch (e) {
    console.warn('Could not load year_summaries.json:', e);
    yearSummaries = {};
  }
  return yearSummaries;
}

async function openYearPanel(year) {
  const sidePanel = document.getElementById('side-panel');
  const yearPanel = document.getElementById('year-panel');
  if (!yearPanel) { console.error('year-panel element not found'); return; }

  // Mutually exclusive with site panel
  sidePanel?.classList.remove('open');

  // Open immediately so the panel is visible regardless of async load time
  yearPanel.classList.add('open');
  document.getElementById('yp-title').textContent = `${year} Traveling Savanna`;

  let summaries, data;
  try {
    summaries = await loadYearSummaries();
    data = summaries[String(year)] || {};
  } catch (e) {
    console.error('openYearPanel: loadYearSummaries failed:', e);
    data = {};
  }

  // Trips & destinations
  const tripsEl = document.getElementById('yp-trips');
  tripsEl.innerHTML = '';
  const trips = data.trips || {};
  const legOrder = ['NW Trip', 'East Trip', 'North Trip', 'South Trip'];
  const legs = legOrder.filter(l => trips[l]).concat(Object.keys(trips).filter(l => !legOrder.includes(l)));
  if (legs.length === 0) {
    tripsEl.innerHTML = '<span class="yp-placeholder">No itinerary data yet.</span>';
  } else {
    legs.forEach(leg => {
      const block = document.createElement('div');
      block.className = 'yp-trip-block';
      const legLabel = leg;
      block.innerHTML = `
        <div class="yp-trip-leg">${legLabel} — ${trips[leg].length} destinations</div>
        <div class="yp-trip-sites">${trips[leg].join(' · ')}</div>
      `;
      tripsEl.appendChild(block);
    });
  }

  // Instructors
  const instrEl = document.getElementById('yp-instructors');
  const instrs = data.instructors && data.instructors.length ? data.instructors : null;
  instrEl.innerHTML = instrs
    ? `<div class="yp-text">${instrs.join(' &nbsp;·&nbsp; ')}</div>`
    : '<span class="yp-placeholder">Instructor names not yet recorded.</span>';

  // Students
  const studEl = document.getElementById('yp-students');
  if (data.student_count) {
    const type = data.student_type ? ` ${data.student_type}` : '';
    studEl.innerHTML = `<div class="yp-text">${data.student_count}${type} students</div>`;
  } else {
    studEl.innerHTML = '<span class="yp-placeholder">Student count not yet recorded.</span>';
  }

  // Ecoregions L1
  const ecoEl = document.getElementById('yp-ecoregions');
  const ecos = data.ecoregions && data.ecoregions.length ? data.ecoregions : null;
  ecoEl.innerHTML = ecos
    ? ecos.map(e => `<span class="yp-eco-tag">${titleCase(e)}</span>`).join('')
    : '<span class="yp-placeholder">No ecoregion data.</span>';

  // Ecoregions L2
  const ecoL2El = document.getElementById('yp-ecoregions-l2');
  const ecosL2 = data.ecoregions_l2 && data.ecoregions_l2.length ? data.ecoregions_l2 : null;
  ecoL2El.innerHTML = ecosL2
    ? ecosL2.map(e => `<span class="yp-eco-tag yp-eco-tag-l2">${titleCase(e)}</span>`).join('')
    : '<span class="yp-placeholder">No ecoregion data.</span>';

  // Photo strip — load from Firestore (non-blocking, panel already open)
  buildYearStrip(year).catch(e => console.warn('Year strip failed:', e));
}

function closeYearPanel() {
  const p = document.getElementById('year-panel');
  p.classList.remove('open');
  p.classList.remove('expanded');
}

function setupMobilePanels() {
  document.getElementById('side-panel-handle').addEventListener('click', () => {
    document.getElementById('side-panel').classList.toggle('expanded');
  });
  document.getElementById('year-panel-handle').addEventListener('click', () => {
    document.getElementById('year-panel').classList.toggle('expanded');
  });
}

async function buildYearStrip(year) {
  const wrap     = document.getElementById('yp-strip-wrap');
  const noPhotos = document.getElementById('yp-no-photos');

  wrap.classList.remove('active');
  wrap.innerHTML = '';
  noPhotos.style.display = 'none';

  let docs = [];
  try {
    const snap = await db.collection('photos')
      .where('status', '==', 'approved')
      .where('year', '==', Number(year))
      .get();
    docs = snap.docs;
  } catch (e) {
    console.warn('Year strip Firestore query failed:', e);
  }

  if (docs.length === 0) {
    noPhotos.style.display = '';
    return;
  }

  wrap.classList.add('active');

  const PAGE_SIZE  = 6;
  const totalPages = Math.ceil(docs.length / PAGE_SIZE);
  let page = 0;

  const grid = document.createElement('div');
  grid.className = 'yp-photo-grid';
  wrap.appendChild(grid);

  const nav = document.createElement('div');
  nav.className = 'yp-strip-nav';
  nav.innerHTML = `
    <button class="yp-nav-btn" id="yp-prev">&#8249;</button>
    <span class="yp-page-count"></span>
    <button class="yp-nav-btn" id="yp-next">&#8250;</button>
  `;
  if (totalPages > 1) wrap.appendChild(nav);

  const prevBtn    = nav.querySelector('#yp-prev');
  const nextBtn    = nav.querySelector('#yp-next');
  const pageCount  = nav.querySelector('.yp-page-count');

  function renderPage() {
    grid.innerHTML = '';
    const start = page * PAGE_SIZE;
    docs.slice(start, start + PAGE_SIZE).forEach((doc, i) => {
      const d  = doc.data();
      const el = document.createElement('div');
      el.className = 'yp-strip-item';
      el.innerHTML = `<img src="${escHtml(d.storageURL)}" alt="${escHtml(d.description || '')}" loading="lazy">`;
      el.addEventListener('click', () => openLightbox(docs, start + i));
      grid.appendChild(el);
    });
    if (totalPages > 1) {
      prevBtn.disabled    = page === 0;
      nextBtn.disabled    = page >= totalPages - 1;
      pageCount.textContent = `${page + 1} / ${totalPages}`;
    }
  }

  prevBtn.addEventListener('click', () => { if (page > 0)               { page--; renderPage(); } });
  nextBtn.addEventListener('click', () => { if (page < totalPages - 1)  { page++; renderPage(); } });

  renderPage();
}

// ── Lightbox with prev / next navigation ────────────────────────────────────
let lbDocs  = [];   // current photo list (Firestore docs)
let lbIndex = 0;    // current position in lbDocs

function openLightbox(docs, startIndex) {
  lbDocs  = docs;
  lbIndex = startIndex;
  renderLightboxSlide();
}

function renderLightboxSlide() {
  const doc  = lbDocs[lbIndex];
  const d    = doc.data();
  lbCurrentDocId = doc.id;

  document.getElementById('lightbox-img').src = d.storageURL || '';
  document.getElementById('lb-description').textContent =
    d.description || '';
  document.getElementById('lb-contributor').textContent =
    d.contributorName ? `📷 ${d.contributorName}` : '';
  const lbSite = sites && d.siteId ? sites.find(s => s.id === d.siteId) : null;
  const lbLocation = lbSite ? `${lbSite.name}, ${lbSite.state}` : (d.siteId || '');
  document.getElementById('lb-year').textContent =
    [lbLocation, d.year].filter(Boolean).join(' · ');

  const likeBtn   = document.getElementById('lb-like-btn');
  const likeCount = document.getElementById('lb-like-count');
  likeCount.textContent = d.likeCount || 0;
  const liked = hasLiked(doc.id);
  likeBtn.classList.toggle('liked', liked);
  likeBtn.disabled = liked;

  document.getElementById('lb-prev').style.visibility =
    lbIndex > 0 ? 'visible' : 'hidden';
  document.getElementById('lb-next').style.visibility =
    lbIndex < lbDocs.length - 1 ? 'visible' : 'hidden';

  document.getElementById('lightbox').classList.add('visible');
}

document.getElementById('lightbox').addEventListener('click', (e) => {
  if (e.target === document.getElementById('lightbox') ||
      e.target === document.getElementById('lightbox-img')) {
    document.getElementById('lightbox').classList.remove('visible');
  }
});

document.getElementById('lightbox-close').addEventListener('click', () => {
  document.getElementById('lightbox').classList.remove('visible');
});

document.getElementById('lb-prev').addEventListener('click', e => {
  e.stopPropagation();
  if (lbIndex > 0) { lbIndex--; renderLightboxSlide(); }
});

document.getElementById('lb-next').addEventListener('click', e => {
  e.stopPropagation();
  if (lbIndex < lbDocs.length - 1) { lbIndex++; renderLightboxSlide(); }
});

document.getElementById('lb-like-btn').addEventListener('click', async (e) => {
  e.stopPropagation();
  const docId = lbCurrentDocId;
  if (!docId || hasLiked(docId)) return;
  const btn = document.getElementById('lb-like-btn');
  btn.disabled = true;
  btn.classList.add('liked');
  try {
    await db.collection('photos').doc(docId).update({
      likeCount: firebase.firestore.FieldValue.increment(1),
    });
    markLiked(docId);
    const el = document.getElementById('lb-like-count');
    el.textContent = parseInt(el.textContent, 10) + 1;
  } catch (e) {
    console.error('Like failed:', e);
    btn.disabled = false;
    btn.classList.remove('liked');
  }
});

document.getElementById('close-year-panel').addEventListener('click', closeYearPanel);
