-- 创建一个函数，用于查找特定钱包地址拥有的所有NFT
CREATE OR REPLACE FUNCTION find_nfts_by_owner(owner_wallet TEXT)
RETURNS SETOF nfts AS $$
BEGIN
  -- 返回所有owner_address字段中包含该钱包地址的NFT
  -- 使用jsonb_each_text将JSON对象转换为键值对，然后检查值是否等于目标钱包地址
  RETURN QUERY
  SELECT n.*
  FROM nfts n, jsonb_each_text(n.owner_address::jsonb) as owners
  WHERE owners.value = owner_wallet;
END;
$$ LANGUAGE plpgsql; 