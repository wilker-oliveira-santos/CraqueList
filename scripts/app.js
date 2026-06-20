
let currentUser = null;      
let players = [];            
let editingPlayerId = null;  
let deleteTarget = null;      
let countriesCache = null;    

let countriesFallback = [
    { name: "Brazil",    flag: "🇧🇷", flagImg: "https://flagcdn.com/w320/br.png", code: "BR" },
    { name: "Argentina", flag: "🇦🇷", flagImg: "https://flagcdn.com/w320/ar.png", code: "AR" },
    { name: "Spain",     flag: "🇪🇸", flagImg: "https://flagcdn.com/w320/es.png", code: "ES" },
    { name: "France",    flag: "🇫🇷", flagImg: "https://flagcdn.com/w320/fr.png", code: "FR" },
    { name: "Portugal",  flag: "🇵🇹", flagImg: "https://flagcdn.com/w320/pt.png", code: "PT" },
    { name: "Germany",   flag: "🇩🇪", flagImg: "https://flagcdn.com/w320/de.png", code: "DE" },
    { name: "England",   flag: "🏴",  flagImg: "https://flagcdn.com/w320/gb-eng.png", code: "GB" }
];


document.addEventListener("DOMContentLoaded", function () {
    initializeApp();
});

function initializeApp() {
    let userTexto = localStorage.getItem("currentUser");


    if (!userTexto) {
        window.location.href = "../pages/login.html";
        return;
    }

    currentUser = JSON.parse(userTexto);

    loadPlayers();
    updateProfileDisplay();
    renderCarousel();
    renderPlayersList();
    populateCountryFilters();
}


function loadPlayers() {
    let todosOsJogadores = JSON.parse(localStorage.getItem("players")) || [];
    players = []; 


    for (let i = 0; i < todosOsJogadores.length; i++) {
        if (todosOsJogadores[i].userId === currentUser.email) {
            players.push(todosOsJogadores[i]);
        }
    }
}

function savePlayers() {
    let todosOsJogadores = JSON.parse(localStorage.getItem("players")) || [];


    let jogadoresDeOutros = [];
    for (let i = 0; i < todosOsJogadores.length; i++) {
        if (todosOsJogadores[i].userId !== currentUser.email) {
            jogadoresDeOutros.push(todosOsJogadores[i]);
        }
    }


    let listaFinal = jogadoresDeOutros.concat(players);
    localStorage.setItem("players", JSON.stringify(listaFinal));
}

async function getAllCountries() {

    if (countriesCache) {
        return countriesCache;
    }

    try {
        let response = await fetch("https://restcountries.com/v3.1/all?fields=name,flag,flags,cca2");

        if (!response.ok) {
            throw new Error("Erro na API");
        }

        let data = await response.json();
        let listaDePaises = [];

        for (let i = 0; i < data.length; i++) {
            let pais = data[i];

            let imagem = null;
            if (pais.flags) {
                if (pais.flags.png) {
                    imagem = pais.flags.png;
                } else {
                    imagem = pais.flags.svg;
                }
            }

            listaDePaises.push({
                name: pais.name.common,
                flag: pais.flag || "",
                flagImg: imagem,
                code: pais.cca2
            });
        }

        listaDePaises.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });

        countriesCache = listaDePaises;
        return countriesCache;

    } catch (error) {
        console.error("Erro ao carregar países:", error);
        return countriesFallback;
    }
}

function buildFlagElement(country, altura) {
    if (country.flagImg) {
        let img = document.createElement("img");
        img.src = country.flagImg;
        img.alt = country.name;
        img.style.height = altura + "px";
        img.style.width = "auto";
        img.style.borderRadius = "4px";
        return img;
    } else {
        let span = document.createElement("span");
        span.style.fontSize = altura + "px";
        span.textContent = country.flag;
        return span;
    }
}


