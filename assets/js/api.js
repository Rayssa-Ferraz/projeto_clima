// ==========================
// SELEÇÃO DE ELEMENTOS DO DOM
// ==========================
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const searchScreen = document.getElementById('searchScreen');
const resultScreen = document.getElementById('resultScreen');
const temperature = document.getElementById('temperature');
const cityName = document.getElementById('cityName');
const backBtn = document.getElementById('backBtn');

// ==========================
// CONSTANTES
// ==========================
const TIMEOUT_MS = 10000;

// ==========================
// FUNÇÕES AUXILIARES
// ==========================

// Requisição com tempo limite
async function fetchComTimeout(url, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
  return response;
}

// ==========================
// REQUISIÇÕES À API
// ==========================

// Busca coordenadas (latitude/longitude) da cidade
async function buscarCoordenadas(cidade) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;
  const resposta = await fetchComTimeout(url);
  const dados = await resposta.json();

  if (!dados.results || dados.results.length === 0) return null;

  const resultado = dados.results[0];
  return {
    latitude: resultado.latitude,
    longitude: resultado.longitude,
    nome: resultado.name,
    pais: resultado.country
  };
}

// Busca dados climáticos atuais
async function buscarDadosClima(coordenadas) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordenadas.latitude}&longitude=${coordenadas.longitude}&current=temperature_2m,weathercode&timezone=auto`;
  const resposta = await fetchComTimeout(url);
  const dados = await resposta.json();
  return dados.current;
}

// ==========================
// FUNÇÃO PRINCIPAL
// ==========================
async function buscarClima() {
  const cidade = cityInput.value.trim();
  if (!cidade) return;

  esconderMensagens();
  mostrarCarregamento();

  try {
    const coordenadas = await buscarCoordenadas(cidade);
    if (!coordenadas) {
      mostrarErro("Cidade não encontrada. Tente novamente.");
      return;
    }

    const dadosClima = await buscarDadosClima(coordenadas);
    exibirClima(coordenadas.nome, coordenadas.pais, dadosClima);
  } catch (erro) {
    mostrarErro("Erro ao buscar os dados. Tente novamente.");
    console.error('Erro ao buscar dados do clima:', erro);
  } finally {
    esconderCarregamento();
  }
}

// ==========================
// FUNÇÕES DE INTERFACE
// ==========================
function exibirClima(nome, pais, dados) {
  esconderMensagens();
  cityName.textContent = `${nome}, ${pais}`;
  temperature.textContent = `${Math.round(dados.temperature_2m)}°`;

  // Define o fundo conforme o clima e horário
  const horaAtual = new Date().getHours();
  definirFundoClima(dados.weathercode, horaAtual);

  searchScreen.style.display = 'none';
  resultScreen.style.display = 'flex';
}

function voltarParaBusca() {
  cityInput.value = '';
  esconderMensagens();

  // Retorna o fundo conforme o horário (não o clima)
  const horaAtual = new Date().getHours();
  definirFundoHorario(horaAtual);

  resultScreen.style.display = 'none';
  searchScreen.style.display = 'flex';
}

// ==========================
// FUNÇÕES DE ESTILO E FUNDO
// ==========================

// Fundo conforme horário (tela inicial)
function definirFundoHorario(hora) {
  let bg;

  if (hora >= 6 && hora < 17) {
    // ☀️ Dia
    bg = "linear-gradient(to bottom, #6dd5fa, #b3e5fc)";
  } else if (hora >= 17 && hora < 19) {
    // 🌇 Pôr do sol
    bg = "linear-gradient(to bottom, #ff9a9e, #fad0c4, #fbc2eb)";
  } else {
    // 🌙 Noite
    bg = "linear-gradient(to bottom, #2c3e50, #4b79a1, #283e51)";
  }

  document.body.style.transition = "background 1.5s ease-in-out";
  document.body.style.background = bg;
  document.body.style.backgroundSize = "200% 200%";
}

// Fundo conforme clima (tela de resultado)
function definirFundoClima(weatherCode, hora) {
  let bg;
  const isDia = hora >= 6 && hora < 17;
  const isPorDoSol = hora >= 17 && hora < 19;

  const limpo = [0, 1];
  const parcialmenteNublado = [2];
  const nublado = [3, 45, 48];
  const chuvoso = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82];

  if (limpo.includes(weatherCode)) {
    if (isDia) bg = "linear-gradient(to bottom, #6dd5fa, #b3e5fc)";
    else if (isPorDoSol) bg = "linear-gradient(to bottom, #ff9a9e, #fad0c4, #fbc2eb)";
    else bg = "linear-gradient(to bottom, #2c3e50, #4b79a1, #283e51)";
  } 
  else if (parcialmenteNublado.includes(weatherCode)) {
    if (isDia) bg = "linear-gradient(to bottom, #8ec5fc, #e0c3fc)";
    else if (isPorDoSol) bg = "linear-gradient(to bottom, #fbc2eb, #a6c1ee)";
    else bg = "linear-gradient(to bottom, #4e54c8, #8f94fb)";
  } 
  else if (nublado.includes(weatherCode)) {
    if (isDia) bg = "linear-gradient(to bottom, #a1c4fd, #c2e9fb)";
    else if (isPorDoSol) bg = "linear-gradient(to bottom, #d7d2cc, #304352)";
    else bg = "linear-gradient(to bottom, #283e51, #485563)";
  } 
  else if (chuvoso.includes(weatherCode)) {
    if (isDia) bg = "linear-gradient(to bottom, #4e73b5, #8eaecf)";
    else if (isPorDoSol) bg = "linear-gradient(to bottom, #3a6186, #89253e)";
    else bg = "linear-gradient(to bottom, #1e3c72, #2a5298)";
  } 
  else {
    bg = "linear-gradient(to bottom, #88d6fa, #b3e5fc)";
  }

  document.body.style.transition = "background 1.5s ease-in-out";
  document.body.style.background = bg;
  document.body.style.backgroundSize = "200% 200%";
}

// ==========================
// MENSAGENS E LOADING
// ==========================
function mostrarCarregamento() {
  loading.style.display = 'block';
}

function esconderCarregamento() {
  loading.style.display = 'none';
}

function esconderMensagens() {
  loading.style.display = 'none';
  const erro = document.getElementById('error');
  if (erro) erro.remove();
}

function mostrarErro(mensagem) {
  esconderMensagens();
  const erro = document.createElement('p');
  erro.id = 'error';
  erro.textContent = mensagem;
  erro.style.color = 'red';
  erro.style.fontSize = '0.95rem';
  erro.style.marginTop = '0.75rem';
  searchScreen.appendChild(erro);
}

// ==========================
// EVENTOS
// ==========================
searchBtn.addEventListener('click', buscarClima);
cityInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') buscarClima();
});
backBtn.addEventListener('click', voltarParaBusca);

// ==========================
// INICIALIZAÇÃO
// ==========================
window.addEventListener('load', () => {
  const horaAtual = new Date().getHours();
  definirFundoHorario(horaAtual);
});
