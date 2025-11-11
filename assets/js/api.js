/**
 * @fileoverview Aplicativo de Previsão do Tempo 
 * @description Sistema web que consulta e exibe dados meteorológicos em tempo real,
 * utilizando as APIs Open-Meteo (Geocoding e Weather) para buscar informações climáticas
 * de cidades ao redor do mundo.
 *
 * @author Rayssa Ferraz
 * @version 1.0.0
 * @license MIT
 */

// =============================================================
//  SELEÇÃO DE ELEMENTOS DO DOM
// =============================================================

/**
 * Elementos HTML manipulados pela aplicação.
 * @type {HTMLElement}
 */
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const searchScreen = document.getElementById('searchScreen');
const resultScreen = document.getElementById('resultScreen');
const temperature = document.getElementById('temperature');
const cityName = document.getElementById('cityName');
const backBtn = document.getElementById('backBtn');

// Elementos criados dinamicamente
let description, weatherIcon, currentDate;

// =============================================================
//  CONSTANTES E CONFIGURAÇÕES
// =============================================================

/**
 * Tempo máximo de espera por resposta da API (em milissegundos).
 * @constant {number}
 * @default 10000
 */
const TIMEOUT_MS = 10000;

/**
 * Mensagens de erro padronizadas utilizadas em diferentes cenários.
 * @constant {Object.<string, string>}
 * @property {string} CIDADE_VAZIA - Quando o campo de busca está vazio.
 * @property {string} CIDADE_NAO_ENCONTRADA - Quando a cidade não é localizada.
 * @property {string} TIMEOUT - Quando a requisição excede o tempo limite.
 * @property {string} REDE - Quando ocorre erro de conexão.
 * @property {string} SERVIDOR - Quando ocorre falha no servidor.
 * @property {string} GENERICO - Quando o erro é genérico.
 */
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

/**
 * Retorna a data e hora atual formatadas no padrão brasileiro.
 * @returns {string} Data e hora completas (ex: segunda-feira, 10 de novembro de 2025 às 15:30).
 * @example
 * const data = obterDataHoraAtual();
 * console.log(data); // "segunda-feira, 10 de novembro de 2025 às 15:30"
 */
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

/**
 * Realiza uma requisição HTTP com tempo limite configurável.
 * Utiliza AbortController para cancelar requisições que excedem o tempo limite.
 *
 * @async
 * @param {string} url - URL da requisição.
 * @param {number} [timeout=TIMEOUT_MS] - Tempo máximo em milissegundos.
 * @throws {Error} Lança erro 'TIMEOUT' se a resposta demorar demais.
 * @returns {Promise<Response>} Resposta da requisição fetch.
 * @example
 * const resposta = await fetchComTimeout('https://api.open-meteo.com/v1/forecast');
 */
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

/**
 * Busca as coordenadas (latitude e longitude) de uma cidade.
 *
 * @async
 * @param {string} cidade - Nome da cidade.
 * @returns {Promise<Object|null>} Objeto com latitude, longitude, nome e país, ou null se não encontrado.
 * @throws {Error} Lança erro se houver falha na requisição.
 * @example
 * const coords = await buscarCoordenadas('São Paulo');
 * console.log(coords.latitude, coords.longitude);
 */
async function buscarCoordenadas(cidade) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    cidade
  )}&count=1&language=pt&format=json`;

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

/**
 * Busca os dados climáticos atuais com base nas coordenadas fornecidas.
 *
 * @async
 * @param {Object} coordenadas - Objeto com latitude e longitude.
 * @returns {Promise<Object>} Dados atuais de temperatura e código do clima.
 * @example
 * const dados = await buscarDadosClima({ latitude: -23.5, longitude: -46.6 });
 * console.log(dados.temperature_2m);
 */
async function buscarDadosClima(coordenadas) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordenadas.latitude}&longitude=${coordenadas.longitude}&current=temperature_2m,weather_code&timezone=auto`;
  const resposta = await fetchComTimeout(url);
  const dados = await resposta.json();
  return dados.current;
}

