import { OAuth2Client } from 'google-auth-library';

export const createGoogleClient = () => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error("Google Client ID not configured");
    }
    return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
};

export const verifyGoogleToken = async (token) => {
    try {
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const payload = await response.json();

        if (!payload || !payload.email) {
            throw new Error("Invalid Google Token");
        }

        return payload;
    } catch (error) {
        throw new Error(`Google token verification failed: ${error.message}`);
    }
};
