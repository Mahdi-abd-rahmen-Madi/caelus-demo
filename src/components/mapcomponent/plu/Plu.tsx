import React, { useCallback, useMemo } from 'react';
import PluWMSLayer from './PLUWMSLayer';
import { PLU_LAYERS, type PluProps, type PluFeature, type PluLayerType } from './types';

const Plu: React.FC<PluProps> = ({
  map,
  visible = false,
  opacity = 0.7,
  pluLayers,
  onLoadingChange,
  onLoadError,
  onFeatureClick
}) => {
  const handleLoadingChange = useCallback((layerType: PluLayerType, loading: boolean) => {
    onLoadingChange?.(layerType, loading);
  }, [onLoadingChange]);

  const handleLoadError = useCallback((layerType: PluLayerType, error: string) => {
    onLoadError?.(layerType, error);
  }, [onLoadError]);

  const handleFeatureClick = useCallback((feature: PluFeature, layerType: PluLayerType) => {
    onFeatureClick?.(feature, layerType);
  }, [onFeatureClick]);

  // Calculate layer visibility with hierarchy and zoom constraints
  const layerVisibility = useMemo(() => {
    const currentZoom = map?.getZoom() || 0;
    const zoningActive = visible && (pluLayers?.['zoning-sectors'] || false);

    return {
      'zoning-sectors': zoningActive && currentZoom >= (PLU_LAYERS['zoning-sectors'].minZoom || 8),
      'prescriptions': zoningActive && (pluLayers?.['prescriptions'] || false) && currentZoom >= (PLU_LAYERS['prescriptions'].minZoom || 10),
      'information': zoningActive && (pluLayers?.['information'] || false) && currentZoom >= (PLU_LAYERS['information'].minZoom || 8)
    };
  }, [map, visible, pluLayers]);

  return (
    <>
      {/* Render layers in specific order: information (bottom), prescriptions (middle), zoning-sectors (top) */}
      {/* Zoning sectors should always be on top as it's the foundational layer that shows continuous data at low zooms and labels at high zooms */}
      {['information', 'prescriptions', 'zoning-sectors'].map((layerType) => {
        const type = layerType as PluLayerType;
        const layerConfig = PLU_LAYERS[type];
        const layerVisible = layerVisibility[type];

        return (
          <PluWMSLayer
            key={type}
            map={map}
            visible={layerVisible}
            opacity={opacity}
            minZoom={layerConfig.minZoom}
            maxZoom={layerConfig.maxZoom}
            onLoadingChange={(loading) => handleLoadingChange(type, loading)}
            onLoadError={(error) => handleLoadError(type, error)}
            onFeatureClick={(feature) => handleFeatureClick(feature, type)}
            layerConfig={layerConfig}
          />
        );
      })}
    </>
  );
};

export default Plu;
