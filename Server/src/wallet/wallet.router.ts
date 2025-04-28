import express from 'express';
import WalletService from "./wallet.service";


const Router = express.Router();


/**
 * GET: Generate Timestamp for signature
 */
Router.get('/get_verify_message', WalletService.sendTimeStamp)

/**
 * POST: Verify signature
 */
Router.post("/verify_signature", WalletService.verifyCheck)


export default Router;