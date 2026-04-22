export interface MapConfig {
  hideBasemap: boolean;
  disableZoneFiltering: boolean;
  enableAdvancedFiltering: boolean;
  enableRiskVisualization: boolean;
  enableDetailedPopups: boolean;
  enableStatistics: boolean;
  enableExportFeatures: boolean;
  disableTileLoader: boolean; // Set to true to temporarily disable tile loading optimization
  disablePageNavigation: boolean; // Set to true to temporarily disable page navigation component
  hideBoundaries: boolean; // Set to true to temporarily hide commune boundaries toggle
  hideParcels: boolean; // Set to true to temporarily hide parcels toggle
  hideLayersTitle: boolean; // Set to true to temporarily hide the "Layers" section title
  disableFiltersInteractivity: boolean; // Set to true to grey out filters and disable interaction
}

export const MAP_CONFIG: MapConfig = {
  hideBasemap: false, // Set to true to temporarily hide basemap
  disableZoneFiltering: false, // Set to true to temporarily disable zone filtering
  enableAdvancedFiltering: true, // Set to true to enable enhanced filtering options
  enableRiskVisualization: true, // Set to true to enable risk-based coloring modes
  enableDetailedPopups: true, // Set to true to show comprehensive parcel information
  enableStatistics: true, // Set to true to display parcel statistics dashboard
  enableExportFeatures: true, // Set to true to allow data export functionality
  disableTileLoader: false, // Set to true to temporarily disable tile loading optimization
  disablePageNavigation: true, // Set to true to temporarily disable page navigation component
  hideBoundaries: false, // Set to true to temporarily hide commune boundaries toggle
  hideParcels: false, // Set to true to temporarily hide parcels toggle
  hideLayersTitle: false, // Set to true to temporarily hide the "Layers" section title
  disableFiltersInteractivity: true // Set to true to grey out filters and disable interaction
};
