const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static('.'));

// 数据库连接配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456', // 用户提供的MySQL密码
    database: 'library_system',
    charset: 'utf8mb4'
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 初始化数据库和表
async function initDatabase() {
    try {
        // 创建数据库（如果不存在）
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });
        
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await connection.end();

        // 创建表
        await createTables();
        console.log('数据库初始化完成');
    } catch (error) {
        console.error('数据库初始化失败:', error);
    }
}

// 创建数据表
async function createTables() {
    const connection = await pool.getConnection();
    
    try {
        // 创建图书分类表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 创建图书表（修改为使用分类ID）
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS books (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                publisher VARCHAR(255) NOT NULL,
                isbn VARCHAR(50) UNIQUE NOT NULL,
                year INT,
                category_id INT,
                status ENUM('available', 'borrowed') DEFAULT 'available',
                current_borrower VARCHAR(255) NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
                INDEX idx_category (category_id),
                INDEX idx_status (status),
                INDEX idx_isbn (isbn)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 创建用户表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(50),
                address TEXT,
                register_date DATE NOT NULL,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 创建借阅记录表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS borrows (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                user_name VARCHAR(255) NOT NULL,
                book_id INT NOT NULL,
                book_title VARCHAR(255) NOT NULL,
                borrow_date DATE NOT NULL,
                due_date DATE NOT NULL,
                return_date DATE NULL,
                status ENUM('borrowed', 'returned') DEFAULT 'borrowed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                INDEX idx_user (user_id),
                INDEX idx_book (book_id),
                INDEX idx_status (status),
                INDEX idx_due_date (due_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 创建图书评价表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS book_reviews (
                id INT PRIMARY KEY AUTO_INCREMENT,
                book_id INT NOT NULL,
                user_id INT NOT NULL,
                user_name VARCHAR(255) NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                review_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_book_review (user_id, book_id),
                INDEX idx_book (book_id),
                INDEX idx_rating (rating)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('数据表创建完成');
        
        // 创建索引以提高性能
        try {
            await connection.execute('CREATE INDEX IF NOT EXISTS idx_books_title ON books(title)');
            await connection.execute('CREATE INDEX IF NOT EXISTS idx_books_author ON books(author)');
            await connection.execute('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
            await connection.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
            await connection.execute('CREATE INDEX IF NOT EXISTS idx_users_name ON users(name)');
            await connection.execute('CREATE INDEX IF NOT EXISTS idx_reviews_created ON book_reviews(created_at)');
            await connection.execute('CREATE INDEX IF NOT EXISTS idx_borrows_dates ON borrows(borrow_date, due_date)');
            console.log('数据库索引创建完成');
        } catch (error) {
            console.log('索引可能已存在，跳过创建');
        }
        
        // 插入示例数据
        await insertSampleData(connection);
        
    } finally {
        connection.release();
    }
}

// 插入示例数据
async function insertSampleData(connection) {
    try {
        // 检查是否已有分类数据
        const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
        if (categories[0].count === 0) {
            // 插入示例分类数据
            const sampleCategories = [
                { name: '文学', description: '文学类图书，包括小说、散文、诗歌等' },
                { name: '科技', description: '科技类图书，包括科学、技术、计算机等' },
                { name: '历史', description: '历史类图书，包括中国史、世界史等' },
                { name: '哲学', description: '哲学类图书，包括哲学理论、伦理学等' },
                { name: '教育', description: '教育类图书，包括教育理论、教学方法等' },
                { name: '艺术', description: '艺术类图书，包括美术、音乐、舞蹈等' },
                { name: '经济', description: '经济类图书，包括经济理论、管理学等' },
                { name: '医学', description: '医学类图书，包括基础医学、临床医学等' },
                { name: '法律', description: '法律类图书，包括法学理论、实务指导等' },
                { name: '其他', description: '其他类别图书' }
            ];

            for (const category of sampleCategories) {
                await connection.execute(
                    'INSERT INTO categories (name, description) VALUES (?, ?)',
                    [category.name, category.description]
                );
            }
            console.log('示例分类数据插入完成');
        }

        // 检查是否已有图书数据
        const [books] = await connection.execute('SELECT COUNT(*) as count FROM books');
        if (books[0].count === 0) {
            // 获取分类ID
            const [categoryRows] = await connection.execute('SELECT id, name FROM categories');
            const categoryMap = {};
            categoryRows.forEach(cat => {
                categoryMap[cat.name] = cat.id;
            });

            // 插入示例图书数据
            const sampleBooks = [
                { title: '三体', author: '刘慈欣', publisher: '重庆出版社', isbn: '9787536692930', year: 2008, category: '科技', description: '科幻小说经典作品，讲述人类与外星文明的接触' },
                { title: '百年孤独', author: '加西亚·马尔克斯', publisher: '南海出版公司', isbn: '9787544253994', year: 1967, category: '文学', description: '魔幻现实主义代表作品' },
                { title: '活着', author: '余华', publisher: '作家出版社', isbn: '9787506365437', year: 1993, category: '文学', description: '现代文学经典，反映中国社会变迁' },
                { title: '人类简史', author: '尤瓦尔·赫拉利', publisher: '中信出版社', isbn: '9787508640757', year: 2014, category: '历史', description: '从认知革命到智人统治地球的历史' },
                { title: '时间简史', author: '史蒂芬·霍金', publisher: '湖南科技出版社', isbn: '9787535732309', year: 1988, category: '科技', description: '物理学科普经典，探索宇宙奥秘' },
                { title: '红楼梦', author: '曹雪芹', publisher: '人民文学出版社', isbn: '9787020002207', year: 1791, category: '文学', description: '中国古典文学四大名著之一' },
                { title: '西游记', author: '吴承恩', publisher: '人民文学出版社', isbn: '9787020008735', year: 1592, category: '文学', description: '中国古典神话小说代表作' },
                { title: '水浒传', author: '施耐庵', publisher: '人民文学出版社', isbn: '9787020008742', year: 1373, category: '文学', description: '描写农民起义的英雄传奇' },
                { title: '三国演义', author: '罗贯中', publisher: '人民文学出版社', isbn: '9787020008728', year: 1522, category: '文学', description: '中国历史小说的经典之作' },
                { title: '平凡的世界', author: '路遥', publisher: '北京十月文艺出版社', isbn: '9787530216781', year: 1986, category: '文学', description: '反映中国农村改革开放的现实主义小说' },
                { title: '围城', author: '钱钟书', publisher: '人民文学出版社', isbn: '9787020002214', year: 1947, category: '文学', description: '现代文学经典，讽刺知识分子生活' },
                { title: '白夜行', author: '东野圭吾', publisher: '南海出版公司', isbn: '9787544242424', year: 1999, category: '文学', description: '日本推理小说名作' },
                { title: '理想国', author: '柏拉图', publisher: '商务印书馆', isbn: '9787100004831', year: 2002, category: '哲学', description: '古希腊哲学经典著作' },
                { title: '国富论', author: '亚当·斯密', publisher: '商务印书馆', isbn: '9787100004848', year: 2009, category: '经济', description: '经济学经典理论著作' },
                { title: '艺术的故事', author: '贡布里希', publisher: '广西美术出版社', isbn: '9787807463108', year: 2008, category: '艺术', description: '西方艺术史经典入门读物' }
            ];

            for (const book of sampleBooks) {
                const categoryId = categoryMap[book.category] || categoryMap['其他'];
                await connection.execute(
                    'INSERT INTO books (title, author, publisher, isbn, year, category_id, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [book.title, book.author, book.publisher, book.isbn, book.year, categoryId, book.description]
                );
            }
            console.log('示例图书数据插入完成');
        }

        // 检查是否已有用户数据
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        if (users[0].count === 0) {
            // 插入示例用户数据
            const sampleUsers = [
                { username: 'admin', password: 'admin123', name: '管理员', email: 'admin@example.com', phone: '13800000000', address: '系统管理', register_date: '2023-01-01' },
                { username: 'zhangsan', password: '$2b$10$8K1p4d8j4RqjJrZXQJ4X5uV3O2aH7x2p5d8j4RqjJrZXQJ4X5uV3O2', name: '张三', email: 'zhangsan@example.com', phone: '13800138001', address: '北京市朝阳区', register_date: '2023-01-15' },
                { username: 'lisi', password: '$2b$10$9L2q5e9k5SrkKsAYRK5Y6vW4P3bI8y3q6e9k5SrkKsAYRK5Y6vW4P3', name: '李四', email: 'lisi@example.com', phone: '13800138002', address: '上海市黄浦区', register_date: '2023-02-20' },
                { username: 'wangwu', password: '$2b$10$7J3r6f0l6TslLtBZSL6Z7xY5Q4cJ9z4r7f0l6TslLtBZSL6Z7xY5Q4', name: '王五', email: 'wangwu@example.com', phone: '13800138003', address: '广州市天河区', register_date: '2023-03-10' },
                { username: 'zhaoliu', password: '$2b$10$6I4s7g1m7UtmMuCATM7A8yZ6R5dK0a5s8g1m7UtmMuCATM7A8yZ6R5', name: '赵六', email: 'zhaoliu@example.com', phone: '13800138004', address: '深圳市南山区', register_date: '2023-04-05' },
                { username: 'qianqi', password: '$2b$10$5H5t8h2n8VunNvDBUN8B9zA7S6eL1b6t9h2n8VunNvDBUN8B9zA7S6', name: '钱七', email: 'qianqi@example.com', phone: '13800138005', address: '杭州市西湖区', register_date: '2023-05-12' },
                { username: 'sunba', password: '$2b$10$4G6u9i3o9WvoOwECVO9C0aB8T7fM2c7u0i3o9WvoOwECVO9C0aB8T7', name: '孙八', email: 'sunba@example.com', phone: '13800138006', address: '南京市鼓楼区', register_date: '2023-06-08' }
            ];

            for (const user of sampleUsers) {
                await connection.execute(
                    'INSERT INTO users (username, password, name, email, phone, address, register_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [user.username, user.password, user.name, user.email, user.phone, user.address, user.register_date]
                );
            }
            console.log('示例用户数据插入完成');
        }

        // 检查是否已有图书评价数据
        const [reviews] = await connection.execute('SELECT COUNT(*) as count FROM book_reviews');
        if (reviews[0].count === 0) {
            // 插入示例图书评价数据
            const sampleReviews = [
                { book_id: 1, user_id: 2, user_name: '张三', rating: 5, review_text: '《三体》是一部非常震撼的科幻小说，想象力丰富，科学基础扎实，强烈推荐！' },
                { book_id: 1, user_id: 3, user_name: '李四', rating: 4, review_text: '刘慈欣的作品总是能给人惊喜，三体文明的设定很有意思。' },
                { book_id: 1, user_id: 4, user_name: '王五', rating: 5, review_text: '硬科幻的典范之作，每次重读都有新的感悟。' },
                { book_id: 2, user_id: 2, user_name: '张三', rating: 5, review_text: '马尔克斯的魔幻现实主义写作手法令人叹为观止，百年孤独堪称经典。' },
                { book_id: 2, user_id: 4, user_name: '王五', rating: 4, review_text: '读完这本书对拉美文学有了更深的理解，值得反复品读。' },
                { book_id: 3, user_id: 3, user_name: '李四', rating: 5, review_text: '余华的《活着》让人深思，朴实的文字中蕴含着深刻的人生哲理。' },
                { book_id: 3, user_id: 5, user_name: '赵六', rating: 4, review_text: '很感人的作品，读完让人对生命有了新的思考。' },
                { book_id: 4, user_id: 4, user_name: '王五', rating: 4, review_text: '《人类简史》用通俗易懂的语言讲述了人类发展史，很有启发性。' },
                { book_id: 4, user_id: 6, user_name: '钱七', rating: 5, review_text: '视角独特，内容深刻，是了解人类历史的优秀读物。' },
                { book_id: 5, user_id: 5, user_name: '赵六', rating: 5, review_text: '霍金的《时间简史》虽然讲的是深奥的物理学，但写得很有趣，易于理解。' },
                { book_id: 6, user_id: 2, user_name: '张三', rating: 5, review_text: '红楼梦是中国文学的巅峰之作，每个人物都栩栩如生。' },
                { book_id: 6, user_id: 3, user_name: '李四', rating: 4, review_text: '古典文学的魅力无穷，值得细细品味。' },
                { book_id: 11, user_id: 6, user_name: '钱七', rating: 4, review_text: '钱钟书的文笔很犀利，对知识分子的刻画入木三分。' },
                { book_id: 12, user_id: 7, user_name: '孙八', rating: 5, review_text: '东野圭吾的推理小说总是出人意料，白夜行更是其代表作。' },
                { book_id: 13, user_id: 4, user_name: '王五', rating: 4, review_text: '柏拉图的理想国虽然古老，但思想依然具有现实意义。' }
            ];

            for (const review of sampleReviews) {
                await connection.execute(
                    'INSERT INTO book_reviews (book_id, user_id, user_name, rating, review_text) VALUES (?, ?, ?, ?, ?)',
                    [review.book_id, review.user_id, review.user_name, review.rating, review.review_text]
                );
            }
            console.log('示例图书评价数据插入完成');
        }

        // 检查是否已有借阅记录数据
        const [borrows] = await connection.execute('SELECT COUNT(*) as count FROM borrows');
        if (borrows[0].count === 0) {
            // 插入示例借阅记录数据
            const sampleBorrows = [
                { user_id: 2, user_name: '张三', book_id: 2, book_title: '百年孤独', borrow_date: '2024-12-01', due_date: '2024-12-31', status: 'borrowed' },
                { user_id: 3, user_name: '李四', book_id: 5, book_title: '时间简史', borrow_date: '2024-11-15', due_date: '2024-12-15', status: 'borrowed' },
                { user_id: 4, user_name: '王五', book_id: 8, book_title: '水浒传', borrow_date: '2024-10-20', due_date: '2024-11-19', status: 'returned' },
                { user_id: 5, user_name: '赵六', book_id: 12, book_title: '白夜行', borrow_date: '2024-12-10', due_date: '2025-01-09', status: 'borrowed' }
            ];

            for (const borrow of sampleBorrows) {
                await connection.execute(
                    'INSERT INTO borrows (user_id, user_name, book_id, book_title, borrow_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [borrow.user_id, borrow.user_name, borrow.book_id, borrow.book_title, borrow.borrow_date, borrow.due_date, borrow.status]
                );
            }
            console.log('示例借阅记录数据插入完成');
        }

        console.log('示例数据插入完成');
    } catch (error) {
        console.error('插入示例数据失败:', error);
    }
}

// API 路由

// 获取所有图书
app.get('/api/books', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT b.*, c.name as category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id 
            ORDER BY b.id DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('获取图书列表失败:', error);
        res.status(500).json({ error: '获取图书列表失败' });
    }
});

// 根据ID获取图书
app.get('/api/books/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT b.*, c.name as category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id 
            WHERE b.id = ?
        `, [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: '图书不存在' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('获取图书失败:', error);
        res.status(500).json({ error: '获取图书失败' });
    }
});

// 添加图书
app.post('/api/books', async (req, res) => {
    try {
        const { title, author, publisher, isbn, year, category_id, description } = req.body;
        
        if (!title || !author || !publisher || !isbn) {
            return res.status(400).json({ error: '请填写完整的图书信息' });
        }

        const [result] = await pool.execute(
            'INSERT INTO books (title, author, publisher, isbn, year, category_id, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, author, publisher, isbn, year || new Date().getFullYear(), category_id || null, description || '']
        );

        const [newBook] = await pool.execute(`
            SELECT b.*, c.name as category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id 
            WHERE b.id = ?
        `, [result.insertId]);
        res.json(newBook[0]);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'ISBN已存在' });
        } else {
            console.error('添加图书失败:', error);
            res.status(500).json({ error: '添加图书失败' });
        }
    }
});

// 更新图书
app.put('/api/books/:id', async (req, res) => {
    try {
        const { title, author, publisher, isbn, year, category_id, status, current_borrower, description } = req.body;
        
        await pool.execute(
            'UPDATE books SET title = ?, author = ?, publisher = ?, isbn = ?, year = ?, category_id = ?, status = ?, current_borrower = ?, description = ? WHERE id = ?',
            [title, author, publisher, isbn, year, category_id, status, current_borrower, description, req.params.id]
        );

        const [updatedBook] = await pool.execute(`
            SELECT b.*, c.name as category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id 
            WHERE b.id = ?
        `, [req.params.id]);
        res.json(updatedBook[0]);
    } catch (error) {
        console.error('更新图书失败:', error);
        res.status(500).json({ error: '更新图书失败' });
    }
});

// 删除图书
app.delete('/api/books/:id', async (req, res) => {
    try {
        // 检查图书是否正在被借阅
        const [borrows] = await pool.execute(
            'SELECT * FROM borrows WHERE book_id = ? AND status = "borrowed"',
            [req.params.id]
        );

        if (borrows.length > 0) {
            return res.status(400).json({ error: '该图书正在被借阅，无法删除' });
        }

        await pool.execute('DELETE FROM books WHERE id = ?', [req.params.id]);
        res.json({ message: '图书删除成功' });
    } catch (error) {
        console.error('删除图书失败:', error);
        res.status(500).json({ error: '删除图书失败' });
    }
});

// 获取所有用户
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM users ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('获取用户列表失败:', error);
        res.status(500).json({ error: '获取用户列表失败' });
    }
});

// 根据ID获取用户
app.get('/api/users/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('获取用户失败:', error);
        res.status(500).json({ error: '获取用户失败' });
    }
});

// 添加用户
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ error: '请填写姓名和邮箱' });
        }

        const registerDate = new Date().toISOString().split('T')[0];
        
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, phone, address, register_date) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone || '', address || '', registerDate]
        );

        const [newUser] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
        res.json(newUser[0]);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: '邮箱已存在' });
        } else {
            console.error('添加用户失败:', error);
            res.status(500).json({ error: '添加用户失败' });
        }
    }
});

// 更新用户
app.put('/api/users/:id', async (req, res) => {
    try {
        const { name, email, phone, address, status } = req.body;
        
        await pool.execute(
            'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, status = ? WHERE id = ?',
            [name, email, phone, address, status, req.params.id]
        );

        const [updatedUser] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
        res.json(updatedUser[0]);
    } catch (error) {
        console.error('更新用户失败:', error);
        res.status(500).json({ error: '更新用户失败' });
    }
});

// 删除用户
app.delete('/api/users/:id', async (req, res) => {
    try {
        // 检查用户是否有未归还的图书
        const [borrows] = await pool.execute(
            'SELECT * FROM borrows WHERE user_id = ? AND status = "borrowed"',
            [req.params.id]
        );

        if (borrows.length > 0) {
            return res.status(400).json({ error: '该用户有未归还的图书，无法删除' });
        }

        await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: '用户删除成功' });
    } catch (error) {
        console.error('删除用户失败:', error);
        res.status(500).json({ error: '删除用户失败' });
    }
});

// 获取所有借阅记录
app.get('/api/borrows', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT b.*, u.name as user_name, bk.title as book_title 
            FROM borrows b 
            LEFT JOIN users u ON b.user_id = u.id 
            LEFT JOIN books bk ON b.book_id = bk.id 
            ORDER BY b.id DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('获取借阅记录失败:', error);
        res.status(500).json({ error: '获取借阅记录失败' });
    }
});

// 借书
app.post('/api/borrows', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { user_id, book_id, user_name, book_title, borrow_date, due_date } = req.body;
        
        if (!user_id || !book_id) {
            return res.status(400).json({ error: '请选择用户和图书' });
        }

        // 检查图书状态
        const [books] = await connection.execute('SELECT * FROM books WHERE id = ?', [book_id]);
        if (books.length === 0) {
            return res.status(404).json({ error: '图书不存在' });
        }
        
        if (books[0].status === 'borrowed') {
            return res.status(400).json({ error: '该图书已被借出' });
        }

        // 使用前端传来的日期，如果没有则使用默认值
        const borrowDate = borrow_date || new Date().toISOString().split('T')[0];
        const dueDate = due_date || (() => {
            const date = new Date();
            date.setDate(date.getDate() + 30);
            return date.toISOString().split('T')[0];
        })();

        // 添加借阅记录
        const [borrowResult] = await connection.execute(
            'INSERT INTO borrows (user_id, user_name, book_id, book_title, borrow_date, due_date) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, user_name, book_id, book_title, borrowDate, dueDate]
        );

        // 更新图书状态
        await connection.execute(
            'UPDATE books SET status = "borrowed", current_borrower = ? WHERE id = ?',
            [user_name, book_id]
        );

        await connection.commit();

        const [newBorrow] = await connection.execute('SELECT * FROM borrows WHERE id = ?', [borrowResult.insertId]);
        res.json(newBorrow[0]);
        
    } catch (error) {
        await connection.rollback();
        console.error('借书失败:', error);
        res.status(500).json({ error: '借书失败' });
    } finally {
        connection.release();
    }
});

// 还书
app.put('/api/borrows/:id/return', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 获取借阅记录
        const [borrows] = await connection.execute('SELECT * FROM borrows WHERE id = ?', [req.params.id]);
        if (borrows.length === 0) {
            return res.status(404).json({ error: '借阅记录不存在' });
        }
        
        const borrow = borrows[0];
        if (borrow.status === 'returned') {
            return res.status(400).json({ error: '该图书已经归还' });
        }

        const returnDate = new Date().toISOString().split('T')[0];

        // 更新借阅记录
        await connection.execute(
            'UPDATE borrows SET return_date = ?, status = "returned" WHERE id = ?',
            [returnDate, req.params.id]
        );

        // 更新图书状态
        await connection.execute(
            'UPDATE books SET status = "available", current_borrower = NULL WHERE id = ?',
            [borrow.book_id]
        );

        await connection.commit();

        const [updatedBorrow] = await connection.execute('SELECT * FROM borrows WHERE id = ?', [req.params.id]);
        res.json(updatedBorrow[0]);
        
    } catch (error) {
        await connection.rollback();
        console.error('还书失败:', error);
        res.status(500).json({ error: '还书失败' });
    } finally {
        connection.release();
    }
});

// 获取统计信息
app.get('/api/stats', async (req, res) => {
    try {
        const [totalBooks] = await pool.execute('SELECT COUNT(*) as count FROM books');
        const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');
        const [borrowedBooks] = await pool.execute('SELECT COUNT(*) as count FROM borrows WHERE status = "borrowed"');
        const [overdueBooks] = await pool.execute(
            'SELECT COUNT(*) as count FROM borrows WHERE status = "borrowed" AND due_date < CURDATE()'
        );

        res.json({
            totalBooks: totalBooks[0].count,
            totalUsers: totalUsers[0].count,
            borrowedBooks: borrowedBooks[0].count,
            overdueBooks: overdueBooks[0].count
        });
    } catch (error) {
        console.error('获取统计信息失败:', error);
        res.status(500).json({ error: '获取统计信息失败' });
    }
});

// 搜索API
app.get('/api/search/books', async (req, res) => {
    try {
        const { keyword, status, category_id } = req.query;
        let query = `
            SELECT b.*, c.name as category_name,
                   ROUND(AVG(r.rating), 1) as average_rating,
                   COUNT(r.id) as review_count
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id 
            LEFT JOIN book_reviews r ON b.id = r.book_id
            WHERE 1=1
        `;
        const params = [];

        if (keyword) {
            query += ' AND (b.title LIKE ? OR b.author LIKE ? OR b.publisher LIKE ? OR b.isbn LIKE ? OR c.name LIKE ?)';
            const searchTerm = `%${keyword}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        if (category_id) {
            query += ' AND b.category_id = ?';
            params.push(category_id);
        }

        query += ' GROUP BY b.id ORDER BY b.id DESC';

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('搜索图书失败:', error);
        res.status(500).json({ error: '搜索图书失败' });
    }
});

// 搜索分类
app.get('/api/search/categories', async (req, res) => {
    try {
        const { keyword } = req.query;
        let query = 'SELECT * FROM categories WHERE 1=1';
        const params = [];

        if (keyword) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            const searchTerm = `%${keyword}%`;
            params.push(searchTerm, searchTerm);
        }

        query += ' ORDER BY name';

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('搜索分类失败:', error);
        res.status(500).json({ error: '搜索分类失败' });
    }
});

