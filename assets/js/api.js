/**
 * @fileoverview Aplicativo de Previsão do Tempo 
 * @description Sistema web que consulta e exibe dados meteorológicos em tempo real.
 * Versão com segurança aprimorada — proteção leve contra XSS e entradas perigosas,
 * sem alterar o comportamento original da aplicação.
 *
 * @author Rayssa Ferraz
 * @version 1.2.0 - Segurança Leve
 * @license MIT
 */

// =============================================================
//  SELEÇÃO DE ELEMENTOS DO DOM
// =============================================================

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const searchScreen = document.getElementById('searchScreen');
const resultScreen = document.getElementById('resultScreen');
const temperature = document.getElementById('temperature');
const cityName = document.getElementById('cityName');
const backBtn = document.getElementById('backBtn');

let description, weatherIcon, currentDate;


// =============================================================
//  SEGURANÇA — Sanitização Simples
//  (não altera comportamento, só remove caracteres perigosos)
// =============================================================

function sanitizarTexto(texto) {
  if (!texto) return "";
  return texto
    .replace(/[<>"'`{}()[\]\\]/g, "") // remove caracteres perigosos
    .trim();
}

function entradaValida(texto) {
  if (!texto) return false;
  const proibidos = /[<>"'`{}()[\]\\]/;
  return !proibidos.test(texto);
}


// =============================================================
//  CONSTANTES
// =============================================================

const TIMEOUT_MS = 10000;

const MENSAGENS_ERRO = {
  CIDADE_VAZIA: 'Por favor, digite o nome de uma cidade.',
  CIDADE_NAO_ENCONTRADA: 'Cidade não encontrada. Tente novamente.',
  TIMEOUT: 'A requisição demorou muito. Verifique sua conexão.',
  REDE: 'Erro de conexão. Verifique sua internet.',
  SERVIDOR: 'Erro no servidor. Tente novamente mais tarde.',
  GENERICO: 'Erro ao buscar dados. Tente novamente.'
};


// =============================================================
//  FUNÇÕES AUXILIARES
// =============================================================

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

async function fetchComTimeout(url, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const resposta = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return resposta;
  } catch (erro) {
    clearTimeout(timeoutId);
    if (erro.name === 'AbortError') throw new Error('TIMEOUT');
    throw erro;
  }
}


// =============================================================
//  REQUISIÇÕES À API
// =============================================================

async function buscarCoordenadas(cidade) {
  // segurança leve
  cidade = sanitizarTexto(cidade);

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    cidade
  )}&count=1&language=pt&format=json`;

  const resposta = await fetchComTimeout(url);
  const dados = await resposta.json();

  if (!dados.results || dados.results.length === 0) return null;

  const r = dados.results[0];
  return {
    latitude: r.latitude,
    longitude: r.longitude,
    nome: sanitizarTexto(r.name),
    pais: sanitizarTexto(r.country)
  };
}

async function buscarDadosClima(coordenadas) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordenadas.latitude}&longitude=${coordenadas.longitude}&current=temperature_2m,weather_code&timezone=auto`;
  const resposta = await fetchComTimeout(url);
  const dados = await resposta.json();
  return dados.current;
}

async function buscarPrevisao5Dias(coordenadas) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordenadas.latitude}&longitude=${coordenadas.longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;

  const resposta = await fetchComTimeout(url);
  const dados = await resposta.json();

  // 🔥 Remove o dia de hoje (index 0)
  const previsoes = dados.daily.time.map((data, i) => ({
    data,
    tempMax: dados.daily.temperature_2m_max[i],
    tempMin: dados.daily.temperature_2m_min[i],
    codigo: dados.daily.weather_code[i]
  }));

  return previsoes.slice(1, 6); // pega só os próximos 4 dias
}



// =============================================================
//  BUSCA PRINCIPAL
// =============================================================

async function buscarClima() {
  const cidadeBruta = cityInput.value.trim();

  if (!cidadeBruta) {
    mostrarErro(MENSAGENS_ERRO.CIDADE_VAZIA);
    return;
  }

  // segurança leve sem quebrar a lógica
  if (!entradaValida(cidadeBruta)) {
    mostrarErro("Entrada inválida. Remova caracteres especiais.");
    return;
  }

  const cidade = sanitizarTexto(cidadeBruta);

  esconderMensagens();
  mostrarCarregamento();

  try {
    const coordenadas = await buscarCoordenadas(cidade);
    if (!coordenadas) {
      mostrarErro(MENSAGENS_ERRO.CIDADE_NAO_ENCONTRADA);
      return;
    }

    const dadosClima = await buscarDadosClima(coordenadas);
    const previsaoProxDias = await buscarPrevisao5Dias(coordenadas);

    exibirClima(coordenadas.nome, coordenadas.pais, dadosClima);
    exibirPrevisaoDias(previsaoProxDias);

  } catch (erro) {
    tratarErro(erro);
  } finally {
    esconderCarregamento();
  }
}


