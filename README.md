# 🚢 Battleship Multiplayer - Web-Based Naval Strategy Game

A fully-featured, real-time multiplayer implementation of the classic Battleship game, built with modern web technologies and designed for GitHub Pages deployment.

## 🎮 Live Demo

Play the game at: `https://yourusername.github.io/battleship-multiplayer`

## ✨ Features

### 🎯 Core Gameplay
- **Classic Battleship Rules**: Traditional 10x10 grid with 5 ships of varying sizes
- **Real-time Multiplayer**: Peer-to-peer connections using WebRTC technology
- **Cross-platform**: Works seamlessly on desktop, tablet, and mobile devices
- **No Backend Required**: Runs entirely in the browser with static hosting

### 🛥️ Ship Fleet
- **Carrier** (5 spaces) - The flagship of your fleet
- **Battleship** (4 spaces) - Heavy firepower and armor
- **Cruiser** (3 spaces) - Balanced attack and mobility
- **Submarine** (3 spaces) - Stealth underwater vessel
- **Destroyer** (2 spaces) - Fast and agile escort ship


### 🌐 Multiplayer System
- **Room-based Matching**: Simple 6-digit room codes for connecting with friends
- **Instant Setup**: Host creates room, guest joins with code
- **Real-time Sync**: All game actions synchronized instantly between players
- **Connection Recovery**: Automatic reconnection handling for network issues

### 🎨 User Experience
- **Intuitive Interface**: Modern, clean design with naval theme
- **Ship Placement**: Drag-and-drop or click-to-place with rotation support
- **Visual Feedback**: Clear hit/miss indicators with animation effects
- **Responsive Design**: Optimized for all screen sizes and devices

## 🚀 Quick Start

### Method 1: GitHub Pages Deployment

1. **Fork or create a new repository**
2. **Upload game files** to the root directory:
   ```
   index.html
   style.css
   app.js
   ```
3. **Enable GitHub Pages** in repository settings
4. **Share your game URL** with friends!

### Method 2: Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/battleship-multiplayer.git
cd battleship-multiplayer

# Serve locally (choose one)
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

Visit `http://localhost:8000` to play locally.

## 🎲 How to Play

### Starting a Game
1. **Host Player**: Click "Host Game" and share the generated room code
2. **Guest Player**: Click "Join Game" and enter the room code

### Ship Placement Phase
1. Select a ship from the fleet list
2. Click on your grid to place it (or use drag & drop)
3. Use "Rotate" button to change ship orientation
4. Use "Random" for automatic placement
5. Click "Ready" when all ships are deployed

### Battle Phase
1. Take turns attacking enemy grid coordinates
2. **Red squares** = Hits 🎯
3. **Blue squares** = Misses 💧
4. Sink all enemy ships to achieve victory! 🏆

## 🛠️ Technical Architecture


### Core Technologies
- **HTML5**: Semantic structure and responsive layout
- **CSS3**: Modern styling with animations and grid systems
- **JavaScript ES6+**: Game logic and real-time interactions
- **WebRTC**: Peer-to-peer networking via PeerJS library

### Key Components
- **BattleshipGame Class**: Main game controller and state manager
- **Peer-to-Peer Networking**: Direct player connections without servers
- **Grid System**: 10x10 coordinate-based game boards
- **Turn Management**: Synchronized gameplay between players

### Message Protocol
```javascript
// Attack message
{ type: 'attack', x: 3, y: 7 }

// Result message  
{ type: 'result', result: 'hit', ship: 'Destroyer' }

// Game state sync
{ type: 'gameState', state: {...} }
```

## 📱 Browser Compatibility

### Fully Supported
- ✅ Chrome 60+ (Desktop & Mobile)
- ✅ Firefox 55+ (Desktop & Mobile)  
- ✅ Safari 11+ (Desktop & Mobile)
- ✅ Edge 79+ (Chromium-based)

### Requirements
- WebRTC support for multiplayer functionality
- JavaScript ES6+ features
- CSS Grid layout support
- HTTPS connection (for WebRTC)

## 🎨 Customization

### Easy Modifications
```css
/* Change color scheme in style.css */
:root {
  --color-water: #1e3a8a;
  --color-ship: #64748b;
  --color-hit: #dc2626;
  --color-miss: #3b82f6;
}
```

```javascript
// Modify ships in app.js
this.ships = [
  { name: 'Carrier', size: 5 },
  { name: 'Battleship', size: 4 },
  // Add custom ships here
];
```

### Advanced Features
- **Sound Effects**: Add audio feedback for actions
- **AI Opponent**: Implement computer player
- **Tournament Mode**: Multi-round scoring system
- **Custom Grids**: Different grid sizes and layouts

## 📁 Project Structure

```
battleship-multiplayer/
├── index.html          # Main game interface
├── style.css           # Styling and animations
├── app.js             # Game logic and networking
├── README.md          # Project documentation
├── deployment-guide.md # GitHub Pages setup
└── technical-docs.md  # Architecture details
```

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow JavaScript ES6+ standards
- Maintain responsive design principles
- Add comments for complex logic
- Test on multiple browsers and devices

## 🐛 Troubleshooting

### Connection Issues
- **Problem**: Players can't connect
- **Solution**: Ensure both players have stable internet and modern browsers

### Deployment Issues  
- **Problem**: Game doesn't load on GitHub Pages
- **Solution**: Check that `index.html` is in root directory and Pages is enabled

### Performance Issues
- **Problem**: Game feels slow or unresponsive
- **Solution**: Close other browser tabs, ensure good internet connection

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Libraries
- **PeerJS**: MIT License - WebRTC wrapper for browser connectivity
- **Icons**: Attribution to respective creators where applicable

## 🙏 Acknowledgments

- Hasbro for creating the original Battleship board game
- PeerJS team for excellent WebRTC abstraction
- The open-source community for inspiration and tools

## 📞 Support

- **Issues**: Report bugs on GitHub Issues
- **Questions**: Start a discussion in GitHub Discussions

---

**Ready to command your fleet?** ⚓ Deploy your Battleship game today and challenge friends to epic naval battles!

[![Deploy to GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-brightgreen)](https://docs.github.com/en/pages)
[![Built with](https://img.shields.io/badge/Built%20with-HTML%2FCSS%2FJS-blue)](#)
[![PeerJS](https://img.shields.io/badge/Networking-PeerJS-orange)](https://peerjs.com/)
