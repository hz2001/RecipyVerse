// 导出所有服务
export { default as walletService } from './walletService';
export { default as contractService } from './contractService';
export { default as merchantService } from './merchantService';
export { default as userService } from './userService';

// 导出类型定义
export type { WalletService } from './walletService';
export type { ContractService } from './contractService';
export type { MerchantService } from './merchantService';
export type { UserService, User } from './userService';
export { ContractType } from './contractService';
export { UserRole } from './userService'; 