# FilmMate

A web-based film photography assistant that helps photographers determine optimal camera settings based on their equipment and shooting conditions.

## Features

- **Smart Exposure Calculator**: Uses photographic principles and the Sunny 16 rule to calculate optimal aperture and shutter speed combinations
- **Equipment Support**: Currently supports Canon AE-1 camera and Canon FD lenses
- **Film Stock Database**: Includes popular film stocks with their ISO ratings and exposure latitude
- **Lighting Condition Analysis**: Covers various lighting scenarios from bright sunlight to low-light conditions
- **Shot Logging**: Track your photos with settings, notes, and ratings
- **Multi-User Support**: Switch between different users with separate shot logs
- **Educational Interface**: Learn why certain settings are recommended

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with modern responsive design
- **State Management**: React Context API
- **Testing**: Jest with React Testing Library
- **Database**: Local browser storage with Supabase integration
- **Deployment**: GitHub Pages ready

## Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/filmmate.git
   cd filmmate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Environment Setup** (Required for database functionality):
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env and add your Supabase credentials
   # Get these from your Supabase project dashboard
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

### Getting Started
1. **Set Your Username**: Enter your name to personalize your experience
2. **Select Equipment**: Choose your camera, lens, and film stock
3. **Choose Lighting**: Select the current lighting condition
4. **Get Recommendations**: View calculated optimal settings and alternatives
5. **Log Your Shot**: Save your settings and add notes for future reference

### Core Features

#### Exposure Calculator
The app uses the photographic formula: `2^EV = (aperture² × 100) / (ISO × shutterSpeed)`

Based on the Sunny 16 rule where at EV 15, correct exposure is f/16 at 1/ISO.

#### Shot Logging
- Record your photos with the settings used
- Add notes and ratings
- Learn from your previous shots

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run format` - Format code with Prettier
- `npm run deploy` - Deploy to GitHub Pages

### Project Structure
```
src/
├── components/          # React components
├── context/            # React context for state management
├── data/               # Initial data and mock data
├── services/           # Database and API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions (exposure calculator)
└── test/               # Test setup files
```

### Testing
The project includes comprehensive tests for the exposure calculator and other core functionality:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Based on photographic principles and the Sunny 16 rule
- To help novice film photographers
- Built with modern web technologies for accessibility and ease of use