// =============================================================
//  EXIBIÇÃO DO CLIMA ATUAL
// =============================================================

function exibirClima(nome, pais, dados) {
  esconderMensagens();

  description?.remove();
  weatherIcon?.remove();
  currentDate?.remove();

  description = document.createElement('p');
  description.id = 'description';

  weatherIcon = document.createElement('i');
  weatherIcon.id = 'weatherIcon';
  weatherIcon.classList.add('weather-icon');

  currentDate = document.createElement('p');
  currentDate.id = 'currentDate';
  currentDate.textContent = obterDataHoraAtual();

  cityName.textContent = `${nome}, ${pais}`;
  temperature.textContent = `${Math.round(dados.temperature_2m)}°`;

  const clima = obterDescricaoClima(dados.weather_code);
  weatherIcon.classList.add('wi', clima.icone);
  description.textContent = clima.descricao;

  document.querySelector('.weather-info').append(description, currentDate);
  document.querySelector('.weather-header').prepend(weatherIcon);

  const horaAtual = new Date().getHours();
  definirFundoClima(dados.weather_code, horaAtual);

  searchScreen.style.display = 'none';
  resultScreen.style.display = 'flex';

  document.body.classList.add("showing-result");
}


// =============================================================
//  EXIBIÇÃO DA PREVISÃO DE 5 DIAS
// =============================================================

function exibirPrevisaoDias(dias) {
  const container = document.getElementById("forecastContainer");
  if (!container) return;

  container.innerHTML = "";

  dias.slice(1, 6).forEach(dia => {

    const dataObj = new Date(dia.data);

    const nomeDia = dataObj.toLocaleDateString("pt-BR", { weekday: "long" });
    const dataFormatada = dataObj.toLocaleDateString("pt-BR");

    const clima = obterDescricaoClima(dia.codigo);

    const item = document.createElement("div");
    item.classList.add("forecast-item");

    item.innerHTML = `
      <div class="forecast-day">
        <strong>${nomeDia}</strong>
        <p>${dataFormatada}</p>
      </div>

      <div class="forecast-info">
        <i class="wi ${clima.icone}"></i>
        <p class="temp">
          <span class="max">${dia.tempMax}°</span> /
          <span class="min">${dia.tempMin}°</span>
        </p>
      </div>
    `;

    container.appendChild(item);
  });
}


// =============================================================
//  TRADUÇÃO DE CÓDIGOS
// =============================================================

function obterDescricaoClima(codigo) {
  const codigos = {
    0: { descricao: 'Céu limpo', dia: 'wi-day-sunny', noite: 'wi-night-clear' },
    1: { descricao: 'Principalmente limpo', dia: 'wi-day-sunny-overcast', noite: 'wi-night-alt-partly-cloudy' },
    2: { descricao: 'Parcialmente nublado', dia: 'wi-day-cloudy', noite: 'wi-night-alt-cloudy' },
    3: { descricao: 'Nublado', dia: 'wi-cloudy', noite: 'wi-night-alt-cloudy-high' },
    45: { descricao: 'Neblina', dia: 'wi-fog', noite: 'wi-night-fog' },
    48: { descricao: 'Nevoeiro', dia: 'wi-fog', noite: 'wi-night-fog' },
    51: { descricao: 'Garoa leve', dia: 'wi-sprinkle', noite: 'wi-night-alt-sprinkle' },
    53: { descricao: 'Garoa moderada', dia: 'wi-sprinkle', noite: 'wi-night-alt-sprinkle' },
    55: { descricao: 'Garoa forte', dia: 'wi-showers', noite: 'wi-night-alt-showers' },
    61: { descricao: 'Chuva leve', dia: 'wi-rain', noite: 'wi-night-alt-rain' },
    63: { descricao: 'Chuva moderada', dia: 'wi-rain', noite: 'wi-night-alt-rain' },
    65: { descricao: 'Chuva forte', dia: 'wi-rain-wind', noite: 'wi-night-alt-rain-wind' },
    71: { descricao: 'Neve leve', dia: 'wi-snow', noite: 'wi-night-alt-snow' },
    73: { descricao: 'Neve moderada', dia: 'wi-snow', noite: 'wi-night-alt-snow' },
    75: { descricao: 'Neve forte', dia: 'wi-snow-wind', noite: 'wi-night-alt-snow-wind' },
    80: { descricao: 'Pancadas de chuva', dia: 'wi-showers', noite: 'wi-night-alt-showers' },
    81: { descricao: 'Pancadas moderadas', dia: 'wi-showers', noite: 'wi-night-alt-showers' },
    82: { descricao: 'Pancadas fortes', dia: 'wi-rain-wind', noite: 'wi-night-alt-rain-wind' },
    95: { descricao: 'Tempestade', dia: 'wi-thunderstorm', noite: 'wi-night-alt-thunderstorm' },
    96: { descricao: 'Tempestade com granizo', dia: 'wi-storm-showers', noite: 'wi-night-alt-storm-showers' },
    99: { descricao: 'Tempestade severa', dia: 'wi-hail', noite: 'wi-night-alt-hail' }
  };

  const hora = new Date().getHours();
  const isNoite = hora >= 18 || hora < 6;
  const clima = codigos[codigo] || { descricao: 'Clima desconhecido', dia: 'wi-na', noite: 'wi-na' };
  const icone = isNoite ? clima.noite : clima.dia;

  return { descricao: clima.descricao, icone };
}


