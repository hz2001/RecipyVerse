export interface VerifyMessage {
    message: string;
    address: string;
}

export enum UserRole {
    ADMIN = "admin", USER = "user", MERCHANT = "merchant"
}

export enum CouponType{
    CASH = "Cash", DISCOUNT = "Discount", FOOD = "Food"
}

export interface User {
    wallet_address: string;
    created_at: string;
    user_id: string;
    role: UserRole;
}

export interface Verification {
    address: string;
    message: string;
    sessionId: string;
    expire_at: string;

}

export interface Merchant {
    id: string;
    created_at: string;
    wallet_address: string;
    is_verified: boolean;
    merchant_name: string;
    merchant_address: string;
}

export interface NFT {
    id: string;
    created_at: string;
    owner_address: string;
    expires_at: string;
    creator_address: string;
    details: string;
    coupon_name: string;
    coupon_type: CouponType;
    coupon_image: string;
    total_supply: number;
    swapping: string;
    contract_address: string;
    detail_hash: string;
    token_id: string
}