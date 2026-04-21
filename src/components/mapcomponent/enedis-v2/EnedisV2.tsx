import React from 'react';
import EnedisV2PosteElectrique from './EnedisV2PosteElectrique';
import EnedisV2PosteSource from './EnedisV2PosteSource';
import EnedisV2PoteauElectrique from './EnedisV2PoteauElectrique';
import EnedisV2HTALines from './EnedisV2HTALines';
import EnedisV2BTLines from './EnedisV2BTLines';
import EnedisV2HTALinesUnderground from './EnedisV2HTALinesUnderground';
import EnedisV2BTLinesUnderground from './EnedisV2BTLinesUnderground';
import { type EnedisV2Feature, type EnedisV2Props } from './types';

const EnedisV2: React.FC<EnedisV2Props> = ({
  map,
  visible = false,
  layers,
  opacity = 0.7,
  onLoadingChange,
  onLoadError,
  onFeatureClick
}) => {

  const handlePosteElectriqueClick = (feature: EnedisV2Feature) => {
    onFeatureClick?.(feature, 'posteElectrique');
  };

  const handlePosteSourceClick = (feature: EnedisV2Feature) => {
    onFeatureClick?.(feature, 'posteSource');
  };

  const handlePoteauElectriqueClick = (feature: EnedisV2Feature) => {
    onFeatureClick?.(feature, 'poteauElectrique');
  };

  const handleHTAClick = (feature: EnedisV2Feature) => {
    onFeatureClick?.(feature, 'htaLines');
  };

  const handleBTClick = (feature: EnedisV2Feature) => {
    onFeatureClick?.(feature, 'btLines');
  };

  const handleHTAUndergroundClick = (feature: EnedisV2Feature) => {
    onFeatureClick?.(feature, 'htaLinesUnderground');
  };

  const handleBTUndergroundClick = (feature: EnedisV2Feature) => {
    onFeatureClick?.(feature, 'btLinesUnderground');
  };

  const handlePosteElectriqueLoading = (loading: boolean) => {
    onLoadingChange?.('posteElectrique', loading);
  };

  const handlePosteSourceLoading = (loading: boolean) => {
    onLoadingChange?.('posteSource', loading);
  };

  const handlePoteauElectriqueLoading = (loading: boolean) => {
    onLoadingChange?.('poteauElectrique', loading);
  };

  const handleHTALoading = (loading: boolean) => {
    onLoadingChange?.('htaLines', loading);
  };

  const handleBTLoading = (loading: boolean) => {
    onLoadingChange?.('btLines', loading);
  };

  const handleHTAUndergroundLoading = (loading: boolean) => {
    onLoadingChange?.('htaLinesUnderground', loading);
  };

  const handleBTUndergroundLoading = (loading: boolean) => {
    onLoadingChange?.('btLinesUnderground', loading);
  };

  const handlePosteElectriqueError = (error: string) => {
    onLoadError?.('posteElectrique', error);
  };

  const handlePosteSourceError = (error: string) => {
    onLoadError?.('posteSource', error);
  };

  const handlePoteauElectriqueError = (error: string) => {
    onLoadError?.('poteauElectrique', error);
  };

  const handleHTAError = (error: string) => {
    onLoadError?.('htaLines', error);
  };

  const handleBTError = (error: string) => {
    onLoadError?.('btLines', error);
  };

  const handleHTAUndergroundError = (error: string) => {
    onLoadError?.('htaLinesUnderground', error);
  };

  const handleBTUndergroundError = (error: string) => {
    onLoadError?.('btLinesUnderground', error);
  };

  return (
    <>
      {/* Poste Electrique Layer */}
      <EnedisV2PosteElectrique
        map={map}
        visible={visible && layers.posteElectrique}
        opacity={opacity}
        onLoadingChange={handlePosteElectriqueLoading}
        onLoadError={handlePosteElectriqueError}
        onFeatureClick={handlePosteElectriqueClick}
      />

      {/* Poste Source Layer */}
      <EnedisV2PosteSource
        map={map}
        visible={visible && layers.posteSource}
        opacity={opacity}
        onLoadingChange={handlePosteSourceLoading}
        onLoadError={handlePosteSourceError}
        onFeatureClick={handlePosteSourceClick}
      />

      {/* Poteau Electrique Layer */}
      <EnedisV2PoteauElectrique
        map={map}
        visible={visible && layers.poteauElectrique}
        opacity={opacity}
        onLoadingChange={handlePoteauElectriqueLoading}
        onLoadError={handlePoteauElectriqueError}
        onFeatureClick={handlePoteauElectriqueClick}
      />

      {/* HTA Lines Layer */}
      <EnedisV2HTALines
        map={map}
        visible={visible && layers.htaLines}
        opacity={opacity}
        onLoadingChange={handleHTALoading}
        onLoadError={handleHTAError}
        onFeatureClick={handleHTAClick}
      />

      {/* BT Lines Layer */}
      <EnedisV2BTLines
        map={map}
        visible={visible && layers.btLines}
        opacity={opacity}
        onLoadingChange={handleBTLoading}
        onLoadError={handleBTError}
        onFeatureClick={handleBTClick}
      />

      {/* HTA Underground Lines Layer */}
      <EnedisV2HTALinesUnderground
        map={map}
        visible={visible && layers.htaLinesUnderground}
        opacity={opacity}
        onLoadingChange={handleHTAUndergroundLoading}
        onLoadError={handleHTAUndergroundError}
        onFeatureClick={handleHTAUndergroundClick}
      />

      {/* BT Underground Lines Layer */}
      <EnedisV2BTLinesUnderground
        map={map}
        visible={visible && layers.btLinesUnderground}
        opacity={opacity}
        onLoadingChange={handleBTUndergroundLoading}
        onLoadError={handleBTUndergroundError}
        onFeatureClick={handleBTUndergroundClick}
      />
    </>
  );
};

export default EnedisV2;
