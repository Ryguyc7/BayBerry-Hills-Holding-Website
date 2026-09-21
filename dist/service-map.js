(() => {
  const container = document.querySelector('#service-map');
  const fallback = document.querySelector('#map-fallback');
  const status = document.querySelector('#map-selection');
  const buttons = [...document.querySelectorAll('[data-town]')];
  const towns = {
    Falmouth: [41.5515, -70.6148], Barnstable: [41.7001, -70.3002],
    Yarmouth: [41.7056, -70.2286], Dennis: [41.7354, -70.1939],
    Brewster: [41.7601, -70.0828], Hyannis: [41.6525, -70.2881],
    Sandwich: [41.7589, -70.4939], Plymouth: [41.9584, -70.6673]
  };
  let map, markers = {};
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const selectTown = name => {
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.town === name)));
    status.textContent = 'Showing ' + name + ', Massachusetts.';
    document.querySelector('.map-reset').setAttribute('aria-pressed', 'false');
    if (!map) return;
    Object.entries(markers).forEach(([town, marker]) => marker.getElement()?.classList.toggle('selected', town === name));
    map.stop();
    map.closePopup();
    // Keep the zoom steady when moving between towns; avoid the flight's zoom-out detour.
    if (map.getZoom() === 11) {
      map.panTo(towns[name], { animate: !reduced(), duration: 0.4 });
    } else {
      map.flyTo(towns[name], 11, { animate: !reduced(), duration: 0.5 });
    }
    markers[name].openPopup();
  };
  buttons.forEach(button => button.addEventListener('click', () => selectTown(button.dataset.town)));
  const overview = () => {
    if (map) {
      map.stop();
      map.closePopup();
      map.fitBounds([[41.48, -70.83], [42.08, -69.9]], { paddingTopLeft: [25, 25], paddingBottomRight: [25, 35], animate: !reduced() });
      Object.values(markers).forEach(marker => marker.getElement()?.classList.remove('selected'));
    }
    buttons.forEach(button => button.setAttribute('aria-pressed', 'false'));
    status.textContent = 'Showing all service areas.';
    document.querySelector('.map-reset').setAttribute('aria-pressed', 'true');
  };
  document.querySelector('.map-reset').addEventListener('click', overview);
  if (!window.L) { fallback.hidden = false; return; }
  map = L.map(container, { scrollWheelZoom: false, zoomControl: false, minZoom: 9, maxZoom: 13, maxBounds: [[40.5, -72.5], [43, -68.5]], maxBoundsViscosity: 0.8, zoomAnimation: !reduced(), fadeAnimation: !reduced(), markerZoomAnimation: !reduced() });
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  // Load once. Keep every coastline ring in the SVG so dragging never exposes clipped edges.
  map.attributionControl.addAttribution('Coastline: <a href="https://www.census.gov/geographies/mapping-files/2024/geo/carto-boundary-file.html">U.S. Census Bureau</a>');
  fetch('service-coast.geojson')
    .then(response => { if (!response.ok) throw new Error('Coastline unavailable'); return response.json(); })
    .then(coast => {
      L.geoJSON(coast, { interactive: false, noClip: true, renderer: L.svg({ padding: 0.5 }), style: { color: '#a9bdbe', weight: 1.2, fillColor: '#f7f7f0', fillOpacity: 1, smoothFactor: 0.5 } }).addTo(map);
      fallback.hidden = true;
    })
    .catch(() => { fallback.hidden = false; });
  const contextLabels = [
    ['Cape Cod Bay', 41.92, -70.27, 'water'],
    ['Nantucket Sound', 41.48, -70.12, 'water'],
    ['Buzzards Bay', 41.56, -70.84, 'water'],
    ['Provincetown', 42.052, -70.186, 'place'],
    ['Chatham', 41.682, -69.96, 'place'],
    ['Wareham', 41.762, -70.72, 'place'],
    ['New Bedford', 41.637, -70.965, 'place'],
    ["Martha’s Vineyard", 41.385, -70.62, 'island']
  ];
  contextLabels.forEach(([name, lat, lng, type]) => {
    L.marker([lat, lng], { interactive: false, keyboard: false,
      icon: L.divIcon({ className: 'map-place-label map-place-label--' + type,
        html: '<span>' + name + '</span>', iconSize: [150, 24], iconAnchor: [75, 12] })
    }).addTo(map);
  });
  const labelPositions = {
    Falmouth: ['bottom', [0, 4]], Barnstable: ['left', [-12, -14]],
    Yarmouth: ['right', [9, 2]], Dennis: ['top', [0, -32]],
    Brewster: ['right', [9, -16]], Hyannis: ['bottom', [0, 4]],
    Sandwich: ['left', [-12, -14]], Plymouth: ['right', [9, -16]]
  };
  const pin = L.divIcon({ className: 'town-pin', html: '<span class="pin-shape"></span>', iconSize: [32, 38], iconAnchor: [16, 34], popupAnchor: [0, -31] });
  Object.entries(towns).forEach(([name, point]) => {
    const content = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = name;
    content.append(title);
    const marker = L.marker(point, { icon: pin, title: name, alt: name + ' service community', keyboard: true }).addTo(map).bindPopup(content, { autoPan: false });
    const [direction, offset] = labelPositions[name];
    marker.bindTooltip(name, { permanent: true, direction, offset, className: 'service-town-label', opacity: 1 });
    marker.on('click', () => selectTown(name));
    marker.on('keypress', event => {
      if (event.originalEvent.key === 'Enter') selectTown(name);
    });
    markers[name] = marker;
  });
  overview();
  if ('ResizeObserver' in window) new ResizeObserver(() => map.invalidateSize({ pan: false })).observe(container);
  // Respect live reduced-motion changes for subsequent map interactions.
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
    if (event.matches) map.stop();
    map.options.zoomAnimation = !event.matches;
    map.options.fadeAnimation = !event.matches;
    map.options.markerZoomAnimation = !event.matches;
  });
})();
