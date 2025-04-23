商家验证流程

api调用流程
前端：直接使用fetch('api/节点名称') 

目前拥有的节点:
GET- 'contract/get_abi': 目前是返回NFTFactory 的abi文件用于前端创建对应contract所需要调用的function
GET- 'wallet/get_verify_message?address=用户的地址': 创建一个用于验证的消息时间戳 发送给用户以及上传至数据库 用于后续POST验证地址是否为真
POST- 'wallet/verify_signature': 用户在body 传输一个json格式的数据 sign: metamask personal_sign 返回的数据自动生成以及 account: 用户的地址用于验证用户地址为真


api需要：
GET 正在swaping的数据库
POST swap更新数据库
POST 商家上传资质
POST 用户拥有的nft
GET 商家自己的发布的nft contract

