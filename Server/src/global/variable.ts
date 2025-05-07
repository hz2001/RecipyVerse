import dotenv from "dotenv";

dotenv.config();
const env = {
    FACTORY_ADDRESS: process.env.FACTORY_ADDRESS || "",

    SUPABASE_URL: process.env.SUPABASE_URL || "",

    SUPABASE_KEY: process.env.SUPABASE_KEY || "",

    SWAP_ADDRESS: process.env.SWAP_ADDRESS || "",
}

export default env;