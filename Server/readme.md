# CS595 Final Project API 文档

## 目录
- [钱包相关接口](#钱包相关接口)
- [合约相关接口](#合约相关接口)
- [商家相关接口](#商家相关接口)
- [数据库服务](#数据库服务)

## 钱包相关接口

### GET `/wallet/get_verify_message`
- **描述**: 创建一个用于验证的消息时间戳，发送给用户并上传至数据库
- **请求参数**:
  - `address` (query string): 用户的钱包地址
- **响应**:
  - 成功: 状态码 200，返回验证消息
  - 失败: 状态码 403，返回错误信息 "Failed to update verify message: [错误信息]"
- **实现函数**: `sendTimeStamp`

### POST `/wallet/verify_signature`
- **描述**: 验证用户签名，确认钱包地址所有权
- **请求体**:
  ```json
  {
    "sign": "metamask personal_sign 返回的数据",
    "account": "用户的钱包地址"
  }
  ```
- **响应**:
  - 成功: 状态码 200，返回 sessionId
  - 失败: 状态码 403，返回 "Signature does not match" 或 "Failed to update verify message: [错误信息]"
- **实现函数**: `verifyCheck`
- **处理流程**:
  1. 获取用户地址对应的验证消息
  2. 验证签名是否匹配
  3. 生成 sessionId 和过期时间
  4. 更新数据库中的验证信息
  5. 更新用户信息

## 合约相关接口

### GET `/contract/get_abi`
- **描述**: 返回 NFTFactory 的 abi 文件，用于前端创建对应 contract 所需的 function
- **请求参数**: 无
- **响应**: NFTFactory 的 ABI 文件内容

## 商家相关接口

### POST `/merchant/upload_qualification`
- **描述**: 上传商家资质文件
- **请求参数**:
  - `sessionId` (query string): 会话ID
  - **请求体** (multipart/form-data):
    - `merchantName` (string): 商家名称
    - `merchantAddress` (string): 商家地址
    - `file` (file): 上传的资质文件
- **响应**:
  - 成功: 状态码 200，返回 "OK"
  - 失败: 状态码 400，返回 "Failed to upload"
- **实现函数**: `uploadQualification`

### GET `/merchant/my_nft_contracts`
- **描述**: 获取商家发布的 NFT 合约列表
- **请求参数**:
  - `sessionId` (query string): 会话ID
- **权限要求**: 商家角色
- **响应**:
  - 成功: 状态码 200，返回 "OK"（目前为占位实现）
- **实现函数**: `getAllContracts`

### GET `/merchant/get_unverify_qualification`
- **描述**: 管理员获取未验证的商家资质
- **请求参数**:
  - `sessionId` (query string): 会话ID
- **权限要求**: 管理员角色
- **响应**:
  - 成功: 状态码 200，返回 "OK"（目前为占位实现）
- **实现函数**: `getAllContracts`

## 数据库服务

以下是后端内部使用的数据库服务函数，不直接暴露为 API 接口：

### 用户验证相关

#### `getVerifyMessage(address: string)`
- **描述**: 获取指定地址的验证消息
- **参数**: 
  - `address` (string): 钱包地址
- **返回**: 验证消息字符串

#### `getRoleBySessionId(sessionId: string)`
- **描述**: 根据会话ID获取用户角色
- **参数**: 
  - `sessionId` (string): 会话ID
- **返回**: 用户角色（admin/user/merchant）

#### `getAddressBySessionId(sessionId: string)`
- **描述**: 根据会话ID获取钱包地址
- **参数**: 
  - `sessionId` (string): 会话ID
- **返回**: 钱包地址

#### `getISSessionExpired(sessionId: string)`
- **描述**: 检查会话是否过期
- **参数**: 
  - `sessionId` (string): 会话ID
- **返回**: 布尔值，表示会话是否有效

#### `updateVerifyMessage(address: string, message?: string, sessionId?: string, expireAt?: string)`
- **描述**: 更新验证消息
- **参数**: 
  - `address` (string): 钱包地址
  - `message` (string, 可选): 验证消息
  - `sessionId` (string, 可选): 会话ID
  - `expireAt` (string, 可选): 过期时间
- **返回**: 操作结果对象 `{ success: boolean, message: string }`

### 用户管理相关

#### `updateUser(address: string, role: UserRole = UserRole.USER)`
- **描述**: 更新用户角色
- **参数**: 
  - `address` (string): 钱包地址
  - `role` (UserRole, 可选): 用户角色，默认为普通用户
- **返回**: 操作结果对象 `{ success: boolean, message: string }`

### 商家相关

#### `uploadFile(address: string, file: Express.Multer.File)`
- **描述**: 上传文件到存储桶
- **参数**: 
  - `address` (string): 钱包地址
  - `file` (Express.Multer.File): 上传的文件
- **返回**: 操作结果对象 `{ success: boolean, message: string }`

#### `updateMerchant(merchantAddress: string, merchantName?: string, walletAddress?: string, isVerified: boolean = false)`
- **描述**: 更新商家信息
- **参数**: 
  - `merchantAddress` (string): 商家地址
  - `merchantName` (string, 可选): 商家名称
  - `walletAddress` (string, 可选): 钱包地址
  - `isVerified` (boolean, 可选): 是否已验证，默认为 false
- **返回**: 操作结果对象 `{ success: boolean, message: string }`

## 系统功能

### 定时任务

系统每 5 分钟执行一次 `updateSessionIds` 函数，清理过期的会话 ID。

### 合约部署

系统启动时会执行 `deployContract` 函数，检查并部署 NFTFactory 合约。

## 数据类型

### UserRole 枚举
```typescript
enum UserRole {
    ADMIN = "admin",
    USER = "user",
    MERCHANT = "merchant",
}
```

### User 接口
```typescript
interface User {
    wallet_address: string;
    created_at: string;
    user_id: string;
    role: UserRole;
}
```

### Verification 接口
```typescript
interface Verification {
    address: string;
    message: string;
    sessionId: string;
    expire_at: string;
}
```

### Merchant 接口
```typescript
interface Merchant {
    id: string;
    created_at: string;
    wallet_address: string;
    is_verified: boolean;
    merchant_name: string;
    merchant_address: string;
}
