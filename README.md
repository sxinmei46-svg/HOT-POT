# 火锅宴会菜式选择网页

这是一个可直接部署到 GitHub Pages 的静态网页项目。来宾可以登录姓名、选择菜品，主人可以查看汇总并导出 CSV。

## 文件说明

- `index.html`：页面结构
- `styles.css`：页面样式
- `app.js`：登录、选菜、提交、汇总逻辑
- `config.js`：宴会标题、主人密码、邀请名单、菜品清单、Firebase 配置
- `.nojekyll`：让 GitHub Pages 按静态文件直接发布

## 本地预览

直接打开 `index.html` 即可预览。  
如果浏览器限制 ES module，建议在项目目录运行：

```bash
python -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 部署到 GitHub Pages

1. 新建一个 GitHub 仓库，例如 `hotpot-party-picker`
2. 把本项目所有文件上传到仓库根目录
3. 进入仓库 `Settings` → `Pages`
4. `Build and deployment` 选择：
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. 保存后等待 GitHub Pages 发布

## 重要说明：多人在线汇总需要 Firebase

GitHub Pages 只是静态网页，不能自己接收并保存所有来宾提交的数据。

本项目默认使用 localStorage，本地演示可用，但数据只在当前浏览器里。  
如需每个来宾用自己的手机提交、主人统一查看，请配置 Firebase Firestore。

### Firebase 配置步骤

1. 打开 Firebase Console，创建项目
2. 添加 Web App
3. 复制 Firebase config，填入 `config.js` 的 `firebaseConfig`
4. 创建 Firestore Database
5. 开发/聚会临时使用可设置 Firestore Rules：

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /hotpotSubmissions/{guestId} {
      allow read, write: if true;
    }
  }
}
```

> 注意：上面的规则方便聚会临时使用，但不是强安全规则。正式项目建议加入 Firebase Authentication 和更严格的权限控制。

## 常用自定义

### 修改主人密码

打开 `config.js`：

```js
hostPassword: "hotpot2026"
```

改成你自己的密码。

### 限制来宾名单

打开 `config.js`：

```js
allowedGuests: ["小王", "Lily", "张三"]
```

如果保持空数组 `[]`，任何人都可以填写。

### 修改菜品

打开 `config.js` 中的 `dishes` 数组，按下面格式添加或删除：

```js
{ name: "肥牛卷", category: "肉类", unit: "盒" }
```