// =============================================================
//  TRATAMENTO DE ERROS
// =============================================================

function tratarErro(erro) {
  console.error('Erro:', erro);
  let mensagem = MENSAGENS_ERRO.GENERICO;

  if (erro.message === 'TIMEOUT') mensagem = MENSAGENS_ERRO.TIMEOUT;
  else if (erro.message.includes('Network')) mensagem = MENSAGENS_ERRO.REDE;
  else if (erro.message.includes('500') || erro.message.includes('503')) mensagem = MENSAGENS_ERRO.SERVIDOR;

  mostrarErro(mensagem);
}

function mostrarErro(mensagem) {
  esconderMensagens();
  const erro = document.createElement('p');
  erro.id = 'error';
  erro.textContent = mensagem;
  erro.classList.add('erro-mensagem');
  searchScreen.appendChild(erro);
}


// =============================================================
//  INTERFACE
// =============================================================

function mostrarCarregamento() {
  loading.style.display = 'block';
}

function esconderCarregamento() {
  loading.style.display = 'none';
}

function esconderMensagens() {
  loading.style.display = 'none';
  document.getElementById('error')?.remove();
}


// =============================================================
//  FUNDO DINÂMICO
// =============================================================

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
      ? "linear-gradient(to bottom, #BFE8FF, #FAACDA, #FC7617)"
      : "linear-gradient(to bottom, #000624, #02184D, #497499)";
  } else if (parcialmenteNublado.includes(weatherCode)) {
    bg = isDia
      ? "linear-gradient(to bottom, #A3DBF7, #A6CAE0)"
      : isPorDoSol
      ? "linear-gradient(to bottom, #84A4BD, #D67C22, #D14217)"
      : "linear-gradient(to bottom, #020024, #415F94)";
  } else if (nublado.includes(weatherCode)) {
    bg = isDia
      ? "linear-gradient(to bottom, #a1c4fd, #c2e9fb)"
      : isPorDoSol
      ? "linear-gradient(to bottom, #AB9C7B, #8A5C4D, #AD5C34)"
      : "linear-gradient(to bottom, #020024, #485B75)";
  } else if (chuvoso.includes(weatherCode)) {
    bg = isDia
      ? "linear-gradient(to bottom, #3D4D6E, #5F81AD)"
      : isPorDoSol
      ? "linear-gradient(to bottom, #39445E, #596B8F, #B06E4D)"
      : "linear-gradient(to bottom, #1D243B, #2E4063)";
  } else {
    bg = "linear-gradient(to bottom, #88d6fa, #b3e5fc)";
  }

  document.body.style.transition = "background 1.5s ease-in-out";
  document.body.style.background = bg;
  document.body.style.backgroundSize = "200% 200%";
}


// =============================================================
//  EVENTOS
// =============================================================

searchBtn.addEventListener('click', buscarClima);
cityInput.addEventListener('keypress', (e) => e.key === 'Enter' && buscarClima());

backBtn.addEventListener('click', () => {
  cityInput.value = '';
  esconderMensagens();
  const horaAtual = new Date().getHours();
  definirFundoClima(0, horaAtual);
  resultScreen.style.display = 'none';
  searchScreen.style.display = 'flex';
  document.body.classList.remove("showing-result");
});


// =============================================================
//  INICIALIZAÇÃO
// =============================================================

window.addEventListener('load', () => {
  const horaAtual = new Date().getHours();
  definirFundoClima(0, horaAtual);
});
