import { fetchAuthSession } from 'aws-amplify/auth';
import API_ENDPOINTS from '../config/endpoints';

export async function redeemPromoCode(code: string): Promise<{
  success: boolean;
  bonusAmount?: number;
  newBalance?: number;
  message?: string;
  error?: string;
}> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(API_ENDPOINTS.redeemPromo, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ promoCode: code })
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.error || 'Failed to redeem code' 
      };
    }

    return {
      success: true,
      bonusAmount: data.bonusAmount,
      newBalance: data.newBalance,
      message: data.message
    };

  } catch (error) {
    console.error('Promo code redemption error:', error);
    return { 
      success: false, 
      error: 'Network error. Please try again.' 
    };
  }
}
