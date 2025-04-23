import path from "node:path";
import * as fs from "node:fs";


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