app.get('/api/search/users', async (req, res) => {
    try {
        const { keyword, status } = req.query;
        let query = 'SELECT * FROM users WHERE 1=1';
        const params = [];

        if (keyword) {
            query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            const searchTerm = `%${keyword}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY id DESC';

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('搜索用户失败:', error);
        res.status(500).json({ error: '搜索用户失败' });
    }
});

app.get('/api/search/borrows', async (req, res) => {
    try {
        const { keyword, status } = req.query;
        let query = `
            SELECT b.*, u.name as user_name, bk.title as book_title 
            FROM borrows b 
            LEFT JOIN users u ON b.user_id = u.id 
            LEFT JOIN books bk ON b.book_id = bk.id 
            WHERE 1=1
        `;
        const params = [];

        if (keyword) {
            query += ' AND (u.name LIKE ? OR bk.title LIKE ?)';
            const searchTerm = `%${keyword}%`;
            params.push(searchTerm, searchTerm);
        }

        if (status) {
            if (status === 'overdue') {
                query += ' AND b.status = "borrowed" AND b.due_date < CURDATE()';
            } else {
                query += ' AND b.status = ?';
                params.push(status);
            }
        }

        query += ' ORDER BY b.id DESC';

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('搜索借阅记录失败:', error);
        res.status(500).json({ error: '搜索借阅记录失败' });
    }
});

// 图书分类相关API
// 获取所有分类
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT c.*, 
                   COUNT(b.id) as book_count
            FROM categories c 
            LEFT JOIN books b ON c.id = b.category_id 
            GROUP BY c.id 
            ORDER BY c.name
        `);
        res.json(rows);
    } catch (error) {
        console.error('获取分类列表失败:', error);
        res.status(500).json({ error: '获取分类列表失败' });
    }
});

