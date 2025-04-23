
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import GenerateCouponContractPage from "./pages/generateContract";
import {connectMetaMask, verifyWithSignature} from "./utils/wallet.ts";



function App() {

    const callSignETH = async () => {
        const address = await connectMetaMask();
        if(address){
            await verifyWithSignature(address);
        }
    }
    return(
        <Router>
          <div className="">
            <div><button onClick={callSignETH}></button></div>
          <Routes>
            <Route path="/" element={<div>hello</div>} />
            <Route path="/contract" element={<GenerateCouponContractPage />} />
            <Route path="/nft" element={<div>NFT</div>} />
            <Route path="/nft/create" element={<div>Create NFT</div>} />
          </Routes>
          </div>
        </Router>
    )

}

export default App;