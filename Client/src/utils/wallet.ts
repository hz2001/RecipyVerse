import "../types/global.d"

export async function connectMetaMask(): Promise<string | null> {
    if (!window.ethereum) {
        alert("You need MetaMask to use this app.");
        return null;
    }

    try {
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        return accounts[0];
    } catch (error) {
        console.error("Connection ERROR:", error);
        return null;
    }
}

export async function verifyWithSignature(account: string) {
    const res = await fetch(`/api/wallet/get_verify_message?address=${account}`)
    const message = await res.text();

    const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
    });

    try {
        await fetch("/api/wallet/verify_signature", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sign: signature,
                account: account
            })
        }).then(res => {
            return res.status === 200;
        });

    }catch (e) {
        console.log(e);
        return false;
    }
}