import express from 'express';
import {checkRole} from "../authorization/auth.middleware";
import nftService from "./nft.service";

const Router = express.Router();

Router.post('/create_nft', checkRole('merchant',true), nftService.createNFT )




export default Router;