function updateProfileDisplay() {
    document.getElementById("userNameNav").textContent = currentUser.nome;
    document.getElementById("profileName").textContent = currentUser.nome;
    document.getElementById("profileEmail").textContent = currentUser.email;
}


async function renderCarousel() {
    let carouselContent = document.getElementById("carouselContent");
    carouselContent.innerHTML = ""; // limpa o que tinha antes

    let countries = await getAllCountries();

    for (let i = 0; i < 5 && i < countries.length; i++) {
        let pais = countries[i];

        // cria o item do carrossel
        let item = document.createElement("div");
        if (i === 0) {
            item.className = "carousel-item active";
        } else {
            item.className = "carousel-item";
        }

        let wrapper = document.createElement("div");
        wrapper.style.textAlign = "center";

        let flagDiv = document.createElement("div");
        flagDiv.style.marginBottom = "1rem";
        flagDiv.appendChild(buildFlagElement(pais, 110));

        let nomeDiv = document.createElement("div");
        nomeDiv.style.fontSize = "1.5rem";
        nomeDiv.textContent = pais.name;

        wrapper.appendChild(flagDiv);
        wrapper.appendChild(nomeDiv);
        item.appendChild(wrapper);
        carouselContent.appendChild(item);
    }
}

async function populateCountryFilters() {
    let filterCountry = document.getElementById("filterCountry");
    filterCountry.innerHTML = "";


    let optionTodas = document.createElement("option");
    optionTodas.value = "";
    optionTodas.textContent = "Todas as Seleções";
    filterCountry.appendChild(optionTodas);

    let countries = await getAllCountries();
    for (let i = 0; i < countries.length; i++) {
        let pais = countries[i];

        let option = document.createElement("option");
        option.value = pais.name;
        option.textContent = pais.flag + " " + pais.name;
        filterCountry.appendChild(option);
    }
}

function filterPlayers() {
    renderPlayersList();
}

function getFilteredPlayers() {
    let countryFilter = document.getElementById("filterCountry").value;
    let positionFilter = document.getElementById("filterPosition").value;

    let resultado = [];
    for (let i = 0; i < players.length; i++) {
        let jogador = players[i];
        let combinaPais = (!countryFilter || jogador.country === countryFilter);
        let combinaPosicao = (!positionFilter || jogador.position === positionFilter);

        if (combinaPais && combinaPosicao) {
            resultado.push(jogador);
        }
    }

    return resultado;
}


