import CryptoJS from 'crypto-js';

// --- 配置区 ---
const DB_KEY = 'ocean_demo_users_final';
const SALT = 'my-science-demo-salt'; 

// 辅助函数：计算哈希值
const hashPassword = (password) => {
  return CryptoJS.SHA256(password + SALT).toString();
};

// --- 预设账号列表 ---
// 你可以把控制台生成的代码直接粘贴到这里
const GLOBAL_USERS = [
  {
    username: '123456',
    // 对应明文: 123456
    password: '069b5ddbae12c6e41892985268227917a164436343ebe2839b49e0ec94ae172e', 
    email: '111111@123'
  },
   {
    username: 'admin',
    // 对应明文: admin
    password: 'a4ac6c9950f3b2aa209d7dfc9d98c29651311dca829af08a204253ef5317904b', 
    email: '111111@123'
  },
  {
    username: 'chenaoyang',
    // 对应明文: chenaoyang
    password: 'beb6f58a49c57f4369d3b8bf6fc80973f8be0789385382425593e71071fb9858', 
    email: '111111@123'
  },

  {
    username: 'zhangcheng',
    // 对应明文: zhangcheng
    password: '1b84af393ac5fde1e24204f911621da9bf2d4761801eacd0218a0c1aea5699b1', 
    email: '111111@123'
  },
];

function getUsers() {
  const localData = localStorage.getItem(DB_KEY);
  const localUsers = localData ? JSON.parse(localData) : [];
  return [...GLOBAL_USERS, ...localUsers];
}

function findUser(username, password) {
  const users = getUsers();
  const inputHash = hashPassword(password);
  const user = users.find(u => u.username === username && u.password === inputHash);
  
  if (user) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
  return null;
}

/**
 * 注册：同时生成预设代码块
 */
function addUser(newUser) {
  const users = getUsers();
  if (users.some(u => u.username === newUser.username)) {
    return false;
  }

  // 计算哈希
  const hashedPassword = hashPassword(newUser.password);

  // 1. 正常保存到 LocalStorage（保证当前能登录）
  const userToSave = {
    username: newUser.username,
    email: newUser.email,
    password: hashedPassword
  };
  const localData = localStorage.getItem(DB_KEY);
  const localUsers = localData ? JSON.parse(localData) : [];
  localUsers.push(userToSave);
  localStorage.setItem(DB_KEY, JSON.stringify(localUsers));

  // 2. 【核心技巧】生成你要的代码块并打印到控制台
  // 这样你就可以直接复制这个块，粘贴到上面的 GLOBAL_USERS 里了
  const codeSnippet = `
  {
    username: '${newUser.username}',
    // 对应明文: ${newUser.password}
    password: '${hashedPassword}', 
    email: '${newUser.email}'
  },`;
//由于前端页面的防止写入机制，不使用后端的注册用户就只能手动，这里添加哈希，防止从前端直接获取密码
//   console.log(`%c[代码生成成功] 请复制以下代码添加到 userService.js 的 GLOBAL_USERS 数组中:`, "color: #0085ca; font-weight: bold; font-size: 14px;");
//   console.log(codeSnippet);

  return true;
}

function findUserByUsernameAndEmail(username, email) {
  return getUsers().find(u => u.username === username && u.email === email) || null;
}

export const userService = {
  addUser,
  findUser,
  findUserByUsernameAndEmail
};