// 添加分类
app.post('/api/categories', async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: '请填写分类名称' });
        }

        const [result] = await pool.execute(
            'INSERT INTO categories (name, description) VALUES (?, ?)',
            [name, description || '']
        );

        const [newCategory] = await pool.execute('SELECT * FROM categories WHERE id = ?', [result.insertId]);
        res.json(newCategory[0]);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: '分类名称已存在' });
        } else {
            console.error('添加分类失败:', error);
            res.status(500).json({ error: '添加分类失败' });
        }
    }
});

// 更新分类
app.put('/api/categories/:id', async (req, res) => {
    try {
        const { name, description } = req.body;
        
        await pool.execute(
            'UPDATE categories SET name = ?, description = ? WHERE id = ?',
            [name, description, req.params.id]
        );

        const [updatedCategory] = await pool.execute('SELECT * FROM categories WHERE id = ?', [req.params.id]);
        res.json(updatedCategory[0]);
    } catch (error) {
        console.error('更新分类失败:', error);
        res.status(500).json({ error: '更新分类失败' });
    }
});

// 删除分类
app.delete('/api/categories/:id', async (req, res) => {
    try {
        // 检查是否有图书使用该分类
        const [books] = await pool.execute('SELECT COUNT(*) as count FROM books WHERE category_id = ?', [req.params.id]);
        
        if (books[0].count > 0) {
            return res.status(400).json({ error: '该分类下还有图书，无法删除' });
        }

        await pool.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: '分类删除成功' });
    } catch (error) {
        console.error('删除分类失败:', error);
        res.status(500).json({ error: '删除分类失败' });
    }
});

