import { Router } from 'express';
import { UserRole } from '../database/database.type';
import { supabase } from '../database/database';

const usersRouter = Router();

// Verify if a user is an admin
usersRouter.get('/verify-admin', async (req, res) => {
  try {
    const walletAddress = req.query.wallet as string;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        isAdmin: false, 
        message: 'Wallet address is required' 
      });
    }
    
    // Query the users table to check if the wallet address has admin role
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress);
      
    if (error) {
      console.error('Error verifying admin status:', error);
      return res.status(500).json({ 
        success: false, 
        isAdmin: false, 
        message: 'Failed to verify admin status' 
      });
    }
    
    // Check if user exists and has admin role
    const isAdmin = data && data.length > 0 && data[0].role === UserRole.ADMIN;
    
    return res.status(200).json({
      success: true,
      isAdmin,
      message: isAdmin ? 'User is an admin' : 'User is not an admin'
    });
    
  } catch (error) {
    console.error('Unexpected error verifying admin status:', error);
    return res.status(500).json({ 
      success: false, 
      isAdmin: false, 
      message: 'An unexpected error occurred' 
    });
  }
});

export default usersRouter; 