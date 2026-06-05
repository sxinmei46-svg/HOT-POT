// ===== 火锅宴会配置 =====
// 1) 修改 PARTY 信息即可换成你的宴会内容。
// 2) GitHub Pages 不能自己保存多人提交数据。
//    如需多人在线提交并由主人统一查看，请创建 Firebase Web App + Firestore，
//    然后把 firebaseConfig 填到下方。未填写时，页面会使用 localStorage 本地演示模式。

window.HOTPOT_CONFIG = {
  partyTitle: "周末火锅宴",
  hostPassword: "hotpot2026",

  // 可邀请名单：空数组表示任何人都可以填写。
  // 如需限制人员，把姓名写在这里，例如 ["小王", "Lily", "张三"]
  allowedGuests: [],

  // Firebase 配置：从 Firebase Console > Project settings > Your apps 获取
  firebaseConfig: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  },

  dishes: [
    { name: "肥牛卷", category: "肉类", unit: "盒" },
    { name: "羔羊肉卷", category: "肉类", unit: "盒" },
    { name: "牛百叶", category: "肉类", unit: "份" },
    { name: "午餐肉", category: "肉类", unit: "盒" },
    { name: "毛肚", category: "肉类", unit: "份" },
    { name: "鸭血", category: "肉类", unit: "盒" },

    { name: "虾滑", category: "海鲜丸滑", unit: "份" },
    { name: "鱼豆腐", category: "海鲜丸滑", unit: "袋" },
    { name: "墨鱼丸", category: "海鲜丸滑", unit: "袋" },
    { name: "蟹柳", category: "海鲜丸滑", unit: "包" },
    { name: "鲜虾", category: "海鲜丸滑", unit: "斤" },

    { name: "豆皮", category: "豆制品", unit: "包" },
    { name: "冻豆腐", category: "豆制品", unit: "盒" },
    { name: "腐竹", category: "豆制品", unit: "包" },
    { name: "千张", category: "豆制品", unit: "包" },
    { name: "油豆腐", category: "豆制品", unit: "袋" },

    { name: "金针菇", category: "蔬菜菌菇", unit: "把" },
    { name: "娃娃菜", category: "蔬菜菌菇", unit: "颗" },
    { name: "生菜", category: "蔬菜菌菇", unit: "颗" },
    { name: "土豆片", category: "蔬菜菌菇", unit: "份" },
    { name: "莲藕片", category: "蔬菜菌菇", unit: "份" },
    { name: "海带结", category: "蔬菜菌菇", unit: "盒" },
    { name: "香菇", category: "蔬菜菌菇", unit: "盒" },
    { name: "玉米", category: "蔬菜菌菇", unit: "根" },

    { name: "宽粉", category: "主食粉面", unit: "包" },
    { name: "方便面", category: "主食粉面", unit: "包" },
    { name: "乌冬面", category: "主食粉面", unit: "包" },
    { name: "年糕", category: "主食粉面", unit: "包" },

    { name: "麻辣锅底", category: "锅底蘸料", unit: "包" },
    { name: "番茄锅底", category: "锅底蘸料", unit: "包" },
    { name: "菌汤锅底", category: "锅底蘸料", unit: "包" },
    { name: "芝麻酱", category: "锅底蘸料", unit: "瓶" },
    { name: "香菜葱花", category: "锅底蘸料", unit: "份" },
    { name: "小米辣蒜泥", category: "锅底蘸料", unit: "份" },

    { name: "酸梅汤", category: "饮料甜品", unit: "瓶" },
    { name: "可乐/雪碧", category: "饮料甜品", unit: "瓶" },
    { name: "冰粉", category: "饮料甜品", unit: "份" },
    { name: "水果拼盘", category: "饮料甜品", unit: "份" }
  ]
};
