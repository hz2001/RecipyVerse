import express from 'express';
import multer from 'multer';
import MerchantService from "./merchant.service";
import {isAdmin, isMerchant} from "../authorization/auth.middleware";



const Router = express.Router();
const upload = multer();

/**
 * POST: Upload merchant's qualification
 */
Router.post('/upload_qualification', isMerchant(), upload.single("file"),  MerchantService.uploadQualification)

Router.get('/my_nft_contracts', isMerchant(), MerchantService.getAllContracts)

Router.get('/get_unverify_qualification',isAdmin(),MerchantService.getAllContracts)

export default Router;

