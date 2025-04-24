import express from 'express';
import multer from 'multer';
import MerchantService from "./merchant.service";
import {checkRole} from "../authorization/auth.middleware";



const Router = express.Router();
const upload = multer();

/**
 * POST: Upload merchant's qualification
 */
Router.post('/upload_qualification', checkRole("merchant"), upload.single("file"),  MerchantService.uploadQualification)

Router.get('/my_nft_contracts', checkRole("merchant"), MerchantService.getAllContracts)

Router.get('/get_unverify_qualification',checkRole("admin"),MerchantService.getAllContracts)

export default Router;

