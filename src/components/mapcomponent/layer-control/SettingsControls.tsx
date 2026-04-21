import React from 'react';
import { useTranslation } from 'react-i18next';
import LayerToggle from './shared/LayerToggle';
import LayerGroupSection from './shared/LayerGroupSection';
import ColorIndicator from './shared/ColorIndicator';

export interface SettingsControlsProps {
  showRiskTrackers: boolean;
  onRiskTrackersToggle: (visible: boolean) => void;
}

const SettingsControls: React.FC<SettingsControlsProps> = ({
  showRiskTrackers,
  onRiskTrackersToggle
}) => {
  const { t } = useTranslation();

  return (
    <LayerGroupSection
      title={t('layer_settings')}
      color="#6b7280"
      backgroundColor="rgba(107, 114, 128, 0.03)"
    >
      {/* Risk Trackers Toggle */}
      <LayerToggle
        checked={showRiskTrackers}
        onChange={() => onRiskTrackersToggle(!showRiskTrackers)}
        label={t('risk_trackers_toggle')}
        color="#6b7280"
        indicator={<ColorIndicator color="#6b7280" />}
      />
    </LayerGroupSection>
  );
};

export default SettingsControls;
