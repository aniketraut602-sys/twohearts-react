require('dotenv').config();

/**
 * Validates that all required environment variables are set
 * Throws an error if any required variables are missing
 */
function validateEnv() {
    const required = ['JWT_SECRET'];
    const missing = [];

    for (const varName of required) {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file or environment configuration.'
        );
    }

    // Warn about insecure defaults
    if (process.env.NODE_ENV === 'production') {
        if (process.env.JWT_SECRET === 'dev_secret' ||
            process.env.JWT_SECRET === 'your_super_secret_jwt_key_change_this_in_production') {
            throw new Error(
                'SECURITY ERROR: You must set a strong JWT_SECRET in production!\n' +
                'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
            );
        }

        if (process.env.JWT_SECRET.length < 32) {
            console.warn('WARNING: JWT_SECRET should be at least 32 characters long for production use');
        }
    }

    console.log('✓ Environment variables validated successfully');
}

module.exports = { validateEnv };
