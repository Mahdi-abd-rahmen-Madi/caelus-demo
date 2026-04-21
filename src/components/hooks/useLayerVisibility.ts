import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';

export const useLayerVisibility = (
    map: maplibregl.Map | null,
    visible: boolean,
    layerId: string
) => {
    useEffect(() => {
        if (!map || !map.isStyleLoaded()) return;
        
        const layer = map.getLayer(layerId);
        if (layer) {
            map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
        }
    }, [map, visible, layerId]);
};
