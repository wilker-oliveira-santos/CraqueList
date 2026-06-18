// ============================================================================
// CRAQUEELIST - SISTEMA DE JOGADORES FAVORITOS
// Lógica completa: CRUD, localStorage, API restcountries direto em JS
// ============================================================================

// ESTADO GLOBAL
let currentUser = null;
let players = [];
let editingPlayerId = null;
let deleteTarget = null;
let countriesCache = null;

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!loggedInUser) {
        window.location.href = '../pages/login.html';
        return;
    }

    currentUser = loggedInUser;
    loadPlayers();
    updateProfileDisplay();
    renderCarousel();
    renderPlayersList();
    populateCountryFilters();
}

// ============================================================================
// CARREGAMENTO DE DADOS
// ============================================================================

function loadPlayers() {
    const allPlayers = JSON.parse(localStorage.getItem('players')) || [];
    players = allPlayers.filter(p => p.userId === currentUser.email);
}

function savePlayers() {
    const allPlayers = JSON.parse(localStorage.getItem('players')) || [];
    const otherPlayers = allPlayers.filter(p => p.userId !== currentUser.email);
    localStorage.setItem('players', JSON.stringify([...otherPlayers, ...players]));
}

// ============================================================================
// API RESTCOUNTRIES
// ============================================================================