async function renderPlayersList() {
    let playersList = document.getElementById("playersList");
    playersList.innerHTML = ""; // limpa o que tinha antes

    let filteredPlayers = getFilteredPlayers();

    if (filteredPlayers.length === 0) {
        let coluna = document.createElement("div");
        coluna.className = "col-12";

        let estadoVazio = document.createElement("div");
        estadoVazio.className = "empty-state";

        let titulo = document.createElement("h3");
        titulo.textContent = "Nenhum jogador encontrado";

        let texto = document.createElement("p");
        texto.textContent = 'Clique em "Adicionar Jogador" para começar sua lista!';

        estadoVazio.appendChild(titulo);
        estadoVazio.appendChild(texto);
        coluna.appendChild(estadoVazio);
        playersList.appendChild(coluna);
        return;
    }

    let countries = await getAllCountries();

    for (let i = 0; i < filteredPlayers.length; i++) {
        let player = filteredPlayers[i];


        let countryEncontrado = null;
        for (let j = 0; j < countries.length; j++) {
            if (countries[j].name === player.country) {
                countryEncontrado = countries[j];
                break;
            }
        }

        let bandeira;
        if (countryEncontrado) {
            bandeira = buildFlagElement(countryEncontrado, 60);
        } else {
            bandeira = document.createElement("span");
            bandeira.style.fontSize = "2.5rem";
            bandeira.textContent = "🏳️";
        }


        let coluna = document.createElement("div");
        coluna.className = "col-12 col-md-6";

        let card = document.createElement("div");
        card.className = "player-card";

        let flagDiv = document.createElement("div");
        flagDiv.className = "player-flag";
        flagDiv.appendChild(bandeira);

        let nomeDiv = document.createElement("div");
        nomeDiv.className = "player-name";
        nomeDiv.textContent = player.name;

        let selecaoDiv = document.createElement("div");
        selecaoDiv.className = "player-info";
        let selecaoLabel = document.createElement("strong");
        selecaoLabel.textContent = "Seleção:";
        selecaoDiv.appendChild(selecaoLabel);
        selecaoDiv.appendChild(document.createTextNode(" " + player.country));

        let posicaoDiv = document.createElement("div");
        posicaoDiv.className = "player-info";
        let posicaoLabel = document.createElement("strong");
        posicaoLabel.textContent = "Posição:";
        posicaoDiv.appendChild(posicaoLabel);
        posicaoDiv.appendChild(document.createTextNode(" " + player.position));

        let acoesDiv = document.createElement("div");
        acoesDiv.className = "player-actions";

        let botaoEditar = document.createElement("button");
        botaoEditar.className = "btn-sm btn-edit";
        botaoEditar.textContent = "Editar";
        botaoEditar.addEventListener("click", function () {
            openEditPlayerModal(player.id);
        });

        let botaoRemover = document.createElement("button");
        botaoRemover.className = "btn-sm btn-delete";
        botaoRemover.textContent = "Remover";
        botaoRemover.addEventListener("click", function () {
            openDeleteConfirm("player", player.id);
        });

        acoesDiv.appendChild(botaoEditar);
        acoesDiv.appendChild(botaoRemover);

        card.appendChild(flagDiv);
        card.appendChild(nomeDiv);
        card.appendChild(selecaoDiv);
        card.appendChild(posicaoDiv);
        card.appendChild(acoesDiv);

        coluna.appendChild(card);
        playersList.appendChild(coluna);
    }
}

async function openAddPlayerModal() {
    editingPlayerId = null;
    document.getElementById("playerModalTitle").textContent = "Adicionar Jogador";
    document.getElementById("playerForm").reset();

    await populatePlayerCountrySelect("");
    let modal = new bootstrap.Modal(document.getElementById("playerModal"));
    modal.show();
}

async function openEditPlayerModal(playerId) {
    editingPlayerId = playerId;

    let player = null;
    for (let i = 0; i < players.length; i++) {
        if (players[i].id === playerId) {
            player = players[i];
            break;
        }
    }

    if (!player) return;

    document.getElementById("playerModalTitle").textContent = "Editar Jogador";
    document.getElementById("playerName").value = player.name;
    document.getElementById("playerPosition").value = player.position;

    await populatePlayerCountrySelect(player.country);
    let modal = new bootstrap.Modal(document.getElementById("playerModal"));
    modal.show();
}

async function populatePlayerCountrySelect(paisSelecionado) {
    let select = document.getElementById("playerCountry");
    select.innerHTML = "";

    let optionVazia = document.createElement("option");
    optionVazia.value = "";
    optionVazia.textContent = "Selecione uma seleção";
    select.appendChild(optionVazia);

    let countries = await getAllCountries();
    for (let i = 0; i < countries.length; i++) {
        let pais = countries[i];

        let option = document.createElement("option");
        option.value = pais.name;
        option.textContent = pais.flag + " " + pais.name;

        if (pais.name === paisSelecionado) {
            option.selected = true;
        }

        select.appendChild(option);
    }
}

function savePlayer() {
    let name = document.getElementById("playerName").value.trim();
    let country = document.getElementById("playerCountry").value;
    let position = document.getElementById("playerPosition").value;

    if (!name || !country || !position) {
        alert("Preencha todos os campos!");
        return;
    }

    if (editingPlayerId) {

        for (let i = 0; i < players.length; i++) {
            if (players[i].id === editingPlayerId) {
                players[i].name = name;
                players[i].country = country;
                players[i].position = position;
                break;
            }
        }
    } else {
        let novoJogador = {
            id: Date.now().toString(),
            userId: currentUser.email,
            name: name,
            country: country,
            position: position
        };
        players.push(novoJogador);
    }

    savePlayers();
    renderPlayersList();

    let modal = bootstrap.Modal.getInstance(document.getElementById("playerModal"));
    modal.hide();
}


