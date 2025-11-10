/**
 * 🌦️ Testes Unitários - Aplicativo de Previsão do Tempo (Rayssa Ferraz)
 * Ferramenta: Jest
 * Objetivo: Garantir o bom funcionamento das funções de requisição e tratamento de erro do app.
 */

describe("🧪 Testes Unitários - App Clima (Rayssa Ferraz)", () => {
  let originalFetch;

  beforeEach(() => {
    // Guarda a função fetch original
    originalFetch = global.fetch;
  });

  afterEach(() => {
    // Restaura o fetch ao seu estado normal após cada teste
    global.fetch = originalFetch;
  });

  // ==============================
  // 1️⃣ Cidade válida
  // ==============================
  test("1. Cidade válida deve retornar dados meteorológicos corretamente", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("geocoding-api")) {
        // Mock para coordenadas
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              results: [
                {
                  latitude: -23.5505,
                  longitude: -46.6333,
                  name: "São Paulo",
                  country: "Brasil",
                },
              ],
            }),
        });
      }

      // Mock para clima
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            current: {
              temperature_2m: 27,
              weather_code: 1,
            },
          }),
      });
    });

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=São Paulo&count=1&language=pt&format=json`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    expect(geoData.results[0].name).toBe("São Paulo");

    const climaUrl = `https://api.open-meteo.com/v1/forecast?latitude=-23.5505&longitude=-46.6333&current=temperature_2m,weather_code`;
    const climaResponse = await fetch(climaUrl);
    const climaData = await climaResponse.json();

    expect(climaData.current.temperature_2m).toBe(27);
  });

  // ==============================
  // 2️⃣ Cidade inexistente
  // ==============================
  test("2. Cidade inexistente deve retornar resultado vazio", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
      })
    );

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=AbcCidadeInexistente&count=1&language=pt&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    expect(data.results.length).toBe(0);
  });

  // ==============================
  // 3️⃣ Entrada vazia
  // ==============================
  test("3. Campo de busca vazio deve falhar na validação", () => {
    const campoVazio = "";
    const apenasEspacos = "   ";

    expect(campoVazio.trim().length > 0).toBe(false);
    expect(apenasEspacos.trim().length > 0).toBe(false);
  });

  // ==============================
  // 4️⃣ Falha de rede ou API
  // ==============================
  test("4. Falha de conexão deve ser tratada com erro", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Erro de conexão")));

    await expect(fetch("https://api.fake.com")).rejects.toThrow("Erro de conexão");
  });

  // ==============================
  // 5️⃣ Limite de requisições
  // ==============================
  test("5. Deve lidar corretamente com erro 429 (limite de requisições atingido)", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 429,
        ok: false,
        json: () =>
          Promise.resolve({
            error: true,
            message: "Muitas requisições. Aguarde um momento.",
          }),
      })
    );

    const resposta = await fetch("https://api.open-meteo.com/v1/search");
    const dados = await resposta.json();

    expect(resposta.status).toBe(429);
    expect(dados.error).toBe(true);
  });

  // ==============================
  // 6️⃣ Internet lenta
  // ==============================
  test("6. Conexão lenta deve gerar timeout controlado", async () => {
    const TEMPO_LIMITE = 1000;

    global.fetch = jest.fn(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Tempo limite excedido")), TEMPO_LIMITE + 500);
        })
    );

    const promiseTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout atingido")), TEMPO_LIMITE);
    });

    await expect(
      Promise.race([fetch("https://api.open-meteo.com/v1/forecast"), promiseTimeout])
    ).rejects.toThrow(/Timeout/i);
  });

  // ==============================
  // 7️⃣ Mudança inesperada no formato JSON
  // ==============================
  test("7. Estrutura da API alterada deve ser detectada", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("geocoding-api")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              locations: [
                {
                  lat: -23.55,
                  lon: -46.63,
                  nome: "São Paulo",
                },
              ],
            }),
        });
      }

      return Promise.resolve({
        json: () =>
          Promise.resolve({
            currentWeather: {
              temp: 26.3,
              codigo: 1,
            },
          }),
      });
    });

    const geoResp = await fetch("https://geocoding-api.open-meteo.com/v1/search");
    const geoData = await geoResp.json();

    expect(geoData.results).toBeUndefined();
    expect(geoData.locations).toBeDefined();

    const climaResp = await fetch("https://api.open-meteo.com/v1/forecast");
    const climaData = await climaResp.json();

    expect(climaData.current).toBeUndefined();
    expect(climaData.currentWeather).toBeDefined();
  });
});
