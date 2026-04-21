# Georisque Rapport Download Component

## Overview

The `GeorisqueRapportDownload` component provides functionality to download environmental reports (PDFs) from the French Georisque API for specific geographic coordinates.

## Features

- **Automatic Visibility**: Shows only when DetailedPopup is displayed (when a parcel is selected)
- **Coordinate-based Downloads**: Uses the selected parcel's longitude and latitude
- **Error Handling**: Comprehensive error handling for network issues, API limits, and invalid coordinates
- **Internationalization**: Full support for French and English languages
- **User Feedback**: Loading states, success/error notifications, and user-friendly messages

## Usage

The component is automatically integrated into the map component and requires no manual setup. It appears in the top-left corner when a parcel is selected.

### Props

```typescript
interface GeorisqueRapportDownloadProps {
  longitude?: number;        // Longitude of the selected location
  latitude?: number;         // Latitude of the selected location  
  visible?: boolean;         // Controls component visibility
}
```

### Integration

The component is integrated in `/src/components/mapcomponent/map.tsx`:

```tsx
<GeorisqueRapportDownload
  longitude={selectedParcel?.longitude}
  latitude={selectedParcel?.latitude}
  visible={!!selectedParcel}
/>
```

## API Integration

The component calls the Georisque API:
```
https://georisques.gouv.fr/api/v1/rapport_pdf?latlon={longitude},{latitude}
```

### Coordinate Format
- Coordinates are formatted as "longitude,latitude" (decimal degrees)
- Uses the selected parcel's exact coordinates
- Example: `2.29253,48.92572`

## Error Handling

The component handles various error scenarios:

- **Network Issues**: Timeout and connectivity problems
- **API Limits**: Rate limiting (HTTP 429)
- **Server Errors**: Georisque API issues (HTTP 5xx)
- **No Data**: No report available for location (HTTP 404)
- **Invalid Coordinates**: Missing or invalid coordinate data

## User Interface

### Design
- Clean Material-UI design consistent with the application
- Positioned in top-left corner (opposite DetailedPopup)
- Semi-transparent background with blur effect
- Responsive sizing

### States
1. **Ready**: Shows download button with coordinates
2. **Downloading**: Shows loading spinner and disables button
3. **Success**: Toast notification and file download
4. **Error**: Error message in toast and snackbar

### File Naming
Downloaded PDFs are named: `rapport_georisque_{lat}_{lng}_{date}.pdf`
- Example: `rapport_georisque_48.9257_2.2925_2026-03-11.pdf`

## Translations

### English
- Environmental Report
- Download environmental report for these coordinates:
- Download Georisque environmental report (PDF)
- Download Report / Downloading...
- Various error messages

### French  
- Rapport Environnemental
- Télécharger le rapport environnemental pour ces coordonnées :
- Télécharger le rapport environnemental Georisque (PDF)
- Télécharger le Rapport / Téléchargement...
- Various error messages in French

## Technical Details

### Dependencies
- `axios` for HTTP requests
- `@mui/material` for UI components
- `react-i18next` for translations
- `react-toastify` for notifications

### Security
- Direct browser download (no server proxy needed)
- CORS handled by Georisque API
- No sensitive data stored

### Performance
- 30-second timeout for downloads
- Blob-based file handling
- Memory cleanup after download
- Minimal impact on map performance

## Testing

To test the component:

1. Start the development server: `npm run dev`
2. Navigate to the map interface
3. Click on any parcel to show DetailedPopup
4. The Georisque download component should appear in the top-left
5. Click the download button to test the functionality

### Test Coordinates
For testing with known locations:
- Paris: `2.29253,48.92572`
- Lyon: `4.84622,45.76404`
- Marseille: `5.36978,43.29648`

## Troubleshooting

### Common Issues

1. **Component not visible**
   - Ensure a parcel is selected (DetailedPopup shown)
   - Check console for JavaScript errors

2. **Download fails**
   - Verify internet connection
   - Check if coordinates are valid
   - Try different location (some areas may not have reports)

3. **API errors**
   - Georisque API may be temporarily unavailable
   - Rate limiting may occur (wait and retry)

4. **File not downloading**
   - Check browser download settings
   - Verify popup blockers are not interfering
   - Try different browser

## Future Enhancements

Potential improvements:
- Support for batch downloads
- Report preview before download
- Integration with other environmental APIs
- Offline report caching
- Export to other formats (CSV, JSON)
