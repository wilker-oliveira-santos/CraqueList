
<p align="center">
  <img src="./image/logo.png" alt="CraqueList Logo" width="180">
</p>

<p align="center">
  Sistema web para cadastro e gerenciamento de jogadores de futebol favoritos.
</p>

---

## 📖 Sobre

O **CraqueList** é uma aplicação web desenvolvida para permitir que usuários criem uma lista personalizada de seus jogadores de futebol favoritos.

O projeto possui autenticação de usuários, gerenciamento completo de jogadores (CRUD), integração com a API **REST Countries** para exibição das bandeiras das seleções e armazenamento de todos os dados utilizando **LocalStorage**, sem necessidade de banco de dados.

---

## ✨ Funcionalidades

- 👤 Cadastro de usuários
- 🔐 Login e Logout
- 🏠 Página inicial personalizada
- ⚽ Cadastro de jogadores
- 📝 Edição de jogadores
- ❌ Exclusão de jogadores
- 🔍 Pesquisa e filtros
- 🌍 Bandeiras das seleções utilizando a REST Countries API
- 💾 Armazenamento em LocalStorage
- 📱 Layout totalmente responsivo

---

## 🛠 Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Bootstrap 5
- LocalStorage
- REST Countries API

---

## 📂 Estrutura do Projeto

```text
CraqueList/
│
├── css/
│   └── style.css
│
├── image/
│   ├── logo.png
│   ├── fundo.png
│   └── FUT.png
│
├── pages/
│   ├── home.html
│   ├── cadastro.html
│   └── login.html
│
├── scripts/
│   ├── app.js
│   ├── cadastro.js
│   └── login.js
│
├── index.html
└── README.md
```

---

## 🚀 Como executar

### Clone o repositório

```bash
git clone https://github.com/SEU-USUARIO/CraqueList.git
```

### Entre na pasta

```bash
cd CraqueList
```

### Execute

Abra o arquivo **index.html** no navegador ou utilize a extensão **Live Server** do Visual Studio Code.

---

## 💻 Funcionalidades do CRUD

| Operação | Descrição |
|----------|-----------|
| ✅ Create | Cadastra um novo jogador |
| 📋 Read | Lista os jogadores cadastrados |
| ✏️ Update | Edita um jogador existente |
| 🗑 Delete | Remove um jogador |

---

## 🌍 API utilizada

O projeto consome a API pública **REST Countries**, utilizada para:

- Buscar os países;
- Exibir as bandeiras;
- Associar a nacionalidade dos jogadores.

API:

https://restcountries.com/

---

## 💾 Armazenamento

Todos os dados ficam salvos localmente através do **LocalStorage**, incluindo:

- Usuários cadastrados;
- Sessão do usuário;
- Lista de jogadores.

Não é necessário instalar banco de dados.

---

## 📱 Responsividade

A interface foi desenvolvida para funcionar em diferentes dispositivos:

- 💻 Desktop
- 📱 Smartphones
- 📲 Tablets

---

## 🎯 Objetivo

Este projeto foi desenvolvido com fins acadêmicos para praticar:

- Manipulação do DOM
- JavaScript puro
- CRUD
- LocalStorage
- Consumo de APIs REST
- Bootstrap
- Organização de código
- Responsividade
- Interface moderna

---


## 📄 Licença

Este projeto possui finalidade exclusivamente educacional.

Sinta-se à vontade para utilizá-lo como referência em seus estudos.