// =============================================================
//  FUNÇÃO PRINCIPAL
// =============================================================

/**
 * Função principal que busca e exibe as informações do clima.
 * Valida entrada, obtém coordenadas, consulta clima e atualiza interface.
 *
 * @async
 * @returns {Promise<void>}
 * @fires mostrarErro - Quando há erro de validação ou requisição.
 * @fires exibirClima - Quando os dados são carregados com sucesso.
 * @example
 * // Chamado ao clicar em "Buscar" ou pressionar Enter
 * await buscarClima();
 */
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

// =============================================================
//  EXIBIÇÃO DO CLIMA NA INTERFACE
// =============================================================

/**
 * Exibe as informações meteorológicas na interface do usuário.
 *
 * @param {string} nome - Nome da cidade.
 * @param {string} pais - Nome do país.
 * @param {Object} dados - Dados meteorológicos retornados pela API.
 * @returns {void}
 */
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
}

// =============================================================
//  TRADUÇÃO DE CÓDIGOS DE CLIMA
// =============================================================

/**
 * Retorna a descrição e o ícone apropriado com base no código climático e horário.
 * @param {number} codigo - Código climático da API.
 * @returns {{descricao: string, icone: string}} Objeto com descrição e ícone correspondente.
 */
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
//  TRATAMENTO DE ERROS E INTERFACE
// =============================================================

/**
 * Trata diferentes tipos de erro e exibe mensagens apropriadas.
 * @param {Error} erro - Objeto de erro capturado.
 * @returns {void}
 */
function tratarErro(erro) {
  console.error('Erro:', erro);
  let mensagem = MENSAGENS_ERRO.GENERICO;

  if (erro.message === 'TIMEOUT') mensagem = MENSAGENS_ERRO.TIMEOUT;
  else if (erro.message.includes('Network')) mensagem = MENSAGENS_ERRO.REDE;
  else if (erro.message.includes('500') || erro.message.includes('503')) mensagem = MENSAGENS_ERRO.SERVIDOR;

  mostrarErro(mensagem);
}

/**
 * Exibe mensagem de erro na interface.
 * @param {string} mensagem - Texto da mensagem.
 * @returns {void}
 */
function mostrarErro(mensagem) {
  esconderMensagens();
  const erro = document.createElement('p');
  erro.id = 'error';
  erro.textContent = mensagem;
  erro.classList.add('erro-mensagem');
  searchScreen.appendChild(erro);
}

/** Exibe o indicador de carregamento. */
function mostrarCarregamento() {
  loading.style.display = 'block';
}

/** Esconde o indicador de carregamento. */
function esconderCarregamento() {
  loading.style.display = 'none';
}

/** Remove mensagens de erro ou carregamento. */
function esconderMensagens() {
  loading.style.display = 'none';
  document.getElementById('error')?.remove();
}

// =============================================================
//  FUNDO DINÂMICO (POR CLIMA E HORÁRIO)
// =============================================================

/**
 * Define dinamicamente o fundo da aplicação com base no clima e horário.
 * @param {number} weatherCode - Código climático.
 * @param {number} hora - Hora atual.
 * @returns {void}
 */
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
// EVENTOS
// =============================================================

/** Evento: executa busca ao clicar no botão. */
searchBtn.addEventListener('click', buscarClima);

/** Evento: executa busca ao pressionar Enter. */
cityInput.addEventListener('keypress', (e) => e.key === 'Enter' && buscarClima());

/** Evento: retorna à tela inicial ao clicar em "voltar". */
backBtn.addEventListener('click', () => {
  cityInput.value = '';
  esconderMensagens();
  const horaAtual = new Date().getHours();
  definirFundoClima(0, horaAtual);
  resultScreen.style.display = 'none';
  searchScreen.style.display = 'flex';
});

// =============================================================
//  INICIALIZAÇÃO AUTOMÁTICA
// =============================================================

/** Aplica o fundo dinâmico automaticamente ao carregar a página. */
window.addEventListener('load', () => {
  const horaAtual = new Date().getHours();
  definirFundoClima(0, horaAtual);
});
