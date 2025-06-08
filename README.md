# Learning React: Building 3 Interactive Games

![React Games Banner](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

**Live Demo:** [https://wh33les.github.io/LearningReact](https://wh33les.github.io/LearningReact)

## 🎯 Project Overview

This project demonstrates my journey learning React by building three progressively complex interactive games. Each game showcases different aspects of modern web development and React concepts, progressing from basic tutorial implementation to custom features and complex game logic.

### 🎮 The Three Games

1. **Basic Tic-Tac-Toe** 
   - Classic 3x3 grid implementation following the official React tutorial
   - Features: Move history with time travel, win detection, draw detection
   - **Learning Focus:** React fundamentals, state management, event handling

2. **Advanced Tic-Tac-Toe**
   - Enhanced version with modern UI/UX improvements
   - Features: Dark theme, sound effects, animations, hover effects
   - **Learning Focus:** CSS custom properties, Web Audio API, performance optimization

3. **Connect Four**
   - Custom-built game with complex 2D logic
   - Features: 6x7 grid, gravity simulation, multi-direction win detection
   - **Learning Focus:** Advanced algorithms, 2D array manipulation, complex state management

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14+)
- npm or yarn
- Git

### Setup and Deployment

1. **Clone and install:**
   ```bash
   git clone https://github.com/wh33les/LearningReact.git
   cd LearningReact
   npm install
   ```

2. **Local development:**
   ```bash
   npm start
   # Opens http://localhost:3000
   ```

3. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   # Automatically builds and deploys to GitHub Pages
   # Includes automated timestamp injection
   ```

## 🛠 Technology Stack

- **React 18.2** - Modern React with hooks and concurrent features
- **Create React App** - Zero-configuration build tooling
- **CSS Custom Properties** - Modern theming and design system
- **Web Audio API** - Sound effects and game feedback
- **GitHub Pages** - Automated static site hosting with custom deployment pipeline

## 📈 Learning Progression Demonstrated

### Phase 1: React Fundamentals (Basic Tic-Tac-Toe)
- Component architecture and props/state management
- Event handling and conditional rendering
- Immutable state updates and debugging
- Following official React tutorial and challenges

### Phase 2: Enhanced UX (Advanced Tic-Tac-Toe)
- CSS custom properties and modern styling
- Web Audio API integration
- SVG animations and performance optimization
- Component composition and reusability

### Phase 3: Complex Logic (Connect Four)
- 2D array algorithms and game mechanics
- Multi-direction win detection patterns
- Advanced state management for complex interactions
- Custom game development from scratch

### Phase 4: Professional Practices
- Comprehensive documentation and code organization
- Automated deployment pipeline with timestamp injection
- Cross-browser compatibility and responsive design
- Performance optimization and accessibility considerations

## 🔧 Key Technical Skills Showcased

### React & JavaScript
- **Modern React patterns:** Hooks (useState, useEffect, useMemo)
- **ES6+ features:** Arrow functions, destructuring, template literals
- **Async programming:** Promise handling for audio loading
- **Algorithm implementation:** Game logic, win detection, 2D arrays

### CSS & Styling
- **Modern CSS:** Custom properties, Grid, Flexbox
- **Design systems:** Consistent theming across components
- **Animations:** SVG animations, CSS transitions
- **Responsive design:** Mobile-friendly layouts

### Development Workflow
- **Build optimization:** Production builds with Create React App
- **Deployment automation:** Custom scripts with automated timestamp injection
- **Version control:** Git workflow with feature branches
- **Documentation:** Comprehensive README and code comments

## 🎨 Design Philosophy

- **Progressive complexity:** Each game builds on previous concepts
- **Modern UX:** Dark themes, animations, and interactive feedback
- **Accessibility:** High contrast ratios and semantic markup
- **Performance:** Optimized rendering and efficient algorithms

## 🌐 Deployment Details

The project uses a custom deployment pipeline that solves a common React deployment challenge:

- **Problem:** React build process breaks file modification timestamps
- **Solution:** Custom post-build script that injects actual deployment time
- **Result:** Consistent timestamp behavior across all portfolio projects

```bash
# Automated deployment process:
npm run deploy
# 1. Builds React app
# 2. Injects current timestamp
# 3. Deploys to GitHub Pages
```

## 📁 Project Structure

```
LearningReact/
├── public/
│   ├── index.html              # Main HTML template
│   ├── lastmodified.html       # Timestamp template
│   └── sounds/                 # Audio assets
├── src/
│   ├── ttt1app/               # Basic Tic-Tac-Toe
│   ├── ttt2app/               # Advanced Tic-Tac-Toe
│   ├── c4app/                 # Connect Four
│   └── index.js               # App entry point
├── update-timestamp.js        # Deployment automation
└── package.json              # Project configuration
```

## 🎯 Learning Outcomes

This project demonstrates:
- **Rapid skill acquisition:** Learning React fundamentals to advanced concepts
- **Problem-solving:** Implementing complex game logic and deployment challenges
- **Professional practices:** Code organization, documentation, and automation
- **Technical versatility:** Frontend development skills applicable to data science UIs

## 👨‍💻 Author

**Ashley K. W. Warren**
- GitHub: [@wh33les](https://github.com/wh33les)
- Background: PhD in Mathematics transitioning to Machine Learning Engineering
- Focus: Building practical software development skills for ML/data science applications

---

*This project represents hands-on learning of modern web development technologies as part of building a comprehensive skill set for machine learning engineering roles.*