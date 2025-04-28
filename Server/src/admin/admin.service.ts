import { supabase } from '../database/database';
import { UserRole } from '../database/database.type';
import { getAddressBySessionId } from '../database/database.service';

export class AdminService {
  /**
   * Verify if a user is an admin based on their session ID
   * @param sessionId The session ID to verify
   * @returns Promise<boolean> True if the user is an admin, false otherwise
   */
  static async verifyAdminBySessionId(sessionId: string): Promise<boolean> {
    try {
      // First get the wallet address from the session ID
      const walletAddress = await getAddressBySessionId(sessionId);
      
      if (!walletAddress) {
        console.error('No wallet address found for session ID:', sessionId);
        return false;
      }
      
      // Query the users table to check if the wallet address has admin role
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('wallet_address', walletAddress)
        .single();
        
      if (error) {
        console.error('Error verifying admin status:', error);
        return false;
      }
      
      // Check if user exists and has admin role
      return data && data.role === UserRole.ADMIN;
      
    } catch (error) {
      console.error('Unexpected error verifying admin status:', error);
      return false;
    }
  }
} 