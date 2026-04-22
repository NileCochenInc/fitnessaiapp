import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

/**
 * Azure Key Vault configuration for retrieving test credentials
 * Supports both environment variables and Azure Key Vault
 */

interface VaultSecrets {
  prodAppUrl: string;
  testUserEmail: string;
  testUserPassword: string;
}

let cachedSecrets: VaultSecrets | null = null;

/**
 * Get secrets from Azure Key Vault or environment variables
 * Priority: Environment variables > Azure Key Vault > Error
 */
export async function getSecrets(): Promise<VaultSecrets> {
  // Return cached secrets if already fetched
  if (cachedSecrets) {
    return cachedSecrets;
  }

  // Try environment variables first
  const envUrl = process.env.PROD_APP_URL;
  const envEmail = process.env.TEST_USER_EMAIL;
  const envPassword = process.env.TEST_USER_PASSWORD;

  if (envUrl && envEmail && envPassword) {
    console.log('✓ Secrets loaded from environment variables');
    cachedSecrets = {
      prodAppUrl: envUrl,
      testUserEmail: envEmail,
      testUserPassword: envPassword,
    };
    return cachedSecrets;
  }

  // Try Azure Key Vault
  const vaultUrl = process.env.AZURE_KEYVAULT_URL;
  if (!vaultUrl) {
    throw new Error(
      'Missing secrets. Set environment variables or AZURE_KEYVAULT_URL. ' +
      'Required: PROD_APP_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD'
    );
  }

  console.log(`Fetching secrets from Key Vault: ${vaultUrl}`);

  try {
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(vaultUrl, credential);

    const [urlSecret, emailSecret, passwordSecret] = await Promise.all([
      client.getSecret('PROD-APP-URL'),
      client.getSecret('TEST-USER-EMAIL'),
      client.getSecret('TEST-USER-PASSWORD'),
    ]);

    cachedSecrets = {
      prodAppUrl: urlSecret.value || '',
      testUserEmail: emailSecret.value || '',
      testUserPassword: passwordSecret.value || '',
    };

    console.log('✓ Secrets loaded from Azure Key Vault');
    return cachedSecrets;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to retrieve secrets from Key Vault: ${errorMsg}\n` +
      'Fallback to environment variables: PROD_APP_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD'
    );
  }
}

/**
 * Validate that all required secrets are present
 */
export async function validateSecrets(): Promise<void> {
  const secrets = await getSecrets();
  const missing = [];

  if (!secrets.prodAppUrl) missing.push('PROD_APP_URL');
  if (!secrets.testUserEmail) missing.push('TEST_USER_EMAIL');
  if (!secrets.testUserPassword) missing.push('TEST_USER_PASSWORD');

  if (missing.length > 0) {
    throw new Error(`Missing required secrets: ${missing.join(', ')}`);
  }

  console.log(`✓ All secrets validated. App URL: ${secrets.prodAppUrl}`);
}
