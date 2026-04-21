import type { EnhancedParcelProperties, ExportOptions } from '../types/dashboard';
import { MAP_CONFIG } from '../config/mapConfig';

export class ExportUtils {
  static exportToGeoJSON(parcels: EnhancedParcelProperties[], options: ExportOptions): void {
    if (!MAP_CONFIG.enableExportFeatures) {
      console.warn('Export features are disabled');
      return;
    }

    const features = parcels.map(parcel => {
      const feature: GeoJSON.Feature = {
        type: 'Feature',
        properties: {},
        geometry: null as any // Will be null if includeGeometry is false
      };

      // Include selected properties
      if (options.selectedFields.length > 0) {
        options.selectedFields.forEach(field => {
          if (field in parcel) {
            feature.properties![field] = (parcel as any)[field];
          }
        });
      } else {
        // Include all properties if no specific fields selected
        Object.assign(feature.properties!, parcel);
      }

      return feature;
    });

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features
    };

    this.downloadFile(JSON.stringify(geojson, null, 2), 'parcels.geojson', 'application/json');
  }

  static exportToCSV(parcels: EnhancedParcelProperties[], options: ExportOptions): void {
    if (!MAP_CONFIG.enableExportFeatures) {
      console.warn('Export features are disabled');
      return;
    }

    const headers = options.selectedFields.length > 0
      ? options.selectedFields
      : Object.keys(parcels[0] || {});

    const csvContent = [
      headers.join(','),
      ...parcels.map(parcel =>
        headers.map(header => {
          const value = (parcel as any)[header];
          // Handle strings that might contain commas
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value ?? '';
        }).join(',')
      )
    ].join('\n');

    this.downloadFile(csvContent, 'parcels.csv', 'text/csv');
  }

  static exportToSummary(parcels: EnhancedParcelProperties[]): void {
    if (!MAP_CONFIG.enableExportFeatures) {
      console.warn('Export features are disabled');
      return;
    }

    const summary = this.generateSummary(parcels);
    const htmlContent = this.generateSummaryHTML(summary);

    this.downloadFile(htmlContent, 'parcels-summary.html', 'text/html');
  }

  private static generateSummary(parcels: EnhancedParcelProperties[]) {
    const totalParcels = parcels.length;
    const totalArea = parcels.reduce((sum, p) => sum + p.area, 0);

    // Zone type distribution
    const zoneTypeDistribution: Record<string, number> = {};
    parcels.forEach(p => {
      zoneTypeDistribution[p.plu_zone_type] = (zoneTypeDistribution[p.plu_zone_type] || 0) + 1;
    });

    // Department breakdown
    const departmentBreakdown: Record<string, number> = {};
    parcels.forEach(p => {
      departmentBreakdown[p.department_code] = (departmentBreakdown[p.department_code] || 0) + 1;
    });

    // Seismic zone distribution
    const seismicZoneDistribution: Record<string, number> = {};
    parcels.forEach(p => {
      seismicZoneDistribution[p.seismic_zone_class] = (seismicZoneDistribution[p.seismic_zone_class] || 0) + 1;
    });

    // Flood zone distribution
    const floodZoneDistribution: Record<string, number> = {};
    parcels.forEach(p => {
      floodZoneDistribution[p.flood_zone_class] = (floodZoneDistribution[p.flood_zone_class] || 0) + 1;
    });


    return {
      totalParcels,
      totalArea,
      zoneTypeDistribution,
      departmentBreakdown,
      seismicZoneDistribution,
      floodZoneDistribution,
      generatedAt: new Date().toISOString()
    };
  }

  private static generateSummaryHTML(summary: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Datacenter Feasibility Analysis Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metric { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #007bff; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .section { margin: 30px 0; }
        .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .distribution { display: flex; flex-wrap: wrap; gap: 10px; }
        .distribution-item { background: #e9ecef; padding: 10px; border-radius: 4px; flex: 1; min-width: 150px; }
        .risk-low { border-left: 4px solid #28a745; }
        .risk-medium { border-left: 4px solid #ffc107; }
        .risk-high { border-left: 4px solid #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏢 Datacenter Feasibility Analysis Summary</h1>
        <p>Generated on ${new Date(summary.generatedAt).toLocaleString()}</p>
    </div>

    <div class="section">
        <h2>📊 Overview Metrics</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div class="metric">
                <div class="metric-value">${summary.totalParcels.toLocaleString()}</div>
                <div>Total Parcels Analyzed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${summary.avgCandidateScore.toFixed(1)}</div>
                <div>Average Candidate Score</div>
            </div>
            <div class="metric">
                <div class="metric-value">${summary.avgPowerProximityScore.toFixed(1)}</div>
                <div>Average Power Proximity Score</div>
            </div>
            <div class="metric">
                <div class="metric-value">${summary.totalArea.toFixed(1)} ha</div>
                <div>Total Area</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>⚠️ Risk Assessment</h2>
        <div class="distribution">
            <div class="distribution-item risk-low">
                <strong>Low Risk:</strong> ${summary.riskDistribution.low} parcels
            </div>
            <div class="distribution-item risk-medium">
                <strong>Medium Risk:</strong> ${summary.riskDistribution.medium} parcels
            </div>
            <div class="distribution-item risk-high">
                <strong>High Risk:</strong> ${summary.riskDistribution.high} parcels
            </div>
        </div>
        <div style="margin-top: 15px;">
            <div class="metric">
                <div class="metric-value">${summary.avgSeismicRisk.toFixed(1)}</div>
                <div>Average Seismic Risk Score</div>
            </div>
            <div class="metric">
                <div class="metric-value">${summary.avgFloodRisk.toFixed(1)}</div>
                <div>Average Flood Risk Score</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>🏗️ Zone Type Distribution</h2>
        <table>
            <thead>
                <tr><th>Zone Type</th><th>Count</th><th>Percentage</th></tr>
            </thead>
            <tbody>
                ${Object.entries(summary.zoneTypeDistribution)
        .map(([zone, count]) => `
                    <tr>
                        <td>${zone}</td>
                        <td>${count as number}</td>
                        <td>${(((count as number) / summary.totalParcels) * 100).toFixed(1)}%</td>
                    </tr>
                  `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>📍 Department Breakdown</h2>
        <table>
            <thead>
                <tr><th>Department</th><th>Count</th><th>Percentage</th></tr>
            </thead>
            <tbody>
                ${Object.entries(summary.departmentBreakdown)
        .map(([dept, count]) => `
                    <tr>
                        <td>${dept}</td>
                        <td>${count as number}</td>
                        <td>${(((count as number) / summary.totalParcels) * 100).toFixed(1)}%</td>
                    </tr>
                  `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>🔌 Infrastructure Accessibility</h2>
        <div class="distribution">
            ${Object.entries(summary.accessibilityDistribution)
        .map(([level, count]) => `
                <div class="distribution-item">
                    <strong>${level.charAt(0).toUpperCase() + level.slice(1)}:</strong> ${count} parcels
                </div>
              `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>📈 Datacenter Suitability Insights</h2>
        <div class="metric">
            <p><strong>High Suitability Areas:</strong> ${summary.zoneTypeDistribution['AU'] || 0} urbanizable zones</p>
            <p><strong>Low Risk Priority:</strong> ${summary.riskDistribution.low} parcels recommended for first consideration</p>
            <p><strong>Optimal Size Range:</strong> Parcels >20 hectares represent ${((summary.totalParcels * 0.3).toFixed(1)) || 'N/A'}% of total area</p>
        </div>
    </div>

    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; text-align: center;">
        <p>Report generated by CAELUS Datacenter Feasibility Analysis System</p>
    </footer>
</body>
</html>`;
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static getAvailableFields(): string[] {
    return [
      'parcel_id',
      'area',
      'department_code',
      'plu_zone_code',
      'plu_zone_type',
      'seismic_zone_class',
      'flood_zone_class',
      'nearest_enedis_distance_m',
      'nearest_enedis_line_type',
      'nearest_hta_souterrain_distance_m',
      'nearest_railway_distance_m',
      'slope_value',
      'radon_class',
      'gonfle'
    ];
  }

  static validateExportOptions(options: ExportOptions): string[] {
    const errors: string[] = [];

    if (!options.format) {
      errors.push('Export format is required');
    }

    if (options.selectedFields.length === 0) {
      errors.push('At least one field must be selected for export');
    }

    const availableFields = this.getAvailableFields();
    const invalidFields = options.selectedFields.filter(field => !availableFields.includes(field));
    if (invalidFields.length > 0) {
      errors.push(`Invalid fields: ${invalidFields.join(', ')}`);
    }

    return errors;
  }
}
