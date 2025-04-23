import {supabase} from "./database";





interface VerifyMessage {
    message: string;
    address: string;
}

export async function getVerifyMessage(address: string){
    try {
        const { data, error } = await supabase
            .from('verify_message')
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
        .from('verify_message')
        .upsert(
            { address: account, message },
            { onConflict: 'address' }
        );
    return error ? null : data;
}

export default {
    getVerifyMessage,
    updateVerifyMessage
}