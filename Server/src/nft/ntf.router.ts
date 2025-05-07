import express from 'express';
import {checkRole} from "../authorization/auth.middleware";
import nftService from "./nft.service";
import multer from 'multer';

const Router = express.Router();
const upload = multer();

Router.post('/create_nft', checkRole('merchant',true), upload.single("file"), nftService.createNFT )

Router.put('/update/:id', checkRole(), upload.single("file"), nftService.updateNFT)

Router.get("/get_swapping", checkRole(), nftService.getAllPendingSwapping)

Router.get("/get_all", checkRole(), nftService.getAllNFTs)

Router.put('/swap_nft', checkRole(), upload.none(), nftService.swapOwner)

export default Router;