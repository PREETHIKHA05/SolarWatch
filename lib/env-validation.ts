// Environment variable validation utility
export function validateEnvironment() {
  const requiredEnvVars = [
    'MONGO_URI',
    'OPENAI_API_KEY',
    'WEATHER_API_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  // Validate MongoDB URI format
  const mongoUri = process.env.MONGO_URI!;
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MONGO_URI format. Must start with mongodb:// or mongodb+srv://');
  }

  console.log('✅ Environment variables validated successfully');
}

// Validate on import in development
if (process.env.NODE_ENV === 'development') {
  try {
    validateEnvironment();
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    console.log('📝 Please copy .env.example to .env.local and fill in your values');
  }
}