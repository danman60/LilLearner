import { FEATURES, FeatureKey } from '../config/features';

/**
 * Check if a feature is enabled.
 * Reads from static config now; will read from DB user preferences later.
 */
export function isEnabled(key: FeatureKey): boolean {
  return FEATURES[key];
}
