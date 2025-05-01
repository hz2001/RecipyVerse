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

export default {
    uploadFile
}