const fleetData = [
  { model: "Boeing 737-BBJ", reg: "G-RASM", type: "B738" },
  { model: "Pilatus PC-24", reg: "G-RASU", type: "PC24" },
  { model: "Daher TBM 930", reg: "G-RAST", type: "TBM9" }
];

const contractPool = [
  { div: "Factory Delivery", orig: "LFBO", origName: "Toulouse", dest: "EGCC", destName: "Manchester", desc: "Factory delivery of customer airframe to UK base.", type: "B738" },
  { div: "Factory Delivery", orig: "KBFI", origName: "Boeing Field", dest: "EGCC", destName: "Manchester", desc: "Transatlantic delivery transit via Keflavik (BIRK).", type: "B738" },
  { div: "Factory Delivery", orig: "LSMU", origName: "Buochs", dest: "EGNH", destName: "Blackpool", desc: "Direct Pilatus assembly transit into Blackpool.", type: "PC24" },
  { div: "VIP Charter", orig: "EGNH", origName: "Blackpool", dest: "LEPA", destName: "Palma de Mallorca", desc: "Executive VIP private transport.", type: "B738" },
  { div: "VIP Charter", orig: "EGCC", origName: "Manchester", dest: "LSGG", destName: "Geneva", desc: "High-altitude winter corporate shuttle.", type: "PC24" },
  { div: "VIP Charter", orig: "EGNH", origName: "Blackpool", dest: "EGPB", destName: "Sumburgh", desc: "Executive North Sea energy logistics link.", type: "TBM9" },
  { div: "Storage Recovery", orig: "LETL", origName: "Teruel", dest: "EGCC", destName: "Manchester", desc: "Post-storage acceptance ferry & technical shakedown.", type: "B738" }
];

const clientNames = ["Apex Global Charter", "Highland Logistics", "AeroLease Trust", "Palma VIP Escapes", "Nordic Aviation Asset Group"];

function generateContracts() {
  const container = document.getElementById("contract-grid");
  if (!container) return;
  container.innerHTML = "";

  // Pick 3 random missions
  const selected = [...contractPool].sort(() => 0.5 - Math.random()).slice(0, 3);

  selected.forEach(job => {
    const ac = fleetData.find(f => f.type === job.type) || fleetData[0];
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
      <a href="${simbriefUrl}" target="_blank" class="btn-dispatch">&#128747; Accept &amp; Dispatch (SimBrief)</a>
    `;
    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", generateContracts);