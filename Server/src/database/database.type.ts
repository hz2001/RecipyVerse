


export interface VerifyMessage {
    message: string;
    address: string;
}

export enum UserRole {
    ADMIN = "admin",
    USER = "user",
    MERCHANT = "merchant"
}

export interface User {
    wallet_address: string;
    created_at: string;
    user_id: string;
    role: UserRole;
}

export interface Verification{
    address: string;
    message: string;
    sessionId: string;
    expire_at: string;
    
}