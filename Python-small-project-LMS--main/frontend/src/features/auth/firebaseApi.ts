import api from '../../lib/api';

/**
 * Send a Firebase ID token to the backend for verification.
 * The backend returns an existing app JWT + local user object.
 * We store only the app JWT — not the Firebase token.
 */
export async function firebaseLogin(idToken: string) {
  try {
    const response = await api.post(
      '/auth/firebase-login',
      { id_token: idToken },
      { timeout: 15000 }
    );
    return response.data as {
      access_token: string;
      token_type: string;
      user: {
        id: number;
        email: string | null;
        full_name: string;
        role: string;
        is_active: boolean;
        created_at: string;
        firebase_uid: string | null;
        auth_provider: string | null;
        phone_number: string | null;
        photo_url: string | null;
        email_verified: boolean;
      };
    };
  } catch (error: any) {
    if (error.response) {
      const detail = error.response.data?.detail || error.response.data?.message || 'Authentication failed.';
      throw new Error(detail);
    } else if (error.request || error.message === 'Network Error') {
      throw new Error('Network Error');
    } else {
      throw new Error(error.message || 'Authentication failed.');
    }
  }
}
