# MapLibre Basemap Crash Prevention Pattern

## Problem Statement

MapLibre applications crash during basemap changes with the error: `TypeError: Cannot read properties of undefined (reading 'getLayer')`. This occurs when components attempt to remove layers/sources during basemap transitions when the map reference becomes undefined.

## Root Cause

During basemap changes, MapLibre internally manages layer and source cleanup. When components also try to remove layers/sources during this transition period, they encounter undefined map references, causing crashes.

## Solution Pattern

### Core Principle: Don't Remove Layers During Basemap Changes

Instead of manually removing layers/sources in cleanup functions, rely on MapLibre's built-in cleanup during style changes.

### Implementation Pattern

#### ❌ **Failing Pattern (Don't Use)**
```typescript
// Cleanup on unmount - CAUSES CRASHES
useEffect(() => {
  return () => {
    if (mapRef.current && initializedRef.current) {
      if (mapRef.current) {
        safeRemoveLayer(mapRef.current, layerId);
        safeRemoveSource(mapRef.current, sourceId);
      }
      initializedRef.current = false;
    }
  };
}, [map]); // ❌ map in dependency array causes re-run during basemap changes
```

#### ✅ **Working Pattern (Use This)**
```typescript
// NO cleanup function - MapLibre handles cleanup automatically
// Only handle initialization, visibility, and property updates

// Handle visibility changes
useEffect(() => {
  if (!map || !map.isStyleLoaded()) return;
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
  }
}, [map, visible, layerId]);

// Handle opacity changes  
useEffect(() => {
  if (!map || !map.isStyleLoaded()) return;
  if (map.getLayer(layerId)) {
    map.setPaintProperty(layerId, 'raster-opacity', opacity);
  }
}, [map, opacity, layerId]);
```

### Key Requirements

1. **No Cleanup useEffects**: Remove any cleanup functions that call `removeLayer` or `removeSource`
2. **No Safe Removal Imports**: Don't import `safeRemoveLayer` or `safeRemoveSource` for cleanup
3. **Keep Initialization**: Maintain proper layer/source initialization logic
4. **Keep Property Updates**: Keep visibility, opacity, and other property update effects
5. **Style Change Handling**: Keep `mapStyleChanged` event listeners for re-initialization

### Safe Utilities Usage - When to Use vs When to Avoid

#### ✅ **Safe Utilities ARE Still Useful For:**
- **Property Updates**: `safeSetLayoutProperty`, `safeSetPaintProperty` for visibility/opacity changes
- **Layer Checks**: `safeGetLayer` to check if layers exist before operations
- **Style Loading**: `safeIsStyleLoaded` to prevent race conditions during initialization
- **Working Components**: PLUWMSLayer uses them successfully without crashes

#### ❌ **Safe Utilities NOT For:**
- **Cleanup During Basemap Changes**: `safeRemoveLayer`, `safeRemoveSource` in cleanup useEffects
- **Any Removal Operations**: Manual layer/source removal during style transitions

**Key Insight**: The problem isn't the safe utilities themselves, but **when** they're used. Property updates are safe, cleanup during basemap changes is not.

### When to Apply

- **WMS Layers**: Raster layers from WMS services
- **Vector Layers**: GeoJSON or vector tile layers  
- **Any Layer Component**: Any component that adds MapLibre layers/sources

### Examples of Working Components

- `EnedisV2WMSLayer.tsx` - No cleanup, relies on MapLibre
- `CanalisationsWMSLayer.tsx` - Direct map calls without safe functions
- All fixed components after applying this pattern

### Benefits

- **No Crashes**: Eliminates undefined map reference errors
- **Simpler Code**: Removes complex cleanup logic
- **Better Performance**: Reduces unnecessary layer removal operations
- **Consistent Behavior**: All layers behave the same during basemap changes

### Migration Steps

1. **Identify Cleanup Functions**: Find `useEffect` with `return () => { removeLayer/removeSource }`
2. **Remove Entire Cleanup useEffect**: Delete the entire cleanup effect block
3. **Remove Only Removal Imports**: Remove `safeRemoveLayer`, `safeRemoveSource` imports (keep other safe utilities)
4. **Test Basemap Changes**: Verify no crashes occur during basemap switches
5. **Keep Other Logic**: Maintain initialization, visibility, and property updates
6. **Keep Safe Property Updates**: Continue using `safeSetLayoutProperty`, `safeSetPaintProperty` for property changes

### Files Successfully Fixed Using This Pattern

- `AleargComponent.tsx`
- `PprnPerimetreInond.tsx` 
- `PprnSeisme.tsx`
- `InondationV1.tsx`
- `PCIParcels.tsx`
- `BDTOPO.tsx`
- `RTE.tsx`

## Conclusion

This pattern eliminates MapLibre basemap change crashes by allowing MapLibre to handle layer cleanup internally rather than attempting manual removal during problematic transition periods. 

**Important Note**: Safe utilities (`mapSafety.ts`) are still valuable for property updates and should be kept - just not for cleanup operations during basemap changes.
