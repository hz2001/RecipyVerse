// 食谱接口
export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  imageUrl: string;
  creator: string;
  createdAt: string;
  category: string;
  duration: string; // 烹饪时间
  difficulty: 'easy' | 'medium' | 'hard'; // 难度级别
  servings: number; // 份量
  tags: string[]; // 标签，如"素食"、"低脂"等
}

// 模拟食谱数据
export const recipes: Recipe[] = [
  {
    id: '1',
    title: '简易番茄炒蛋',
    description: '一道简单美味的中式家常菜，酸甜可口，适合新手尝试。',
    ingredients: [
      '鸡蛋 4个',
      '番茄 2个',
      '葱花 适量',
      '盐 适量',
      '糖 适量',
      '食用油 适量'
    ],
    steps: [
      '将鸡蛋打入碗中，加入少许盐，搅拌均匀',
      '番茄洗净切块',
      '热锅倒油，倒入蛋液炒熟，盛出备用',
      '锅中再次倒油，放入番茄翻炒至软烂出汁',
      '加入适量糖调味',
      '放入炒好的鸡蛋，翻炒均匀',
      '撒上葱花即可出锅'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    creator: '0xUserNumber234567890abcdef12345678',
    createdAt: '2023-01-15T12:30:00Z',
    category: '家常菜',
    duration: '15分钟',
    difficulty: 'easy',
    servings: 2,
    tags: ['快手菜', '家常菜', '鸡蛋料理']
  },
  {
    id: '2',
    title: '意大利经典披萨',
    description: '正宗意大利风味披萨，酥脆的饼底配上浓郁的番茄酱和马苏里拉奶酪。',
    ingredients: [
      '高筋面粉 300g',
      '酵母 5g',
      '温水 180ml',
      '橄榄油 15ml',
      '盐 5g',
      '番茄酱 100g',
      '马苏里拉奶酪 200g',
      '罗勒叶 适量',
      '意大利香肠 适量'
    ],
    steps: [
      '将面粉、酵母、盐混合，加入温水和橄榄油揉成面团',
      '面团醒发至2倍大',
      '将面团压平，擀成圆形',
      '均匀涂抹番茄酱',
      '撒上马苏里拉奶酪和切片的意大利香肠',
      '烤箱预热至220℃',
      '烤15-20分钟至饼底金黄、奶酪融化',
      '撒上新鲜罗勒叶即可'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    creator: '0xMerchantVerified1234567890abcdef12345678',
    createdAt: '2023-02-20T18:15:00Z',
    category: '西餐',
    duration: '2小时',
    difficulty: 'medium',
    servings: 4,
    tags: ['意大利菜', '烘焙', '奶酪']
  },
  {
    id: '3',
    title: '日式拉面',
    description: '浓郁的猪骨汤底配上弹韧的面条，是一道经典的日式料理。',
    ingredients: [
      '拉面 200g',
      '猪骨高汤 500ml',
      '叉烧肉 100g',
      '溏心蛋 2个',
      '海苔 2片',
      '葱花 适量',
      '酱油 15ml',
      '味增 10g'
    ],
    steps: [
      '猪骨熬制高汤数小时至乳白色',
      '加入酱油和味增调味',
      '拉面下锅煮至弹韧有嚼劲',
      '将煮好的面条放入碗中',
      '倒入热汤',
      '摆上切片的叉烧肉、对半切开的溏心蛋',
      '点缀海苔片和葱花'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80',
    creator: '0xUserNumber234567890abcdef12345678',
    createdAt: '2023-03-10T19:45:00Z',
    category: '日式料理',
    duration: '3小时',
    difficulty: 'hard',
    servings: 2,
    tags: ['日本料理', '汤面', '猪肉']
  },
  {
    id: '4',
    title: '法式焦糖布丁',
    description: '经典法式甜点，丝滑的卡仕达配上苦甜的焦糖，口感丰富多层次。',
    ingredients: [
      '鸡蛋 4个',
      '牛奶 500ml',
      '香草精 5ml',
      '白砂糖 100g (其中60g用于焦糖)',
      '盐 少许'
    ],
    steps: [
      '将60g糖在小锅中加热至呈琥珀色',
      '迅速倒入布丁模具底部',
      '打散鸡蛋，加入剩余的糖',
      '加热牛奶至微沸，慢慢倒入蛋液中，不断搅拌',
      '加入香草精和少许盐调味',
      '过滤蛋液，倒入布丁模具',
      '水浴法在150℃烤箱中烘烤约40分钟至中心凝固',
      '冷却后冰镇数小时',
      '食用前将布丁倒扣出来，焦糖自然流出'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    creator: '0xMerchantVerified1234567890abcdef12345678',
    createdAt: '2023-04-05T14:20:00Z',
    category: '甜点',
    duration: '1小时',
    difficulty: 'medium',
    servings: 4,
    tags: ['法式甜点', '焦糖', '烘焙']
  },
  {
    id: '5',
    title: '泰式冬阴功汤',
    description: '酸辣开胃的泰国传统汤品，香茅和柠檬草的香气与辣椒的刺激相结合。',
    ingredients: [
      '虾 300g',
      '草菇 100g',
      '柠檬草 2根',
      '香茅 3片',
      '南姜 3片',
      '辣椒 适量',
      '鱼露 15ml',
      '酸柑汁 30ml',
      '香菜 少许'
    ],
    steps: [
      '将虾洗净去肠线',
      '锅中倒入清水，加入切段的柠檬草、香茅、南姜煮出香味',
      '放入虾和草菇煮熟',
      '加入鱼露和酸柑汁调味',
      '最后加入切片的辣椒',
      '撒上香菜即可'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    creator: '0xMerchantVerified1234567890abcdef12345678',
    createdAt: '2023-05-12T11:10:00Z',
    category: '泰国料理',
    duration: '30分钟',
    difficulty: 'medium',
    servings: 4,
    tags: ['泰国菜', '海鲜', '辣味']
  },
  {
    id: '6',
    title: '美式BBQ烤肋排',
    description: '美国南方风格的BBQ肋排，烤至肉质松软，表面酥脆，配上自制BBQ酱汁。',
    ingredients: [
      '猪肋排 1.5kg',
      '棕糖 50g',
      '盐 15g',
      '黑胡椒 10g',
      '辣椒粉 10g',
      '大蒜粉 5g',
      '番茄酱 100g',
      '蜂蜜 30g',
      '苹果醋 30ml',
      '芥末 10g'
    ],
    steps: [
      '混合棕糖、盐、黑胡椒、辣椒粉、大蒜粉制作干腌料',
      '将干腌料均匀涂抹在肋排上',
      '包裹保鲜膜，冷藏腌制至少4小时，最好过夜',
      '混合番茄酱、蜂蜜、苹果醋、芥末制作BBQ酱',
      '烤箱预热至120℃',
      '将肋排放在烤架上，下方放烤盘接油脂',
      '低温慢烤约3小时',
      '最后30分钟每15分钟刷一次BBQ酱',
      '切成小段即可享用'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=1349&q=80',
    creator: '0xMerchantVerified1234567890abcdef12345678',
    createdAt: '2023-06-18T16:30:00Z',
    category: '美式料理',
    duration: '5小时',
    difficulty: 'hard',
    servings: 6,
    tags: ['烧烤', '美式料理', '猪肉']
  }
]; 