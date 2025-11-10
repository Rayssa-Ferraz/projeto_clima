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

// Elementos novos para exibição de dados extras
let description, weatherIcon, currentDate;

// ==========================
// CONSTANTES
// ==========================
const TIMEOUT_MS = 10000;
const MENSAGENS_ERRO = {
  CIDADE_VAZIA: 'Por favor, digite o nome de uma cidade.',
  CIDADE_NAO_ENCONTRADA: 'Cidade não encontrada. Tente novamente.',
  TIMEOUT: 'A requisição demorou muito. Verifique sua conexão.',
  REDE: 'Erro de conexão. Verifique sua internet.',
  SERVIDOR: 'Erro no servidor. Tente novamente mais tarde.',
  GENERICO: 'Erro ao buscar dados. Tente novamente.'
};

// ==========================
// FUNÇÕES AUXILIARES
// ==========================

// Função para retornar data e hora formatadas
function obterDataHoraAtual() {
  const agora = new Date();
  const opcoes = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return agora.toLocaleDateString('pt-BR', opcoes);
}

// Requisição com tempo limite
async function fetchComTimeout(url, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (erro) {
    clearTimeout(timeoutId);
    if (erro.name === 'AbortError') throw new Error('TIMEOUT');
    throw erro;
  }
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
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordenadas.latitude}&longitude=${coordenadas.longitude}&current=temperature_2m,weather_code&timezone=auto`;
  const resposta = await fetchComTimeout(url);
  const dados = await resposta.json();
  return dados.current;
}

// ==========================
// FUNÇÃO PRINCIPAL
// ==========================
async function buscarClima() {
  const cidade = cityInput.value.trim();

  if (!cidade) {
    mostrarErro(MENSAGENS_ERRO.CIDADE_VAZIA);
    return;
  }

  esconderMensagens();
  mostrarCarregamento();

  try {
    const coordenadas = await buscarCoordenadas(cidade);
    if (!coordenadas) {
      mostrarErro(MENSAGENS_ERRO.CIDADE_NAO_ENCONTRADA);
      return;
    }

    const dadosClima = await buscarDadosClima(coordenadas);
    exibirClima(coordenadas.nome, coordenadas.pais, dadosClima);
  } catch (erro) {
    tratarErro(erro);
  } finally {
    esconderCarregamento();
  }
}

// ==========================
// FUNÇÃO DE EXIBIÇÃO DO CLIMA
// ==========================
function exibirClima(nome, pais, dados) {
  esconderMensagens();

  // Remove elementos antigos se existirem
  if (description) description.remove();
  if (weatherIcon) weatherIcon.remove();
  if (currentDate) currentDate.remove();

  // Criação de novos elementos
  description = document.createElement('p');
  description.id = 'description';

  weatherIcon = document.createElement('i');
  weatherIcon.id = 'weatherIcon';
  weatherIcon.classList.add('weather-icon');

  currentDate = document.createElement('p');
  currentDate.id = 'currentDate';
  currentDate.textContent = obterDataHoraAtual();

  // Atualiza os textos principais
  cityName.textContent = `${nome}, ${pais}`;
  temperature.textContent = `${Math.round(dados.temperature_2m)}°`;

  // Define ícone e descrição
  const clima = obterDescricaoClima(dados.weather_code);
  weatherIcon.classList.add('wi', clima.icone);
  description.textContent = clima.descricao;

  // Adiciona os novos elementos à tela
  const infoContainer = document.querySelector('.weather-info');
  infoContainer.appendChild(description);
  infoContainer.appendChild(currentDate);

  const headerContainer = document.querySelector('.weather-header');
  headerContainer.prepend(weatherIcon);

  // Aplica fundo dinâmico
  const horaAtual = new Date().getHours();
  definirFundoClima(dados.weather_code, horaAtual);

  // Alterna as telas
  searchScreen.style.display = 'none';
  resultScreen.style.display = 'flex';
}

/// ==========================
// TRADUÇÃO DE CÓDIGOS DE CLIMA (DIA E NOITE)
// ==========================
function obterDescricaoClima(codigo) {
  const codigos = {
    0: { 
      descricao: 'Céu limpo', 
      dia: 'wi-day-sunny', 
      noite: 'wi-night-clear' 
    },
    1: { 
      descricao: 'Principalmente limpo', 
      dia: 'wi-day-sunny-overcast', 
      noite: 'wi-night-alt-partly-cloudy' 
    },
    2: { 
      descricao: 'Parcialmente nublado', 
      dia: 'wi-day-cloudy', 
      noite: 'wi-night-alt-cloudy' 
    },
    3: { 
      descricao: 'Nublado', 
      dia: 'wi-cloudy', 
      noite: 'wi-night-alt-cloudy-high' 
    },
    45: { 
      descricao: 'Neblina', 
      dia: 'wi-fog', 
      noite: 'wi-night-fog' 
    },
    48: { 
      descricao: 'Nevoeiro', 
      dia: 'wi-fog', 
      noite: 'wi-night-fog' 
    },
    51: { 
      descricao: 'Garoa leve', 
      dia: 'wi-sprinkle', 
      noite: 'wi-night-alt-sprinkle' 
    },
    53: { 
      descricao: 'Garoa moderada', 
      dia: 'wi-sprinkle', 
      noite: 'wi-night-alt-sprinkle' 
    },
    55: { 
      descricao: 'Garoa forte', 
      dia: 'wi-showers', 
      noite: 'wi-night-alt-showers' 
    },
    61: { 
      descricao: 'Chuva leve', 
      dia: 'wi-rain', 
      noite: 'wi-night-alt-rain' 
    },
    63: { 
      descricao: 'Chuva moderada', 
      dia: 'wi-rain', 
      noite: 'wi-night-alt-rain' 
    },
    65: { 
      descricao: 'Chuva forte', 
      dia: 'wi-rain-wind', 
      noite: 'wi-night-alt-rain-wind' 
    },
    71: { 
      descricao: 'Neve leve', 
      dia: 'wi-snow', 
      noite: 'wi-night-alt-snow' 
    },
    73: { 
      descricao: 'Neve moderada', 
      dia: 'wi-snow', 
      noite: 'wi-night-alt-snow' 
    },
    75: { 
      descricao: 'Neve forte', 
      dia: 'wi-snow-wind', 
      noite: 'wi-night-alt-snow-wind' 
    },
    80: { 
      descricao: 'Pancadas de chuva', 
      dia: 'wi-showers', 
      noite: 'wi-night-alt-showers' 
    },
    81: { 
      descricao: 'Pancadas moderadas', 
      dia: 'wi-showers', 
      noite: 'wi-night-alt-showers' 
    },
    82: { 
      descricao: 'Pancadas fortes', 
      dia: 'wi-rain-wind', 
      noite: 'wi-night-alt-rain-wind' 
    },
    95: { 
      descricao: 'Tempestade', 
      dia: 'wi-thunderstorm', 
      noite: 'wi-night-alt-thunderstorm' 
    },
    96: { 
      descricao: 'Tempestade com granizo', 
      dia: 'wi-storm-showers', 
      noite: 'wi-night-alt-storm-showers' 
    },
    99: { 
      descricao: 'Tempestade severa', 
      dia: 'wi-hail', 
      noite: 'wi-night-alt-hail' 
    }
  };

  // Verifica horário atual (para alternar entre ícone de dia e de noite)
  const hora = new Date().getHours();
  const isNoite = hora >= 18 || hora < 6;

  const clima = codigos[codigo] || { descricao: 'Clima desconhecido', dia: 'wi-na', noite: 'wi-na' };
  const icone = isNoite ? clima.noite : clima.dia;

  return { descricao: clima.descricao, icone };
}


// ==========================
// FUNÇÕES DE ERRO E INTERFACE
// ==========================
function tratarErro(erro) {
  console.error('Erro:', erro);
  let mensagem = MENSAGENS_ERRO.GENERICO;

  if (erro.message === 'TIMEOUT') mensagem = MENSAGENS_ERRO.TIMEOUT;
  else if (erro.message.includes('Failed to fetch') || erro.message.includes('Network'))
    mensagem = MENSAGENS_ERRO.REDE;
  else if (erro.message.includes('500') || erro.message.includes('502') || erro.message.includes('503'))
    mensagem = MENSAGENS_ERRO.SERVIDOR;

  mostrarErro(mensagem);
}

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
// FUNÇÕES DE FUNDO DINÂMICO
// ==========================
function definirFundoClima(weatherCode, hora) {
  let bg;
  const isDia = hora >= 6 && hora < 17;
  const isPorDoSol = hora >= 17 && hora < 19;

  const limpo = [0, 1];
  const parcialmenteNublado = [2];
  const nublado = [3, 45, 48];
  const chuvoso = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];

  if (limpo.includes(weatherCode)) {
    bg = isDia
      ? "linear-gradient(to bottom, #6dd5fa, #b3e5fc)"
      : isPorDoSol
      ? "linear-gradient(to bottom, #ff9a9e, #fad0c4, #fbc2eb)"
      : "linear-gradient(to bottom, #2c3e50, #4b79a1, #283e51)";
  } else if (parcialmenteNublado.includes(weatherCode)) {
    bg = isDia
      ? "linear-gradient(to bottom, #8ec5fc, #e0c3fc)"
      : isPorDoSol
      ? "linear-gradient(to bottom, #fbc2eb, #a6c1ee)"
      : "linear-gradient(to bottom, #4e54c8, #8f94fb)";
  } else if (nublado.includes(weatherCode)) {
    bg = isDia
      ? "linear-gradient(to bottom, #a1c4fd, #c2e9fb)"
      : isPorDoSol
      ? "linear-gradient(to bottom, #d7d2cc, #304352)"
      : "linear-gradient(to bottom, #283e51, #485563)";
  } else if (chuvoso.includes(weatherCode)) {
    bg = isDia
      ? "linear-gradient(to bottom, #4e73b5, #8eaecf)"
      : isPorDoSol
      ? "linear-gradient(to bottom, #3a6186, #89253e)"
      : "linear-gradient(to bottom, #1e3c72, #2a5298)";
  } else {
    bg = "linear-gradient(to bottom, #88d6fa, #b3e5fc)";
  }

  document.body.style.transition = "background 1.5s ease-in-out";
  document.body.style.background = bg;
  document.body.style.backgroundSize = "200% 200%";
}

// ==========================
// EVENTOS
// ==========================
searchBtn.addEventListener('click', buscarClima);
cityInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') buscarClima();
});
backBtn.addEventListener('click', () => {
  cityInput.value = '';
  esconderMensagens();
  const horaAtual = new Date().getHours();
  definirFundoClima(0, horaAtual);
  resultScreen.style.display = 'none';
  searchScreen.style.display = 'flex';
});

// ==========================
// INICIALIZAÇÃO
// ==========================
window.addEventListener('load', () => {
  const horaAtual = new Date().getHours();
  definirFundoClima(0, horaAtual);
});
