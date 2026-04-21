# Map Data Layer Design Pattern

This pattern ensures consistent display of map data layers during pan/zoom operations by following the proven approach used in GeoJSONParcelLayer.

## Problem Statement

MapLibre GL layers can lose their data or recreation during pan/zoom operations when not properly managed. This causes visual flickering or complete disappearance of data layers.

## Solution Pattern

### Core Principles

1. **Initialize Empty, Load Later**: Create source with empty data first, then load actual data asynchronously
2. **Separate Concerns**: Source/layer initialization is separate from data loading
3. **Persist During Movements**: Never recreate source/layer during normal map operations
4. **Style Change Handling**: Only re-initialize on actual style changes, not movements

### Implementation Pattern

```typescript
// 1. State Management
const [geoJsonData, setGeoJsonData] = useState<any>(null);
const initializedRef = useRef(false);

// 2. Initialize Source and Layers (Empty First)
useEffect(() => {
  if (!map || !visible) return;

  function initializeSource() {
    if (!map || !map.isStyleLoaded()) return;

    // Add source with EMPTY data
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        generateId: true
      });
    }

    // Add layer using empty source
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'circle', // or 'fill', 'line', etc.
        source: sourceId,
        paint: { /* paint properties */ },
        layout: { visibility: visible ? 'visible' : 'none' }
      });
    }

    initializedRef.current = true;
  }

  // Handle style changes only
  const handleStyleChange = () => {
    setTimeout(() => {
      if (map && map.isStyleLoaded()) {
        initializeSource();
      }
    }, 100);
  };

  window.addEventListener('mapStyleChanged', handleStyleChange);

  if (!map.isStyleLoaded()) {
    map.on('styledata', () => {
      initializeSource();
      map.off('styledata', arguments.callee);
    });
  } else {
    initializeSource();
  }

  return () => {
    window.removeEventListener('mapStyleChanged', handleStyleChange);
  };
}, [map, visible]);

// 3. Load Data Asynchronously
useEffect(() => {
  const loadData = async () => {
    const response = await fetch('/your-data.geojson');
    const data = await response.json();
    setGeoJsonData(data);
  };
  loadData();
}, []);

// 4. Update Source When Data Loads
useEffect(() => {
  if (!map || !geoJsonData || !initializedRef.current) return;

  const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
  if (source) {
    source.setData(geoJsonData);
  }
}, [map, geoJsonData, sourceId]);

// 5. Handle Property Updates
useEffect(() => {
  if (!map || !map.isStyleLoaded()) return;
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
  }
}, [map, visible, layerId]);
```

## Key Benefits

- **No Recreation**: Source and layer persist during pan/zoom
- **Consistent Display**: Data remains visible during map movements
- **Performance**: Eliminates unnecessary re-initialization
- **Robust**: Handles style changes properly

## Implementation Checklist

- [ ] Initialize source with empty data first
- [ ] Separate data loading from initialization
- [ ] Only handle style changes, not movements
- [ ] Use `source.setData()` to update data
- [ ] **Add timing safeguard**: Update data immediately after initialization if already loaded
- [ ] Proper cleanup on unmount
- [ ] Style change event listeners

## Applied Examples

### PosteSource Component
- ✅ Follows this pattern exactly
- ✅ Initializes with empty source
- ✅ Loads GeoJSON data asynchronously
- ✅ Updates source via `setData()`
- ✅ Handles style changes only

### GeoJSONParcelLayer Component  
- ✅ Original implementation of this pattern
- ✅ Proven to work consistently
- ✅ Reference implementation

### RailwayNetwork Component - Case Study
- ⚠️ **Initial Issue**: Layer not visible despite toggle being on
- 🐛 **Root Cause**: Timing issue between data loading and initialization
- 🔧 **Fix Applied**: Added immediate data update after initialization
- ✅ **Lesson Learned**: Data can load before initialization completes

#### Timing Issue Details

The RailwayNetwork component initially failed because:

1. **Data Loading**: GeoJSON data (1638 features) loaded immediately on mount
2. **Initialization**: Only occurred when visibility toggle was turned on
3. **Race Condition**: By the time `initializedRef.current = true` was set, `geoJsonData` was already loaded
4. **Missing Update**: The data update useEffect never triggered again after initialization

#### Solution Implementation

```typescript
// After setting initializedRef.current = true
// Immediately update source data if it's already loaded
if (geoJsonData) {
  const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
  if (source) {
    source.setData(geoJsonData);
  }
}
```

This ensures data is applied regardless of initialization timing.

#### Pattern Enhancement

The base pattern should include this timing safeguard:

```typescript
// 4. Update Source When Data Loads (with timing safeguard)
useEffect(() => {
  if (!map || !geoJsonData || !initializedRef.current) return;

  const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
  if (source) {
    source.setData(geoJsonData);
  }
}, [map, geoJsonData, sourceId]);

// AND in initialization function:
initializedRef.current = true;

// Immediately update source data if it's already loaded
if (geoJsonData) {
  const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
  if (source) {
    source.setData(geoJsonData);
  }
}
```

## Usage Guidelines

When creating new map data layers:

1. **Copy this pattern** from PosteSource or GeoJSONParcelLayer
2. **Adapt layer type** (circle, fill, line, symbol) as needed
3. **Customize paint properties** for your data visualization
4. **Maintain initialization sequence** strictly
5. **Add timing safeguard** to handle data loading before initialization
6. **Test both scenarios**: data loads before AND after initialization
7. **Test pan/zoom behavior** thoroughly

This pattern ensures all map data layers behave consistently without recreation issues and handles timing edge cases properly.
