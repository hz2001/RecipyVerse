import express from 'express';
import {checkRole} from "../authorization/auth.middleware";
import UserService from "./user.service";

const Router = express.Router();



Router.get('/get_info', checkRole(), UserService.getUserInfo)

Router.get('/get_nfts',checkRole(), UserService.getAllNFTs)

Router.get('/get_nft_detail/:nftId', checkRole(), UserService.getDetailedNFT)








export default Router;