const form = document.getElementById("task-form");
const btnSubmit = form.querySelector("button");

const columnaPerFer = document.getElementById("per-fer");
const columnaEnCurs = document.getElementById("en-curs");
const columnaFet = document.getElementById("fet");

let tascaEditantId = null;

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

  tasques.push(crearTasca(dades));
  guardarTasques();
  renderTauler();
  form.reset();
});

function renderTauler() {
  columnaPerFer.innerHTML = "";
  columnaEnCurs.innerHTML = "";
  columnaFet.innerHTML = "";

  tasques.forEach(tasca => {
    const card = crearTargeta(tasca);

    if (tasca.estat === "perFer") columnaPerFer.appendChild(card);
    if (tasca.estat === "enCurs") columnaEnCurs.appendChild(card);
    if (tasca.estat === "fet") columnaFet.appendChild(card);
  });
}


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

document.addEventListener("change", e => {
  if (e.target.tagName === "SELECT" && e.target.dataset.id) {
    const tasca = tasques.find(t => t.id === e.target.dataset.id);
    tasca.estat = e.target.value;
    guardarTasques();
    renderTauler();
  }
});

document.addEventListener("click", e => {
  if (e.target.dataset.delete) {
    if (!confirm("Vols eliminar aquesta tasca?")) return;

    tasques = tasques.filter(t => t.id !== e.target.dataset.delete);
    guardarTasques();
    renderTauler();
  }
});

if (e.target.dataset.edit) {
  const tasca = tasques.find(t => t.id === e.target.dataset.edit);

  form.titol.value = tasca.titol;
  form.descripcio.value = tasca.descripcio;
  form.prioritat.value = tasca.prioritat;
  form.data.value = tasca.dataVenciment;

  tascaEditantId = tasca.id;
  btnSubmit.textContent = "Guardar canvis";
}

if (tascaEditantId) {
  const tasca = tasques.find(t => t.id === tascaEditantId);
  tasca.titol = dades.titol;
  tasca.descripcio = dades.descripcio;
  tasca.prioritat = dades.prioritat;
  tasca.dataVenciment = dades.dataVenciment;

  tascaEditantId = null;
  btnSubmit.textContent = "Afegir tasca";
} else  {
  tasques.push(crearTasca(dades));
}

const STORAGE_KEY = "tasquesKanban";
let tasques = [];

function carregarTasques() {
  const dades = localStorage.getItem(STORAGE_KEY);
  tasques = dades ? JSON.parse(dades) : [];
}

function guardarTasques() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasques));
}

function init() {
  carregarTasques();
  console.log("Tasques carregades:", tasques);
}

document.addEventListener("DOMContentLoaded", init);
