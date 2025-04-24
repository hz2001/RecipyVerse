import {supabase} from "./database";
import {User, UserRole, Verification, VerifyMessage} from "./database.type";

export async function getVerifyMessage(address: string){
    try {
        const { data, error } = await supabase
            .from('verification')
            .select("*")
            .eq('address', address);

        if (error) {
            console.error('Error:', error);
            return "";
        }

        const messages = data as VerifyMessage[];
        return messages && messages.length > 0 ? messages[0].message : "";
    } catch (e) {
        console.error('Error:', e);
        return "";
    }
}

export async function updateVerifyMessage(message: string, account: string){
    const { data, error } = await supabase
        .from('verification')
        .upsert(
            { address: account, message },
            { onConflict: 'address' }
        );
    return error ? null : data;
}

export async function getRole(sessionId:string){
    try{
        const { data, error } = await supabase
            .from('verification')
            .select(`*,
            users:address (role)`)
            .eq('session_id', sessionId);

        if (error) {
            console.error('Error:', error);
            return UserRole.USER;
        }
        return data && data.length > 0 ? data[0].users.role : UserRole.USER;

    }catch(e){
        console.error('Error:', e);
        return UserRole.USER;
    }
}

export async function login(address: string){

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    const { data, error } = await supabase
        .from('verification')
        .upsert({ address, session_id: sessionId, expire_at: expiresAt }, { onConflict: 'address'})
    try{

        await supabase
            .from('users')
            .upsert({ wallet_address: address}, { onConflict: 'wallet_address' })
    }catch(e){
        console.error('Error on login:', e);
    }
    return error ? null : sessionId;
}

export async function getAddressBySessionId(sessionId: string){
    const { data, error } = await supabase
    .from('verification')
    .select(`*`)
    .eq('session_id', sessionId);
    return error ? null : data && data.length > 0 ? data[0].address : null;
}

export async function uploadFile(address: string, file: Express.Multer.File){
    try{
        const { data, error } = await supabase.storage
            .from('merchantlicense')
            .upload(`${address}/license`,file.buffer, {
                contentType: file.mimetype,
                upsert: true
            })
        if(error){
            console.error('Error on upload:', error);
            return false;
        }
        return true;
        }catch(e){
            console.error('Error on upload:', e);
            return false;
    }
}

export async function updateMerchant(merchantName: string, merchantAddress: string, address: string){
    try{
        const {data, error} = await supabase
            .from('merchants')
            .upsert({
                merchant_name: merchantName,
                merchant_address: merchantAddress,
                wallet_address: address,
                is_verified: false,
            })
        if(error){
            console.error('Error on update merchant:', error);
            return false;
        }
        return true;
    }catch(e){
        console.error('Error on update merchant:', e);
        return false;
    }
}

export async function isSessionValid(sessionId: string){
    const {data, error} = await supabase
        .from('verification')
        .select(`*`)
        .eq('session_id', sessionId);

    if(error){
        return false;
    }
    if(data && data.length > 0){
        const verification = data[0] as Verification;
        const expiresAt = new Date(verification.expire_at);
        const now = new Date();
        return now < expiresAt;
    }
    return false;
}


export default {
    getVerifyMessage,
    updateVerifyMessage,
    getRole,
    login,
    getAddressBySessionId,
    uploadFile,
    updateMerchant,
    isSessionValid
}