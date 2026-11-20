import { WorkerEnv } from '../types';

export interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(
  token: string,
  env: WorkerEnv,
  clientIp?: string
): Promise<{ success: boolean; error?: string }> {
  // If no token is provided
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return { success: false, error: 'Verification token is missing' };
  }

  const secret = env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

  // Allow test key pass-through in local development if offline or using dummy test tokens
  if (token === 'TEST_PASS_TOKEN' && env.ENVIRONMENT === 'development') {
    return { success: true };
  }

  try {
    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);
    if (clientIp) {
      formData.append('remoteip', clientIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to communicate with bot verification service' };
    }

    const result = (await response.json()) as TurnstileVerifyResponse;

    if (result.success) {
      return { success: true };
    }

    const errorCodes = result['error-codes']?.join(', ') || 'Verification failed';
    return {
      success: false,
      error: `Security verification failed: ${errorCodes}`,
    };
  } catch (err) {
    console.error('Turnstile verification error:', err);
    // In dev environment with network failure to Cloudflare, allow graceful fallback if using test secret
    if (env.ENVIRONMENT === 'development' && secret.startsWith('1x0000000000')) {
      return { success: true };
    }
    return { success: false, error: 'Error validating security challenge. Please try again.' };
  }
}
