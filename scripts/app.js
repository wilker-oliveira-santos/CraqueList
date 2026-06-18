// ============================================================================
// CRAQUEELIST - SISTEMA DE JOGADORES FAVORITOS
// Lógica completa: CRUD, localStorage, API restcountries direto em JS
// ============================================================================

// ESTADO GLOBAL
let currentUser = null;
let players = [];
let editingPlayerId = null;
let deleteTarget = null;

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Verificar se usuário está logado
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
    const updatedPlayers = [...otherPlayers, ...players];
    localStorage.setItem('players', JSON.stringify(updatedPlayers));
}

// ============================================================================
// API RESTCOUNTRIES
// ============================================================================

async function getCountryFlag(countryName) {
    try {
        if (!countryName) return '🏳️';
        const encoded = encodeURIComponent(countryName.trim());
        const response = await fetch(`https://restcountries.com/v3.1/name/${encoded}`);
        if (!response.ok) return '🏳️';
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) return '🏳️';
        return data[0]?.flag || '🏳️';
    } catch (error) {
        console.error('Erro ao buscar bandeira:', error);
        return '🏳️';
    }
}

async function getAllCountries() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch('https://restcountries.com/v3.1/all', { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) return [];
        const data = await response.json();
        return data
            .map(country => ({
                name: country.name.common,
                flag: country.flag,
                code: country.cca2
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error('Erro ao carregar países:', error);
        // Fallback: retornar algumas seleções comuns para manter a UI funcional
        return [
            { name: 'Brazil', flag: '🇧🇷', code: 'BR' },
            { name: 'Argentina', flag: '🇦🇷', code: 'AR' },
            { name: 'Spain', flag: '🇪🇸', code: 'ES' },
            { name: 'France', flag: '🇫🇷', code: 'FR' },
            { name: 'Portugal', flag: '🇵🇹', code: 'PT' }
        ];
    }
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
        const featuredCountries = countries.slice(0, 5);

        carouselContent.innerHTML = featuredCountries.map((country, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <div style="text-align: center;">
                    <div style="font-size: 5rem; margin-bottom: 1rem;">${country.flag}</div>
                    <div style="font-size: 1.5rem;">${country.name}</div>
                </div>
            </div>
        `).join('');
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
        filterCountry.innerHTML = '<option value="">Todas as Seleções</option>' + 
            countries.map(country => `
                <option value="${country.name}">${country.flag} ${country.name}</option>
            `).join('');
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
        playersList.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <h3>Nenhum jogador encontrado</h3>
                    <p>Clique em "Adicionar Jogador" para começar sua lista!</p>
                </div>
            </div>
        `;
        return;
    }

    // Renderizar cards com bandeiras
    const cardsHTML = await Promise.all(filteredPlayers.map(async (player) => {
        const flag = await getCountryFlag(player.country);

        return `
            <div class="col-12 col-md-6">
                <div class="player-card">
                    <div class="player-flag">${flag}</div>
                    <div class="player-name">${player.name}</div>
                    <div class="player-info">
                        <strong>Seleção:</strong> ${player.country}
                    </div>
                    <div class="player-info">
                        <strong>Posição:</strong> ${player.position}
                    </div>
                    <div class="player-actions">
                        <button class="btn-sm btn-edit" onclick="openEditPlayerModal('${player.id}')">
                            Editar
                        </button>
                        <button class="btn-sm btn-delete" onclick="openDeleteConfirm('player', '${player.id}')">
                            Remover
                        </button>
                    </div>
                </div>
            </div>
        `;
    }));

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
    const modal = new bootstrap.Modal(document.getElementById('playerModal'));
    modal.show();
}

async function openEditPlayerModal(playerId) {
    editingPlayerId = playerId;
    const player = players.find(p => p.id === playerId);

    if (player) {
        document.getElementById('playerModalTitle').textContent = 'Editar Jogador';
        document.getElementById('playerName').value = player.name;
        document.getElementById('playerPosition').value = player.position;
        await populatePlayerCountrySelect(player.country);
        const modal = new bootstrap.Modal(document.getElementById('playerModal'));
        modal.show();
    }
}

async function populatePlayerCountrySelect(selectedCountry = '') {
    const select = document.getElementById('playerCountry');
    
    // Mostrar loading
    select.innerHTML = '<option value="">Carregando seleções...</option>';
    
    try {
        const countries = await getAllCountries();
        select.innerHTML = '<option value="">Selecione uma seleção</option>' +
            countries.map(country => `
                <option value="${country.name}" ${selectedCountry === country.name ? 'selected' : ''}>
                    ${country.flag} ${country.name}
                </option>
            `).join('');
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
        // Editar jogador existente
        const player = players.find(p => p.id === editingPlayerId);
        if (player) {
            player.name = name;
            player.country = country;
            player.position = position;
        }
    } else {
        // Adicionar novo jogador
        const newPlayer = {
            id: Date.now().toString(),
            userId: currentUser.email,
            name,
            country,
            position
        };
        players.push(newPlayer);
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
    const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    modal.show();
}

function saveProfile() {
    const newName = document.getElementById('editName').value.trim();
    const newEmail = document.getElementById('editEmail').value.trim();

    if (!newName || !newEmail) {
        alert('Preencha todos os campos!');
        return;
    }

    if (!newEmail.includes('@') || !newEmail.includes('.')) {
        alert('Digite um email válido!');
        return;
    }

    // Verificar se email já existe (exceto o atual)
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuarios.some(u => u.email === newEmail && u.email !== currentUser.email)) {
        alert('Este email já está cadastrado!');
        return;
    }

    // Atualizar usuário no localStorage
    const allUsers = JSON.parse(localStorage.getItem('usuarios')) || [];
    const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        allUsers[userIndex].nome = newName;
        allUsers[userIndex].email = newEmail;
        localStorage.setItem('usuarios', JSON.stringify(allUsers));
    }

    // Atualizar usuário atual
    const oldEmail = currentUser.email;
    currentUser.nome = newName;
    currentUser.email = newEmail;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Atualizar email dos jogadores
    const allPlayers = JSON.parse(localStorage.getItem('players')) || [];
    allPlayers.forEach(player => {
        if (player.userId === oldEmail) {
            player.userId = newEmail;
        }
    });
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
    const modal = document.getElementById('confirmDeleteModal');
    const message = document.getElementById('confirmDeleteMessage');

    if (type === 'player') {
        const player = players.find(p => p.id === id);
        message.textContent = `Tem certeza que deseja remover o jogador "${player.name}" da sua lista?`;
    } else if (type === 'account') {
        message.textContent = 'Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita!';
    }

    const confirmModal = new bootstrap.Modal(modal);
    confirmModal.show();
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
    // Remover usuário
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const filteredUsers = usuarios.filter(u => u.email !== currentUser.email);
    localStorage.setItem('usuarios', JSON.stringify(filteredUsers));

    // Remover jogadores do usuário
    const allPlayers = JSON.parse(localStorage.getItem('players')) || [];
    const filteredPlayers = allPlayers.filter(p => p.userId !== currentUser.email);
    localStorage.setItem('players', JSON.stringify(filteredPlayers));

    // Limpar usuário atual
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
