# CAELUS Demo

Standalone demo version of CAELUS with Avignon data, no backend required.

## Features

- **Demo Mode**: Completely standalone, no Django backend needed
- **Avignon Data**: Rich sample data for Avignon area only
- **Direct WMS**: WMS layers handled directly from frontend
- **No Authentication**: Bypass login for easy demonstration

## Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# or
pnpm install
```

### Running the Demo

```bash
# Development mode
npm run dev

# The demo will be available at http://localhost:3001
```

### Building for Production

```bash
# Build demo version
npm run build:demo

# Preview production build
npm run preview
```

## Demo Data

The demo includes comprehensive data for Avignon:
- **Parcels**: Sample parcels with full metadata
- **Risk Assessment**: Seismic, flood, and radon risk data
- **Infrastructure**: Railway, electrical network, and industrial installations
- **Urban Planning**: PLU zoning and land use data

## Key Differences from Full Version

### Removed Dependencies
- Django backend API calls
- Authentication system
- Multi-city support (Avignon only)
- Backend WMS proxy

### Added Features
- Mock API service with realistic data
- Direct WMS layer connections
- Demo-specific configuration
- Optimized for demonstration

## Configuration

### Environment Variables
Demo uses built-in configuration:
- **Port**: 3001 (vs 5174 for full version)
- **City**: Avignon only
- **Department**: 84 (Vaucluse)

### WMS Services
- **Canalisations**: Direct BRGM WMS service
- **Enedis**: Direct GeoBretagne WMS service  
- **PLU**: Demo placeholder service

## Development

### Project Structure
```
src/
  services/
    api.ts          # Mock API implementation
    demoApi.ts      # Demo data providers
  demo-data/
    geojson/
      avignon.json # Sample parcel data
  components/      # UI components
  context/         # State management
```

### Customization
To customize the demo for other areas:
1. Replace `src/demo-data/geojson/avignon.json` with new data
2. Update default coordinates in context
3. Adjust WMS layer configurations if needed

## Performance

The demo is optimized for:
- **Fast Loading**: Mock responses with realistic delays
- **Smooth Interaction**: Debounced API calls and caching
- **Memory Efficiency**: Optimized data structures

## Support

For issues or questions about the demo:
1. Check this README for common solutions
2. Review the console for error messages
3. Verify all dependencies are installed correctly

## License

Demo version follows the same license as the main CAELUS project.
