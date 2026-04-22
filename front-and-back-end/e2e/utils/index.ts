import { getSecrets, validateSecrets } from './vault-config';
import { loginTestUser, resetTestUserData, logoutTestUser } from './test-user';
import {
  createDummyWorkouts,
  createDummyWorkoutsViaAPI,
  verifyStatsPopulated,
  getStatsDataFromAPI,
} from './test-data';

export {
  // Vault
  getSecrets,
  validateSecrets,
  // User management
  loginTestUser,
  resetTestUserData,
  logoutTestUser,
  // Test data
  createDummyWorkouts,
  createDummyWorkoutsViaAPI,
  verifyStatsPopulated,
  getStatsDataFromAPI,
};
