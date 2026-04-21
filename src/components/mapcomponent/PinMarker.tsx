import { useEffect, useRef, useState } from 'react';

interface PinMarkerProps {
  map: any;
  lng: number;
  lat: number;
  isValid?: boolean;
}

const PinMarkerComponent = ({ map, lng, lat, isValid = true }: PinMarkerProps) => {
  const markerRef = useRef<any>(null);
  const [maplibregl, setMaplibregl] = useState<any>(null);
  const isPlacedRef = useRef<boolean>(false);
  const initialCoordsRef = useRef<{ lng: number; lat: number; isValid?: boolean } | null>(null);

  useEffect(() => {
    // Dynamically import maplibre-gl
    import('maplibre-gl').then((module) => {
      setMaplibregl(module.default || module);
    }).catch((error) => {
      console.error('Failed to load maplibre-gl:', error);
    });
  }, []);

  useEffect(() => {
    if (!map || !maplibregl || isPlacedRef.current) return;

    console.log('PinMarker: Creating marker at', lng, lat);

    // Store initial coordinates
    initialCoordsRef.current = { lng, lat, isValid };

    // Create custom marker element
    const markerElement = document.createElement('div');
    markerElement.style.width = '32px';
    markerElement.style.height = '32px';
    markerElement.style.display = 'flex';
    markerElement.style.alignItems = 'center';
    markerElement.style.justifyContent = 'center';
    markerElement.style.borderRadius = '50%';
    markerElement.style.background = isValid
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    markerElement.style.boxShadow = isValid
      ? '0 2px 8px rgba(16, 185, 129, 0.4)'
      : '0 2px 8px rgba(245, 158, 11, 0.4)';
    markerElement.style.border = '2px solid white';
    markerElement.style.cursor = 'pointer';
    markerElement.style.transition = 'all 0.3s ease';
    markerElement.style.zIndex = '1000';

    // Add icon
    const iconElement = document.createElement('div');
    iconElement.innerHTML = `<svg style="width: 18px; height: 18px; color: white;" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`;
    markerElement.appendChild(iconElement);

    // Create marker with exact positioning
    const marker = new maplibregl.Marker({
      element: markerElement,
      anchor: 'center',
      offset: [0, 0]
    })
      .setLngLat([lng, lat])
      .addTo(map);

    markerRef.current = marker;
    isPlacedRef.current = true; // Lock the marker permanently

    // Add hover effect
    markerElement.addEventListener('mouseenter', () => {
      markerElement.style.transform = 'scale(1.1)';
    });

    markerElement.addEventListener('mouseleave', () => {
      markerElement.style.transform = 'scale(1)';
    });

    // Hide the marker after a short delay to simulate "drop" effect
    setTimeout(() => {
      if (markerRef.current) {
        markerElement.style.opacity = '0';
        markerElement.style.transition = 'opacity 0.3s ease';

        // Remove the marker completely after fade out
        setTimeout(() => {
          if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
          }
        }, 300);
      }
    }, 500); // Hide after 500ms

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
        isPlacedRef.current = false;
      }
    };
  }, [map, maplibregl]); // Remove lng, lat, isValid from dependencies

  return null;
};

export default PinMarkerComponent;
