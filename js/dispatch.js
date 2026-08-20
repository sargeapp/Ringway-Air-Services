// --- 1. Dynamic Site Builder & Loader ---
async function initSite() {
  // A. Load Settings & Navigation
  try {
    const res = await fetch('/data/settings.json');
    if (res.ok) {
      const settings = await res.json();
      const navContainer = document.getElementById('dynamic-nav');
      if (navContainer && settings.nav_links) {
        navContainer.innerHTML = settings.nav_links
          .map(link => `<a href="${link.url}" class="badge">${link.label}</a>`)
          .join('');
      }
    }
  } catch (e) { console.warn("Settings failed to load", e); }

  // B. Load Dynamic Fleet
  const fleetAirframes = [];
  const fleetRegistry = ['G-RASM', 'G-RASU', 'G-RAST'];
  const fleetContainer = document.getElementById('dynamic-fleet-grid');

  if (fleetContainer) {
    fleetContainer.innerHTML = '';
    for (const reg of fleetRegistry) {
      try {
        const res = await fetch(`/data/fleet/${reg}.json`);
        if (res.ok) {
          const item = await res.json();
          fleetAirframes.push(item);

          const imgTag = item.image 
            ? `<div style="height:140px; overflow:hidden; border-radius:4px; margin-bottom:10px;"><img src="${item.image}" style="width:100%; height:100%; object-fit:cover;" alt="${item.model}"></div>` 
            : '';
          
          const downloadBtn = item.download_url && item.download_url !== '#'
            ? `<a href="${item.download_url}" class="btn-dispatch" style="margin-top:8px; background:#1e1e1e;" download>💾 Download Livery (.ZIP)</a>`
            : '';

          const card = document.createElement('div');
          card.className = 'fleet-card';
          card.innerHTML = `
            ${imgTag}
            <div class="fleet-header">
              <h4>${item.model}</h4>
              <span class="fleet-reg">${item.reg}</span>
            </div>
            <p class="fleet-role">${item.role}</p>
            <div class="fleet-specs">
              <span>Range: ${item.range}</span>
              <span>Perf: ${item.perf}</span>
            </div>
            <div class="download-badge">${item.pbr_tier}</div>
            ${downloadBtn}
          `;
          fleetContainer.appendChild(card);
        }
      } catch (e) { /* continue */ }
    }
  }

  // C. Load Scenery Bases
  const sceneryHubs = ['EGNH', 'EGCC'];
  const sceneryContainer = document.getElementById('dynamic-scenery-grid');
  if (sceneryContainer) {
    sceneryContainer.innerHTML = '';
    for (const icao of sceneryHubs) {
      try {
        const res = await fetch(`/data/scenery/${icao}.json`);
        if (res.ok) {
          const base = await res.json();
          const card = document.createElement('div');
          card.className = 'scenery-card';
          card.innerHTML = `
            <h4>${base.title} (${base.icao})</h4>
            <p class="scenery-type">${base.facility_type}</p>
            <div style="font-size:0.75rem; color:var(--ras-orange); font-weight:bold; margin-bottom:8px;">STATUS: ${base.status}</div>
            <p>${base.description}</p>
          `;
          sceneryContainer.appendChild(card);
        }
      } catch (e) { /* continue */ }
    }
  }

  // D. Populate Telemetry & Generate Dispatch Jobs
  loadTelemetry();
  generateContracts(fleetAirframes);
}

// --- 2. Telemetry ---
async function loadTelemetry() {
  try {
    const res = await fetch('/data/telemetry.json');
    if (res.ok) {
      const stats = await res.json();
      if (document.getElementById('stat-total-hours')) document.getElementById('stat-total-hours').innerText = `${stats.total_hours}+`;
      if (document.getElementById('stat-jet-hours')) document.getElementById('stat-jet-hours').innerText = `${stats.jet_hours}+`;
      if (document.getElementById('stat-turboprop-hours')) document.getElementById('stat-turboprop-hours').innerText = `${stats.turboprop_hours}+`;
    }
  } catch (e) { console.warn("Telemetry offline", e); }
}

// --- 3. Procedural SimBrief Dispatch Engine ---
const contractPool = [
  { div: "Factory Delivery", orig: "LFBO", origName: "Toulouse", dest: "EGCC", destName: "Manchester", desc: "Factory delivery of customer airframe to UK base.", type: "B738" },
  { div: "Factory Delivery", orig: "KBFI", origName: "Boeing Field", dest: "EGCC", destName: "Manchester", desc: "Transatlantic delivery transit via Keflavik (BIRK).", type: "B738" },
  { div: "Factory Delivery", orig: "LSMU", origName: "Buochs", dest: "EGNH", destName: "Blackpool", desc: "Direct Pilatus assembly transit into Blackpool.", type: "PC24" },
  { div: "VIP Charter", orig: "EGNH", origName: "Blackpool", dest: "LEPA", destName: "Palma de Mallorca", desc: "Executive VIP private transport.", type: "B738" },
  { div: "VIP Charter", orig: "EGCC", origName: "Manchester", dest: "LSGG", destName: "Geneva", desc: "High-altitude winter corporate shuttle.", type: "PC24" },
  { div: "Storage Recovery", orig: "LETL", origName: "Teruel", dest: "EGCC", destName: "Manchester", desc: "Post-storage acceptance ferry & technical shakedown.", type: "B738" }
];

const clientNames = ["Apex Global Charter", "Highland Logistics", "AeroLease Trust", "Palma VIP Escapes", "Nordic Aviation Asset Group"];

function generateContracts(fleetList) {
  const container = document.getElementById("contract-grid");
  if (!container) return;
  container.innerHTML = "";

  const selected = [...contractPool].sort(() => 0.5 - Math.random()).slice(0, 3);

  selected.forEach(job => {
    const ac = (fleetList && fleetList.length)
      ? (fleetList.find(f => f.type === job.type) || fleetList[0])
      : { model: "Boeing 737-BBJ", reg: "G-RASM", type: "B738" };

    const client = clientNames[Math.floor(Math.random() * clientNames.length)];
    const fltNum = Math.floor(100 + Math.random() * 900);
    const callsign = `RAS${fltNum}`;
    const simbriefUrl = `https://dispatch.simbrief.com/options/custom?airline=RAS&fltnum=${fltNum}&callsign=${callsign}&type=${ac.type}&orig=${job.orig}&dest=${job.dest}&reg=${ac.reg}`;

    const card = document.createElement("div");
    card.className = "contract-card";
    card.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="badge badge-accent">${job.div}</span>
          <span style="color: #777; font-size: 0.75rem; font-weight: bold;">${callsign}</span>
        </div>
        <div style="font-size: 0.8rem; color: #AAA; margin-bottom: 6px;">Client: <strong style="color: #EEE;">${client}</strong></div>
        <div class="route-box">
          <span>${job.orig} <small style="color:#888;">(${job.origName})</small></span>
          <span style="color: var(--ras-orange);">&#10140;</span>
          <span>${job.dest} <small style="color:#888;">(${job.destName})</small></span>
        </div>
        <div style="font-size: 0.75rem; color: #888; margin-bottom: 6px;">
          Airframe: <strong style="color: #DDD;">${ac.model}</strong> (${ac.reg})
        </div>
        <p style="font-size: 0.75rem; color: #999; line-height: 1.4;">${job.desc}</p>
      </div>
      <a href="${simbriefUrl}" target="_blank" class="btn-dispatch">&#128747; Dispatch SimBrief OFP</a>
    `;
    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", initSite);