async function getAllCountries() {
    if (countriesCache) return countriesCache;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flag,flags,cca2', {
            signal: controller.signal
        });
        clearTimeout(timeout);
        if (!response.ok) throw new Error('API error ' + response.status);
        const data = await response.json();
        countriesCache = data
            .map(c => ({
                name: c.name.common,
                flag: c.flag || '',
                flagImg: (c.flags && (c.flags.png || c.flags.svg)) || null,
                flagAlt: (c.flags && c.flags.alt) || c.name.common,
                code: c.cca2
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
        return countriesCache;
    } catch (error) {
        console.error('Erro ao carregar países:', error);
        return [
            { name: 'Brazil',    flag: '🇧🇷', flagImg: 'https://flagcdn.com/w320/br.png', flagAlt: 'Brazil',    code: 'BR' },
            { name: 'Argentina', flag: '🇦🇷', flagImg: 'https://flagcdn.com/w320/ar.png', flagAlt: 'Argentina', code: 'AR' },
            { name: 'Spain',     flag: '🇪🇸', flagImg: 'https://flagcdn.com/w320/es.png', flagAlt: 'Spain',     code: 'ES' },
            { name: 'France',    flag: '🇫🇷', flagImg: 'https://flagcdn.com/w320/fr.png', flagAlt: 'France',    code: 'FR' },
            { name: 'Portugal',  flag: '🇵🇹', flagImg: 'https://flagcdn.com/w320/pt.png', flagAlt: 'Portugal',  code: 'PT' },
            { name: 'Germany',   flag: '🇩🇪', flagImg: 'https://flagcdn.com/w320/de.png', flagAlt: 'Germany',   code: 'DE' },
            { name: 'England',   flag: '🏴',  flagImg: 'https://flagcdn.com/w320/gb-eng.png', flagAlt: 'England', code: 'GB' },
        ];
    }
}

function buildFlagImgTag(country, height) {
    if (country.flagImg) {
        return '<img src="' + country.flagImg + '" alt="' + country.flagAlt + '" style="height:' + height + 'px;width:auto;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.25);">';
    }
    return '<span style="font-size:' + Math.round(height * 0.7) + 'px;">' + country.flag + '</span>';
}

// ============================================================================
// EXIBIÇÃO DE PERFIL
// ============================================================================

function updateProfileDisplay() {
    document.getElementById('userNameNav').textContent = currentUser.nome;
    document.getElementById('profileName').textContent = currentUser.nome;
    document.getElementById('profileEmail').textContent = currentUser.email;
}

// ============================================================================
// CARROSSEL
// ============================================================================

async function renderCarousel() {
    const carouselContent = document.getElementById('carouselContent');
    try {
        const countries = await getAllCountries();
        const featured = countries.slice(0, 5);
        carouselContent.innerHTML = featured.map(function(country, index) {
            var activeClass = index === 0 ? ' active' : '';
            var flagTag = buildFlagImgTag(country, 110);
            return '<div class="carousel-item' + activeClass + '">'
                + '<div style="text-align:center;">'
                + '<div style="margin-bottom:1rem;">' + flagTag + '</div>'
                + '<div style="font-size:1.5rem;">' + country.name + '</div>'
                + '</div>'
                + '</div>';
        }).join('');
    } catch (error) {
        console.error('Erro ao renderizar carrossel:', error);
        carouselContent.innerHTML = '<div class="carousel-item active"><p>Erro ao carregar seleções</p></div>';
    }
}

// ============================================================================
// FILTROS
// ============================================================================

async function populateCountryFilters() {
    const filterCountry = document.getElementById('filterCountry');
    try {
        const countries = await getAllCountries();
        filterCountry.innerHTML = '<option value="">Todas as Seleções</option>'
            + countries.map(c => '<option value="' + c.name + '">' + c.flag + ' ' + c.name + '</option>').join('');
    } catch (error) {
        console.error('Erro ao popular filtros:', error);
    }
}

function filterPlayers() {
    renderPlayersList();
}

function getFilteredPlayers() {
    const countryFilter = document.getElementById('filterCountry').value;
    const positionFilter = document.getElementById('filterPosition').value;
    return players.filter(player => {
        const countryMatch = !countryFilter || player.country === countryFilter;
        const positionMatch = !positionFilter || player.position === positionFilter;
        return countryMatch && positionMatch;
    });
}

// ============================================================================
// RENDERIZAÇÃO DE JOGADORES
// ============================================================================

async function renderPlayersList() {
    const playersList = document.getElementById('playersList');
    const filteredPlayers = getFilteredPlayers();

    if (filteredPlayers.length === 0) {
        playersList.innerHTML = '<div class="col-12"><div class="empty-state"><h3>Nenhum jogador encontrado</h3><p>Clique em "Adicionar Jogador" para começar sua lista!</p></div></div>';
        return;
    }

    const countries = await getAllCountries();
    const countryMap = {};
    countries.forEach(c => { countryMap[c.name] = c; });

    const cardsHTML = filteredPlayers.map(function(player) {
        var country = countryMap[player.country] || null;
        var flagTag = country
            ? buildFlagImgTag(country, 60)
            : '<span style="font-size:2.5rem;">🏳️</span>';

        return '<div class="col-12 col-md-6">'
            + '<div class="player-card">'
            + '<div class="player-flag">' + flagTag + '</div>'
            + '<div class="player-name">' + player.name + '</div>'
            + '<div class="player-info"><strong>Seleção:</strong> ' + player.country + '</div>'
            + '<div class="player-info"><strong>Posição:</strong> ' + player.position + '</div>'
            + '<div class="player-actions">'
            + '<button class="btn-sm btn-edit" onclick="openEditPlayerModal(\'' + player.id + '\')">Editar</button>'
            + '<button class="btn-sm btn-delete" onclick="openDeleteConfirm(\'player\', \'' + player.id + '\')">Remover</button>'
            + '</div>'
            + '</div>'
            + '</div>';
    });

    playersList.innerHTML = cardsHTML.join('');
}

// ============================================================================
// MODAL - ADICIONAR/EDITAR JOGADOR
// ============================================================================

async function openAddPlayerModal() {
    editingPlayerId = null;
    document.getElementById('playerModalTitle').textContent = 'Adicionar Jogador';
    document.getElementById('playerForm').reset();
    await populatePlayerCountrySelect();
    new bootstrap.Modal(document.getElementById('playerModal')).show();
}

async function openEditPlayerModal(playerId) {
    editingPlayerId = playerId;
    const player = players.find(p => p.id === playerId);
    if (player) {
        document.getElementById('playerModalTitle').textContent = 'Editar Jogador';
        document.getElementById('playerName').value = player.name;
        document.getElementById('playerPosition').value = player.position;
        await populatePlayerCountrySelect(player.country);
        new bootstrap.Modal(document.getElementById('playerModal')).show();
    }
}

async function populatePlayerCountrySelect(selectedCountry = '') {
    const select = document.getElementById('playerCountry');
    select.innerHTML = '<option value="">Carregando seleções...</option>';
    try {
        const countries = await getAllCountries();
        select.innerHTML = '<option value="">Selecione uma seleção</option>'
            + countries.map(c => {
                var sel = selectedCountry === c.name ? ' selected' : '';
                return '<option value="' + c.name + '"' + sel + '>' + c.flag + ' ' + c.name + '</option>';
            }).join('');
    } catch (error) {
        console.error('Erro ao popular seleções:', error);
        select.innerHTML = '<option value="">Erro ao carregar seleções</option>';
    }
}

function savePlayer() {
    const name = document.getElementById('playerName').value.trim();
    const country = document.getElementById('playerCountry').value;
    const position = document.getElementById('playerPosition').value;

    if (!name || !country || !position) {
        alert('Preencha todos os campos!');
        return;
    }

    if (editingPlayerId) {
        const player = players.find(p => p.id === editingPlayerId);
        if (player) {
            player.name = name;
            player.country = country;
            player.position = position;
        }
    } else {
        players.push({
            id: Date.now().toString(),
            userId: currentUser.email,
            name,
            country,
            position
        });
    }

    savePlayers();
    renderPlayersList();
    bootstrap.Modal.getInstance(document.getElementById('playerModal')).hide();
}

// ============================================================================
// MODAL - EDITAR PERFIL
// ============================================================================

function openEditProfileModal() {
    document.getElementById('editName').value = currentUser.nome;
    document.getElementById('editEmail').value = currentUser.email;
    new bootstrap.Modal(document.getElementById('editProfileModal')).show();
}

function saveProfile() {
    const newName = document.getElementById('editName').value.trim();
    const newEmail = document.getElementById('editEmail').value.trim();

    if (!newName || !newEmail) { alert('Preencha todos os campos!'); return; }
    if (!newEmail.includes('@') || !newEmail.includes('.')) { alert('Digite um email válido!'); return; }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuarios.some(u => u.email === newEmail && u.email !== currentUser.email)) {
        alert('Este email já está cadastrado!');
        return;
    }

    const allUsers = JSON.parse(localStorage.getItem('usuarios')) || [];
    const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        allUsers[userIndex].nome = newName;
        allUsers[userIndex].email = newEmail;
        localStorage.setItem('usuarios', JSON.stringify(allUsers));
    }

    const oldEmail = currentUser.email;
    currentUser.nome = newName;
    currentUser.email = newEmail;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    const allPlayers = JSON.parse(localStorage.getItem('players')) || [];
    allPlayers.forEach(p => { if (p.userId === oldEmail) p.userId = newEmail; });
    localStorage.setItem('players', JSON.stringify(allPlayers));

    loadPlayers();
    updateProfileDisplay();
    renderPlayersList();
    bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
    alert('Perfil atualizado com sucesso!');
}

