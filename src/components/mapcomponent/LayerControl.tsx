import React, { memo } from 'react';
import type { BaseMapType } from '../../types/dashboard';
import { LayerControl as RefactoredLayerControl } from './layer-control';

// Preserve the original interface for backward compatibility
interface MobileLayerControlProps {
    internalSelectedBaseMap: BaseMapType;
    currentZoom: number;
    showRailwayNetwork: boolean;
    // Enedis V2 props
    showEnedisV2Network: boolean;
    enedisV2Layers: {
        posteElectrique: boolean;
        posteSource: boolean;
        poteauElectrique: boolean;
        htaLines: boolean;
        btLines: boolean;
        htaLinesUnderground: boolean;
        btLinesUnderground: boolean;
    };
    // Canalisations props
    showCanalisationsNetwork: boolean;
    showIndustrialInstallations: boolean;
    icpeFilters: {
        '1': boolean; // Seuil Haut
        '2': boolean; // Seuil Bas
        '3': boolean; // Non Seveso
    };
    showSeismicZones: boolean;
    showSeismicV1: boolean;
    // seismicZoneFilters removed - WMS shows all zones by default
    // Vector tile versions for testing
    showSevesoInstallationsVector: boolean;
    showInondationV1: boolean;
    showAlearg: boolean;
    showMvtLocalise: boolean;
    showCavitesNonMinieresBRGM: boolean;
    showPprnPerimetreInond: boolean;
    showPprnSeisme: boolean;
    // SSP (Sites et Sols Pollués) props
    showSspClassificationSis: boolean;
    showSspInstruction: boolean;
    showSspEtablissement: boolean;
    // RTE Network props
    rteTensionMode: boolean;
    // Dynamic MVT Simple props
    showDynamicMVTSimple: boolean;
    // PLU (Plan Local d'Urbanisme) props
    showPluNetwork: boolean;
    pluLayers: {
        'zoning-sectors': boolean;
        'prescriptions': boolean;
        'information': boolean;
    };
    // Risk Trackers props
    showRiskTrackers: boolean;
    // IGN Vector Layers props
    showPCINetwork: boolean;
    pciLayers: {
        main: boolean;
    };
    showBDTOPONetwork: boolean;
    bdtopoLayers: {
        buildings: boolean;
    };
    onBaseMapChange: (value: BaseMapType) => void;
    onRailwayNetworkToggle: (visible: boolean) => void;
    // Enedis V2 handlers
    onEnedisV2NetworkToggle: (visible: boolean) => void;
    onEnedisV2LayerToggle: (layer: string, visible: boolean) => void;
    // Canalisations handlers
    onCanalisationsNetworkToggle: (visible: boolean) => void;
    onIndustrialInstallationsToggle: (visible: boolean) => void;
    onICPEFilterToggle: (classification: string, visible: boolean) => void;
    onSeismicZonesToggle: (visible: boolean) => void;
    onSeismicV1Toggle: (visible: boolean) => void;
    // onSeismicZoneFilterToggle removed - WMS shows all zones by default
    // Vector tile handlers for testing
    onSevesoInstallationsVectorToggle: (visible: boolean) => void;
    onInondationV1Toggle: (visible: boolean) => void;
    onAleargToggle: (visible: boolean) => void;
    onMvtLocaliseToggle: (visible: boolean) => void;
    onCavitesNonMinieresBRGMToggle: (visible: boolean) => void;
    onPprnPerimetreInondToggle: (visible: boolean) => void;
    onPprnSeismeToggle: (visible: boolean) => void;
    // SSP (Sites et Sols Pollués) handlers
    onSspClassificationSisToggle: (visible: boolean) => void;
    onSspInstructionToggle: (visible: boolean) => void;
    onSspEtablissementToggle: (visible: boolean) => void;
    // RTE Network handlers
    onRTETensionModeToggle: (visible: boolean) => void;
    // Dynamic MVT Simple handlers
    onDynamicMVTSimpleToggle: (visible: boolean) => void;
    // PLU handlers
    onPluNetworkToggle: (visible: boolean) => void;
    onPluLayerToggle: (layer: string, visible: boolean) => void;
    // Risk Trackers handlers
    onRiskTrackersToggle: (visible: boolean) => void;
    // IGN Vector Layers handlers
    onPCINetworkToggle: (visible: boolean) => void;
    onPCILayerToggle: (layer: string, visible: boolean) => void;
    onBDTOPONetworkToggle: (visible: boolean) => void;
    onBDTOPOLayerToggle: (layer: string, visible: boolean) => void;
}

const MobileLayerControl: React.FC<MobileLayerControlProps> = (props) => {
    return <RefactoredLayerControl {...props} />;
};

export default memo(MobileLayerControl);