import express from 'express';
import { AdminService } from './admin.service';
import { checkRole } from '../authorization/auth.middleware';

const Router = express.Router();

/**
 * GET: Verify if a user is an admin
 */
Router.get('/verify', checkRole(), async (req, res) => {
  try {
    const sessionId = req.query.sessionId as string;
    const isAdmin = await AdminService.verifyAdminBySessionId(sessionId);
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'User does not have admin permissions'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User has admin permissions'
    });
  } catch (error) {
    console.error('Error in admin verification:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while verifying admin status'
    });
  }
});

export default Router; 