function openEditProfileModal() {
    document.getElementById("editName").value = currentUser.nome;
    document.getElementById("editEmail").value = currentUser.email;

    let modal = new bootstrap.Modal(document.getElementById("editProfileModal"));
    modal.show();
}

function saveProfile() {
    let newName = document.getElementById("editName").value.trim();
    let newEmail = document.getElementById("editEmail").value.trim();

    if (!newName || !newEmail) {
        alert("Preencha todos os campos!");
        return;
    }

    if (!newEmail.includes("@") || !newEmail.includes(".")) {
        alert("Digite um email válido!");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];


    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === newEmail && usuarios[i].email !== currentUser.email) {
            alert("Este email já está cadastrado!");
            return;
        }
    }

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === currentUser.email) {
            usuarios[i].nome = newName;
            usuarios[i].email = newEmail;
            break;
        }
    }
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    let oldEmail = currentUser.email;
    currentUser.nome = newName;
    currentUser.email = newEmail;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    let todosOsJogadores = JSON.parse(localStorage.getItem("players")) || [];
    for (let i = 0; i < todosOsJogadores.length; i++) {
        if (todosOsJogadores[i].userId === oldEmail) {
            todosOsJogadores[i].userId = newEmail;
        }
    }
    localStorage.setItem("players", JSON.stringify(todosOsJogadores));

    loadPlayers();
    updateProfileDisplay();
    renderPlayersList();

    let modal = bootstrap.Modal.getInstance(document.getElementById("editProfileModal"));
    modal.hide();
    alert("Perfil atualizado com sucesso!");
}

function openDeleteConfirm(tipo, id) {
    deleteTarget = { type: tipo, id: id };
    let mensagem = document.getElementById("confirmDeleteMessage");

    if (tipo === "player") {
        let player = null;
        for (let i = 0; i < players.length; i++) {
            if (players[i].id === id) {
                player = players[i];
                break;
            }
        }
        mensagem.textContent = 'Tem certeza que deseja remover o jogador "' + player.name + '" da sua lista?';
    } else if (tipo === "account") {
        mensagem.textContent = "Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita!";
    }

    let modal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
    modal.show();
}

function confirmDelete() {
    if (!deleteTarget) return;

    if (deleteTarget.type === "player") {
        let novaLista = [];
        for (let i = 0; i < players.length; i++) {
            if (players[i].id !== deleteTarget.id) {
                novaLista.push(players[i]);
            }
        }
        players = novaLista;
        savePlayers();
        renderPlayersList();
    } else if (deleteTarget.type === "account") {
        deleteAccountConfirmed();
    }

    let modal = bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal"));
    modal.hide();
    deleteTarget = null;
}
function deleteAccount() {
    openDeleteConfirm("account", null);
}

function deleteAccountConfirmed() {

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let usuariosRestantes = [];
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email !== currentUser.email) {
            usuariosRestantes.push(usuarios[i]);
        }
    }
    localStorage.setItem("usuarios", JSON.stringify(usuariosRestantes));

    let todosOsJogadores = JSON.parse(localStorage.getItem("players")) || [];
    let jogadoresRestantes = [];
    for (let i = 0; i < todosOsJogadores.length; i++) {
        if (todosOsJogadores[i].userId !== currentUser.email) {
            jogadoresRestantes.push(todosOsJogadores[i]);
        }
    }
    localStorage.setItem("players", JSON.stringify(jogadoresRestantes));

    localStorage.removeItem("currentUser");
    alert("Conta deletada com sucesso!");
    window.location.href = "../index.html";
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../pages/login.html";
}