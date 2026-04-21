import React from 'react';
import { useTranslation } from 'react-i18next';
import LayerToggle from './shared/LayerToggle';
import LayerGroupSection from './shared/LayerGroupSection';
import ColorIndicator from './shared/ColorIndicator';

export interface ParcelControlsProps {
  showDynamicMVTSimple: boolean;
  onDynamicMVTSimpleToggle: (visible: boolean) => void;
}

const ParcelControls: React.FC<ParcelControlsProps> = ({
  showDynamicMVTSimple,
  onDynamicMVTSimpleToggle
}) => {
  const { t } = useTranslation();

  return (
    <LayerGroupSection
      title={t('parcels')}
      color="#22c55e"
      backgroundColor="rgba(34, 197, 94, 0.03)"
    >
      {/* Parcels Toggle - using Dynamic MVT Simple */}
      <LayerToggle
        checked={showDynamicMVTSimple}
        onChange={() => onDynamicMVTSimpleToggle(!showDynamicMVTSimple)}
        label={t('show_parcels')}
        color="#22c55e"
        indicator={<ColorIndicator color="#22c55e" />}
        layerId="dynamic-mvt-simple"
        debugMode={false}
      />
    </LayerGroupSection>
  );
};

export default ParcelControls;
