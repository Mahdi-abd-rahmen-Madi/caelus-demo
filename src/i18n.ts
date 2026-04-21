import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define your translation resources
const resources = {
    en: {
        translation: {
            // Navigation and Common
            'dashboard': 'Dashboard',
            'toolbox': 'Toolbox',
            'study_area': 'Study Area',
            'loading': 'Loading...',
            'error': 'Error',
            'close': 'Close',
            'save': 'Save',
            'cancel': 'Cancel',
            'confirm': 'Confirm',
            'search': 'Search',
            'filter': 'Filter',
            'clear': 'Clear',
            'all': 'All',
            'none': 'None',

            // Authentication
            'app_title': 'CAELUS',
            'app_subtitle': 'Geospatial Datacenter Intelligence Platform',
            'username': 'Username',
            'password': 'Password',
            'sign_in': 'Sign In',
            'username_required': 'Username is required',
            'password_required': 'Password is required',
            'secure_access_required': 'Secure Access Required',
            'contact_admin': 'Contact your system administrator to obtain login credentials',

            // Layer Controls
            'layer_controls': 'Layer Controls',
            'base_map': 'Base Map',
            'layers': 'Layers',
            'building_status': 'Building Status',
            'openstreetmap': 'OpenStreetMap',
            'osm_humanitarian': 'OSM Humanitarian',
            'carto_positron_light': 'Carto Positron (Light)',
            'carto_darkmatter_dark': 'Carto Dark Matter (Dark)',
            'satellite_imagery': 'Satellite Imagery',
            'boundaries': 'Boundaries',
            'parcels': 'Parcels',
            'color': 'Color',
            'default_colors': 'Default colors',
            'seismic_risk_levels': 'Seismic risk levels',
            'flood_risk_levels': 'Flood risk levels',
            'plu_zoning': 'PLU zoning',
            'suitability_score_heatmap': 'Suitability score heatmap',
            'connectivity_levels': 'Connectivity levels',
            'industrial_risk_zones': 'Industrial risk zones',
            'power_plant_proximity': 'Power plant proximity',

            // Infrastructure Section
            'infrastructure': 'Infrastructure',
            'railways': 'Railways',
            'enedis_v2': 'Enedis V2',
            'poste_electrique': 'Electrical Substation',
            'poste_source': 'Source Substation',
            'poteau_electrique': 'Electrical Pole',
            'hta_lines': 'HTA Lines',
            'bt_lines': 'BT Lines',
            'hta_underground': 'HTA Underground',
            'bt_underground': 'BT Underground',

            // RTE Network Section
            'rte_network': 'RTE Network',
            'aerien': 'Overhead',
            'souterrain': 'Underground',
            'voltage_range': 'Voltage Range',
            'min': 'Min',
            'max': 'Max',

            // IGN Vector Layers
            'ign_vector_layers': 'IGN Vector Layers',
            'parcels_and_buildings': 'Parcels & Buildings',
            'buildings': 'Buildings',
            'parcels_ign': 'Parcels',
            'active': 'ACTIVE',
            'zoom_to': 'Zoom to',
            'parcels_need': 'Parcels need',
            'all_active': 'All active',

            // Map Controls
            'osm': 'OSM',
            'hot': 'HOT',
            'light': 'Light',
            'dark': 'Dark',
            'sat': 'Sat',
            'def': 'Def',
            'seis': 'Seis',
            'flood': 'Flood',
            'score': 'Score',
            'conn': 'Conn',
            'risk': 'Risk',
            'ind': 'Ind',
            'power': 'Power',
            'mode': 'Mode',

            // Statistics Dashboard
            'loading_statistics': 'Loading Statistics...',
            'total_parcels': 'Total Parcels',
            'high_risk_parcels': 'High Risk Parcels',
            'suitable_parcels': 'Suitable Parcels',
            'average_score': 'Average Score',
            'no_data_available': 'No data available',
            'statistics_title': 'Statistics',

            // Risk Assessment
            'department': 'Department',
            'all_departments': 'All Departments',
            'analysis_radius': 'Analysis Radius',
            'seismic_risk_level': 'Seismic Risk Level',
            'flood_risk_level': 'Flood Risk Level',
            'stability_risk_level': 'Stability Risk Level',

            // Detailed Popup
            'parcel_details': 'Parcel Details',
            'connectivity': 'Connectivity',
            'power_proximity': 'Power Proximity',
            'seismic_risk': 'Seismic Risk',
            'flood_risk': 'Flood Risk',
            'suitability_level': 'Suitability Level',
            'area': 'Area',
            'access': 'Access',
            'filtered': 'Filtered',
            'slope': 'Slope',
            'risk_factors': 'Risk Factors',
            'more': 'more',

            // Dynamic Legend
            'excellent_high_speed_fiber': 'Excellent - High-speed fiber, redundant connections',
            'good_reliable_fiber': 'Good - Reliable fiber connections',
            'moderate_standard_connections': 'Moderate - Standard connections',
            'limited_basic_infrastructure': 'Limited - Basic infrastructure',
            'poor_minimal_connectivity': 'Poor - Minimal connectivity',
            'zone_1_lowest': 'Zone 1 (Lowest)',
            'zone_2_low': 'Zone 2 (Low)',
            'zone_3_moderate': 'Zone 3 (Moderate)',
            'zone_4_high': 'Zone 4 (High)',
            'zone_5_highest': 'Zone 5 (Highest)',
            'zone_1_low_risk': 'Zone 1 (Low Risk)',
            'zone_2_moderate': 'Zone 2 (Moderate)',
            'zone_3_high_risk': 'Zone 3 (High Risk)',
            'zone_4_very_high': 'Zone 4 (Very High)',
            'u_urban': 'U (Urban)',
            'au_auc_urbanizable': 'AU/AUC (Urbanizable)',
            'aus_urbanizable_services': 'AUS (Urbanizable + Services)',
            'ah_agricultural_housing': 'AH (Agricultural + Housing)',
            'nh_natural_housing': 'NH (Natural + Housing)',
            'all_parcels_default_color': 'All parcels shown in default color',

            // PLU Zone Codes
            'U': 'Urban',
            'AUC': 'Urbanizable',
            'AUS': 'Urbanizable with Services',
            'urban_expansion': 'Urban Expansion',

            // PLU Zone Types (English words that need translation)
            'urban': 'Urban',
            'urbanizable': 'Urbanizable',
            'urbanizable with services': 'Urbanizable with Services',
            'plu_zone': 'PLU Zone',

            // Viability and Accessibility
            'excellent': 'Excellent',
            'good': 'Good',
            'moderate': 'Moderate',
            'limited': 'Limited',
            'poor': 'Poor',
            'far': 'Far',
            'very_close': 'Very Close',
            'high_impact': 'High Impact',

            // Area Viability Classes
            'edge': 'Edge',
            'small': 'Small',
            'standard_viable': 'Standard Viable',
            'hyperscale': 'Hyperscale',
            'edge_only': 'Edge Only',
            'small_scale': 'Small Scale',
            'hyperscale_viable': 'Hyperscale Viable',

            // Web Vitals
            'web_vitals': 'Web Vitals',
            'web_vitals_dashboard': 'Web Vitals Dashboard',

            // Language
            'language': 'Language',
            'french': 'French',
            'english': 'English',

            // Additional filter keys
            'zones': 'Zones',
            'search_criteria': 'Search Criteria',
            'area_risks': 'Area Risks',
            'feasibility': 'Feasibility:',
            'filter_by_department': 'Filter by Department',
            'loading_departments': 'Loading departments...',
            'error_loading_departments': 'Error loading departments',
            'retry': 'Retry',
            'search_results': 'Search Results',
            'search_radius': 'Search Radius',
            'search_location': 'Search Location',
            'advanced_filters': 'Advanced Filters',
            'basic_filters': 'Basic Filters',
            'zone_infrastructure': 'Zone & Infrastructure',
            'zone_types': 'Zone Types',
            'risk_viability': 'Risk & Viability',
            'area_viability': 'Area Viability',
            'area_range': 'Area Range',
            'railway_distance': 'Railway Distance',
            'search_commune_placeholder': 'Search for a commune...',
            'no_communes_found': 'No communes found',
            'type_to_search_communes': 'Type to search communes',
            'search_location_address': 'Search address or place...',
            'enter_location': 'Enter location...',
            'no_locations_found': 'No locations found',
            'type_to_search_locations': 'Type to search locations',
            'selected_location': 'Selected Location',

            // Suitable Parcels List
            'failed_to_fetch_parcels': 'Failed to fetch suitable parcels',
            'filters_applied': 'filters applied',
            'no_parcels_match_filters': 'No parcels match your current filters',
            'try_adjusting_filters': 'Try adjusting your filter criteria or refresh to see all available parcels',
            'clear_filters': 'Clear Filters',
            'fly_to_parcel': 'Fly to parcel',
            'load_more': 'Load More',
            'parcels_loaded': 'parcels loaded',
            'no_suitable_parcels_fallback': 'no suitable parcels found',
            'no_parcels_found_in_area': 'No parcels found in this area',
            'try_different_location': 'Try searching in a different location',

            // Risk Assessment Page
            'highly_suitable': 'Highly Suitable',
            'moderately_suitable': 'Moderately Suitable',
            'not_suitable': 'Not Suitable',
            'back_to_dashboard': 'Back to Dashboard',
            'risk_assessment_dashboard': 'Risk Assessment Dashboard',
            'risk_assessment_description': 'Comprehensive analysis of seismic, flood, and ground stability risks for datacenter siting',
            'real_time_analysis': 'Real-time Analysis',
            'refresh': 'Refresh',
            'calculating': 'Calculating...',
            'risk_levels_analysis': 'Risk Levels Analysis',
            'current_risk_assessment': 'Current Risk Assessment',
            'ground_stability': 'Ground Stability',
            'earthquake_hazard_assessment': 'Earthquake hazard assessment',
            'flooding_hazard_assessment': 'Flooding hazard assessment',
            'ground_stability_assessment': 'Ground stability assessment',
            'feasibility_score': 'Feasibility Score',
            'datacenter_suitability_score': 'Datacenter suitability score (0-100)',
            'score_interpretation': 'Score Interpretation',
            'highly_suitable_description': 'Highly suitable for datacenter development',
            'moderately_suitable_description': 'Moderately suitable with mitigation',
            'not_suitable_description': 'Not suitable for datacenter development',
            'parcel_statistics': 'Parcel Statistics',
            'total_parcels_analyzed': 'Total Parcels Analyzed',
            'suitability_rate': 'Suitability Rate',
            'analysis_location': 'Analysis Location',
            'coordinates': 'Coordinates',
            'error_loading_risk_metrics': 'Error loading risk metrics',

            // Risk Level Classes
            'low': 'Low',
            'medium': 'Medium',
            'high': 'High',
            'unknown': 'Unknown',
            'very_low': 'Very Low',
            'extreme': 'Extreme',
            'no_flood_risk': 'No Flood Risk',
            'low_risk': 'Low Risk',
            'moderate_risk': 'Moderate Risk',
            'high_risk': 'High Risk',
            'very_high_risk': 'Very High Risk',
            'no_flood_zone_detected': 'No flood zone detected',
            'near_main_flood_zone': 'Near main flood zone',
            'surface_water_runoff_zone': 'Surface water runoff zone',
            'main_river_flood_zone': 'Main river flood zone',
            'coastal_flood_zone': 'Coastal flood zone',
            'no_clay_swelling_risk': 'No Clay Swelling Risk',
            'clay_swelling_low': 'Low risk',
            'clay_swelling_moderate': 'Moderate risk',
            'clay_swelling_high': 'High risk',
            'clay_swelling_unknown': 'Unknown risk',
            'no_clay_swelling_data': 'No clay swelling data available',
            'clay_swelling': 'Clay Swelling',
            'radon_risk': 'Radon Risk',
            'no_radon_risk': 'No Radon Risk',
            'radon_class_1': 'Class 1 (Low)',
            'radon_class_2': 'Class 2 (Medium)',
            'radon_class_3': 'Class 3 (High)',
            'radon_risk_low': 'Low radon concentration',
            'radon_risk_medium': 'Moderate radon concentration',
            'radon_risk_high': 'High radon concentration',
            'slope_flat': 'Flat',
            'slope_gentle': 'Gentle slope',
            'slope_moderate': 'Moderate slope',
            'slope_steep': 'Steep terrain',
            'slope_very_steep': 'Very steep terrain',
            'slope_unknown': 'Unknown terrain',
            'risk_class_low': 'Low Risk',
            'risk_class_medium': 'Medium Risk',
            'risk_class_high': 'High Risk',
            'seismic_risk_class': 'Seismic Risk Class',
            'flood_risk_class': 'Flood Risk Class',
            'stability_risk_class': 'Stability Risk Class',
            'risk_class': 'Risk',
            'impact': 'Impact',
            'seismic': 'Seismic',

            // Datacenter Suitability
            'datacenter_suitability': 'Datacenter Suitability',
            'overall_assessment': 'Overall Assessment',
            'excellent_suitability_description': 'This parcel has excellent characteristics for datacenter development with high scores across all key metrics.',
            'good_suitability_description': 'This parcel shows good potential for datacenter development with moderate to good characteristics.',
            'moderate_suitability_description': 'This parcel has some limitations but may be suitable for datacenter development with mitigation measures.',
            'poor_suitability_description': 'This parcel has significant challenges for datacenter development and may not be recommended.',

            // Industrial Risk
            'industrial_influence': 'Industrial Risk Impact Score',

            // Enhanced Industrial Risk Details
            'industrial_risk_details': 'Industrial Risk Details',
            'nearest_facility': 'Nearest Facility',
            'seveso_classification': 'Seveso Classification',
            'activity_types': 'Activity Types',
            'industry': 'Industry',
            'nearby_facilities': 'nearby facilities',

            // Activity Type Translations
            'industrial': 'Industrial',
            'quarry': 'Quarry',
            'livestock': 'Livestock',
            'wind_turbine': 'Wind Turbine',

            // Basic Information
            'basic_information': 'Basic Information',

            // Infrastructure Proximity Labels
            'electrical_infrastructure_proximity': 'Electrical Infrastructure Proximity',
            'distance_to_nearest_electrical_line_enedis': 'Distance to Nearest Electrical Line (Enedis)',
            'nearest_line_type_voltage_installation': 'Nearest Line Type (Voltage/Installation)',
            'distance_to_underground_high_voltage_line_hta': 'Distance to Underground High Voltage Line (HTA)',
            'distance_to_nearest_railway_fibre_line': 'Distance to Nearest Railway/Fibre Line',

            // Line Type Descriptions
            'low_voltage_aerial': 'Low Voltage, Aerial',
            'low_voltage_underground': 'Low Voltage, Underground',
            'high_voltage_aerial': 'High Voltage, Aerial',
            'high_voltage_underground': 'High Voltage, Underground',

            // Risk Analysis
            'risk_analysis': 'Risk Analysis',

            // Map Legend
            'map_legend': 'Map Legend',
            'default_view_color_mode': 'Default',
            'infrastructure_connectivity': 'Infrastructure Connectivity',
            'combined_risk_assessment': 'Combined Risk Assessment',
            'industrial_risk_influence': 'Industrial Risk Influence',
            'power_infrastructure_proximity': 'Power Infrastructure Proximity',
            'seismic_risk_zones': 'Seismic Risk Zones',
            'seismic_zones': 'Seismic Zones',
            'flood_risk_zones': 'Flood Risk Zones',
            'plu_zone_types': 'PLU Zone Types',
            'color_mode': 'Color mode',
            'industrial_proximity_impact_description': 'Industrial proximity impact on datacenter operations',
            'power_grid_proximity_description': 'Proximity to power grid infrastructure',

            // Placeholder for parcels list before search
            'drop_pin_or_search_to_view_parcels': 'Drop pin or make a search to view suitable parcels',
            'search_by_location_or_drop_pin_on_map': 'Search by location or drop a pin on the map to get started',

            // MVT Incident Types
            'rockfall': 'Rockfall',
            'landslide': 'Landslide',
            'subsidence': 'Subsidence',
            'debris_flow': 'Debris Flow',
            'other': 'Other',
            'unknown_type': 'Unknown Type',

            // Georisque Rapport Download
            'environmental_rapport': 'Environmental Report',
            'download_rapport_for_coordinates': 'Download environmental report for these coordinates:',
            'download_georisque_rapport': 'Download Georisque environmental report (PDF)',
            'download_rapport': 'Download Report',
            'downloading': 'Downloading...',
            'invalid_coordinates': 'Invalid coordinates',
            'download_failed': 'Download failed',
            'download_timeout': 'Download timeout',
            'no_rapport_found': 'No report available for this location',
            'too_many_requests': 'Too many requests, please try again later',
            'server_error': 'Server error, please try again later',
            'no_pdf_available': 'No PDF available from server',
            'rapport_downloaded_successfully': 'Report downloaded successfully',

            // Georisques Risk Categories
            'natural_risks_georisques': 'Natural Risks (Georisques)',
            'technological_risks_georisques': 'Technological Risks (Georisques)',
            'present_risks': 'present risks',
            'no_risk': 'No Risk',
            'no_risk_detected': 'No risk detected',
            'risk_present': 'Risk present',
            'all_risks_in_natural_section': 'All natural and geological risks are now displayed in the Natural Risks section below.',

            // Ruler and Buffer Zone Tools
            'ruler_tool': 'Ruler Tool',
            'buffer_zone': 'Buffer Zone',
            'place_buffer_here': 'Click Map to Place Buffer',
            'clear_buffer_location': 'Clear Buffer Location',
            'follow_search_location': 'Follow Search Location',
            'manual_placement': 'Manual Placement',
            'buffer_follows_search_pin': 'Buffer follows search/pin location',
            'click_to_measure': 'Click to measure distances',
            'click_two_points': 'Click 2 points to measure',
            'click_path_points': 'Click points to create path',
            'first_point_placed': 'First point placed',
            'measurements': 'measurements',
            'measurement': 'Measurement',
            'points': 'points',
            'buffer_radius': 'Buffer Radius',
            'circumference': 'Circumference',

            // Parcels Section
            'show_parcels': 'Show Parcels',
            'parcel_color_mode': 'Color Mode',
            'parcel_mode_default': 'Default',
            'parcel_mode_plu': 'PLU',
            'parcel_mode_risk': 'Risk',

            // Settings Section
            'layer_settings': 'Settings',
            'risk_trackers_toggle': 'Risk Trackers',

            // PLU Urban Planning Section
            'urban_planning': 'Urban Planning',
            'plu_layers': 'PLU Layers',
            'zoning_sectors': 'Zoning Sectors',
            'planning_prescriptions': 'Planning Prescriptions',
            'planning_information': 'Planning Information',

            // DVF (Demande de Valeur Foncière) Section
            'dvf': 'DVF - Property Transactions',
            'dvf.title': 'Property Transactions',
            'dvf_transactions': 'transactions',
            'dvf.transactions': 'transactions',
            'dvf.no_transactions': 'No property transactions found',
            'dvf.refresh': 'Refresh data',
            'dvf.source': 'Source: {{source}}',
            'dvf.error.fetch': 'Failed to fetch transaction data',
            'dvf.error.unknown': 'Unknown error occurred',
            'dvf.not_specified': 'Not specified',
            'dvf.nature.sale': 'Sale',
            'dvf.nature.exchange': 'Exchange',
            'dvf.nature.donation': 'Donation',
            'dvf.nature.inheritance': 'Inheritance',
            'dvf.nature.adjudication': 'Adjudication',
            'dvf.type.house': 'House',
            'dvf.type.apartment': 'Apartment',
            'dvf.type.dependency': 'Dependency',
            'dvf.type.industrial': 'Industrial',
            'dvf.type.commercial': 'Commercial',
            'dvf.type.land': 'Land',
            'dvf.placeholder': 'Click on a parcel to see its associated transactions',

            // Demo Mode
            'demo_mode_not_functional': 'Demo Mode - Not Functional'
        }
    },
    fr: {
        translation: {
            // Navigation and Common
            'dashboard': 'Tableau de Bord',
            'toolbox': 'Boîte à Outils',
            'study_area': 'Zone d\'Étude',
            'loading': 'Chargement...',
            'error': 'Erreur',
            'close': 'Fermer',
            'save': 'Enregistrer',
            'cancel': 'Annuler',
            'confirm': 'Confirmer',
            'search': 'Rechercher',
            'filter': 'Filtrer',
            'clear': 'Effacer',
            'all': 'Tous',
            'none': 'Aucun',

            // Authentication
            'app_title': 'CAELUS',
            'app_subtitle': 'Plateforme d\'Intelligence Géospatiale',
            'username': 'Nom d\'utilisateur',
            'password': 'Mot de passe',
            'sign_in': 'Se Connecter',
            'username_required': 'Le nom d\'utilisateur est requis',
            'password_required': 'Le mot de passe est requis',
            'secure_access_required': 'Accès Sécurisé Requis',
            'contact_admin': 'Contactez votre administrateur système pour obtenir les identifiants de connexion',

            // Layer Controls
            'layer_controls': 'Contrôles de Couches',
            'base_map': 'Carte de Base',
            'layers': 'Couches',
            'building_status': 'Statut du Bâtiment',
            'openstreetmap': 'OpenStreetMap',
            'osm_humanitarian': 'OSM Humanitaire',
            'carto_positron_light': 'Carto Positron (Clair)',
            'carto_darkmatter_dark': 'Carto Dark Matter (Sombre)',
            'satellite_imagery': 'Images Satellite',
            'boundaries': 'Limites',
            'parcels': 'Parcelles',
            'color': 'Couleur',
            'default_colors': 'Couleurs par défaut',
            'seismic_risk_levels': 'Niveaux de risque sismique',
            'flood_risk_levels': 'Niveaux de risque d\'inondation',
            'plu_zoning': 'Zonage PLU',
            'suitability_score_heatmap': 'Carte de chaleur du score de pertinence',
            'connectivity_levels': 'Niveaux de connectivité',
            'industrial_risk_zones': 'Zones de risque industriel',
            'power_plant_proximity': 'Proximité des centrales électriques',

            // Infrastructure Section
            'infrastructure': 'Infrastructure',
            'railways': 'Chemins de fer',
            'enedis_v2': 'Enedis V2',
            'poste_electrique': 'Poste Électrique',
            'poste_source': 'Poste Source',
            'poteau_electrique': 'Poteau Électrique',
            'hta_lines': 'Lignes HTA',
            'bt_lines': 'Lignes BT',
            'hta_underground': 'HTA Souterrain',
            'bt_underground': 'BT Souterrain',

            // RTE Network Section
            'rte_network': 'Réseau RTE',
            'aerien': 'Aérien',
            'souterrain': 'Souterrain',
            'voltage_range': 'Plage de Tension',
            'min': 'Min',
            'max': 'Max',

            // IGN Vector Layers
            'ign_vector_layers': 'Couches Vectorielles IGN',
            'parcels_and_buildings': 'Parcelles & Bâtiments',
            'buildings': 'Bâtiments',
            'parcels_ign': 'Parcelles',
            'active': 'ACTIF',
            'zoom_to': 'Zoom vers',
            'parcels_need': 'Parcelles besoin',
            'all_active': 'Tout actif',

            // Map Controls
            'osm': 'OSM',
            'hot': 'HOT',
            'light': 'Clair',
            'dark': 'Sombre',
            'sat': 'Sat',
            'def': 'Déf',
            'seis': 'Sism',
            'flood': 'Inond',
            'score': 'Score',
            'conn': 'Connect',
            'risk': 'Risque',
            'ind': 'Ind',
            'power': 'Puissance',
            'mode': 'Mode',

            // Additional translations
            'default_view': 'Vue par défaut',
            'color_mode_default': 'Mode de couleur : Défaut',

            // Statistics Dashboard
            'loading_statistics': 'Chargement des Statistiques...',
            'total_parcels': 'Total des Parcelles',
            'high_risk_parcels': 'Parcelles à Haut Risque',
            'suitable_parcels': 'Parcelles Appropriées',
            'average_score': 'Score Moyen',
            'no_data_available': 'Aucune donnée disponible',
            'statistics_title': 'Statistiques',

            // Risk Assessment
            'department': 'Département',
            'all_departments': 'Tous les Départements',
            'analysis_radius': 'Rayon d\'Analyse',
            'seismic_risk_level': 'Niveau de Risque Sismique',
            'flood_risk_level': 'Niveau de Risque d\'Inondation',
            'stability_risk_level': 'Niveau de Risque de Stabilité',

            // Detailed Popup
            'parcel_details': 'Détails de la Parcelle',
            'connectivity': 'Connectivité',
            'power_proximity': 'Proximité Électrique',
            'seismic_risk': 'Risque Sismique',
            'flood_risk': 'Risque d\'Inondation',
            'suitability_level': 'Niveau de Pertinence',
            'area': 'Superficie',
            'access': 'Accès',
            'filtered': 'Filtré',
            'slope': 'Pente',
            'risk_factors': 'Facteurs de Risque',
            'more': 'plus',

            // Dynamic Legend
            'excellent_high_speed_fiber': 'Excellent - Fibre haut débit, connexions redondantes',
            'good_reliable_fiber': 'Bon - Connexions fibre fiables',
            'moderate_standard_connections': 'Modéré - Connexions standard',
            'limited_basic_infrastructure': 'Limité - Infrastructure de base',
            'poor_minimal_connectivity': 'Médiocre - Connectivité minimale',
            'zone_1_lowest': 'Zone 1 (Plus Faible)',
            'zone_2_low': 'Zone 2 (Faible)',
            'zone_3_moderate': 'Zone 3 (Modéré)',
            'zone_4_high': 'Zone 4 (Élevé)',
            'zone_5_highest': 'Zone 5 (Plus Élevé)',
            'zone_1_low_risk': 'Zone 1 (Faible Risque)',
            'zone_2_moderate': 'Zone 2 (Modéré)',
            'zone_3_high_risk': 'Zone 3 (Risque Élevé)',
            'zone_4_very_high': 'Zone 4 (Très Élevé)',
            'u_urban': 'U (Urbain)',
            'au_auc_urbanizable': 'AU/AUC (Urbanisable)',
            'aus_urbanizable_services': 'AUS (Urbanisable + Services)',
            'ah_agricultural_housing': 'AH (Agricole + Logement)',
            'nh_natural_housing': 'NH (Naturel + Logement)',
            'all_parcels_default_color': 'Toutes les parcelles affichées en couleur par défaut',

            // PLU Zone Codes
            'U': 'Urbain',
            'AUC': 'Urbanisable',
            'AUS': 'Urbanisable avec Services',
            'urban_expansion': 'Expansion Urbaine',

            // PLU Zone Types (English words that need translation)
            'urban': 'Urbain',
            'urbanizable': 'Urbanisable',
            'urbanizable with services': 'Urbanisable avec Services',
            'plu_zone': 'Zone PLU',

            // Viability and Accessibility
            'excellent': 'Excellent',
            'good': 'Bon',
            'moderate': 'Modéré',
            'limited': 'Limité',
            'poor': 'Médiocre',

            // Area Viability Classes
            'edge': 'Périphérique',
            'small': 'Petite',
            'standard_viable': 'Viable Standard',
            'hyperscale': 'Hyper-échelle',
            'edge_only': 'Périphérique Seulement',
            'small_scale': 'Petite Échelle',
            'hyperscale_viable': 'Hyper-échelle Viable',

            // Web Vitals
            'web_vitals': 'Web Vitals',
            'web_vitals_dashboard': 'Tableau de Bord Web Vitals',

            // Language
            'language': 'Langue',
            'french': 'Français',
            'english': 'Anglais',

            // Additional filter keys
            'zones': 'Zones',
            'search_criteria': 'Critères de Recherche',
            'area_risks': 'Risques de Zone',
            'feasibility': 'Faisabilité:',
            'filter_by_department': 'Filtrer par Département',
            'loading_departments': 'Chargement des départements...',
            'error_loading_departments': 'Erreur lors du chargement des départements',
            'retry': 'Réessayer',
            'search_results': 'Résultats de Recherche',
            'search_radius': 'Rayon de Recherche',
            'search_location': 'Rechercher Localisation',
            'advanced_filters': 'Filtres Avancés',
            'basic_filters': 'Filtres de Base',
            'zone_infrastructure': 'Zone & Infrastructure',
            'zone_types': 'Types de Zone',
            'risk_viability': 'Risque & Faisabilité',
            'area_viability': 'Faisabilité de Zone',
            'area_range': 'Plage de Superficie',
            'railway_distance': 'Distance Ferroviaire',
            'search_commune_placeholder': 'Rechercher une commune...',
            'no_communes_found': 'Aucune commune trouvée',
            'type_to_search_communes': 'Tapez pour rechercher des communes',
            'search_location_address': 'Rechercher une adresse ou un lieu...',
            'enter_location': 'Entrer un lieu...',
            'no_locations_found': 'Aucun lieu trouvé',
            'type_to_search_locations': 'Tapez pour rechercher des lieux',
            'selected_location': 'Lieu Sélectionné',

            // Suitable Parcels List
            'failed_to_fetch_parcels': 'Échec de la récupération des parcelles appropriées',
            'filters_applied': 'filtres appliqués',
            'no_parcels_match_filters': 'Aucune parcelle ne correspond à vos filtres actuels',
            'try_adjusting_filters': 'Essayez d\'ajuster vos critères de filtre ou d\'actualiser pour voir toutes les parcelles disponibles',
            'clear_filters': 'Effacer les Filtres',
            'fly_to_parcel': 'Vol vers la parcelle',
            'load_more': 'Charger Plus',
            'parcels_loaded': 'parcelles chargées',
            'no_suitable_parcels_fallback': 'aucune parcelle appropriée trouvée',
            'no_parcels_found_in_area': 'Aucune parcelle trouvée dans cette zone',
            'try_different_location': 'Essayez de rechercher dans un autre lieu',

            // Risk Assessment Page
            'highly_suitable': 'Très Approprié',
            'moderately_suitable': 'Modérément Approprié',
            'not_suitable': 'Non Approprié',
            'back_to_dashboard': 'Retour au Tableau de Bord',
            'risk_assessment_dashboard': 'Tableau de Bord d\'Évaluation des Risques',
            'risk_assessment_description': 'Analyse complète des risques sismiques, d\'inondation et de stabilité du sol pour l\'implantation de datacenter',
            'real_time_analysis': 'Analyse en Temps Réel',
            'refresh': 'Actualiser',
            'calculating': 'Calcul en cours...',
            'risk_levels_analysis': 'Analyse des Niveaux de Risque',
            'current_risk_assessment': 'Évaluation des Risques Actuelle',
            'ground_stability': 'Stabilité du Sol',
            'earthquake_hazard_assessment': 'Évaluation des risques sismiques',
            'flooding_hazard_assessment': 'Évaluation des risques d\'inondation',
            'ground_stability_assessment': 'Évaluation de la stabilité du sol',
            'feasibility_score': 'Score de Faisabilité',
            'datacenter_suitability_score': 'Score de pertinence du datacenter (0-100)',
            'score_interpretation': 'Interprétation du Score',
            'highly_suitable_description': 'Très approprié pour le développement de datacenter',
            'moderately_suitable_description': 'Modérément approprié avec atténuation',
            'not_suitable_description': 'Non approprié pour le développement de datacenter',
            'parcel_statistics': 'Statistiques des Parcelles',
            'total_parcels_analyzed': 'Total des Parcelles Analysées',
            'suitability_rate': 'Taux de Pertinence',
            'analysis_location': 'Lieu d\'Analyse',
            'coordinates': 'Coordonnées',
            'error_loading_risk_metrics': 'Erreur lors du chargement des métriques de risque',

            // Risk Level Classes
            'low': 'Faible',
            'medium': 'Moyen',
            'high': 'Élevé',
            'critical': 'Critique',
            'unknown': 'Inconnu',
            'very_low': 'Très Faible',
            'extreme': 'Extrême',
            'no_flood_risk': 'Aucun Risque d\'Inondation',
            'low_risk': 'Faible Risque',
            'moderate_risk': 'Risque Modéré',
            'high_risk': 'Risque Élevé',
            'very_high_risk': 'Très Élevé Risque',
            'no_flood_zone_detected': 'Aucune zone d\'inondation détectée',
            'near_main_flood_zone': 'Près de la zone d\'inondation principale',
            'surface_water_runoff_zone': 'Zone de ruissellement des eaux de surface',
            'main_river_flood_zone': 'Zone d\'inondation principale du fleuve',
            'coastal_flood_zone': 'Zone d\'inondation côtière',
            'no_clay_swelling_risk': 'Aucun Risque de Gonflement d\'Argile',
            'clay_swelling_low': 'Faible risque',
            'clay_swelling_moderate': 'Risque modéré',
            'clay_swelling_high': 'Risque élevé',
            'clay_swelling_unknown': 'Risque inconnu',
            'no_clay_swelling_data': 'Aucune donnée de gonflement d\'argile disponible',
            'clay_swelling': 'Gonflement d\'Argile',
            'radon_risk': 'Risque Radon',
            'no_radon_risk': 'Aucun Risque Radon',
            'radon_class_1': 'Classe 1 (Faible)',
            'radon_class_2': 'Classe 2 (Moyen)',
            'radon_class_3': 'Classe 3 (Élevé)',
            'radon_risk_low': 'Faible concentration de radon',
            'radon_risk_medium': 'Concentration de radon modérée',
            'radon_risk_high': 'Forte concentration de radon',
            'slope_flat': 'Plat',
            'slope_gentle': 'Pente douce',
            'slope_moderate': 'Pente modérée',
            'slope_steep': 'Terrain pentu',
            'slope_very_steep': 'Terrain très pentu',
            'slope_unknown': 'Terrain inconnu',
            'risk_class_low': 'Faible Risque',
            'risk_class_medium': 'Risque Moyen',
            'risk_class_high': 'Risque Élevé',
            'seismic_risk_class': 'Classe de Risque Sismique',
            'flood_risk_class': 'Classe de Risque d\'Inondation',
            'stability_risk_class': 'Classe de Risque de Stabilité',
            'risk_class': 'Risque',
            'impact': 'Impact',
            'seismic': 'Sismique',

            // Datacenter Suitability
            'datacenter_suitability': 'Adéquation du Datacenter',
            'overall_assessment': 'Évaluation Globale',
            'excellent_suitability_description': 'Cette parcelle possède d\'excellentes caractéristiques pour le développement d\'un datacenter avec des scores élevés sur tous les indicateurs clés.',
            'good_suitability_description': 'Cette parcelle montre un bon potentiel pour le développement d\'un datacenter avec des caractéristiques modérées à bonnes.',
            'moderate_suitability_description': 'Cette parcelle présente certaines limitations mais peut être appropriée pour le développement d\'un datacenter avec des mesures d\'atténuation.',
            'poor_suitability_description': 'Cette parcelle présente des défis importants pour le développement d\'un datacenter et peut ne pas être recommandée.',

            // Industrial Risk
            'industrial_influence': 'Score d\'Impact du Risque Industriel',

            // Enhanced Industrial Risk Details
            'industrial_risk_details': 'Détails du Risque Industriel',
            'nearest_facility': 'Installation la Plus Proche',
            'seveso_classification': 'Classification Seveso',
            'activity_types': 'Types d\'Activités',
            'industry': 'Industrie',
            'nearby_facilities': 'installations à proximité',

            // Activity Type Translations
            'industrial': 'Industriel',
            'quarry': 'Carrière',
            'livestock': 'Élevage',
            'wind_turbine': 'Éolienne',

            // Basic Information
            'basic_information': 'Informations de Base',

            // Infrastructure Proximity Labels
            'electrical_infrastructure_proximity': 'Proximité des Infrastructures Électriques',
            'distance_to_nearest_electrical_line_enedis': 'Distance à la Ligne Électrique la Plus Proche (Enedis)',
            'nearest_line_type_voltage_installation': 'Type de Ligne la Plus Proche (Tension/Installation)',
            'distance_to_underground_high_voltage_line_hta': 'Distance à la Ligne Haute Tension Souterraine (HTA)',
            'distance_to_nearest_railway_fibre_line': 'Distance à la Ligne Ferroviaire/Fibre la Plus Proche',

            // Line Type Descriptions
            'low_voltage_aerial': 'Basse Tension, Aérien',
            'low_voltage_underground': 'Basse Tension, Souterrain',
            'high_voltage_aerial': 'Haute Tension, Aérien',
            'high_voltage_underground': 'Haute Tension, Souterrain',

            // Risk Analysis
            'risk_analysis': 'Analyse des Risques',

            // Map Legend
            'map_legend': 'Légende de la Carte',
            'default_view_color_mode': 'Défaut',
            'infrastructure_connectivity': 'Connectivité des Infrastructures',
            'combined_risk_assessment': 'Évaluation Combinée des Risques',
            'industrial_risk_influence': 'Influence du Risque Industriel',
            'power_infrastructure_proximity': 'Proximité des Infrastructures Électriques',
            'seismic_risk_zones': 'Zones de Risque Sismique',
            'seismic_zones': 'Zones Sismiques',
            'flood_risk_zones': 'Zones de Risque d\'Inondation',
            'plu_zone_types': 'Types de Zones PLU',
            'color_mode': 'Mode de couleur',
            'combined_seismic_flood_risk_description': 'Scores combinés de risque sismique et d\'inondation',
            'industrial_proximity_impact_description': 'Impact de la proximité industrielle sur les opérations du datacenter',
            'power_grid_proximity_description': 'Proximité des infrastructures du réseau électrique',

            // Placeholder for parcels list before search
            'drop_pin_or_search_to_view_parcels': 'Déposez une épingle ou faites une recherche pour voir les parcelles appropriées',
            'search_by_location_or_drop_pin_on_map': 'Recherchez par localisation ou déposez une épingle sur la carte pour commencer',

            // MVT Incident Types
            'rockfall': 'Chute de pierres',
            'landslide': 'Glissement de terrain',
            'subsidence': 'Affaissement',
            'debris_flow': 'Coulée de boue',
            'other': 'Autre',
            'unknown_type': 'Type inconnu',

            // Georisque Rapport Download
            'environmental_rapport': 'Rapport Environnemental',
            'download_rapport_for_coordinates': 'Télécharger le rapport environnemental pour ces coordonnées :',
            'download_georisque_rapport': 'Télécharger le rapport environnemental Georisque (PDF)',
            'download_rapport': 'Télécharger le Rapport',
            'downloading': 'Téléchargement...',
            'invalid_coordinates': 'Coordonnées invalides',
            'download_failed': 'Échec du téléchargement',
            'download_timeout': 'Délai de téléchargement dépassé',
            'no_rapport_found': 'Aucun rapport disponible pour cette localisation',
            'too_many_requests': 'Trop de requêtes, veuillez réessayer plus tard',
            'server_error': 'Erreur serveur, veuillez réessayer plus tard',
            'no_pdf_available': 'Aucun PDF disponible depuis le serveur',
            'rapport_downloaded_successfully': 'Rapport téléchargé avec succès',

            // Georisques Risk Categories
            'natural_risks_georisques': 'Risques Naturels (Georisques)',
            'technological_risks_georisques': 'Risques Technologiques (Georisques)',
            'present_risks': 'risques présents',
            'no_risk': 'Aucun Risque',
            'no_risk_detected': 'Aucun risque détecté',
            'risk_present': 'Risque présent',
            'all_risks_in_natural_section': 'Tous les risques naturels et géologiques sont maintenant affichés dans la section Risques Naturels ci-dessous.',

            // Ruler and Buffer Zone Tools
            'ruler_tool': 'Outil de Mesure',
            'buffer_zone': 'Zone Tampon',
            'place_buffer_here': 'Cliquez sur la Carte pour Placer la Zone',
            'clear_buffer_location': 'Effacer l\'Emplacement de la Zone',
            'follow_search_location': 'Suivre la Localisation de Recherche',
            'manual_placement': 'Placement Manuel',
            'buffer_follows_search_pin': 'La zone tampon suit la recherche/pin',
            'click_to_measure': 'Cliquez pour mesurer les distances',
            'click_two_points': 'Cliquez 2 points pour mesurer',
            'click_path_points': 'Cliquez des points pour créer un chemin',
            'first_point_placed': 'Premier point placé',
            'measurements': 'mesures',
            'measurement': 'Mesure',
            'points': 'points',
            'buffer_radius': 'Rayon de la Zone',
            'circumference': 'Circonférence',

            // Parcels Section
            'show_parcels': 'Afficher les Parcelles',
            'parcel_color_mode': 'Mode Couleur',
            'parcel_mode_default': 'Défaut',
            'parcel_mode_plu': 'PLU',
            'parcel_mode_risk': 'Risque',

            // Settings Section
            'layer_settings': 'Paramètres',
            'risk_trackers_toggle': 'Suiveurs de Risque',

            // PLU Urban Planning Section
            'urban_planning': 'Urbanisme',
            'plu_layers': 'Couches PLU',
            'zoning_sectors': 'Secteurs de Zonage',
            'planning_prescriptions': 'Prescriptions d\'Urbanisme',
            'planning_information': 'Informations d\'Urbanisme',

            // DVF (Demande de Valeur Foncière) Section
            'dvf': 'DVF - Transactions Immobilières',
            'dvf.title': 'Transactions Immobilières',
            'dvf_transactions': 'transactions',
            'dvf.transactions': 'transactions',
            'dvf.no_transactions': 'Aucune transaction immobilière trouvée',
            'dvf.refresh': 'Actualiser les données',
            'dvf.source': 'Source : {{source}}',
            'dvf.error.fetch': 'Échec de la récupération des données de transaction',
            'dvf.error.unknown': 'Erreur inconnue',
            'dvf.not_specified': 'Non spécifié',
            'dvf.nature.sale': 'Vente',
            'dvf.nature.exchange': 'Échange',
            'dvf.nature.donation': 'Donation',
            'dvf.nature.inheritance': 'Succession',
            'dvf.nature.adjudication': 'Adjudication',
            'dvf.type.house': 'Maison',
            'dvf.type.apartment': 'Appartement',
            'dvf.type.dependency': 'Dépendance',
            'dvf.type.industrial': 'Local industriel',
            'dvf.type.commercial': 'Local commercial',
            'dvf.type.land': 'Terrain',
            'dvf.placeholder': 'Cliquez sur une parcelle pour voir ses transactions associées',

            // Demo Mode
            'demo_mode_not_functional': 'Mode Démo - Non Fonctionnel'
        }
    }
};

// Initialize i18n asynchronously to avoid blocking
export const initI18n = async () => {
    // Get saved language preference or use default
    const savedLanguage = localStorage.getItem('caelus_language') as 'fr' | 'en' | null;
    const initialLanguage = savedLanguage || 'fr';

    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: initialLanguage, // use saved language or default French
            fallbackLng: 'fr',
            interpolation: {
                escapeValue: false, // react already safes from xss
            },
            debug: import.meta.env.DEV,
            // Async loading options to prevent blocking
            initImmediate: false,
        });
    return i18n;
};

// Synchronous initialization for fallback (only if needed)
const savedLanguage = localStorage.getItem('caelus_language') as 'fr' | 'en' | null;
const initialLanguage = savedLanguage || 'fr';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: initialLanguage, // use saved language or default French
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false,
        },
        debug: import.meta.env.DEV,
        initImmediate: true, // Allow async initialization
    });

export default i18n;