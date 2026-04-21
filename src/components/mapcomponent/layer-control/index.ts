// Main component
export { default as LayerControl } from './LayerControl';

// Layer group components
export { default as BaseMapControls } from './BaseMapControls';
export { default as GeorisquesControls } from './GeorisquesControls';
export { default as IGNVectorControls } from './IGNVectorControls';
export { default as InfrastructureControls } from './InfrastructureControls';
export { default as ParcelControls } from './ParcelControls';
export { default as SettingsControls } from './SettingsControls';
export { default as UrbanPlanningControls } from './UrbanPlanningControls';

// Shared UI components
export { default as ColorIndicator } from './shared/ColorIndicator';
export { default as LayerGroupSection } from './shared/LayerGroupSection';
export { default as LayerToggle } from './shared/LayerToggle';
export { default as ZoomIndicator } from './shared/ZoomIndicator';

// Types
export type {
    BDTOPOLayers, EnedisV2Layers,
    ICPEFilters, LayerConfig, LayerControlHandlers, LayerControlState, PCILayers,
    // SeismicZoneFilters removed - WMS shows all zones by default
    PLULayers
} from './types/layerControlTypes';

