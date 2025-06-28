// Battleship Game - Main Application
class BattleshipGame {
    constructor() {
        this.peer = null;
        this.connection = null;
        this.isHost = false;
        this.gameState = 'menu'; // menu, placement, battle, gameover
        this.currentTurn = null; // 'host' or 'guest'
        this.myTurn = false;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 3;
        
        // Game data
        this.ships = [
            { name: 'Carrier', size: 5, placed: false },
            { name: 'Battleship', size: 4, placed: false },
            { name: 'Cruiser', size: 3, placed: false },
            { name: 'Submarine', size: 3, placed: false },
            { name: 'Destroyer', size: 2, placed: false }
        ];
        
        this.myGrid = Array(10).fill().map(() => Array(10).fill(null));
        this.enemyGrid = Array(10).fill().map(() => Array(10).fill(null));
        this.myShips = [];
        this.enemyShips = [];
        
        // Placement state
        this.selectedShip = null;
        this.shipOrientation = 'horizontal'; // horizontal or vertical
        this.placementReady = false;
        this.opponentReady = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showScreen('main-menu');
    }
    
    setupEventListeners() {
        // Main menu
        document.getElementById('host-btn').addEventListener('click', () => this.hostGame());
        document.getElementById('join-btn').addEventListener('click', () => this.showJoinForm());
        document.getElementById('connect-btn').addEventListener('click', () => this.joinGame());
        document.getElementById('back-btn').addEventListener('click', () => this.showMainMenu());
        
        // Ship placement
        document.getElementById('rotate-btn').addEventListener('click', () => this.rotateShip());
        document.getElementById('random-btn').addEventListener('click', () => this.randomPlacement());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearPlacement());
        document.getElementById('ready-btn').addEventListener('click', () => this.setReady());
        
        // Game over
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
        document.getElementById('main-menu-btn').addEventListener('click', () => this.backToMainMenu());
        
        // Ship selection
        document.querySelectorAll('.ship-item').forEach(item => {
            item.addEventListener('click', () => this.selectShip(item));
        });
        