// 图书评价相关API
// 获取图书的所有评价
app.get('/api/books/:id/reviews', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT r.*, u.name as user_name 
            FROM book_reviews r 
            LEFT JOIN users u ON r.user_id = u.id 
            WHERE r.book_id = ? 
            ORDER BY r.created_at DESC
        `, [req.params.id]);
        res.json(rows);
    } catch (error) {
        console.error('获取图书评价失败:', error);
        res.status(500).json({ error: '获取图书评价失败' });
    }
});

// 添加或更新图书评价
app.post('/api/books/:id/reviews', async (req, res) => {
    try {
        const { user_id, user_name, rating, review_text } = req.body;
        const book_id = req.params.id;
        
        if (!user_id || !rating) {
            return res.status(400).json({ error: '请填写完整的评价信息' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: '评分必须在1-5之间' });
        }

        // 检查用户是否已经评价过该图书
        const [existingReview] = await pool.execute(
            'SELECT id FROM book_reviews WHERE user_id = ? AND book_id = ?',
            [user_id, book_id]
        );

        if (existingReview.length > 0) {
            // 更新现有评价
            await pool.execute(
                'UPDATE book_reviews SET rating = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND book_id = ?',
                [rating, review_text || '', user_id, book_id]
            );
            
            const [updatedReview] = await pool.execute(
                'SELECT * FROM book_reviews WHERE user_id = ? AND book_id = ?',
                [user_id, book_id]
            );
            res.json(updatedReview[0]);
        } else {
            // 添加新评价
            const [result] = await pool.execute(
                'INSERT INTO book_reviews (book_id, user_id, user_name, rating, review_text) VALUES (?, ?, ?, ?, ?)',
                [book_id, user_id, user_name, rating, review_text || '']
            );

            const [newReview] = await pool.execute('SELECT * FROM book_reviews WHERE id = ?', [result.insertId]);
            res.json(newReview[0]);
        }
    } catch (error) {
        console.error('添加图书评价失败:', error);
        res.status(500).json({ error: '添加图书评价失败' });
    }
});

// 删除图书评价
app.delete('/api/reviews/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM book_reviews WHERE id = ?', [req.params.id]);
        res.json({ message: '评价删除成功' });
    } catch (error) {
        console.error('删除图书评价失败:', error);
        res.status(500).json({ error: '删除图书评价失败' });
    }
});

// 获取图书的平均评分
app.get('/api/books/:id/rating', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                ROUND(AVG(rating), 1) as average_rating,
                COUNT(*) as review_count
            FROM book_reviews 
            WHERE book_id = ?
        `, [req.params.id]);
        
        res.json({
            average_rating: rows[0].average_rating || 0,
            review_count: rows[0].review_count || 0
        });
    } catch (error) {
        console.error('获取图书评分失败:', error);
        res.status(500).json({ error: '获取图书评分失败' });
    }
});

