// 钱包连接（这里仅模拟随机钱包地址，真实项目建议接入 MetaMask）
const connectWallet = async (walletType: string) => {
    setIsLoading(true)

    try {
        // 模拟 MetaMask
        const randomWallet = `0x${Math.random().toString(16).substr(2, 40)}`
        setWalletAddress(randomWallet)
        setCurrentStep(RegistrationStep.Confirmation)
    } finally {
        setIsLoading(false)
    }
}

// 完成注册，写入 Supabase
const completeRegistration = async () => {
    setIsLoading(true)

    const newUser = {
        username: formData.username,
        walletAddress,
        bio: formData.bio,
    }

    const result = await UserService.registerWithWallet(newUser)

    setIsLoading(false)

    if (result.success && result.user) {
        UserService.setCurrentUser(result.user)
        onComplete(result.user)
    } else {
        alert('Registration failed: ' + result.error)
    }
}