// ============================================================================
// CONFIRMAÇÃO DE EXCLUSÃO
// ============================================================================

function openDeleteConfirm(type, id) {
    deleteTarget = { type, id };
    const message = document.getElementById('confirmDeleteMessage');
    if (type === 'player') {
        const player = players.find(p => p.id === id);
        message.textContent = 'Tem certeza que deseja remover o jogador "' + player.name + '" da sua lista?';
    } else if (type === 'account') {
        message.textContent = 'Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita!';
    }
    new bootstrap.Modal(document.getElementById('confirmDeleteModal')).show();
}

function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'player') {
        players = players.filter(p => p.id !== deleteTarget.id);
        savePlayers();
        renderPlayersList();
    } else if (deleteTarget.type === 'account') {
        deleteAccountConfirmed();
    }
    bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')).hide();
    deleteTarget = null;
}

// ============================================================================
// EXCLUSÃO DE CONTA
// ============================================================================

function deleteAccount() {
    openDeleteConfirm('account', null);
}

function deleteAccountConfirmed() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    localStorage.setItem('usuarios', JSON.stringify(usuarios.filter(u => u.email !== currentUser.email)));

    const allPlayers = JSON.parse(localStorage.getItem('players')) || [];
    localStorage.setItem('players', JSON.stringify(allPlayers.filter(p => p.userId !== currentUser.email)));

    localStorage.removeItem('currentUser');
    alert('Conta deletada com sucesso!');
    window.location.href = '../index.html';
}

// ============================================================================
// LOGOUT
// ============================================================================

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../pages/login.html';
}