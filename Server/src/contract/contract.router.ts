import express from 'express';
import ContractService from "./contract.service";


const Router = express.Router();



Router.get('/get_abi',ContractService.getContractAbi )






export default Router;