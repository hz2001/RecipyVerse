import express from 'express';
import ContractService from "./contract.service";
import {checkRole} from "../authorization/auth.middleware";


const Router = express.Router();



Router.get('/get_nft_factory_abi',checkRole(),ContractService.getNFTFactoryContractAbi )

Router.get('/get_nft_coupon_abi',checkRole(),ContractService.getNFTCouponContractAbi )

Router.get('/get_nft_swap_abi',checkRole(),ContractService.getNFTSwapContractAbi )




export default Router;