import cors from 'cors';

import dotenv from 'dotenv';
import express from 'express';

import UserRouter from "./user/user.router";
import WalletRouter from './wallet/wallet.router';
import ContractRouter from "./contract/contract.router";
import MerchantRouter from "./merchant/merchant.router";

import {deployContract} from "./utils/deployNFTFactory";
import {updateSessionIds} from "./utils/utils";



dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use("/wallet",WalletRouter)
app.use("/contract",ContractRouter)
app.use("/merchant", MerchantRouter)
app.use("/user", UserRouter)

async function main() {
    await deployContract();

    setInterval(updateSessionIds, 1000 * 60 * 15)

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