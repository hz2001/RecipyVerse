import React, { useState, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';

const TestMerchantRegistration: React.FC = () => {
    const [formData, setFormData] = useState({
        walletAddress: '',
        merchantName: '',
        merchantAddress: '',
        isVerified: 'false' as 'true' | 'false' | 'rejected',
    });
    
    const [file, setFile] = useState<File | null>(null);
    const [registering, setRegistering] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        data?: any;
    } | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const clearForm = () => {
        setFormData({
            walletAddress: '',
            merchantName: '',
            merchantAddress: '',
            isVerified: 'false',
        });
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegistering(true);
        setResult(null);
        
        try {
            // 1. 首先尝试连接数据库（测试连接）
            const testConnection = await supabase.from('merchants').select('count');
            if (testConnection.error) {
                setResult({
                    success: false,
                    message: `数据库连接失败: ${testConnection.error.message}`
                });
                return;
            }
            
            console.log("数据库连接测试成功");
            
            // 2. 插入商家记录
            const { data, error } = await supabase
                .from('merchants')
                .insert([
                    {
                        wallet_address: formData.walletAddress,
                        merchant_name: formData.merchantName,
                        merchant_address: formData.merchantAddress,
                        is_verified: formData.isVerified,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();
                
            if (error) {
                console.error("商家注册失败:", error);
                
                let errorMessage = error.message;
                if (error.message.includes('duplicate key')) {
                    errorMessage = '该钱包地址已注册为商家';
                } else if (error.message.includes('row-level security policy')) {
                    errorMessage = '数据库安全策略限制，请修改RLS策略';
                }
                
                setResult({
                    success: false,
                    message: `商家记录创建失败: ${errorMessage}`
                });
                return;
            }
            
            console.log("商家记录创建成功:", data);
            
            // 3. 如果有上传文件，处理文件上传
            let fileUploadResult = null;
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${formData.walletAddress}_license.${fileExt}`;
                
                const { data: fileData, error: fileError } = await supabase.storage
                    .from('merchant_licenses')
                    .upload(fileName, file);
                    
                if (fileError) {
                    console.error("文件上传失败:", fileError);
                    setResult({
                        success: true,
                        message: `商家记录创建成功，但文件上传失败: ${fileError.message}`,
                        data
                    });
                    return;
                }
                
                fileUploadResult = fileData;
                console.log("文件上传成功:", fileData);
            }
            
            // 4. 全部成功
            setResult({
                success: true,
                message: '商家注册成功！包括数据库记录和文件上传',
                data: {
                    merchant: data,
                    file: fileUploadResult
                }
            });
            
            // 清空表单
            clearForm();
            
        } catch (err) {
            console.error("注册过程中出现异常:", err);
            setResult({
                success: false,
                message: `注册过程中出现异常: ${String(err)}`
            });
        } finally {
            setRegistering(false);
        }
    };

    // 随机生成钱包地址
    const generateRandomWallet = () => {
        const chars = '0123456789abcdef';
        let address = '0x';
        for (let i = 0; i < 40; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        setFormData(prev => ({
            ...prev,
            walletAddress: address
        }));
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">商家注册测试</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">填写商家信息</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="walletAddress">
                            钱包地址 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex">
                            <input 
                                id="walletAddress"
                                name="walletAddress"
                                type="text"
                                value={formData.walletAddress}
                                onChange={handleChange}
                                placeholder="0x..."
                                required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                            <button
                                type="button"
                                onClick={generateRandomWallet}
                                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                随机生成
                            </button>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="merchantName">
                            商家名称 <span className="text-red-500">*</span>
                        </label>
                        <input 
                            id="merchantName"
                            name="merchantName"
                            type="text"
                            value={formData.merchantName}
                            onChange={handleChange}
                            placeholder="输入商家名称"
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="merchantAddress">
                            商家地址 <span className="text-red-500">*</span>
                        </label>
                        <input 
                            id="merchantAddress"
                            name="merchantAddress"
                            type="text"
                            value={formData.merchantAddress}
                            onChange={handleChange}
                            placeholder="输入商家地址"
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="isVerified">
                            验证状态
                        </label>
                        <select
                            id="isVerified"
                            name="isVerified"
                            value={formData.isVerified}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="false">未验证</option>
                            <option value="true">已验证</option>
                            <option value="rejected">已拒绝</option>
                        </select>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="licenseFile">
                            营业执照文件
                        </label>
                        <input 
                            id="licenseFile"
                            name="licenseFile"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <p className="text-xs text-gray-500 mt-1">请上传商家证明文件，支持JPG、PNG、PDF格式</p>
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={clearForm}
                            className="mr-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            清空表单
                        </button>
                        <button
                            type="submit"
                            disabled={registering}
                            className={`bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center ${
                                registering ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {registering ? (
                                <>
                                    <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                                    注册中...
                                </>
                            ) : '测试注册商家'}
                        </button>
                    </div>
                </form>
            </div>
            
            {result && (
                <div className={`bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 ${
                    result.success ? 'border-green-500' : 'border-red-500'
                }`}>
                    <h2 className={`text-xl font-semibold mb-2 ${
                        result.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                        {result.success ? '操作成功' : '操作失败'}
                    </h2>
                    
                    <p className="text-gray-700 mb-2">{result.message}</p>
                    
                    {result.data && (
                        <div className="mt-4">
                            <h3 className="font-semibold text-gray-700 mb-2">返回数据:</h3>
                            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                {JSON.stringify(result.data, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">使用说明</h2>
                <div className="text-gray-700 space-y-2">
                    <p>1. 此页面用于直接测试商家注册功能，绕过钱包连接流程。</p>
                    <p>2. 所有带 <span className="text-red-500">*</span> 的字段为必填。</p>
                    <p>3. 如遇到"row-level security policy"错误，请修改Supabase中merchants表的RLS策略。</p>
                    <p>4. 钱包地址可以点击"随机生成"自动生成一个模拟地址。</p>
                    <p>5. 验证状态默认为"未验证"，也可以测试其他状态。</p>
                </div>
            </div>
        </div>
    );
};

export default TestMerchantRegistration; 