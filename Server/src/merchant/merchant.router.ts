import express from 'express';
import multer from 'multer';
import MerchantService from "./merchant.service";
import {checkRole} from "../authorization/auth.middleware";


const Router = express.Router();
const upload = multer();

/**
 * POST: Upload merchant's qualification
 */
Router.post('/upload_qualification', checkRole(), upload.single("file"), MerchantService.uploadQualification)

Router.get('/my_nft_contracts', checkRole("merchant"), MerchantService.getAllContracts)

Router.get('/get_merchant_detail', checkRole('merchant'), MerchantService.getInfoBySessionId)

export default Router;

