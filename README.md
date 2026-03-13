# SPADE GitHub Pages - Project Documentation

This project contains the SPADE (Smart Python Agent Development Environment) website, built with **Astro.js** framework and deployed on GitHub Pages.

## 🚀 Project Overview

The website has been built with Astro.js with the following features:

- **Component-based architecture** with reusable Astro components
- **TypeScript support** for better development experience
- **Optimized build system** with Astro's performance benefits
- **GitHub Pages integration** for easy deployment
- **Dark mode support** and responsive design for all devices

## 📁 Project Structure

```text
spade_githubio/
├── public/                    # Static assets
│   ├── demos.js              # Interactive demo functionality
│   ├── scripts.js            # Main JavaScript functionality
│   ├── styles.css            # Original styles (as backup)
│   └── landing-assets/       # Images, icons, and data files
├── src/
│   ├── components/           # Reusable Astro components
│   │   ├── FeatureCard.astro # Feature display component
│   │   ├── PluginCard.astro  # Plugin showcase component
│   │   ├── Hero.astro        # Hero section component
│   │   ├── Navbar.astro      # Navigation with dark mode toggle
│   │   └── Footer.astro      # Footer component
│   ├── layouts/
│   │   └── BaseLayout.astro  # Main layout with meta tags & scripts
│   ├── pages/
│   │   └── index.astro       # Main landing page
│   └── styles/
│       └── global.css        # Global styles with dark mode support
└── package.json
│   │   └── BaseLayout.astro  # Main layout with meta tags & scripts
│   ├── pages/
│   │   └── index.astro       # Main landing page
│   └── styles/
│       └── global.css        # Global styles with dark mode support
└── package.json
```

## 🔄 GitHub Pages Integration

This project is set up for automatic deployment to GitHub Pages:

- **GitHub Actions Workflow**: `.github/workflows/deploy.yml` handles automatic deployment
- **Astro Config**: `astro.config.mjs` is configured for GitHub Pages
- **No Base Path**: Site is deployed at the root level of the GitHub Pages domain

### Deployment Process

1. Changes pushed to the `main` branch trigger the GitHub Actions workflow
2. The workflow builds the Astro site and deploys it to GitHub Pages
3. The site is automatically published at the configured URL

### Local Development

To develop the website locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## 🎉 Migration Completed Successfully!

### Major Improvements Made

- ✅ **Complete Style Migration**: All 950+ lines of CSS properly migrated with enhancements
- ✅ **Interactive Demo Section**: Added the missing interactive agent demonstration
- ✅ **Enhanced Dark Mode**: Complete dark mode support across all components
- ✅ **Improved Animations**: Card hover effects, fade-ins, and smooth transitions
- ✅ **Code Syntax Highlighting**: Prism.js integration with Python syntax support
- ✅ **Responsive Design**: Enhanced mobile and tablet compatibility
- ✅ **Component Architecture**: Modular, maintainable Astro components
- ✅ **Performance Optimized**: Static site generation for fast loading
- ✅ **SEO Ready**: Proper meta tags and structured data
- ✅ **Code Refactoring**: Demo functionality extracted to separate `demos.js` file for better
  maintainability
- ✅ **Clean Architecture**: Agent demo code is now isolated from general UI scripts
- ✅ **Improved Maintainability**: Separation of concerns between UI scripts and demo functionality

### Features Preserved and Enhanced

- 🔄 **Dynamic Content Loading**: News and demos load from JSON files
- 🌙 **Smart Dark Mode**: System preference detection + manual toggle
- 📱 **Mobile Navigation**: Responsive navbar with collapsible menu
- 🎨 **Visual Effects**: Gradient backgrounds, shadows, and animations
- 🔗 **Social Integration**: GitHub, documentation, and community links
- 📊 **Comparison Tables**: Framework comparison with visual indicators
- ❓ **FAQ Section**: Accordion-style frequently asked questions
- 🧩 **Plugin Showcase**: SPADE ecosystem extensions display

### Ready for Production

The migrated SPADE landing page is now production-ready with:

- Static site generation for optimal performance
- Modern web standards compliance
- Enhanced user experience
- Maintainable component-based architecture
- Comprehensive documentation and examples

🚀 **The migration is complete and the site is ready for deployment!**

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🐍 Python Management Scripts

This project includes powerful Python scripts for easy project management:

### Quick Start

```bash
# Launch the main project manager
python3 spade_manager.py
```

### Available Scripts

| Script             | Purpose                                | Usage                      |
| ------------------ | -------------------------------------- | -------------------------- |
| `spade_manager.py` | **Main project manager**               | `python3 spade_manager.py` |
| `manage_news.py`   | Manage news items for the landing page | `python3 manage_news.py`   |
| `manage_demos.py`  | Manage interactive demo scenarios      | `python3 manage_demos.py`  |

### Project Manager Features

- 📰 **news** - Manage news content
- 🎮 **demos** - Manage demo scenarios
- 📦 **backup** - Backup data files
- 📊 **status** - Check project health
- 📦 **install** - Install dependencies

See [`PYTHON_SCRIPTS.md`](./PYTHON_SCRIPTS.md) for detailed documentation.

## 🔧 Development Notes

- **Assets**: All original assets are preserved in `public/landing-assets/`
- **Scripts**: The original `scripts.js` is included with `is:inline` directive for proper bundling
- **Styles**: Global CSS includes dark mode support and responsive design
- **Components**: Each major section is componentized for better maintainability
- **Build**: Production builds are optimized and ready for deployment

## 🚀 Deployment

The site is configured for static deployment with:

- **Site URL**: `https://spade-multi-agent-systems.github.io`
- **Output**: Static files in `./dist/`
- **Assets**: Properly bundled and optimized

To deploy:

1. Run `npm run build`
2. Deploy the `dist/` folder to your hosting service
3. For GitHub Pages, the `astro.config.mjs` is already configured

## 👀 Want to learn more?

- [SPADE Documentation](https://spadeagents.eu/docs/spade)
- [SPADE GitHub Repository](https://github.com/javipalanca/spade)
- [Astro Documentation](https://docs.astro.build)
