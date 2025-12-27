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
