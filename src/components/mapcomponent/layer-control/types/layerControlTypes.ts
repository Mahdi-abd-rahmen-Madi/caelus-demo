import type { BaseMapType } from '../../../../types/dashboard';

// Base layer configuration interface
export interface LayerConfig {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  minZoom?: number;
  maxZoom?: number;
}

// Infrastructure layer types
export interface EnedisV2Layers {
  posteElectrique: boolean;
  posteSource: boolean;
  poteauElectrique: boolean;
  htaLines: boolean;
  btLines: boolean;
  htaLinesUnderground: boolean;
  btLinesUnderground: boolean;
}

export interface ICPEFilters {
  '1': boolean; // Seuil Haut
  '2': boolean; // Seuil Bas
  '3': boolean; // Non Seveso
}

// SeismicZoneFilters removed - WMS shows all zones by default


export interface PLULayers {
  'zoning-sectors': boolean;
  'prescriptions': boolean;
  'information': boolean;
}

export interface PCILayers {
  main: boolean;
}

export interface BDTOPOLayers {
  buildings: boolean;
}

// Main layer control state interface
export interface LayerControlState {
  // Base map
  internalSelectedBaseMap: BaseMapType;
  currentZoom: number;

  // Infrastructure
  showRailwayNetwork: boolean;
  showEnedisV2Network: boolean;
  enedisV2Layers: EnedisV2Layers;
  rteTensionMode: boolean;

  // Canalisations
  showCanalisationsNetwork: boolean;
  showIndustrialInstallations: boolean;
  icpeFilters: ICPEFilters;

  // Seismic
  showSeismicZones: boolean;
  showSeismicV1: boolean;
  // seismicZoneFilters removed - WMS shows all zones by default


  // Vector tile test layers
  showSevesoInstallationsVector: boolean;
  showInondationV1: boolean;
  showAlearg: boolean;
  showMvtLocalise: boolean;
  showCavitesNonMinieresBRGM: boolean;
  showPprnPerimetreInond: boolean;
  showPprnSeisme: boolean;

  // SSP (Sites et Sols Pollués)
  showSspClassificationSis: boolean;
  showSspInstruction: boolean;
  showSspEtablissement: boolean;

  // Dynamic MVT Simple (Parcels)
  showDynamicMVTSimple: boolean;

  // PLU (Plan Local d'Urbanisme)
  showPluNetwork: boolean;
  pluLayers: PLULayers;

  // Risk Trackers
  showRiskTrackers: boolean;

  // IGN Vector Layers
  showPCINetwork: boolean;
  pciLayers: PCILayers;
  showBDTOPONetwork: boolean;
  bdtopoLayers: BDTOPOLayers;
}

// Handler interfaces for layer control
export interface LayerControlHandlers {
  // Base map
  onBaseMapChange: (value: BaseMapType) => void;

  // Infrastructure
  onRailwayNetworkToggle: (visible: boolean) => void;
  onEnedisV2NetworkToggle: (visible: boolean) => void;
  onEnedisV2LayerToggle: (layer: string, visible: boolean) => void;
  onRTETensionModeToggle: (visible: boolean) => void;

  // Canalisations
  onCanalisationsNetworkToggle: (visible: boolean) => void;
  onIndustrialInstallationsToggle: (visible: boolean) => void;
  onICPEFilterToggle: (classification: string, visible: boolean) => void;

  // Seismic
  onSeismicZonesToggle: (visible: boolean) => void;
  onSeismicV1Toggle: (visible: boolean) => void;
  // onSeismicZoneFilterToggle removed - WMS shows all zones by default


  // Vector tile test layers
  onSevesoInstallationsVectorToggle: (visible: boolean) => void;
  onInondationV1Toggle: (visible: boolean) => void;
  onAleargToggle: (visible: boolean) => void;
  onMvtLocaliseToggle: (visible: boolean) => void;
  onCavitesNonMinieresBRGMToggle: (visible: boolean) => void;
  onPprnPerimetreInondToggle: (visible: boolean) => void;
  onPprnSeismeToggle: (visible: boolean) => void;

  // SSP
  onSspClassificationSisToggle: (visible: boolean) => void;
  onSspInstructionToggle: (visible: boolean) => void;
  onSspEtablissementToggle: (visible: boolean) => void;

  // Dynamic MVT Simple
  onDynamicMVTSimpleToggle: (visible: boolean) => void;

  // PLU
  onPluNetworkToggle: (visible: boolean) => void;
  onPluLayerToggle: (layer: string, visible: boolean) => void;

  // Risk Trackers
  onRiskTrackersToggle: (visible: boolean) => void;

  // IGN Vector Layers
  onPCINetworkToggle: (visible: boolean) => void;
  onPCILayerToggle: (layer: string, visible: boolean) => void;
  onBDTOPONetworkToggle: (visible: boolean) => void;
  onBDTOPOLayerToggle: (layer: string, visible: boolean) => void;
}