// 用户注册
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, name, email, phone, address } = req.body;
        
        // 验证必填字段
        if (!username || !password || !name || !email) {
            return res.status(400).json({ error: '用户名、密码、姓名和邮箱为必填项' });
        }

        // 检查用户名是否已存在
        const [existingUser] = await pool.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ error: '用户名已存在' });
        }

        // 检查邮箱是否已存在
        const [existingEmail] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        if (existingEmail.length > 0) {
            return res.status(400).json({ error: '邮箱已存在' });
        }

        // 加密密码
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 插入新用户
        const [result] = await pool.execute(
            'INSERT INTO users (username, password, name, email, phone, address, register_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, name, email, phone || '', address || '', new Date().toISOString().split('T')[0]]
        );

        res.json({ 
            message: '注册成功', 
            userId: result.insertId,
            username: username,
            name: name
        });
    } catch (error) {
        console.error('用户注册失败:', error);
        res.status(500).json({ error: '注册失败，请重试' });
    }
});

// 用户登录
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }

        // 查找用户
        const [users] = await pool.execute(
            'SELECT id, username, password, name, email, status FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const user = users[0];

        // 检查账户状态
        if (user.status === 'inactive') {
            return res.status(401).json({ error: '账户已被禁用' });
        }

        // 验证密码
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 登录成功，返回用户信息（不包含密码）
        res.json({
            message: '登录成功',
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('用户登录失败:', error);
        res.status(500).json({ error: '登录失败，请重试' });
    }
});

