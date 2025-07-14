-- Library Management System Database Initialization

-- Drop existing database if exists and create new one
DROP DATABASE IF EXISTS library_system;
CREATE DATABASE library_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE library_system;

-- Create categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create books table (using category_id foreign key)
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create borrow records table
CREATE TABLE borrows (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create book reviews table
CREATE TABLE book_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample categories (must be inserted first due to foreign key constraints)
INSERT INTO categories (name, description) VALUES
('文学', '文学类图书，包括小说、散文、诗歌等'),
('科技', '科技类图书，包括科学、技术、计算机等'),
('历史', '历史类图书，包括中国史、世界史等'),
('哲学', '哲学类图书，包括哲学理论、伦理学等'),
('教育', '教育类图书，包括教育理论、教学方法等'),
('艺术', '艺术类图书，包括美术、音乐、舞蹈等'),
('经济', '经济类图书，包括经济理论、管理学等'),
('医学', '医学类图书，包括基础医学、临床医学等'),
('法律', '法律类图书，包括法学理论、实务指导等'),
('其他', '其他类别图书');

-- Insert sample users
INSERT INTO users (username, password, name, email, phone, address, register_date) VALUES
('admin', 'admin123', '管理员', 'admin@example.com', '13800000000', '系统管理', '2023-01-01'),
('zhangsan', '$2b$10$8K1p4d8j4RqjJrZXQJ4X5uV3O2aH7x2p5d8j4RqjJrZXQJ4X5uV3O2', '张三', 'zhangsan@example.com', '13800138001', '北京市朝阳区', '2023-01-15'),
('lisi', '$2b$10$9L2q5e9k5SrkKsAYRK5Y6vW4P3bI8y3q6e9k5SrkKsAYRK5Y6vW4P3', '李四', 'lisi@example.com', '13800138002', '上海市黄浦区', '2023-02-20'),
('wangwu', '$2b$10$7J3r6f0l6TslLtBZSL6Z7xY5Q4cJ9z4r7f0l6TslLtBZSL6Z7xY5Q4', '王五', 'wangwu@example.com', '13800138003', '广州市天河区', '2023-03-10'),
('zhaoliu', '$2b$10$6I4s7g1m7UtmMuCATM7A8yZ6R5dK0a5s8g1m7UtmMuCATM7A8yZ6R5', '赵六', 'zhaoliu@example.com', '13800138004', '深圳市南山区', '2023-04-05'),
('qianqi', '$2b$10$5H5t8h2n8VunNvDBUN8B9zA7S6eL1b6t9h2n8VunNvDBUN8B9zA7S6', '钱七', 'qianqi@example.com', '13800138005', '杭州市西湖区', '2023-05-12'),
('sunba', '$2b$10$4G6u9i3o9WvoOwECVO9C0aB8T7fM2c7u0i3o9WvoOwECVO9C0aB8T7', '孙八', 'sunba@example.com', '13800138006', '南京市鼓楼区', '2023-06-08');

-- Insert sample books (after categories are inserted)
INSERT INTO books (title, author, publisher, isbn, year, category_id, description) VALUES
('三体', '刘慈欣', '重庆出版社', '9787536692930', 2008, 2, '科幻小说经典作品，讲述人类与外星文明的接触'),
('百年孤独', '加西亚·马尔克斯', '南海出版公司', '9787544253994', 1967, 1, '魔幻现实主义代表作品'),
('活着', '余华', '作家出版社', '9787506365437', 1993, 1, '现代文学经典，反映中国社会变迁'),
('人类简史', '尤瓦尔·赫拉利', '中信出版社', '9787508640757', 2014, 3, '从认知革命到智人统治地球的历史'),
('时间简史', '史蒂芬·霍金', '湖南科技出版社', '9787535732309', 1988, 2, '物理学科普经典，探索宇宙奥秘'),
('红楼梦', '曹雪芹', '人民文学出版社', '9787020002207', 1791, 1, '中国古典文学四大名著之一'),
('西游记', '吴承恩', '人民文学出版社', '9787020008735', 1592, 1, '中国古典神话小说代表作'),
('水浒传', '施耐庵', '人民文学出版社', '9787020008742', 1373, 1, '描写农民起义的英雄传奇'),
('三国演义', '罗贯中', '人民文学出版社', '9787020008728', 1522, 1, '中国历史小说的经典之作'),
('平凡的世界', '路遥', '北京十月文艺出版社', '9787530216781', 1986, 1, '反映中国农村改革开放的现实主义小说'),
('围城', '钱钟书', '人民文学出版社', '9787020002214', 1947, 1, '现代文学经典，讽刺知识分子生活'),
('白夜行', '东野圭吾', '南海出版公司', '9787544242424', 1999, 1, '日本推理小说名作'),
('理想国', '柏拉图', '商务印书馆', '9787100004831', 2002, 4, '古希腊哲学经典著作'),
('国富论', '亚当·斯密', '商务印书馆', '9787100004848', 2009, 7, '经济学经典理论著作'),
('艺术的故事', '贡布里希', '广西美术出版社', '9787807463108', 2008, 6, '西方艺术史经典入门读物');

-- Insert sample book reviews
INSERT INTO book_reviews (book_id, user_id, user_name, rating, review_text) VALUES
(1, 2, '张三', 5, '《三体》是一部非常震撼的科幻小说，想象力丰富，科学基础扎实，强烈推荐！'),
(1, 3, '李四', 4, '刘慈欣的作品总是能给人惊喜，三体文明的设定很有意思。'),
(1, 4, '王五', 5, '硬科幻的典范之作，每次重读都有新的感悟。'),
(2, 2, '张三', 5, '马尔克斯的魔幻现实主义写作手法令人叹为观止，百年孤独堪称经典。'),
(2, 4, '王五', 4, '读完这本书对拉美文学有了更深的理解，值得反复品读。'),
(3, 3, '李四', 5, '余华的《活着》让人深思，朴实的文字中蕴含着深刻的人生哲理。'),
(3, 5, '赵六', 4, '很感人的作品，读完让人对生命有了新的思考。'),
(4, 4, '王五', 4, '《人类简史》用通俗易懂的语言讲述了人类发展史，很有启发性。'),
(4, 6, '钱七', 5, '视角独特，内容深刻，是了解人类历史的优秀读物。'),
(5, 5, '赵六', 5, '霍金的《时间简史》虽然讲的是深奥的物理学，但写得很有趣，易于理解。'),
(6, 2, '张三', 5, '红楼梦是中国文学的巅峰之作，每个人物都栩栩如生。'),
(6, 3, '李四', 4, '古典文学的魅力无穷，值得细细品味。'),
(11, 6, '钱七', 4, '钱钟书的文笔很犀利，对知识分子的刻画入木三分。'),
(12, 7, '孙八', 5, '东野圭吾的推理小说总是出人意料，白夜行更是其代表作。'),
(13, 4, '王五', 4, '柏拉图的理想国虽然古老，但思想依然具有现实意义。');

-- Insert sample borrow records
INSERT INTO borrows (user_id, user_name, book_id, book_title, borrow_date, due_date, status) VALUES
(2, '张三', 2, '百年孤独', '2024-12-01', '2024-12-31', 'borrowed'),
(3, '李四', 5, '时间简史', '2024-11-15', '2024-12-15', 'borrowed'),
(4, '王五', 8, '水浒传', '2024-10-20', '2024-11-19', 'returned'),
(5, '赵六', 12, '白夜行', '2024-12-10', '2025-01-09', 'borrowed');

-- Create indexes for better performance
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_reviews_created ON book_reviews(created_at);
CREATE INDEX idx_borrows_dates ON borrows(borrow_date, due_date);


