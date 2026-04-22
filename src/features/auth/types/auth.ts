export interface UserFeatures {
  has_railway_distance_feature: boolean;
  has_enedis_feature: boolean;
  has_rte_feature: boolean;
  has_plu_feature: boolean;
  has_georisques_feature: boolean;
  has_pci_feature: boolean;
  has_bdtopo_feature: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  features: UserFeatures;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
