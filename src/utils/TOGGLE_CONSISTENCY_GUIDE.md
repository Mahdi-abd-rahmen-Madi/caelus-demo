# Layer Toggle Consistency Guide

This guide explains how to use the new toggle consistency system to ensure all layer toggles work reliably and consistently.

## Quick Start

### For New Layer Components

1. **Use the useLayerVisibility Hook**
```typescript
import { useLayerVisibility } from '../hooks/useLayerVisibility';

// In your component
useLayerVisibility({
  map,
  layerIds: ['your-layer-id'],
  visible: isVisible,
  debugMode: process.env.NODE_ENV === 'development'
});
```

2. **Remove Unsafe Cleanup Operations**
```typescript
// DON'T DO THIS - causes crashes during basemap changes
useEffect(() => {
  return () => {
    safeRemoveLayer(map, layerId);
    safeRemoveSource(map, sourceId);
  };
}, [map, layerId]);

// INSTEAD - let MapLibre handle cleanup automatically
// NO cleanup needed during basemap changes
```

### For Layer Control Components

1. **Use Enhanced LayerToggle**
```typescript
<LayerToggle
  checked={isVisible}
  onChange={() => onToggle(!isVisible)}
  label="Layer Name"
  color="#6366f1"
  layerId="your-layer-id"        // For debugging
  debugMode={false}             // Enable for troubleshooting
/>
```

## Debugging Tools

### Enable Debug Mode
```typescript
import { LayerDebugger } from '../utils/layerDebugging';

LayerDebugger.enable();  // Enable debug logging
LayerDebugger.printMapState(map);  // Print current map state
```

### Validate Toggle States
```typescript
import { LayerValidator } from '../utils/layerValidation';

// Check all toggle states match actual visibility
const toggleStates = {
  'layer-1': true,
  'layer-2': false
};

const results = LayerValidator.validateAllToggles(map, toggleStates);
const summary = LayerValidator.getValidationSummary(results);

console.log(`${summary.consistent} consistent, ${summary.inconsistent} inconsistent`);

// Auto-fix inconsistencies
LayerValidator.fixInconsistentToggles(map, results);
```

### Run Automated Tests
```typescript
import { ToggleTester } from '../utils/toggleTestUtils';

// Run comprehensive toggle tests
ToggleTester.enableDebugMode();
const testResults = ToggleTester.runToggleTests(map);

console.log(`Tests: ${testResults.passed} passed, ${testResults.failed} failed`);
testResults.errors.forEach(error => console.error(error));
```

## Best Practices

### 1. Layer Initialization
Follow Pattern A (GeoJSON) or Pattern B (Vector Tiles) from user rules:

**Pattern A - GeoJSON with Manual Loading:**
```typescript
// Initialize empty first, load data later
useEffect(() => {
  if (!map || !visible) return;
  
  function initializeSource() {
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
    }
    // Add layers...
  }
  
  initializeSource();
}, [map, visible]);

// Load data asynchronously
useEffect(() => {
  const loadData = async () => {
    const data = await fetch('/data.geojson');
    const source = map.getSource(sourceId);
    if (source) source.setData(data);
  };
  loadData();
}, []);
```

**Pattern B - Vector Tiles:**
```typescript
// Backend handles decompression, MapLibre handles loading
useEffect(() => {
  if (!map || !visible) return;
  
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'vector',
      tiles: ['http://localhost:8000/tiles/{z}/{x}/{y}']
    });
  }
  // Add layers...
}, [map, visible]);
```

### 2. Visibility Management
Always use the `useLayerVisibility` hook:
```typescript
useLayerVisibility({
  map,
  layerIds: ['layer-fill', 'layer-outline'],  // Multiple layers supported
  visible: isVisible,
  debugMode: false,
  onVisibilityChange: (layerId, isVisible) => {
    console.log(`${layerId} is now ${isVisible ? 'visible' : 'hidden'}`);
  }
});
```

### 3. Error Handling
Include proper error handling:
```typescript
useEffect(() => {
  if (!map || !map.isStyleLoaded()) return;
  
  try {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    }
  } catch (error) {
    console.warn(`Error setting ${layerId} visibility:`, error);
  }
}, [map, visible, layerId]);
```

### 4. Style Change Handling
The hook automatically handles style changes, but for manual implementations:
```typescript
useEffect(() => {
  if (!map) return;
  
  const handleStyleChange = () => {
    setTimeout(() => {
      if (map && map.isStyleLoaded()) {
        // Reapply visibility
        setVisibility(visible);
      }
    }, 100);
  };
  
  window.addEventListener('mapStyleChanged', handleStyleChange);
  return () => window.removeEventListener('mapStyleChanged', handleStyleChange);
}, [map, visible]);
```

## Troubleshooting

### Common Issues

1. **Toggle doesn't show/hide layer**
   - Check if layer exists: `map.getLayer(layerId)`
   - Verify layer ID matches between toggle and component
   - Enable debug mode to see visibility changes

2. **Crashes during basemap changes**
   - Remove cleanup operations that call `removeLayer`/`removeSource`
   - Let MapLibre handle cleanup automatically

3. **Inconsistent toggle state**
   - Use `LayerValidator.validateAllToggles()` to check consistency
   - Use `LayerValidator.fixInconsistentToggles()` to auto-fix

4. **Performance issues**
   - Avoid rapid toggle changes
   - Use debouncing for frequent updates
   - Check for unnecessary re-renders

### Debug Commands

```typescript
// Check specific layer
const info = LayerDebugger.getLayerInfo(map, 'layer-id');
console.log('Layer info:', info);

// Find all layers matching pattern
const layers = LayerDebugger.getAllLayersMatchingPattern(map, 'mvt-.*');
console.log('MVT layers:', layers);

// Validate single toggle
const result = LayerValidator.validateSingleToggle(map, 'layer-id', true);
console.log('Toggle valid:', result.isConsistent);
```

## Migration Checklist

For existing layer components:

- [ ] Remove unsafe cleanup operations
- [ ] Replace manual visibility with `useLayerVisibility` hook
- [ ] Add debugging props to LayerToggle components
- [ ] Test with validation tools
- [ ] Run automated test suite

## Testing

Run the test suite to verify implementation:

```bash
# In development console
ToggleTester.enableDebugMode();
const results = ToggleTester.runToggleTests(map);
console.log('Test results:', results);
```

Expected results:
- All basic toggle tests pass
- No race conditions detected
- Zoom-based visibility works correctly
- No crashes during basemap changes

## Support

For issues or questions:
1. Check the debugging output
2. Run validation tools
3. Review this guide
4. Check user rules for MapLibre patterns

The toggle consistency system ensures reliable, predictable behavior across all layers while preventing crashes and providing comprehensive debugging capabilities.
