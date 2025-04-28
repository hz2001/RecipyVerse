import "../types/global.d";
import {BigNumberish, ethers} from "ethers";
import * as React from "react";
import {useState} from "react";
import {connectMetaMask} from "../utils/wallet";


const GenerateCouponContractPage = () => {
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [maxSupply, setMaxSupply] = useState(0);
    const [expirationDate, setExpirationDate] = useState<Date>(new Date());
    const [contractAddress, setContractAddress] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await deployContract(name, symbol, maxSupply, expirationDate.getTime());
    };

    return (
        <div>
            <button onClick={
                connectMetaMask
            }>Connect MetaMask</button>
            <form onSubmit={handleSubmit}>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name"/>
                <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol"/>
                <input type="number" value={maxSupply} onChange={(e) => setMaxSupply(Number(e.target.value))}
                       placeholder="Max Supply"/>
                <input type="date" value={expirationDate.toISOString().split('T')[0]}
                       onChange={(e) => setExpirationDate(new Date(e.target.value))}/>
                <button type="submit">Generate</button>
            </form>
            <button onClick={
                async () => {
                    const address = await getContractAddress();
                    setContractAddress(address);
                    console.log(address);
                }
            }>Get Contract Address</button>
            {contractAddress && <div>Contract Address: {contractAddress}</div>}
        </div>
    )
}

async function deployContract(name: string, symbol: string, maxSupply: BigNumberish, expirationDate: BigNumberish) {
    const res = await fetch("/api/contract/get_abi");
    const {abi, address} = await res.json();

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(address, abi, signer);

    try {
        const tx = await contract.deployCollection(name, symbol, maxSupply, expirationDate);
        const receipt = await tx.wait();
        return receipt.logs[1].args[1];
    } catch (error) {
        console.error("Error deploying contract:", error);
    }
}

async function getContractAddress() {
    const res = await fetch("/api/contract/get_abi");
    const {abi, address} = await res.json();

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(address, abi, signer);

    try {
        const address = await signer.getAddress();
        const collections = await contract.getCollectionsByOwner(address);
        console.log("Contract deployed to:", collections);
        return collections;
    } catch (error) {
        console.error("Error deploying contract:", error);
    }
}



export default GenerateCouponContractPage;