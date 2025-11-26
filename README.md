# 🌤 Aplicativo de Previsão do Tempo
<br /> <div align="center"> <img src="https://imgur.com/q6ZRYV4.png" title="Prévia da Aplicação" /> </div> <br />
<div align="center"> <img src="https://img.shields.io/github/repo-size/Rayssa-Ferraz/projeto_clima?style=flat-square" /> <img src="https://img.shields.io/badge/HTML-5-orange.svg" /> <img src="https://img.shields.io/badge/CSS-3-purple.svg" /> <img src="https://img.shields.io/badge/JavaScript-ES6+-yellow.svg" /> <img src="https://img.shields.io/github/last-commit/Rayssa-Ferraz/projeto_clima?style=flat-square" /> <img src="https://img.shields.io/github/issues/Rayssa-Ferraz/projeto_clima?style=flat-square" /> <img src="https://img.shields.io/github/issues-pr/Rayssa-Ferraz/projeto_clima?style=flat-square" /> <img src="https://img.shields.io/badge/License-MIT-blue.svg"> </div>

<br />

## 1. Descrição

Aplicativo interativo que permite consultar as condições climáticas em tempo real de qualquer cidade do mundo, exibindo a previsão do dia atual e dos próximos 4 dias. <br>
Desenvolvido com <b>HTML, CSS e JavaScript </b>, o sistema consome as APIs da <b>Open-Meteo</b> para exibir temperatura, descrição do clima e ícone dinâmico, além de ajustar automaticamente o fundo da tela conforme o horário (dia, pôr do sol ou noite).<br><br>
Conta também com tratamento de erros (rede, cidade inexistente, timeout),  testes unitários com Jest, mensagens informativas e uma experiência fluida e responsiva — tudo em uma interface moderna e intuitiva.
.


<br />

## 2. Funcionalidades

🔎 Busca inteligente de cidades

🌡 Clima em tempo real

⛅ Previsão dos próximos dias

🌇 Tema dinâmico (dia / pôr do sol / noite)

📱 Layout totalmente responsivo

⚠️ Tratamento de erros (rede, timeout, cidade inválida)

🧪 Testes com Jest

<br />

## 3. 🧩 Tecnologias Utilizadas
### 3.1 Frontend

- HTML5

- CSS3

- Variáveis CSS

- Flexbox

- Grid

- Animações

- JavaScript (ES6+)

- async/await

- fetch API

- AbortController

### 3.2 APIs Externas

- **[Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)** - Geolocalização de cidades
- **[Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs)** - Dados meteorológicos

### 3.3 Bibliotecas de Ícones

- **[Weather Icons 2.0.12](https://erikflowers.github.io/weather-icons/)** - Ícones meteorológicos temáticos

### 3.4 Ferramentas de Desenvolvimento

- **[Jest](https://jestjs.io/)** - Framework de testes unitários
- **[Google Fonts (Poppins)](https://fonts.google.com/specimen/Poppins)** - Tipografia moderna
- **[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)**- Execução local automatizada

<br />

## 4. Pré-requisitos

- Navegador moderno

- Conexão com a internet

- Node.js + npm (para testes)

<br />

## 5. Instalação
### 📥 1. Clone o repositório

```bash
git clone https://github.com/Rayssa-Ferraz/projeto_clima.git
cd projeto_clima
```
### 📂 2. Estrutura do Projeto (com emojis)
```bash
📁 projeto_clima/
│
├── 📁 assets/
│   ├── 📁 css/
│   │   └── 📄 styles.css      # Estilos principais
│   │
│   ├── 📁 js/
│   │   └── 📄 api.js          # Lógica da aplicação
│   │
│   └── 📁 img/                # Ícones e imagens
│
├── 📁 tests/
│   └── 📄 api.test.js         # Testes unitários (Jest)
│
├── 📄 index.html               # Página principal
├── 📄 LICENSE                  # Licença MIT
├── 📄 README.md                # Documentação
└── 📄 package.json             # Configurações do Jest
```
<br />

## 6. Como Executar
### ▶️ Método 1 — Abrir direto no navegador

1. Navegue até a pasta do projeto
2. Abra o arquivo `index.html` diretamente no navegador
3. A aplicação estará pronta para uso!

### ▶️ Método 2 — Live Server (recomendado)
Se você usa **Visual Studio Code**:

1. Instale a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Clique com o botão direito em `index.html`
3. Selecione **"Open with Live Server"**
4. A aplicação será aberta automaticamente em `http://localhost:5500`

<br />
## 7. Como Usar

1. Digite o nome da cidade
2. Clique em Buscar
3. Veja:
	- Temperatura atual

	- Descrição do clima

	- Ícone dinâmico

	- Data e hora

	- Previsão dos próximos dias

4. Clique no botão 🏠 para voltar

<br />

## 8. Como Executar os Testes com Jest

1. Instalação do Jest (dependência de desenvolvimento):
```bash
npm install --save-dev jest
```
2. Execução dos testes:
```bash
npm test
```

## 📊 Resultado dos Testes Automatizados

Todos os testes unitários foram executados com sucesso ✅

<p align="center"> <img src="https://ik.imagekit.io/f9incgeso/testprojetoclima.JPG?updatedAt=1764130857906"</p>

<br />

## 9. Segurança & Boas Práticas
- HTTPS
	
- Timeout de requisição
	
- Tratamento robusto de erros
	
- Sem uso de dados sensíveis
	
- API pública sem chave

<br />

## 10. APIs Utilizadas
🌍 Open-Meteo Geocoding API

🔗 Documentação:
https://open-meteo.com/en/docs/geocoding-api

🌦 Open-Meteo Weather Forecast API

🔗 Documentação:
https://open-meteo.com/en/docs

💰 Planos & Limites

https://open-meteo.com/en/pricing

<br />

## 11. Responsividade

- Layout adaptado para:

- Desktop

- Tablet

- Mobile

<br />

## 12. Tratamento de Erros

| Cenário               | Mensagem                                  |
| --------------------- | ----------------------------------------- |
| Campo vazio           | “Por favor, digite o nome de uma cidade.” |
| Cidade não encontrada | “Cidade não encontrada.”                  |
| Timeout               | “A requisição demorou muito.”             |
| Rede                  | “Erro de conexão.”                        |
| Servidor              | “Erro no servidor.”                       |

<br />

## 13. Licença

Este projeto está sob a Licença MIT.
📄 Acesse aqui:
👉 https://github.com/Rayssa-Ferraz/projeto_clima/blob/main/LICENSE

<br />


## ⭐Autora⭐

👩‍💻 Desenvolvido por [**Rayssa**](https://github.com/Rayssa-Ferraz).  
📧 Para dúvidas, sugestões ou colaborações, entre em contato:
**rayssa_nana@hotmail.com**  
🌎 [Meu Site](https://rayssa-ferraz.github.io/PORTFOLIO)
