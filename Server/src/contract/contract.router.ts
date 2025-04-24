import express from 'express';
import ContractService from "./contract.service";
import {checkRole} from "../authorization/auth.middleware";


const Router = express.Router();



Router.get('/get_abi',checkRole(),ContractService.getContractAbi )






export default Router;