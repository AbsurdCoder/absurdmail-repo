/**
 * Environment configuration
 * Validates and exports all environment variables
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const config = {
  // App
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  appName: getEnvVar('NEXT_PUBLIC_APP_NAME', 'AbsurdLabs'),
  
  // Database
  mongodbUri: getEnvVar('MONGODB_URI'),
  redisUrl: getEnvVar('REDIS_URL'),
  
  // Auth
  jwtSecret: getEnvVar('JWT_SECRET'),
  jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
  bcryptRounds: parseInt(getEnvVar('BCRYPT_ROUNDS', '12')),
  
  // Email
  emailFrom: getEnvVar('EMAIL_FROM', 'noreply@absurdlabs.io'),
  smtpHost: getEnvVar('SMTP_HOST'),
  smtpPort: parseInt(getEnvVar('SMTP_PORT', '587')),
  smtpUser: getEnvVar('SMTP_USER'),
  smtpPass: getEnvVar('SMTP_PASS'),
  
  // Google Cloud Storage
  gcsProjectId: getEnvVar('GCS_PROJECT_ID'),
  gcsBucketName: getEnvVar('GCS_BUCKET_NAME'),
  gcsKeyFile: process.env.GCS_KEY_FILE,
  gcsCredentialsJson: process.env.GCS_CREDENTIALS_JSON,
  
  // Rate Limiting
  rateLimitMax: parseInt(getEnvVar('RATE_LIMIT_MAX', '100')),
  rateLimitWindow: parseInt(getEnvVar('RATE_LIMIT_WINDOW', '900000')), // 15 minutes
  
  // Feature flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;
