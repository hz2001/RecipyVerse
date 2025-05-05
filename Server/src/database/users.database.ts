import {supabase} from "./database";
import {User, UserRole} from "./database.type";

export async function getUserRole(address: string) {
    const {data: user} = await supabase
        .from('users')
        .select(`*`)
        .eq('wallet_address', address);
    return user && user.length > 0 ? user[0].role : UserRole.USER;
}

export async function updateUser(address: string, role: UserRole = UserRole.USER) {
    let {data} = await supabase
        .from('users')
        .select(`*`)
        .eq('wallet_address', address);
    const user = data && data.length > 0 ? data[0] as User : null;

    if (user) {
        role = (user.role != UserRole.USER) ? user.role : role;
    }

    let {error} = await supabase
        .from('users')
        .upsert({
            wallet_address: address, role: role
        })

    if (error) {
        console.error('Error on update user:', error);
        return {success: false, message: error.message};
    }
    return {success: true, message: "Success"};
}

export async function deleteUser(address: string) {
    const {error: userError} = await supabase
        .from('users')
        .delete()
        .eq('wallet_address', address);
    if (userError) {
        console.error('Error on delete user:', userError);
        return {success: false, message: userError.message};
    }

    const {error: verifyError} = await supabase
        .from('verification')
        .delete()
        .eq('address', address);
    if (verifyError) {
        console.error('Error on delete verify:', verifyError);
        return {success: false, message: verifyError.message};
    }
    return {success: true, message: "Success"};
}

export async function getUserInfo(address: string) {
    const {data, error} = await supabase
        .from('users')
        .select(`*`)
        .eq('wallet_address', address);
    return data && data.length > 0 ? data[0] as User : null;
}

export default {
    getUserRole,
    updateUser,
    deleteUser,
    getUserInfo
}