import {supabase} from "./database";


export async function uploadFile(address: string, file: Express.Multer.File, fileName: string) {
    const {error} = await supabase.storage
        .from('files')
        .upload(`${address}/${fileName}`, file.buffer, {
            contentType: file.mimetype, upsert: true
        })

    if (error) {
        console.error('Error on upload:', error);
        return {success: false, message: error.message};
    }
    return {success: true, message: "Success"};
}

export async function getFile(address: string, fileName: string) {
    const {data, error} = await supabase.storage
        .from('files')
        .download(`${address}/${fileName}`);
    if (error) {
        console.error('Error on download:', error);
        return {success: false, message: error.message};
    }
    return {success: true, data: data};
}

export async function getFileUrl(address: string, fileName: string) {
    const { data, error } = await supabase
        .storage
        .from('files')
        .createSignedUrl(`${address}/${fileName}`, 60 * 60);

    if (error || !data || !data.signedUrl) {
        return { success: false, data: null };
    }

    return { success: true, data: data.signedUrl };
}
export default {
    uploadFile,
    getFile,
    getFileUrl
}