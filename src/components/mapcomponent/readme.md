# GeoJSON Parcel Layer Fix

## Problem
The GeoJSON parcel layer was not displaying tiles when zone filtering was enabled. Users could see tiles when filtering was disabled, but all parcels were filtered out when any zone types were selected.

## Root Cause Analysis
1. **Backend Data Mismatch**: The GeoJSON API endpoint (`/api/geodata/tiles/geojson/parcels/{z}/{x}/{y}/`) was only returning:
   - `parcel_id`
   - `power_proximity_score`
   
   But the frontend filtering logic expected zone information like `plu_zone_code`.

2. **Vector Tiles vs GeoJSON Tiles**: The vector tile generation (`10generate_vector_tiles.py`) correctly included all fields:
   - `plu_zone_code`
   - `seismic_zone_class` 
   - `flood_zone_class`
   - All other fields
   
   But the GeoJSON endpoint had a limited field selection.

## Solution
### 1. Updated GeoJSON API Endpoint
**File**: `/home/mahdi/CAELUS/backend/geodata/view_modules/geojson_tiles.py`

**Changes**:
- Added `plu_zone_code` to SELECT query
- Added `seismic_zone_class` to SELECT query  
- Added `flood_zone_class` to SELECT query
- Updated feature properties mapping to include new fields

```python
# Before
SELECT 
    parcel_id,
    power_proximity_score,
    ST_AsGeoJSON(...)

# After  
SELECT 
    parcel_id,
    power_proximity_score,
    plu_zone_code,
    seismic_zone_class,
    flood_zone_class,
    ST_AsGeoJSON(...)
```

### 2. Optimized Frontend Zone Mapping
**File**: `/home/mahdi/CAELUS/frontend/src/components/GeoJSONParcelLayer.tsx`

**Changes**:
- Removed zone types that don't exist in backend data
- Kept only zones actually present: `U`, `AU`, `AUC`, `AUS`, `AH`, `NH`
- Updated colors to match actual zone scheme

**File**: `/home/mahdi/CAELUS/frontend/src/components/mapcomponent/filter.tsx`

**Changes**:
- Updated `ZONE_TYPES` array to only include available zones
- Updated colors to match the zone mapping in GeoJSONParcelLayer

## Verification
1. **API Testing**: Confirmed GeoJSON endpoint now returns zone data:
   ```bash
   curl "http://localhost:8000/api/geodata/tiles/geojson/parcels/10/524/373/" | jq '.features[0] | .properties.plu_zone_code'
   # Returns: "U"
   ```

2. **Frontend Testing**: Zone filtering now works correctly - parcels are visible and filterable by zone type.

## Key Files Modified
- `/home/mahdi/CAELUS/backend/geodata/view_modules/geojson_tiles.py` - Added zone fields to GeoJSON response
- `/home/mahdi/CAELUS/frontend/src/components/GeoJSONParcelLayer.tsx` - Reduced zone mapping to actual data
- `/home/mahdi/CAELUS/frontend/src/components/mapcomponent/filter.tsx` - Updated filter options to match available zones
- `/home/mahdi/CAELUS/frontend/src/config/mapConfig.ts` - Added zone filtering disable flag for debugging

## Lessons Learned
- Always verify that API endpoints return the same fields expected by frontend
- Test both vector tiles and GeoJSON endpoints for consistency
- Use backend data analysis to confirm actual vs expected data structure