        // Room input enter key
        document.getElementById('room-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinGame();
            }
        });
    }
    
    // Screen Management
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        this.gameState = screenId.replace('-screen', '');
    }
    
    showMainMenu() {
        this.resetGame();
        this.showScreen('main-menu');
        document.getElementById('room-display').classList.add('hidden');
        document.getElementById('join-form').classList.add('hidden');
    }
    
    showJoinForm() {
        document.getElementById('join-form').classList.remove('hidden');
        document.getElementById('room-input').focus();
    }
    
    // Networking
    hostGame() {
        const roomCode = this.generateRoomCode();
        this.showMessage('Creating room...', 'info');
        
        try {
            this.peer = new Peer(roomCode, {
                host: '0.peerjs.com',
                port: 443,
                path: '/',
                secure: true,
                debug: 0
            });
            
            this.peer.on('open', (id) => {
                console.log('Host peer opened with ID:', id);
                this.isHost = true;
                document.getElementById('room-code').textContent = roomCode;
                document.getElementById('room-display').classList.remove('hidden');
                this.showMessage('Room created! Share the code with your friend.', 'success');
            });
            
            this.peer.on('connection', (conn) => {
                console.log('Incoming connection:', conn);
                this.connection = conn;
                this.setupConnection();
            });
            
            this.peer.on('error', (err) => {
                console.error('Host peer error:', err);
                this.showMessage('Failed to create room. Please try again.', 'error');
                this.resetNetworking();
            });
            
        } catch (error) {
            console.error('Error creating peer:', error);
            this.showMessage('Failed to create room. Please check your connection.', 'error');
        }
    }
    
    joinGame() {
        const roomCode = document.getElementById('room-input').value.trim().toUpperCase();
        if (roomCode.length !== 6) {
            this.showMessage('Please enter a valid 6-digit room code.', 'error');
            return;
        }
        
        this.showMessage('Connecting to room...', 'info');
        this.connectionAttempts++;
        
        try {
            // Generate a unique peer ID for the guest
            const guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
            
            this.peer = new Peer(guestId, {
                host: '0.peerjs.com',
                port: 443,
                path: '/',
                secure: true,
                debug: 0
            });
            
            this.peer.on('open', (id) => {
                console.log('Guest peer opened with ID:', id);
                console.log('Attempting to connect to room:', roomCode);
                
                this.connection = this.peer.connect(roomCode, {
                    reliable: true
                });
                
                this.setupConnection();
            });
            
            this.peer.on('error', (err) => {
                console.error('Guest peer error:', err);
                if (this.connectionAttempts < this.maxConnectionAttempts) {
                    this.showMessage(`Connection failed. Retrying... (${this.connectionAttempts}/${this.maxConnectionAttempts})`, 'warning');
                    setTimeout(() => this.joinGame(), 2000);
                } else {
                    this.showMessage('Could not connect to room. Please check the code and try again.', 'error');
                    this.resetNetworking();
                }
            });
            
        } catch (error) {
            console.error('Error joining game:', error);
            this.showMessage('Failed to join room. Please check your connection.', 'error');
        }
    }
    
    setupConnection() {
        if (!this.connection) {
            console.error('No connection to setup');
            return;
        }
        
        this.connection.on('open', () => {
            console.log('Connection opened successfully');
            this.showMessage('Connected to opponent!', 'success');
            this.connectionAttempts = 0;
            
            // Start placement phase after a short delay
            setTimeout(() => {
                this.startPlacementPhase();
            }, 1500);
        });
        
        this.connection.on('data', (data) => {
            console.log('Received data:', data);
            this.handleNetworkMessage(data);
        });
        
        this.connection.on('close', () => {
            console.log('Connection closed');
            this.showMessage('Opponent disconnected.', 'error');
            this.updateConnectionStatus(false);
        });
        
        this.connection.on('error', (err) => {
            console.error('Connection error:', err);
            this.showMessage('Connection error occurred.', 'error');
            this.updateConnectionStatus(false);
        });
        
        // For host, the connection is immediately ready
        if (this.isHost) {
            this.showMessage('Opponent connected!', 'success');
            setTimeout(() => {
                this.startPlacementPhase();
            }, 1500);
        }
    }
    
    resetNetworking() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        this.connectionAttempts = 0;
    }
    
    sendMessage(type, data) {
        if (this.connection && this.connection.open) {
            try {
                this.connection.send({ type, data });
                console.log('Sent message:', { type, data });
            } catch (error) {
                console.error('Error sending message:', error);
                this.showMessage('Communication error with opponent.', 'error');
            }
        } else {
            console.warn('Cannot send message - connection not open');
        }
    }
    
    handleNetworkMessage(message) {
        const { type, data } = message;
        console.log('Handling message:', type, data);
        
        switch (type) {
            case 'ready':
                this.opponentReady = true;
                this.updateOpponentStatus('Ready for battle!');
                this.checkBattleStart();
                break;
            case 'attack':
                this.handleIncomingAttack(data.row, data.col);
                break;
            case 'attack-result':
                this.handleAttackResult(data);
                break;
            case 'game-over':
                this.handleGameOver(data.winner === 'opponent');
                break;
            case 'play-again':
                this.resetForNewGame();
                break;
        }
    }
    
    // Ship Placement Phase
    startPlacementPhase() {
        console.log('Starting placement phase');
        this.showScreen('placement-screen');
        this.setupPlacementGrid();
        this.updateConnectionStatus(true);
        this.updateOpponentStatus('Placing ships...');
        
        // Auto-select first ship
        const firstShip = document.querySelector('.ship-item');
        if (firstShip) {
            this.selectShip(firstShip);
        }
    }
    
    setupPlacementGrid() {
        const gridContainer = document.getElementById('placement-cells');
        gridContainer.innerHTML = '';
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                cell.addEventListener('mouseenter', () => this.showPlacementPreview(row, col));
                cell.addEventListener('mouseleave', () => this.hidePlacementPreview());
                
                gridContainer.appendChild(cell);
            }
        }
    }
    
    selectShip(shipElement) {
        if (shipElement.classList.contains('placed')) return;
        
        document.querySelectorAll('.ship-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        shipElement.classList.add('selected');
        this.selectedShip = {
            name: shipElement.dataset.ship,
            size: parseInt(shipElement.dataset.size)
        };
        
        console.log('Selected ship:', this.selectedShip);
    }
    
    handleCellClick(row, col) {
        if (!this.selectedShip || this.selectedShip.placed) return;
        
        if (this.canPlaceShip(row, col, this.selectedShip.size, this.shipOrientation)) {
            this.placeShip(row, col, this.selectedShip.size, this.shipOrientation, this.selectedShip.name);
            this.markShipAsPlaced(this.selectedShip.name);
            
            // Auto-select next unplaced ship
            const nextShip = document.querySelector('.ship-item:not(.placed)');
            if (nextShip) {
                this.selectShip(nextShip);
            } else {
                this.selectedShip = null;
            }
            
            this.updateReadyButton();
        } else {
            this.showMessage('Cannot place ship here!', 'error');
        }
    }
    
    canPlaceShip(row, col, size, orientation) {
        if (orientation === 'horizontal') {
            if (col + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (this.myGrid[row][col + i] !== null) return false;
            }
        } else {
            if (row + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (this.myGrid[row + i][col] !== null) return false;
            }
        }
        return true;
    }
    
    placeShip(row, col, size, orientation, name) {
        const ship = { name, size, hits: 0, positions: [] };
        
        if (orientation === 'horizontal') {
            for (let i = 0; i < size; i++) {
                this.myGrid[row][col + i] = name;
                ship.positions.push({ row, col: col + i });
                this.updateCell('placement', row, col + i, 'ship');
            }
        } else {
            for (let i = 0; i < size; i++) {
                this.myGrid[row + i][col] = name;
                ship.positions.push({ row: row + i, col });
                this.updateCell('placement', row + i, col, 'ship');
            }
        }
        
        this.myShips.push(ship);
        console.log('Placed ship:', ship);
    }
    
    showPlacementPreview(row, col) {
        if (!this.selectedShip) return;
        
        this.hidePlacementPreview();
        const canPlace = this.canPlaceShip(row, col, this.selectedShip.size, this.shipOrientation);
        
        if (this.shipOrientation === 'horizontal') {
            for (let i = 0; i < this.selectedShip.size && col + i < 10; i++) {
                const cell = this.getCell('placement', row, col + i);
                if (cell) {
                    cell.classList.add(canPlace ? 'valid-placement' : 'invalid-placement');
                }
            }
        } else {
            for (let i = 0; i < this.selectedShip.size && row + i < 10; i++) {
                const cell = this.getCell('placement', row + i, col);
                if (cell) {
                    cell.classList.add(canPlace ? 'valid-placement' : 'invalid-placement');
                }
            }
        }
    }
    
    hidePlacementPreview() {
        document.querySelectorAll('.valid-placement, .invalid-placement').forEach(cell => {
            cell.classList.remove('valid-placement', 'invalid-placement');
        });
    }
    
    rotateShip() {
        this.shipOrientation = this.shipOrientation === 'horizontal' ? 'vertical' : 'horizontal';
        this.showMessage(`Ship orientation: ${this.shipOrientation}`, 'info');
    }
    
    randomPlacement() {
        this.clearPlacement();
        
        for (const ship of this.ships) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);
                const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                
                if (this.canPlaceShip(row, col, ship.size, orientation)) {
                    this.placeShip(row, col, ship.size, orientation, ship.name);
                    this.markShipAsPlaced(ship.name);
                    placed = true;
                }
                attempts++;
            }
        }
        
        this.selectedShip = null;
        this.updateReadyButton();
        this.showMessage('Ships placed randomly!', 'success');
    }
    
    clearPlacement() {
        this.myGrid = Array(10).fill().map(() => Array(10).fill(null));
        this.myShips = [];
        
        document.querySelectorAll('.ship-item').forEach(item => {
            item.classList.remove('placed', 'selected');
        });
        
        document.querySelectorAll('#placement-cells .cell').forEach(cell => {
            cell.className = 'cell';
        });
        
        this.ships.forEach(ship => ship.placed = false);
        this.selectedShip = null;
        this.updateReadyButton();
        
        // Auto-select first ship after clearing
        const firstShip = document.querySelector('.ship-item');
        if (firstShip) {
            this.selectShip(firstShip);
        }
    }
    
    markShipAsPlaced(shipName) {
        const shipElement = document.querySelector(`[data-ship="${shipName.toLowerCase()}"]`);
        if (shipElement) {
            shipElement.classList.add('placed');
            shipElement.classList.remove('selected');
        }
        
        const ship = this.ships.find(s => s.name === shipName);
        if (ship) ship.placed = true;
    }
    
    updateReadyButton() {
        const readyBtn = document.getElementById('ready-btn');
        const allPlaced = this.ships.every(ship => ship.placed);
        readyBtn.disabled = !allPlaced;
        
        if (allPlaced) {
            readyBtn.textContent = 'Ready for Battle!';
        } else {
            const remaining = this.ships.filter(s => !s.placed).length;
            readyBtn.textContent = `Place ${remaining} more ship${remaining === 1 ? '' : 's'}`;
        }
    }
    
    setReady() {
        this.placementReady = true;
        this.sendMessage('ready', {});
        this.updateOpponentStatus('Waiting for opponent...');
        document.getElementById('ready-btn').disabled = true;
        document.getElementById('ready-btn').textContent = 'Waiting...';
        this.checkBattleStart();
    }
    
    checkBattleStart() {
        if (this.placementReady && this.opponentReady) {
            setTimeout(() => this.startBattlePhase(), 1000);
        }
    }
    
    // Battle Phase
    startBattlePhase() {
        console.log('Starting battle phase');
        this.showScreen('battle-screen');
        this.setupBattleGrids();
        this.currentTurn = 'host';
        this.myTurn = this.isHost;
        this.updateTurnDisplay();
        this.updateShipStatus();
        this.showMessage('Battle begins! ' + (this.myTurn ? 'Your turn!' : 'Opponent goes first.'), 'success');
    }
    
    setupBattleGrids() {
        this.setupBattleGrid('enemy-cells', true);
        this.setupBattleGrid('player-cells', false);
    }
    
    setupBattleGrid(containerId, isEnemy) {
        const gridContainer = document.getElementById(containerId);
        gridContainer.innerHTML = '';
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (isEnemy) {
                    cell.addEventListener('click', () => this.makeAttack(row, col));
                } else {
                    // Show player's ships
                    if (this.myGrid[row][col] !== null) {
                        cell.classList.add('ship');
                    }
                }
                
                gridContainer.appendChild(cell);
            }
        }
    }
    
    makeAttack(row, col) {
        if (!this.myTurn) {
            this.showMessage("It's not your turn!", 'error');
            return;
        }
        
        if (this.enemyGrid[row][col] !== null) {
            this.showMessage('You already attacked this position!', 'error');
            return;
        }
        
        console.log('Making attack at:', row, col);
        this.sendMessage('attack', { row, col });
        this.myTurn = false;
        this.updateTurnDisplay();
        this.showMessage('Attack sent! Waiting for result...', 'info');
    }
    
    handleIncomingAttack(row, col) {
        console.log('Handling incoming attack at:', row, col);
        const isHit = this.myGrid[row][col] !== null;
        let sunkShip = null;
        
        if (isHit) {
            const shipName = this.myGrid[row][col];
            const ship = this.myShips.find(s => s.name === shipName);
            ship.hits++;
            
            this.updateCell('player', row, col, 'hit');
            
            if (ship.hits === ship.size) {
                sunkShip = ship.name;
                ship.positions.forEach(pos => {
                    this.updateCell('player', pos.row, pos.col, 'sunk');
                });
            }
        } else {
            this.updateCell('player', row, col, 'miss');
        }
        
        const gameOver = this.checkGameOver();
        const result = {
            row, col, hit: isHit, sunk: sunkShip, gameOver
        };
        
        this.sendMessage('attack-result', result);
        
        if (gameOver) {
            this.sendMessage('game-over', { winner: 'opponent' });
            this.handleGameOver(false);
        } else if (!isHit) {
            this.myTurn = true;
            this.updateTurnDisplay();
        }
        // If hit but not game over, opponent continues their turn
    }
    
    handleAttackResult(result) {
        const { row, col, hit, sunk, gameOver } = result;
        console.log('Attack result:', result);
        
        this.enemyGrid[row][col] = hit ? 'hit' : 'miss';
        this.updateCell('enemy', row, col, hit ? 'hit' : 'miss');
        
        if (sunk) {
            this.showMessage(`You sunk the enemy's ${sunk}!`, 'success');
            this.markEnemyShipAsSunk(sunk);
        } else if (hit) {
            this.showMessage('Hit!', 'success');
        } else {
            this.showMessage('Miss!', 'info');
        }
        
        if (gameOver) {
            this.handleGameOver(true);
        } else if (hit) {
            // Continue turn on hit
            this.myTurn = true;
            this.updateTurnDisplay();
        } else {
            // Switch turns on miss
            this.myTurn = false;
            this.updateTurnDisplay();
        }
        
        this.updateShipStatus();
    }
    
    markEnemyShipAsSunk(shipName) {
        // Update enemy ship status
        const enemyShip = this.enemyShips.find(ship => ship.name === shipName);
        if (enemyShip) {
            enemyShip.hits = enemyShip.size;
        }
        
        // Mark cells as sunk (simplified approach)
        const hitCells = document.querySelectorAll('#enemy-cells .cell.hit');
        let sunkCount = 0;
        const shipSizes = { 'Carrier': 5, 'Battleship': 4, 'Cruiser': 3, 'Submarine': 3, 'Destroyer': 2 };
        const targetSize = shipSizes[shipName];
        
        hitCells.forEach(cell => {
            if (sunkCount < targetSize && this.enemyGrid[cell.dataset.row][cell.dataset.col] === 'hit') {
                cell.classList.remove('hit');
                cell.classList.add('sunk');
                sunkCount++;
            }
        });
    }
    
    checkGameOver() {
        return this.myShips.every(ship => ship.hits === ship.size);
    }
    
    handleGameOver(isWinner) {
        console.log('Game over, winner:', isWinner);
        this.gameState = 'gameover';
        setTimeout(() => {
            this.showScreen('gameover-screen');
            const title = document.getElementById('gameover-title');
            const message = document.getElementById('gameover-message');
            
            if (isWinner) {
                title.textContent = 'Victory! 🎉';
                title.style.color = 'var(--color-success)';
                message.textContent = 'You have successfully sunk all enemy ships!';
            } else {
                title.textContent = 'Defeat 💥';
                title.style.color = 'var(--color-error)';
                message.textContent = 'Your fleet has been destroyed. Better luck next time!';
            }
        }, 2000);
    }
    
    // Utility functions
    updateCell(gridType, row, col, type) {
        const cell = this.getCell(gridType, row, col);
        if (cell) {
            cell.className = `cell ${type}`;
            if (type === 'hit' || type === 'miss') {
                cell.classList.add('attacked');
            }
        }
    }
    
    getCell(gridType, row, col) {
        let containerId;
        if (gridType === 'placement') containerId = 'placement-cells';
        else if (gridType === 'enemy') containerId = 'enemy-cells';
        else if (gridType === 'player') containerId = 'player-cells';
        
        const container = document.getElementById(containerId);
        return container?.children[row * 10 + col];
    }
    
    updateTurnDisplay() {
        const turnStatus = document.getElementById('turn-status');
        const battleInfo = document.querySelector('.battle-info');
        
        if (this.myTurn) {
            turnStatus.textContent = 'Your Turn';
            turnStatus.className = 'status status--success';
            battleInfo.textContent = 'Select coordinates to attack';
        } else {
            turnStatus.textContent = "Opponent's Turn";
            turnStatus.className = 'status status--warning';
            battleInfo.textContent = 'Waiting for opponent...';
        }
    }
    
    updateConnectionStatus(connected) {
        const indicators = document.querySelectorAll('#connection-indicator, #battle-connection');
        indicators.forEach(indicator => {
            if (connected) {
                indicator.textContent = 'Connected';
                indicator.className = 'status status--success';
            } else {
                indicator.textContent = 'Disconnected';
                indicator.className = 'status status--error';
            }
        });
    }
    
    updateOpponentStatus(status) {
        const opponentStatus = document.getElementById('opponent-status');
        if (opponentStatus) {
            opponentStatus.textContent = `Opponent: ${status}`;
        }
    }
    
    updateShipStatus() {
        this.updateFleetStatus('player-ships', this.myShips);
        this.updateFleetStatus('enemy-ships', this.getEnemyShipStatus());
    }
    
    updateFleetStatus(containerId, ships) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        ships.forEach(ship => {
            const shipItem = document.createElement('div');
            shipItem.className = 'ship-status-item';
            
            const shipName = document.createElement('span');
            shipName.textContent = ship.name;
            
            const shipHealth = document.createElement('div');
            shipHealth.className = 'ship-health';
            
            for (let i = 0; i < ship.size; i++) {
                const pip = document.createElement('div');
                pip.className = 'health-pip';
                if (i < ship.hits) pip.classList.add('hit');
                shipHealth.appendChild(pip);
            }
            
            shipItem.appendChild(shipName);
            shipItem.appendChild(shipHealth);
            container.appendChild(shipItem);
        });
    }
    
    getEnemyShipStatus() {
        // Initialize enemy ships if not done yet
        if (this.enemyShips.length === 0) {
            this.enemyShips = [
                { name: 'Carrier', size: 5, hits: 0 },
                { name: 'Battleship', size: 4, hits: 0 },
                { name: 'Cruiser', size: 3, hits: 0 },
                { name: 'Submarine', size: 3, hits: 0 },
                { name: 'Destroyer', size: 2, hits: 0 }
            ];
        }
        return this.enemyShips;
    }
    
    showMessage(text, type = 'info') {
        const messageEl = document.getElementById('game-message');
        messageEl.textContent = text;
        messageEl.className = `game-message ${type}`;
        messageEl.classList.remove('hidden');
        messageEl.classList.add('show');
        
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => messageEl.classList.add('hidden'), 300);
        }, 3000);
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // Game management
    playAgain() {
        this.sendMessage('play-again', {});
        this.resetForNewGame();
    }
    
    resetForNewGame() {
        this.resetGame();
        this.startPlacementPhase();
    }
    
    backToMainMenu() {
        this.resetNetworking();
        this.showMainMenu();
    }
    
    resetGame() {
        this.gameState = 'menu';
        this.myGrid = Array(10).fill().map(() => Array(10).fill(null));
        this.enemyGrid = Array(10).fill().map(() => Array(10).fill(null));
        this.myShips = [];
        this.enemyShips = [];
        this.selectedShip = null;
        this.shipOrientation = 'horizontal';
        this.placementReady = false;
        this.opponentReady = false;
        this.myTurn = false;
        this.currentTurn = null;
        
        this.ships.forEach(ship => ship.placed = false);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BattleshipGame();
});