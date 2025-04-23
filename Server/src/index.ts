import cors from 'cors';

import dotenv from 'dotenv';
import express from 'express';

import WalletRouter from './wallet/wallet.router';
import ContractRouter from "./contract/contract.router";

import {deployContract} from "./utils/deployNFTFactory";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use("/wallet",WalletRouter)
app.use("/contract",ContractRouter)

async function main() {
    await deployContract();
    try {
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

main();