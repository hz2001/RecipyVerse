import path from "node:path";
import * as fs from "node:fs";
import {supabase} from "../database/database";


export function updateEnv(key: string, value: string) {
    const envPath = path.resolve(__dirname, "../.env");
    let envConfig = "";
    if (fs.existsSync(envPath)) {
        envConfig = fs.readFileSync(envPath, "utf8");
        if (envConfig.includes(`${key}=`)) {
            envConfig = envConfig.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
        } else {
            envConfig += `\n${key}=${value}\n`;
        }
    } else {
        envConfig = `${key}=${value}\n`;
    }
    fs.writeFileSync(envPath, envConfig);
}

export async function updateSessionIds() {
    console.log("Cleaning up expired session_id");
    const now = new Date().toISOString();

    const {error} = await supabase
        .from('verification')
        .delete()
        .lt('expire_at', now);

    if (error) {
        console.error('Failed delete expired session_id:', error.message);
    } else {
        console.log('Cleaned up expired session_id');
    }

}