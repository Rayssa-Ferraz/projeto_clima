<h1 align="center">🌤️ Projeto – Aplicativo de Previsão do Tempo</h1>



<p align="center">
Aplicativo interativo que permite consultar as condições climáticas em tempo real de qualquer cidade do mundo. 🌎<br>
Desenvolvido com <b>HTML, CSS e JavaScript puro</b>, o sistema consome as APIs da <b>Open-Meteo</b> para exibir temperatura, descrição do clima e ícone dinâmico, além de ajustar automaticamente o fundo da tela conforme o horário (dia, pôr do sol ou noite).<br><br>
Conta também com tratamento de erros (rede, cidade inexistente, timeout), mensagens informativas e uma experiência fluida e responsiva — tudo em uma interface moderna e intuitiva.
</p>





---

## 🚀 Como Executar a Aplicação

1. Baixe ou clone o repositório:

```bash
git clone https://github.com/Rayssa-Ferraz/projeto_clima.git
```

2. 🗂️ Estrutura do projeto:

PROJETO_CLIMA/
│
├── index.html                  # Página principal do aplicativo
│
├── assets/
│   ├── css/
│   │   └── styles.css          # Folha de estilos principal (design e responsividade)
│   │
│   ├── js/
│   │   └── api.js              # Lógica principal e integração com as APIs Open-Meteo
│   │
│   └── images/                 # Ícones e imagens ilustrativas
│
├── tests/
│   └── api.test.js             # Testes unitários com Jest

3. Abra o arquivo index.html diretamente no navegador.
    Nenhum servidor é necessário — a aplicação roda totalmente no cliente.

4. Caso prefira, abra no Visual Studio Code e utilize a extensão Live Server para execução automática.


## 🧠 Como Executar os Testes com Jest

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

<p align="center"> <img src="https://ik.imagekit.io/f9incgeso/api.test.JPG?updatedAt=1762842215446"</p>


## 🧩 Tecnologias Utilizadas
HTML5 → Estrutura da aplicação

CSS3 (Flexbox & Grid) → Estilização e layout responsivo

JavaScript (ES6+) → Lógica e consumo das APIs

Open-Meteo API → Dados meteorológicos em tempo real

Jest → Testes automatizados (unitários e de validação)

## 📝 Licença

Distribuído sob a licença MIT.
Consulte o arquivo LICENSE para mais detalhes.

## ✨ Autora

👩‍💻 Desenvolvido por [**Rayssa**](https://github.com/Rayssa-Ferraz).  
📧 Para dúvidas, sugestões ou colaborações, entre em contato:
**rayssa_nana@hotmail.com**  
🌎 [Meu Site](https://rayssa-ferraz.github.io/PORTFOLIO)