// 管理员登录（简单的硬编码验证）
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 从数据库验证管理员（username为'admin'的用户）
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ? AND status = ?',
            [username, 'active']
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: '用户不存在或已被禁用' });
        }

        const user = rows[0];
        
        // 验证用户名是否为admin
        if (user.username !== 'admin') {
            return res.status(401).json({ error: '只有管理员可以通过此接口登录' });
        }

        // 验证密码 - 对admin用户特殊处理
        let isPasswordValid = false;
        
        if (user.username === 'admin') {
            // 对admin用户，支持明文密码验证
            if (user.password === 'admin123' && password === 'admin123') {
                isPasswordValid = true;
            } else {
                // 也尝试bcrypt验证，以防数据库中存储的是哈希值
                try {
                    isPasswordValid = await bcrypt.compare(password, user.password);
                } catch (err) {
                    // bcrypt验证失败，继续使用明文比较结果
                    isPasswordValid = false;
                }
            }
        } else {
            // 对其他用户使用bcrypt验证
            isPasswordValid = await bcrypt.compare(password, user.password);
        }
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: '密码错误' });
        }

        res.json({
            message: '管理员登录成功',
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('管理员登录失败:', error);
        res.status(500).json({ error: '登录失败，请重试' });
    }
});

// 静态文件路由 - 确保index.html作为默认页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
async function startServer() {
    try {
        await initDatabase();
        app.listen(PORT, () => {
            console.log(`服务器运行在 http://localhost:${PORT}`);
            console.log('请在浏览器中访问: http://localhost:3000');
        });
    } catch (error) {
        console.error('启动服务器失败:', error);
    }
}

startServer();
