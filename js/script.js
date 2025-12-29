/*************************
 * VARIABLES GLOBALS
 *************************/
const STORAGE_KEY = "tasquesKanban";
let tasques = [];
let tascaEditantId = null;

/*************************
 * REFERÈNCIES DOM
 *************************/
const form = document.getElementById("task-form");
const btnSubmit = form.querySelector("button");

const columnaPerFer = document.getElementById("per-fer");
const columnaEnCurs = document.getElementById("en-curs");
const columnaFet = document.getElementById("fet");

const filtreEstat = document.getElementById("filtre-estat");
const filtrePrioritat = document.getElementById("filtre-prioritat");
const cercaText = document.getElementById("cerca-text");

const statTotal = document.getElementById("stat-total");
const statPerFer = document.getElementById("stat-perfer");
const statEnCurs = document.getElementById("stat-encurs");
const statFet = document.getElementById("stat-fet");
const statPercent = document.getElementById("stat-percent");

/*************************
 * MODEL DE TASCA
 *************************/
function crearTasca({ titol, descripcio, prioritat, dataVenciment }) {
  return {
    id: Date.now().toString(),
    titol: titol.trim(),
    descripcio: descripcio.trim(),
    prioritat,
    dataVenciment,
    estat: "perFer",
    creatEl: new Date().toISOString()
  };
}

/*************************
 * PERSISTÈNCIA
 *************************/
function carregarTasques() {
  const dades = localStorage.getItem(STORAGE_KEY);
  tasques = dades ? JSON.parse(dades) : [];
}

function guardarTasques() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasques));
}

/*************************
 * FORMULARI (CREAR / EDITAR)
 *************************/
form.addEventListener("submit", e => {
  e.preventDefault();

  const formData = new FormData(form);
  const titol = formData.get("titol");

  if (!titol.trim()) {
    alert("El títol és obligatori");
    return;
  }

  const dades = {
    titol,
    descripcio: formData.get("descripcio"),
    prioritat: formData.get("prioritat"),
    dataVenciment: formData.get("data")
  };

  if (tascaEditantId) {
    const tasca = tasques.find(t => t.id === tascaEditantId);
    tasca.titol = dades.titol;
    tasca.descripcio = dades.descripcio;
    tasca.prioritat = dades.prioritat;
    tasca.dataVenciment = dades.dataVenciment;

    tascaEditantId = null;
    btnSubmit.textContent = "Afegir tasca";
  } else {
    tasques.push(crearTasca(dades));
  }

  guardarTasques();
  renderTauler();
  form.reset();
});

/*************************
 * RENDERITZACIÓ KANBAN
 *************************/
function renderTauler() {
  columnaPerFer.innerHTML = "";
  columnaEnCurs.innerHTML = "";
  columnaFet.innerHTML = "";

  const visibles = getTasquesFiltrades();

  visibles.forEach(tasca => {
    const card = crearTargeta(tasca);

    if (tasca.estat === "perFer") columnaPerFer.appendChild(card);
    if (tasca.estat === "enCurs") columnaEnCurs.appendChild(card);
    if (tasca.estat === "fet") columnaFet.appendChild(card);
  });

  actualitzarEstadistiques();
}

/*************************
 * TARGETA DE TASCA
 *************************/
function crearTargeta(tasca) {
  const div = document.createElement("div");
  div.className = `tasca prioritat-${tasca.prioritat}`;

  div.innerHTML = `
    <h4>${tasca.titol}</h4>
    <p>${tasca.descripcio || ""}</p>
    <small>Prioritat: ${tasca.prioritat}</small><br>

    <select data-id="${tasca.id}">
      <option value="perFer" ${tasca.estat === "perFer" ? "selected" : ""}>Per fer</option>
      <option value="enCurs" ${tasca.estat === "enCurs" ? "selected" : ""}>En curs</option>
      <option value="fet" ${tasca.estat === "fet" ? "selected" : ""}>Fet</option>
    </select>

    <button data-edit="${tasca.id}">Editar</button>
    <button data-delete="${tasca.id}">Eliminar</button>
  `;

  return div;
}

/*************************
 * CANVI D’ESTAT
 *************************/
document.addEventListener("change", e => {
  if (e.target.tagName === "SELECT" && e.target.dataset.id) {
    const tasca = tasques.find(t => t.id === e.target.dataset.id);
    tasca.estat = e.target.value;
    guardarTasques();
    renderTauler();
  }
});

/*************************
 * EDITAR / ELIMINAR
 *************************/
document.addEventListener("click", e => {

  if (e.target.dataset.delete) {
    if (!confirm("Vols eliminar aquesta tasca?")) return;

    tasques = tasques.filter(t => t.id !== e.target.dataset.delete);
    guardarTasques();
    renderTauler();
  }

  if (e.target.dataset.edit) {
    const tasca = tasques.find(t => t.id === e.target.dataset.edit);

    form.titol.value = tasca.titol;
    form.descripcio.value = tasca.descripcio;
    form.prioritat.value = tasca.prioritat;
    form.data.value = tasca.dataVenciment;

    tascaEditantId = tasca.id;
    btnSubmit.textContent = "Guardar canvis";
  }
});

/*************************
 * FILTRES I CERCA
 *************************/
function getTasquesFiltrades() {
  return tasques.filter(tasca => {

    if (filtreEstat.value && tasca.estat !== filtreEstat.value) {
      return false;
    }

    if (filtrePrioritat.value && tasca.prioritat !== filtrePrioritat.value) {
      return false;
    }

    if (cercaText.value) {
      const text = cercaText.value.toLowerCase();
      const contingut =
        tasca.titol.toLowerCase() +
        " " +
        tasca.descripcio.toLowerCase();

      if (!contingut.includes(text)) return false;
    }

    return true;
  });
}

/*************************
 * ESTADÍSTIQUES
 *************************/
function actualitzarEstadistiques() {
  const total = tasques.length;
  const perFer = tasques.filter(t => t.estat === "perFer").length;
  const enCurs = tasques.filter(t => t.estat === "enCurs").length;
  const fet = tasques.filter(t => t.estat === "fet").length;

  statTotal.textContent = total;
  statPerFer.textContent = perFer;
  statEnCurs.textContent = enCurs;
  statFet.textContent = fet;

  const percent = total === 0 ? 0 : Math.round((fet / total) * 100);
  statPercent.textContent = percent;
}

/*************************
 * EVENTS FILTRES
 *************************/
filtreEstat.addEventListener("change", renderTauler);
filtrePrioritat.addEventListener("change", renderTauler);
cercaText.addEventListener("input", renderTauler);

/*************************
 * INIT
 *************************/
function init() {
  carregarTasques();
  renderTauler();
}

document.addEventListener("DOMContentLoaded", init);
