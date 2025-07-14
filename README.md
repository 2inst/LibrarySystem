# 图书馆借阅管理系统

一个基于 Node.js + Express + MySQL 开发的现代化图书馆管理系统，提供完整的图书借阅管理功能。

## 🌟 项目特色

- **现代化界面设计**：采用星空主题的响应式UI设计
- **完整的用户权限管理**：支持管理员和普通用户两种角色
- **全功能图书管理**：支持图书的增删改查、分类管理、搜索过滤
- **智能借阅系统**：自动化借还书流程，逾期提醒
- **图书评价系统**：用户可对图书进行评分和评论
- **数据统计分析**：提供系统运营数据统计

## 📋 功能特性

### 用户功能
- 🔐 用户注册与登录
- 📚 图书浏览与搜索
- 🔍 按分类、状态筛选图书
- 📖 查看图书详细信息和评价
- ⭐ 图书评分与评论
- 📋 借阅历史记录查询

### 管理员功能
- 👥 用户管理（查看、添加、编辑、删除用户）
- 📚 图书管理（增删改查、批量操作）
- 🏷️ 分类管理（添加、编辑、删除图书分类）
- 📊 借阅管理（借书、还书、续期）
- 📈 统计分析（图书借阅率、用户活跃度等）
- 🔍 高级搜索与数据筛选

### 系统功能
- 🛡️ 密码加密存储（bcrypt）
- 📱 响应式设计，支持移动端
- ⚡ 异步API设计，快速响应
- 🔄 实时数据同步
- 📊 RESTful API架构

## 🚀 技术栈

### 后端技术
- **Node.js**: JavaScript运行环境
- **Express.js**: Web应用框架
- **MySQL**: 关系型数据库
- **mysql2**: MySQL数据库驱动
- **bcrypt**: 密码加密
- **cors**: 跨域资源共享
- **body-parser**: 请求体解析

### 前端技术
- **HTML5**: 页面结构
- **CSS3**: 样式设计（包含渐变、动画效果）
- **JavaScript (ES6+)**: 交互逻辑
- **Font Awesome**: 图标库
- **Fetch API**: HTTP请求

### 开发工具
- **nodemon**: 开发环境自动重启
- **npm**: 包管理器

## 📁 项目结构

```
library_system_test/b/
├── server.js              # 服务器主文件，包含所有API路由
├── index.html             # 前端主页面
├── script.js              # 前端JavaScript逻辑
├── styles.css             # 样式文件
├── package.json           # 项目配置和依赖
├── package-lock.json      # 依赖版本锁定文件
├── init.sql               # 数据库初始化脚本
├── test.html              # API测试页面（开发调试用）
└── README.md              # 项目说明文档
```

## 🗄️ 数据库设计

### 数据表结构

1. **categories（图书分类表）**
   - id: 主键
   - name: 分类名称
   - description: 分类描述

2. **users（用户表）**
   - id: 主键
   - username: 用户名
   - password: 密码（加密存储）
   - name: 真实姓名
   - email: 邮箱
   - phone: 电话
   - address: 地址
   - register_date: 注册日期
   - status: 账户状态

3. **books（图书表）**
   - id: 主键
   - title: 书名
   - author: 作者
   - publisher: 出版社
   - isbn: ISBN号
   - year: 出版年份
   - category_id: 分类ID（外键）
   - status: 图书状态（可借/已借）
   - current_borrower: 当前借阅者
   - description: 图书描述

4. **borrows（借阅记录表）**
   - id: 主键
   - user_id: 用户ID（外键）
   - book_id: 图书ID（外键）
   - borrow_date: 借阅日期
   - due_date: 到期日期
   - return_date: 归还日期
   - status: 借阅状态

5. **book_reviews（图书评价表）**
   - id: 主键
   - book_id: 图书ID（外键）
   - user_id: 用户ID（外键）
   - rating: 评分（1-5星）
   - review_text: 评价内容

## 🛠️ 安装与运行

