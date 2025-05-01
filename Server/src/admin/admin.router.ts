import express from 'express';
import {checkRole} from "../authorization/auth.middleware";
import adminService from "./admin.service";
import multer from "multer";



const Router = express.Router();
const upload = multer();

Router.get('/get_all_users', checkRole('admin'), adminService.getAllUsers)

Router.get('/get_all_merchants', checkRole('admin'), adminService.getAllMerchants)

Router.get('/get_all_nfts', checkRole('admin'), adminService.getAllNFTs)

Router.get('/get_all_files', checkRole('admin'), adminService.getAllFiles)

Router.post('/update_merchant', checkRole('admin'), adminService.updateMerchant)

Router.post('/update_nft', checkRole('admin'), adminService.updateNFT)

Router.post('/update_user', checkRole('admin'), adminService.updateUser)

Router.post('/update_file', checkRole('admin'), upload.single('file'), adminService.updateFile)

export default Router;