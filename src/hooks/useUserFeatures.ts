import { useAuth } from '../context/AuthContext';
import type { UserFeatures } from '../types/auth';

export const useUserFeatures = (): UserFeatures & { hasRailwayDistanceFeature: () => boolean } => {
  const { user } = useAuth();

  // Default features for unauthenticated users
  const defaultFeatures: UserFeatures = {
    has_railway_distance_feature: false,
    has_enedis_feature: false,
    has_rte_feature: false,
    has_plu_feature: false,
    has_georisques_feature: false,
    has_pci_feature: false,
    has_bdtopo_feature: false,
  };

  const features = user?.features || defaultFeatures;

  // Debug logging
  console.log('🔍 useUserFeatures Debug:', {
    user: user,
    features: features,
    hasRailwayFeature: features.has_railway_distance_feature,
    isAuthenticated: !!user
  });

  const hasRailwayDistanceFeature = (): boolean => {
    const result = features.has_railway_distance_feature;
    console.log('🚂 hasRailwayDistanceFeature called:', result);
    return result;
  };

  return {
    ...features,
    hasRailwayDistanceFeature,
  };
};
