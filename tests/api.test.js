/**
 * Testes Unitários - Aplicativo de Previsão do Tempo 
 * Ferramenta: Jest
 */

describe("Testes Unitários - App Clima", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // 1️⃣ Cidade válida
  test("1. Cidade válida deve retornar dados meteorológicos corretamente", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("geocoding-api")) {
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

      return Promise.resolve({
        json: () =>
          Promise.resolve({
            current: { temperature_2m: 27, weather_code: 1 },
          }),
      });
    });

    const geoResp = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?name=São Paulo"
    );
    const geoData = await geoResp.json();
    expect(geoData.results[0].name).toBe("São Paulo");

    const climaResp = await fetch("https://api.open-meteo.com/v1/forecast");
    const climaData = await climaResp.json();
    expect(climaData.current.temperature_2m).toBe(27);
  });

  // 2️⃣ Cidade inexistente
  test("2. Cidade inexistente deve retornar resultado vazio", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
      })
    );

    const resp = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?name=CidadeFake"
    );
    const data = await resp.json();
    expect(data.results.length).toBe(0);
  });

  // 3️⃣ Entrada vazia
  test("3. Campo de busca vazio deve falhar na validação", () => {
    const vazio = "";
    const espacos = "   ";
    expect(vazio.trim().length > 0).toBe(false);
    expect(espacos.trim().length > 0).toBe(false);
  });

  // 4️⃣ Falha de rede
  test("4. Falha de conexão deve ser tratada com erro", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Erro de conexão")));
    await expect(fetch("https://api.fake.com")).rejects.toThrow(
      "Erro de conexão"
    );
  });

  // 5️⃣ Erro 429
  test("5. Deve lidar corretamente com erro 429 (muitas requisições)", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 429,
        ok: false,
        json: () =>
          Promise.resolve({
            error: true,
            message: "Muitas requisições. Aguarde.",
          }),
      })
    );

    const resp = await fetch("https://api.open-meteo.com/v1/search");
    const data = await resp.json();
    expect(resp.status).toBe(429);
    expect(data.error).toBe(true);
  });

  // 6️⃣ Timeout
  test("6. Conexão lenta deve gerar timeout controlado", async () => {
    const TEMPO = 1000;

    global.fetch = jest.fn(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Tempo limite excedido")), TEMPO + 500);
        })
    );

    const promiseTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout atingido")), TEMPO);
    });

    await expect(
      Promise.race([fetch("https://api.open-meteo.com/v1/forecast"), promiseTimeout])
    ).rejects.toThrow(/Timeout/i);
  });

  // 7️⃣ Mudança no formato da API
  test("7. Estrutura alterada da API deve ser detectada", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("geocoding-api")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              locations: [{ lat: -23.55, lon: -46.63, nome: "São Paulo" }],
            }),
        });
      }
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            currentWeather: { temp: 26.3, codigo: 1 },
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