### 环境要求
- Node.js >= 14.0.0
- MySQL >= 5.7 或 MariaDB >= 10.3
- npm >= 6.0.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd library_system_test/b
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置数据库**
   
   在MySQL中创建数据库：
   ```sql
   mysql -u root -p
   source init.sql
   ```
   
   或者修改 `server.js` 中的数据库配置：
   ```javascript
   const dbConfig = {
       host: 'localhost',
       user: 'root',
       password: '你的密码',  // 修改为你的MySQL密码
       database: 'library_system',
       charset: 'utf8mb4'
   };
   ```

4. **启动服务器**
   
   开发模式（自动重启）：
   ```bash
   npm run dev
   ```
   
   生产模式：
   ```bash
   npm start
   ```

5. **访问系统**
   
   打开浏览器访问：`http://localhost:3000`

### 默认账户

系统会自动创建以下测试账户：

**管理员账户：**
- 用户名：`admin`
- 密码：`admin123`

**普通用户账户：**
- 用户名：`zhangsan` 密码：见数据库（已加密）
- 用户名：`lisi` 密码：见数据库（已加密）
- 其他测试用户...

## 🔧 API 接口文档

### 认证相关
- `POST /api/login` - 用户登录
- `POST /api/admin/login` - 管理员登录
- `POST /api/register` - 用户注册

### 图书管理
- `GET /api/books` - 获取所有图书
- `GET /api/books/:id` - 获取单本图书
- `POST /api/books` - 添加图书
- `PUT /api/books/:id` - 更新图书
- `DELETE /api/books/:id` - 删除图书
- `GET /api/search/books` - 搜索图书

### 用户管理
- `GET /api/users` - 获取所有用户
- `GET /api/users/:id` - 获取单个用户
- `POST /api/users` - 添加用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 借阅管理
- `GET /api/borrows` - 获取借阅记录
- `POST /api/borrows` - 借书
- `PUT /api/borrows/:id/return` - 还书

### 分类管理
- `GET /api/categories` - 获取所有分类
- `POST /api/categories` - 添加分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 评价管理
- `GET /api/books/:id/reviews` - 获取图书评价
- `POST /api/books/:id/reviews` - 添加评价
- `DELETE /api/reviews/:id` - 删除评价

### 统计信息
- `GET /api/stats` - 获取系统统计信息

## 🔍 使用说明

### 管理员操作指南

1. **登录系统**
   - 选择"管理员登录"
   - 输入用户名：admin，密码：admin123

2. **图书管理**
   - 点击"图书管理"进入图书列表
   - 可以添加、编辑、删除图书
   - 支持按关键字、分类、状态搜索

3. **用户管理**
   - 查看所有注册用户
   - 管理用户状态（激活/禁用）

4. **借阅管理**
   - 处理借书和还书操作
   - 查看借阅记录和逾期情况

### 普通用户操作指南

1. **注册登录**
   - 选择"读者登录"
   - 新用户点击"注册"创建账户

2. **浏览图书**
   - 查看图书列表
   - 使用搜索功能查找感兴趣的图书

3. **图书评价**
   - 对读过的图书进行评分和评论

## 🐛 已知问题与限制

### 已修复的问题
- ✅ 数据库连接配置
- ✅ API路由错误处理
- ✅ 前端用户界面响应

### 当前限制
- 📌 暂未实现图书续借功能
- 📌 缺少图片上传功能
- 📌 暂未实现邮件通知功能
- 📌 缺少高级报表功能

### 无用文件识别
- `test.html` - 这是一个API测试文件，仅用于开发调试，生产环境中可以删除

## 🚀 未来改进计划

### 短期计划
- [ ] 添加图书续借功能
- [ ] 实现图书封面上传
- [ ] 添加更多的数据统计图表
- [ ] 优化移动端用户体验

### 长期计划
- [ ] 实现微信/QQ登录
- [ ] 添加图书推荐系统
- [ ] 支持多图书馆管理
- [ ] 集成第三方图书数据API

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 开发者信息

- **项目类型**: 图书馆管理系统
- **开发语言**: JavaScript (Node.js)
- **数据库**: MySQL
- **架构模式**: MVC
- **API风格**: RESTful

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 📧 Email: [your-email@example.com]
- 💬 Issues: [项目Issues页面]

---

*最后更新时间：2025年7月14日*