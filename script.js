// 图书馆管理系统 JavaScript 代码

// 全局变量
let currentUser = null;
let currentUserRole = null;

// API基础URL
const API_BASE_URL = '/api';

// API类
class API {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // HTTP请求工具方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP错误: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    // 图书相关API
    async getBooks() {
        return await this.request('/books');
    }

    async getBook(id) {
        return await this.request(`/books/${id}`);
    }

    async addBook(bookData) {
        return await this.request('/books', {
            method: 'POST',
            body: bookData
        });
    }

    async updateBook(id, bookData) {
        return await this.request(`/books/${id}`, {
            method: 'PUT',
            body: bookData
        });
    }

    async deleteBook(id) {
        return await this.request(`/books/${id}`, {
            method: 'DELETE'
        });
    }

    async searchBooks(keyword, status, categoryId) {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (status) params.append('status', status);
        if (categoryId) params.append('category_id', categoryId);
        
        console.log('搜索参数:', { keyword, status, categoryId });
        console.log('API URL:', `/search/books?${params.toString()}`);
        
        return await this.request(`/search/books?${params.toString()}`);
    }

    // 用户相关API
    async getUsers() {
        return await this.request('/users');
    }

    async getUserById(id) {
        return await this.request(`/users/${id}`);
    }

    async addUser(userData) {
        return await this.request('/users', {
            method: 'POST',
            body: userData
        });
    }

    async updateUser(id, userData) {
        return await this.request(`/users/${id}`, {
            method: 'PUT',
            body: userData
        });
    }

    async deleteUser(id) {
        return await this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    }

    // 分类相关API
    async getCategories() {
        return await this.request('/categories');
    }

    async addCategory(categoryData) {
        return await this.request('/categories', {
            method: 'POST',
            body: categoryData
        });
    }

    async updateCategory(id, categoryData) {
        return await this.request(`/categories/${id}`, {
            method: 'PUT',
            body: categoryData
        });
    }

    async deleteCategory(id) {
        return await this.request(`/categories/${id}`, {
            method: 'DELETE'
        });
    }

    // 借阅相关API
    async getBorrows() {
        return await this.request('/borrows');
    }

    async addBorrow(borrowData) {
        return await this.request('/borrows', {
            method: 'POST',
            body: borrowData
        });
    }

    async returnBook(borrowId) {
        return await this.request(`/borrows/${borrowId}/return`, {
            method: 'PUT'
        });
    }

    // 评价相关API
    async getBookReviews(bookId) {
        return await this.request(`/books/${bookId}/reviews`);
    }

    async addReview(bookId, reviewData) {
        return await this.request(`/books/${bookId}/reviews`, {
            method: 'POST',
            body: reviewData
        });
    }

    async deleteReview(reviewId) {
        return await this.request(`/reviews/${reviewId}`, {
            method: 'DELETE'
        });
    }

    async getBookRating(bookId) {
        return await this.request(`/books/${bookId}/rating`);
    }

    // 统计API
    async getStats() {
        return await this.request('/stats');
    }

    // 搜索API
    async searchCategories(keyword) {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        
        return await this.request(`/search/categories?${params.toString()}`);
    }

    async searchUsers(keyword, status) {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (status) params.append('status', status);
        
        return await this.request(`/search/users?${params.toString()}`);
    }

    async searchBorrows(keyword, status) {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (status) params.append('status', status);
        
        return await this.request(`/search/borrows?${params.toString()}`);
    }
}

// 实例化API
const api = new API();

// 工具函数
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;

    // 设置背景色
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#212529';
            break;
        default:
            notification.style.backgroundColor = '#17a2b8';
    }

    document.body.appendChild(notification);

    // 3秒后自动移除
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 登录相关功能
function selectRole(role) {
    currentUserRole = role;
    const loginForm = document.getElementById('loginForm');
    const usernameLabel = document.getElementById('usernameLabel');
    const registerBtn = document.getElementById('registerBtn');
    
    if (role === 'reader') {
        usernameLabel.textContent = '用户名：';
        registerBtn.style.display = 'inline-block';
    } else {
        usernameLabel.textContent = '管理员用户名：';
        registerBtn.style.display = 'none';
    }
    
    document.querySelector('.role-selection').style.display = 'none';
    loginForm.style.display = 'block';
}

function showRoleSelection() {
    currentUserRole = null;
    document.querySelector('.role-selection').style.display = 'flex';
    document.getElementById('loginForm').style.display = 'none';
    // 清空输入框
    document.getElementById('userName').value = '';
    document.getElementById('userPassword').value = '';
}

function showRegisterForm() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('registerContainer').style.display = 'block';
    // 清空注册表单
    document.getElementById('regUsername').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regConfirmPassword').value = '';
    document.getElementById('regName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPhone').value = '';
    document.getElementById('regAddress').value = '';
}

function backToLogin() {
    document.getElementById('registerContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'block';
}

async function register() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const address = document.getElementById('regAddress').value.trim();
    
    // 验证输入
    if (!username || !password || !name || !email) {
        showNotification('用户名、密码、姓名和邮箱为必填项', 'error');
        return;
    }
    
    if (username.length < 3 || username.length > 20) {
        showNotification('用户名长度应为3-20位字符', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('密码长度至少为6位', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('邮箱格式不正确', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                name,
                email,
                phone,
                address
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('注册成功！请登录', 'success');
            backToLogin();
            // 自动填入用户名
            document.getElementById('userName').value = username;
        } else {
            showNotification(data.error || '注册失败', 'error');
        }
    } catch (error) {
        console.error('注册失败:', error);
        showNotification('注册失败，请检查网络连接', 'error');
    }
}

async function login() {
    const userName = document.getElementById('userName').value.trim();
    const userPassword = document.getElementById('userPassword').value;
    
    if (!userName || !userPassword) {
        showNotification('请输入用户名和密码', 'error');
        return;
    }
    
    try {
        let endpoint = currentUserRole === 'admin' ? '/api/admin/login' : '/api/login';
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: userName,
                password: userPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // 登录成功，设置当前用户
            currentUser = {
                id: data.user.id,
                username: data.user.username,
                name: data.user.name,
                role: currentUserRole
            };
            
            showNotification(`${currentUserRole === 'admin' ? '管理员' : '读者'} ${data.user.name} 登录成功`, 'success');
            
            // 显示主界面
            showMainInterface();
        } else {
            showNotification(data.error || '登录失败', 'error');
        }
    } catch (error) {
        console.error('登录失败:', error);
        showNotification('登录失败，请检查网络连接', 'error');
    }
}

function showMainInterface() {
    const loginContainer = document.getElementById('loginContainer');
    const mainContainer = document.getElementById('mainContainer');
    
    if (loginContainer) loginContainer.style.display = 'none';
    if (mainContainer) mainContainer.style.display = 'flex';
    
    // 初始化应用
    initializeApp();
}

async function initializeApp() {
    // 设置用户权限
    setUserPermissions();
    
    // 绑定导航事件
    bindNavigationEvents();
    
    // 绑定搜索事件
    bindSearchEvents();
    
    // 设置高级搜索事件
    setupAdvancedSearchEvents();
    
    // 加载初始数据
    await loadBooks();
    await loadCategories();
    await loadAdvancedSearchCategories();
    
    if (currentUserRole === 'admin') {
        await loadUsers();
        await loadBorrows();
        await updateStats();
    }
    
    console.log('应用初始化完成');
}

function setUserPermissions() {
    const addBookBtn = document.getElementById('addBookBtn');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const usersTab = document.getElementById('usersTab');
    const categoriesTab = document.getElementById('categoriesTab');
    const borrowTab = document.querySelector('[data-tab="borrow"]');
    
    // 显示当前用户信息
    const userInfo = document.getElementById('currentUser');
    if (userInfo && currentUser) {
        userInfo.textContent = `${currentUserRole === 'admin' ? '管理员' : '读者'}：${currentUser.name}`;
    }
    
    if (currentUserRole === 'admin') {
        // 管理员拥有所有权限
        if (addBookBtn) addBookBtn.style.display = 'inline-block';
        if (addCategoryBtn) addCategoryBtn.style.display = 'inline-block';
        if (usersTab) usersTab.style.display = 'inline-block';
        if (categoriesTab) categoriesTab.style.display = 'inline-block';
        if (borrowTab) borrowTab.style.display = 'inline-block';
    } else {
        // 读者只能查看，不能添加图书、分类和用户
        if (addBookBtn) addBookBtn.style.display = 'none';
        if (addCategoryBtn) addCategoryBtn.style.display = 'none';
        if (usersTab) usersTab.style.display = 'none';
        if (categoriesTab) categoriesTab.style.display = 'none';
        if (borrowTab) borrowTab.style.display = 'none';
    }
}

function logout() {
    currentUser = null;
    currentUserRole = null;
    
    // 显示登录界面
    const loginContainer = document.getElementById('loginContainer');
    const registerContainer = document.getElementById('registerContainer');
    const mainContainer = document.getElementById('mainContainer');
    
    if (loginContainer) loginContainer.style.display = 'flex';
    if (registerContainer) registerContainer.style.display = 'none';
    if (mainContainer) mainContainer.style.display = 'none';
    
    // 重置界面
    showRoleSelection();
    
    showNotification('已成功登出', 'success');
}

// 导航功能
function bindNavigationEvents() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

async function switchTab(tabName) {
    // 隐藏所有标签页内容
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // 移除所有导航按钮的active类
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    // 显示选中的标签页内容
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // 激活对应的导航按钮
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // 根据标签页加载相应的数据
    switch (tabName) {
        case 'books':
            await loadBooks();
            break;
        case 'categories':
            await loadCategories();
            break;
        case 'users':
            await loadUsers();
            break;
        case 'borrow':
            await loadBorrows();
            await updateStats();
            break;
        case 'search':
            await loadAdvancedSearchCategories();
            break;
    }
}

// 搜索功能
function bindSearchEvents() {
    const bookSearch = document.getElementById('bookSearch');
    if (bookSearch) {
        bookSearch.addEventListener('input', debounce(searchBooks, 300));
    }

    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', debounce(searchUsers, 300));
    }

    const categorySearch = document.getElementById('categorySearch');
    if (categorySearch) {
        categorySearch.addEventListener('input', debounce(searchCategories, 300));
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 图书管理
async function loadBooks() {
    try {
        const books = await api.getBooks();
        renderBooksTable(books);
    } catch (error) {
        showNotification('加载图书列表失败', 'error');
        console.error('加载图书失败:', error);
    }
}

function renderBooksTable(books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="no-data">暂无图书</td></tr>';
        return;
    }
    
    books.forEach(book => {
        const row = document.createElement('tr');
        const statusText = book.status === 'available' ? '可借' : '已借出';
        const statusClass = book.status === 'available' ? 'status-available' : 'status-borrowed';
        
        // 只有管理员才能看到编辑和删除按钮
        let adminActions = '';
        if (currentUserRole === 'admin') {
            adminActions = `
                <button class="btn btn-sm btn-warning" onclick="editBook(${book.id})">编辑</button>
                <button class="btn btn-sm btn-danger" onclick="deleteBook(${book.id})">删除</button>
            `;
        }
        
        // 借阅按钮 - 所有登录用户都可以借书
        let borrowAction = '';
        if (book.status === 'available' && currentUser) {
            borrowAction = `<button class="btn btn-sm btn-success" onclick="borrowBook(${book.id})">借阅</button>`;
        } else if (book.status !== 'available') {
            borrowAction = '<span class="text-muted">已借出</span>';
        } else {
            borrowAction = '<span class="text-muted">请先登录</span>';
        }
        
        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.publisher}</td>
            <td>${book.isbn}</td>
            <td>${book.year || '-'}</td>
            <td>${book.category_name || '未分类'}</td>
            <td>
                <span class="status ${statusClass}">${statusText}</span>
                <br>${borrowAction}
            </td>
            <td>
                <button class="btn btn-sm btn-info" onclick="showBookDetail(${book.id})">详情</button>
                ${adminActions}
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function searchBooks() {
    const keyword = document.getElementById('bookSearch').value.trim();
    
    console.log('搜索关键词:', keyword);
    
    if (!keyword) {
        await loadBooks();
        return;
    }
    
    try {
        console.log('调用搜索API...');
        const books = await api.searchBooks(keyword, null, null);
        console.log('搜索结果:', books);
        renderBooksTable(books);
    } catch (error) {
        console.error('搜索图书失败:', error);
        showNotification('搜索图书失败: ' + error.message, 'error');
    }
}

async function showBookDetail(bookId) {
    try {
        const book = await api.getBook(bookId);
        const reviews = await api.getBookReviews(bookId);
        const rating = await api.getBookRating(bookId);
        
        showBookDetailModal(book, reviews, rating);
    } catch (error) {
        showNotification('获取图书详情失败', 'error');
        console.error('获取图书详情失败:', error);
    }
}

function showBookDetailModal(book, reviews, rating) {
    const modal = createModal('图书详情');
    modal.content.classList.add('large');
    modal.body.classList.add('book-detail');
    modal.header.querySelector('h3').setAttribute('data-book-detail', 'true');
    
    // 生成评价列表HTML
    const reviewsHtml = reviews.map((review, index) => `
        <div class="review-item" style="animation-delay: ${0.1 + index * 0.1}s;">
            <div class="review-header">
                <strong>${review.user_name}</strong>
                <span class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                <span class="review-date">${formatDate(review.created_at)}</span>
            </div>
            <div class="review-text">${review.review_text || '无文字评价'}</div>
        </div>
    `).join('');
    
    const statusClass = book.status === 'available' ? 'available' : 'borrowed';
    const statusText = book.status === 'available' ? '可借' : '已借出';
    
    modal.body.innerHTML = `
        <div class="book-details">
            <h3>${book.title}</h3>
            
            <div class="book-info-grid">
                <div class="book-info-item">
                    <div class="label">📝 作者</div>
                    <div class="value">${book.author}</div>
                </div>
                <div class="book-info-item">
                    <div class="label">🏢 出版社</div>
                    <div class="value">${book.publisher}</div>
                </div>
                <div class="book-info-item">
                    <div class="label">🔢 ISBN</div>
                    <div class="value">${book.isbn}</div>
                </div>
                <div class="book-info-item">
                    <div class="label">📅 出版年份</div>
                    <div class="value">${book.year || '-'}</div>
                </div>
                <div class="book-info-item">
                    <div class="label">📂 分类</div>
                    <div class="value">${book.category_name || '未分类'}</div>
                </div>
                <div class="book-info-item">
                    <div class="label">📊 状态</div>
                    <div class="value">
                        <span class="book-status ${statusClass}">${statusText}</span>
                    </div>
                </div>
            </div>
            
            <div class="book-info-item" style="grid-column: 1/-1; animation-delay: 0.7s;">
                <div class="label">📝 描述</div>
                <div class="value">${book.description || '暂无描述'}</div>
            </div>
            
            <div class="book-rating" style="animation: fadeInUp 0.5s ease-out 0.8s both;">
                <span class="rating-stars">${rating.average_rating ? '★'.repeat(Math.floor(rating.average_rating)) + '☆'.repeat(5-Math.floor(rating.average_rating)) : '☆☆☆☆☆'}</span>
                <span class="rating-text">${rating.average_rating ? `${rating.average_rating}/5.0 (${rating.review_count}评)` : '暂无评价'}</span>
            </div>
            
            <div class="reviews-section">
                <h4>用户评价</h4>
                ${reviewsHtml || '<p style="color: #6c757d; text-align: center; padding: 20px;">暂无评价</p>'}
                
                <div class="add-review-section">
                    <h5>添加评价</h5>
                    <div class="form-group">
                        <label>评分:</label>
                        <select id="reviewRating" class="form-select">
                            <option value="5">5星 - 非常好</option>
                            <option value="4">4星 - 好</option>
                            <option value="3">3星 - 一般</option>
                            <option value="2">2星 - 差</option>
                            <option value="1">1星 - 非常差</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>评价内容:</label>
                        <textarea id="reviewText" class="form-textarea" rows="3" placeholder="请输入您的评价..."></textarea>
                    </div>
                    <button class="btn btn-primary" onclick="submitReview(${book.id})">
                        <i class="fas fa-star"></i> 提交评价
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showModal(modal);
}

async function submitReview(bookId) {
    const rating = document.getElementById('reviewRating').value;
    const reviewText = document.getElementById('reviewText').value.trim();
    
    if (!rating) {
        showNotification('请选择评分', 'error');
        return;
    }
    
    try {
        await api.addReview(bookId, {
            user_id: currentUser.id,
            user_name: currentUser.name,
            rating: parseInt(rating),
            review_text: reviewText
        });
        
        showNotification('评价提交成功', 'success');
        closeModal();
        
        // 重新加载图书详情
        showBookDetail(bookId);
        
    } catch (error) {
        showNotification(error.message || '提交评价失败', 'error');
    }
}

function showAddBookModal() {
    if (currentUserRole !== 'admin') {
        showNotification('只有管理员可以添加图书', 'error');
        return;
    }
    
    const modal = createModal('添加图书');
    
    modal.body.innerHTML = `
        <form id="addBookForm">
            <div class="form-group">
                <label>标题:</label>
                <input type="text" id="bookTitle" name="title" class="form-input" required>
            </div>
            <div class="form-group">
                <label>作者:</label>
                <input type="text" id="bookAuthor" name="author" class="form-input" required>
            </div>
            <div class="form-group">
                <label>出版社:</label>
                <input type="text" id="bookPublisher" name="publisher" class="form-input" required>
            </div>
            <div class="form-group">
                <label>ISBN:</label>
                <input type="text" id="bookIsbn" name="isbn" class="form-input" required>
            </div>
            <div class="form-group">
                <label>出版年份:</label>
                <input type="number" id="bookYear" name="year" class="form-input" min="1900" max="2030">
            </div>
            <div class="form-group">
                <label>分类:</label>
                <select id="bookCategory" name="category_id" class="form-input">
                    <option value="">请选择分类</option>
                </select>
            </div>
            <div class="form-group">
                <label>描述:</label>
                <textarea id="bookDescription" name="description" class="form-input" rows="3"></textarea>
            </div>
        </form>
    `;
    
    // 加载分类选项
    loadCategoryOptions('bookCategory');
    
    modal.footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="submitAddBook()">添加</button>
    `;
    
    showModal(modal);
}

async function loadCategoryOptions(selectId) {
    try {
        console.log('开始加载分类选项，selectId:', selectId);
        const categories = await api.getCategories();
        console.log('获取到的分类数据:', categories);
        
        const select = document.getElementById(selectId);
        console.log('找到的select元素:', select);
        
        if (select) {
            // 清空现有选项，保留默认选项
            select.innerHTML = '<option value="">请选择分类</option>';
            
            if (categories && Array.isArray(categories)) {
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    select.appendChild(option);
                    console.log('添加分类选项:', category.name, category.id);
                });
                console.log('分类选项加载完成，共', categories.length, '个分类');
            } else {
                console.error('分类数据格式错误:', categories);
            }
        } else {
            console.error('未找到select元素:', selectId);
        }
    } catch (error) {
        console.error('加载分类选项失败:', error);
        // 如果加载失败，至少保证有默认选项
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">加载分类失败</option>';
        }
    }
}

async function submitAddBook() {
    const form = document.getElementById('addBookForm');
    const formData = new FormData(form);
    
    const bookData = {
        title: formData.get('title'),
        author: formData.get('author'),
        publisher: formData.get('publisher'),
        isbn: formData.get('isbn'),
        year: formData.get('year') ? parseInt(formData.get('year')) : null,
        category_id: formData.get('category_id') ? parseInt(formData.get('category_id')) : null,
        description: formData.get('description')
    };
    
    if (!bookData.title || !bookData.author || !bookData.publisher || !bookData.isbn) {
        showNotification('请填写完整的图书信息', 'error');
        return;
    }
    
    try {
        await api.addBook(bookData);
        showNotification('图书添加成功', 'success');
        closeModal();
        await loadBooks();
    } catch (error) {
        showNotification(error.message || '添加图书失败', 'error');
    }
}

async function editBook(bookId) {
    if (currentUserRole !== 'admin') {
        showNotification('只有管理员可以编辑图书', 'error');
        return;
    }
    
    try {
        console.log('正在获取图书信息，ID:', bookId);
        const book = await api.getBook(bookId);
        console.log('获取到的图书信息:', book);
        
        const modal = createModal('编辑图书');
        
        modal.body.innerHTML = `
            <form id="editBookForm">
                <div class="form-group">
                    <label>标题:</label>
                    <input type="text" id="editBookTitle" name="title" class="form-input" value="${book.title || ''}" required>
                </div>
                <div class="form-group">
                    <label>作者:</label>
                    <input type="text" id="editBookAuthor" name="author" class="form-input" value="${book.author || ''}" required>
                </div>
                <div class="form-group">
                    <label>出版社:</label>
                    <input type="text" id="editBookPublisher" name="publisher" class="form-input" value="${book.publisher || ''}" required>
                </div>
                <div class="form-group">
                    <label>ISBN:</label>
                    <input type="text" id="editBookIsbn" name="isbn" class="form-input" value="${book.isbn || ''}" required>
                </div>
                <div class="form-group">
                    <label>出版年份:</label>
                    <input type="number" id="editBookYear" name="year" class="form-input" value="${book.year || ''}" min="1900" max="2030">
                </div>
                <div class="form-group">
                    <label>分类:</label>
                    <select id="editBookCategory" name="category_id" class="form-input">
                        <option value="">请选择分类</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>描述:</label>
                    <textarea id="editBookDescription" name="description" class="form-input" rows="3">${book.description || ''}</textarea>
                </div>
            </form>
        `;
        
        // 显示模态框
        showModal(modal);
        
        // 加载分类选项并设置当前值（在模态框显示后执行）
        try {
            console.log('开始加载分类选项并设置当前值，book.category_id:', book.category_id);
            await loadCategoryOptions('editBookCategory');
            
            // 设置当前选中的分类
            if (book.category_id) {
                // 使用setTimeout确保DOM更新完成
                setTimeout(() => {
                    const categorySelect = document.getElementById('editBookCategory');
                    if (categorySelect) {
                        categorySelect.value = book.category_id;
                        console.log('设置分类选中值:', book.category_id, '实际选中值:', categorySelect.value);
                        
                        // 验证是否设置成功
                        if (categorySelect.value != book.category_id) {
                            console.warn('分类值设置失败，尝试再次设置');
                            // 再次尝试设置
                            categorySelect.value = book.category_id;
                        }
                    } else {
                        console.error('未找到分类选择框');
                    }
                }, 100);
            }
        } catch (categoryError) {
            console.error('加载分类选项失败:', categoryError);
            showNotification('加载分类选项失败，但仍可编辑图书', 'warning');
        }
        
        modal.footer.innerHTML = `
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="submitEditBook(${bookId})">保存</button>
        `;
        
    } catch (error) {
        console.error('编辑图书失败:', error);
        showNotification(`获取图书信息失败: ${error.message}`, 'error');
    }
}

async function submitEditBook(bookId) {
    const form = document.getElementById('editBookForm');
    if (!form) {
        showNotification('表单未找到', 'error');
        return;
    }
    
    const formData = new FormData(form);
    
    const bookData = {
        title: formData.get('title'),
        author: formData.get('author'),
        publisher: formData.get('publisher'),
        isbn: formData.get('isbn'),
        year: formData.get('year') ? parseInt(formData.get('year')) : null,
        category_id: formData.get('category_id') ? parseInt(formData.get('category_id')) : null,
        description: formData.get('description')
    };
    
    console.log('提交编辑的图书数据:', bookData);
    
    if (!bookData.title || !bookData.author || !bookData.publisher || !bookData.isbn) {
        showNotification('请填写完整的图书信息', 'error');
        return;
    }
    
    try {
        console.log('正在更新图书，ID:', bookId);
        const result = await api.updateBook(bookId, bookData);
        console.log('更新结果:', result);
        showNotification('图书更新成功', 'success');
        closeModal();
        await loadBooks();
    } catch (error) {
        console.error('更新图书失败:', error);
        showNotification(`更新图书失败: ${error.message}`, 'error');
    }
}

async function deleteBook(bookId) {
    if (currentUserRole !== 'admin') {
        showNotification('只有管理员可以删除图书', 'error');
        return;
    }
    
    if (!confirm('确定要删除这本图书吗？')) {
        return;
    }
    
    try {
        await api.deleteBook(bookId);
        showNotification('图书删除成功', 'success');
        await loadBooks();
    } catch (error) {
        showNotification(error.message || '删除图书失败', 'error');
    }
}

async function borrowBook(bookId) {
    if (!currentUser) {
        showNotification('请先登录', 'error');
        return;
    }
    
    try {
        const book = await api.getBook(bookId);
        
        if (book.status !== 'available') {
            showNotification('该图书已被借出', 'error');
            return;
        }
        
        const borrowData = {
            user_id: currentUser.id,
            user_name: currentUser.name,
            book_id: bookId,
            book_title: book.title,
            borrow_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30天后
        };
        
        await api.addBorrow(borrowData);
        showNotification('借阅成功', 'success');
        await loadBooks();
        
    } catch (error) {
        showNotification(error.message || '借阅失败', 'error');
    }
}

// 用户管理
async function loadUsers() {
    if (currentUserRole !== 'admin') return;
    
    try {
        const users = await api.getUsers();
        renderUsersTable(users);
    } catch (error) {
        showNotification('加载用户列表失败', 'error');
        console.error('加载用户失败:', error);
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">暂无用户</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        const statusText = user.status === 'active' ? '正常' : '禁用';
        const statusClass = user.status === 'active' ? 'status-active' : 'status-inactive';
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || '-'}</td>
            <td>${formatDate(user.register_date)}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>-</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function searchUsers() {
    const keyword = document.getElementById('userSearch').value.trim();
    
    if (!keyword) {
        await loadUsers();
        return;
    }
    
    try {
        const users = await api.searchUsers(keyword);
        renderUsersTable(users);
    } catch (error) {
        showNotification('搜索用户失败', 'error');
        console.error('搜索用户失败:', error);
    }
}

async function deleteUser(userId) {
    if (currentUserRole !== 'admin') {
        showNotification('只有管理员可以删除用户', 'error');
        return;
    }
    
    if (!confirm('确定要删除这个用户吗？')) {
        return;
    }
    
    try {
        await api.deleteUser(userId);
        showNotification('用户删除成功', 'success');
        await loadUsers();
    } catch (error) {
        showNotification(error.message || '删除用户失败', 'error');
    }
}

// 分类管理
async function loadCategories() {
    try {
        const categories = await api.getCategories();
        renderCategoriesTable(categories);
    } catch (error) {
        showNotification('加载分类列表失败', 'error');
        console.error('加载分类失败:', error);
    }
}

function renderCategoriesTable(categories) {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">暂无分类</td></tr>';
        return;
    }
    
    categories.forEach(category => {
        const row = document.createElement('tr');
        
        let adminActions = '';
        if (currentUserRole === 'admin') {
            adminActions = `
                <button class="btn btn-sm btn-warning" onclick="editCategory(${category.id})">编辑</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">删除</button>
            `;
        }
        
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${category.description || '-'}</td>
            <td>${formatDate(category.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewCategoryBooks(${category.id})">查看图书</button>
                ${adminActions}
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function searchCategories() {
    const keyword = document.getElementById('categorySearch').value.trim();
    
    if (!keyword) {
        await loadCategories();
        return;
    }
    
    try {
        const categories = await api.searchCategories(keyword);
        renderCategoriesTable(categories);
    } catch (error) {
        showNotification('搜索分类失败', 'error');
        console.error('搜索分类失败:', error);
    }
}

function showAddCategoryModal() {
    if (currentUserRole !== 'admin') {
        showNotification('只有管理员可以添加分类', 'error');
        return;
    }
    
    const modal = createModal('添加分类');
    
    modal.body.innerHTML = `
        <form id="addCategoryForm">
            <div class="form-group">
                <label>分类名称:</label>
                <input type="text" id="categoryName" name="name" class="form-input" required>
            </div>
            <div class="form-group">
                <label>描述:</label>
                <textarea id="categoryDescription" name="description" class="form-input" rows="3"></textarea>
            </div>
        </form>
    `;
    
    modal.footer.innerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="submitAddCategory()">添加</button>
    `;
    
    showModal(modal);
}

async function submitAddCategory() {
    const form = document.getElementById('addCategoryForm');
    const formData = new FormData(form);
    
    const categoryData = {
        name: formData.get('name'),
        description: formData.get('description')
    };
    
    if (!categoryData.name) {
        showNotification('请填写分类名称', 'error');
        return;
    }
    
    try {
        await api.addCategory(categoryData);
        showNotification('分类添加成功', 'success');
        closeModal();
        await loadCategories();
    } catch (error) {
        showNotification(error.message || '添加分类失败', 'error');
    }
}

async function editCategory(categoryId) {
    if (currentUserRole !== 'admin') {
        showNotification('只有管理员可以编辑分类', 'error');
        return;
    }
    
    try {
        const categories = await api.getCategories();
        const category = categories.find(c => c.id === categoryId);
        
        if (!category) {
            showNotification('找不到分类信息', 'error');
            return;
        }
        
        const modal = createModal('编辑分类');
        
        modal.body.innerHTML = `
            <form id="editCategoryForm">
                <div class="form-group">
                    <label>分类名称:</label>
                    <input type="text" id="editCategoryName" name="name" class="form-input" value="${category.name}" required>
                </div>
                <div class="form-group">
                    <label>描述:</label>
                    <textarea id="editCategoryDescription" name="description" class="form-input" rows="3">${category.description || ''}</textarea>
                </div>
            </form>
        `;
        
        modal.footer.innerHTML = `
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="submitEditCategory(${categoryId})">保存</button>
        `;
        
        showModal(modal);
        
    } catch (error) {
        showNotification('获取分类信息失败', 'error');
    }
}

async function submitEditCategory(categoryId) {
    const form = document.getElementById('editCategoryForm');
    const formData = new FormData(form);
    
    const categoryData = {
        name: formData.get('name'),
        description: formData.get('description')
    };
    
    if (!categoryData.name) {
        showNotification('请填写分类名称', 'error');
        return;
    }
    
    try {
        await api.updateCategory(categoryId, categoryData);
        showNotification('分类更新成功', 'success');
        closeModal();
        await loadCategories();
    } catch (error) {
        showNotification(error.message || '更新分类失败', 'error');
    }
}

async function deleteCategory(categoryId) {
    if (currentUserRole !== 'admin') {
        showNotification('只有管理员可以删除分类', 'error');
        return;
    }
    
    if (!confirm('确定要删除这个分类吗？')) {
        return;
    }
    
    try {
        await api.deleteCategory(categoryId);
        showNotification('分类删除成功', 'success');
        await loadCategories();
    } catch (error) {
        showNotification(error.message || '删除分类失败', 'error');
    }
}

async function viewCategoryBooks(categoryId) {
    try {
        const books = await api.getBooks();
        const categories = await api.getCategories();
        const category = categories.find(cat => cat.id === categoryId);
        const categoryBooks = books.filter(book => book.category_id === categoryId);
        
        const modal = createModal(`分类图书 - ${category ? category.name : '未知分类'}`);
        modal.content.classList.add('large');
        modal.content.classList.add('category-books-modal');
        modal.body.classList.add('category-books-detail');
        modal.header.querySelector('h3').setAttribute('data-category-books', 'true');
        
        const booksHtml = categoryBooks.map((book, index) => {
            const statusClass = book.status === 'available' ? 'status-available' : 'status-borrowed';
            const statusText = book.status === 'available' ? '可借' : '已借出';
            
            return `
                <div class="category-book-card" style="animation: fadeInUp 0.5s ease-out ${0.1 + index * 0.05}s both;">
                    <div class="book-card-header">
                        <h4 class="book-title">${book.title}</h4>
                        <span class="book-status-badge ${statusClass}">${statusText}</span>
                    </div>
                    
                    <div class="book-card-content">
                        <div class="book-info-grid-compact">
                            <div class="book-info-item-compact">
                                <span class="info-icon">📝</span>
                                <span class="info-label">作者:</span>
                                <span class="info-value">${book.author}</span>
                            </div>
                            <div class="book-info-item-compact">
                                <span class="info-icon">🏢</span>
                                <span class="info-label">出版社:</span>
                                <span class="info-value">${book.publisher}</span>
                            </div>
                            <div class="book-info-item-compact">
                                <span class="info-icon">🔢</span>
                                <span class="info-label">ISBN:</span>
                                <span class="info-value">${book.isbn}</span>
                            </div>
                            <div class="book-info-item-compact">
                                <span class="info-icon">�</span>
                                <span class="info-label">出版年份:</span>
                                <span class="info-value">${book.year || '-'}</span>
                            </div>
                        </div>
                        
                        ${book.description ? `
                            <div class="book-description">
                                <span class="info-icon">📝</span>
                                <span class="description-text">${book.description.length > 120 ? book.description.substring(0, 120) + '...' : book.description}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="book-card-actions">
                        <button class="btn btn-sm btn-primary" onclick="showBookDetail(${book.id})">
                            <i class="fas fa-eye"></i> 查看详情
                        </button>
                        ${book.status === 'available' ? `
                            <button class="btn btn-sm btn-success" onclick="borrowBook(${book.id})">
                                <i class="fas fa-book"></i> 借阅
                            </button>
                        ` : `
                            <button class="btn btn-sm btn-secondary" disabled>
                                <i class="fas fa-clock"></i> 已借出
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
        
        modal.body.innerHTML = `
            <div class="category-books-container">
                ${category ? `
                    <div class="category-header-info">
                        <div class="category-icon">📂</div>
                        <div class="category-details">
                            <h3 class="category-name">${category.name}</h3>
                            <p class="category-description">${category.description || '暂无描述'}</p>
                        </div>
                    </div>
                ` : ''}
                
                <div class="books-summary">
                    <div class="summary-icon">📚</div>
                    <span class="summary-text">共找到 <strong>${categoryBooks.length}</strong> 本图书</span>
                </div>
                
                ${categoryBooks.length > 0 ? `
                    <div class="category-books-grid">
                        ${booksHtml}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-icon">📖</div>
                        <h4>该分类下暂无图书</h4>
                        <p>请联系管理员添加相关图书</p>
                    </div>
                `}
            </div>
        `;
        
        showModal(modal);
        
    } catch (error) {
        showNotification('获取分类图书失败', 'error');
        console.error('获取分类图书失败:', error);
    }
}

// 借阅管理
async function loadBorrows() {
    if (currentUserRole !== 'admin') return;
    
    try {
        const borrows = await api.getBorrows();
        renderBorrowsTable(borrows);
    } catch (error) {
        showNotification('加载借阅记录失败', 'error');
        console.error('加载借阅记录失败:', error);
    }
}

function renderBorrowsTable(borrows) {
    const tbody = document.getElementById('borrowTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (borrows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">暂无借阅记录</td></tr>';
        return;
    }
    
    // 按借阅日期倒序排列
    const sortedBorrows = borrows.sort((a, b) => new Date(b.borrow_date) - new Date(a.borrow_date));
    
    sortedBorrows.forEach(borrow => {
        const row = document.createElement('tr');
        const isOverdue = borrow.status === 'borrowed' && new Date(borrow.due_date) < new Date();
        const statusText = borrow.status === 'borrowed' ? '借阅中' : '已归还';
        const statusClass = borrow.status === 'borrowed' ? 'status-borrowed' : 'status-returned';
        
        let actionButton = '';
        if (borrow.status === 'borrowed') {
            actionButton = `<button class="btn btn-sm btn-warning" onclick="returnBookFromTable(${borrow.id})">还书</button>`;
        } else {
            actionButton = '<span class="text-success">已归还</span>';
        }
        
        row.innerHTML = `
            <td>${borrow.id}</td>
            <td>${borrow.user_name}</td>
            <td>${borrow.book_title}</td>
            <td>${formatDate(borrow.borrow_date)}</td>
            <td class="${isOverdue ? 'overdue' : ''}">${formatDate(borrow.due_date)}</td>
            <td>${borrow.return_date ? formatDate(borrow.return_date) : '-'}</td>
            <td>
                <span class="status ${statusClass}">${statusText}</span>
                ${isOverdue ? '<span class="overdue-label">逾期</span>' : ''}
            </td>
            <td>${actionButton}</td>
        `;
        tbody.appendChild(row);
    });
}

async function returnBookFromTable(borrowId) {
    if (currentUserRole !== 'admin') {
        showNotification('只有管理员可以操作还书', 'error');
        return;
    }
    
    if (!confirm('确定要标记为已归还吗？')) {
        return;
    }
    
    try {
        await api.returnBook(borrowId);
        showNotification('图书归还成功', 'success');
        await loadBorrows();
        await loadBooks(); // 更新图书状态
        await updateStats(); // 更新统计信息
    } catch (error) {
        showNotification(error.message || '归还图书失败', 'error');
    }
}

// 统计信息
async function updateStats() {
    if (currentUserRole !== 'admin') return;
    
    try {
        const stats = await api.getStats();
        
        const totalBooksElement = document.getElementById('totalBooks');
        const totalUsersElement = document.getElementById('totalUsers');
        const borrowedBooksElement = document.getElementById('borrowedBooks');
        const overdueBooksElement = document.getElementById('overdueBooks');
        
        if (totalBooksElement) totalBooksElement.textContent = stats.totalBooks || 0;
        if (totalUsersElement) totalUsersElement.textContent = stats.totalUsers || 0;
        if (borrowedBooksElement) borrowedBooksElement.textContent = stats.borrowedBooks || 0;
        if (overdueBooksElement) overdueBooksElement.textContent = stats.overdueBooks || 0;
        
    } catch (error) {
        console.error('更新统计信息失败:', error);
    }
}

// 模态框功能
function createModal(title) {
    const modal = {
        element: document.createElement('div'),
        content: null,
        header: null,
        body: null,
        footer: null
    };
    
    modal.element.className = 'modal';
    modal.element.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <span class="close" onclick="closeModal()">&times;</span>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer"></div>
        </div>
    `;
    
    modal.content = modal.element.querySelector('.modal-content');
    modal.header = modal.element.querySelector('.modal-header');
    modal.body = modal.element.querySelector('.modal-body');
    modal.footer = modal.element.querySelector('.modal-footer');
    
    return modal;
}

function showModal(modal) {
    document.body.appendChild(modal.element);
    modal.element.style.display = 'block';
    
    // 点击背景关闭模态框
    modal.element.addEventListener('click', (e) => {
        if (e.target === modal.element) {
            closeModal();
        }
    });
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.remove();
    });
}

// 页面初始化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('图书馆管理系统初始化...');
    
    // 显示登录界面
    const loginContainer = document.getElementById('loginContainer');
    const mainContainer = document.getElementById('mainContainer');
    
    if (loginContainer) loginContainer.style.display = 'flex';
    if (mainContainer) mainContainer.style.display = 'none';
    
    console.log('图书馆管理系统初始化完成');
});

// 添加CSS样式
const styles = `
    .notification {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
    }
    
    .modal-content {
        background-color: #fefefe;
        margin: 5% auto;
        padding: 0;
        border: none;
        border-radius: 8px;
        width: 90%;
        max-width: 600px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .modal-content.large {
        max-width: 95%;
        width: 95%;
    }
    
    .modal-content.large .modal-body {
        max-height: 75vh;
    }
    
    .modal-header {
        padding: 20px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #495057;
    }
    
    .modal-body {
        padding: 20px;
        max-height: 500px;
        overflow-y: auto;
    }
    
    .modal-footer {
        padding: 20px;
        background-color: #f8f9fa;
        border-top: 1px solid #dee2e6;
        border-radius: 0 0 8px 8px;
        text-align: right;
    }
    
    .modal-footer .btn {
        margin-left: 10px;
    }
    
    .close {
        color: #aaa;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
    }
    
    .close:hover,
    .close:focus {
        color: #000;
        text-decoration: none;
    }
    
    .book-details h3 {
        color: #495057;
        margin-bottom: 20px;
    }
    
    .book-details p {
        margin: 10px 0;
        line-height: 1.5;
    }
    
    .reviews-section {
        margin-top: 30px;
        border-top: 1px solid #dee2e6;
        padding-top: 20px;
    }
    
    .review-item {
        background-color: #f8f9fa;
        padding: 15px;
        margin: 10px 0;
        border-radius: 5px;
        border-left: 4px solid #007bff;
    }
    
    .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .rating {
        color: #ffc107;
        font-size: 16px;
    }
    
    .review-date {
        color: #6c757d;
        font-size: 12px;
    }
    
    .review-text {
        color: #495057;
        line-height: 1.5;
    }
    
    .add-review-section {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 5px;
        margin-top: 20px;
    }
    
    .book-item {
        background-color: #f8f9fa;
        padding: 15px;
        margin: 10px 0;
        border-radius: 5px;
        border-left: 4px solid #28a745;
    }
    
    .book-item h4 {
        margin: 0 0 10px 0;
        color: #495057;
    }
    
    .overdue {
        color: #dc3545 !important;
        font-weight: bold;
    }
    
    .overdue-label {
        background-color: #dc3545;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        margin-left: 5px;
    }
    
    .status-borrowed {
        color: #ffc107;
    }
    
    .status-returned {
        color: #28a745;
    }
    
    .status-available {
        color: #28a745;
    }
    
    .status-active {
        color: #28a745;
    }
    
    .status-inactive {
        color: #dc3545;
    }
    
    .no-data {
        text-align: center;
        color: #B0BEC5;
        font-style: italic;
        padding: 60px 20px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        border: 2px dashed rgba(255, 255, 255, 0.2);
        margin: 20px 0;
    }
    
    .no-data::before {
        content: '📝';
        display: block;
        font-size: 48px;
        margin-bottom: 15px;
        opacity: 0.6;
    }
    
    .data-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .data-table th {
        background: linear-gradient(135deg, #64B5F6, #42A5F5);
        color: white;
        padding: 15px;
        text-align: left;
        font-weight: 600;
        font-size: 14px;
        border: none;
    }
    
    .data-table td {
        padding: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 14px;
        color: #E8F4FD;
    }
    
    .data-table tr:hover {
        background: rgba(100, 181, 246, 0.05);
    }
    
    .data-table tr:last-child td {
        border-bottom: none;
    }
    
    .search-panel {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 25px;
    }
    
    .search-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        align-items: end;
    }
    
    .filter-group {
        display: flex;
        flex-direction: column;
        min-width: 160px;
        flex: 1;
    }
    
    .filter-group label {
        margin-bottom: 8px;
        font-weight: 500;
        color: #E8F4FD;
        font-size: 14px;
        letter-spacing: 0.3px;
    }
    
    .form-select {
        padding: 12px 16px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.1);
        color: #E8F4FD;
        font-size: 14px;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    }
    
    .form-input {
        padding: 12px 16px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.1);
        color: #E8F4FD;
        font-size: 14px;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        width: 100%;
    }
    
    .form-select:focus,
    .form-input:focus {
        outline: none;
        border-color: #64B5F6;
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 0 0 3px rgba(100, 181, 246, 0.2);
    }
    
    .form-input::placeholder {
        color: #B0BEC5;
    }
    
    .form-select option {
        background: #001122;
        color: #E8F4FD;
        padding: 8px;
    }
    
    .search-results {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 25px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 20px;
    }
    
    .search-results h3 {
        color: #E8F4FD;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .search-results h3::before {
        content: '🔍';
        margin-right: 12px;
        font-size: 18px;
        background: linear-gradient(135deg, #64B5F6, #42A5F5);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
    }
    
    .search-panel .btn-primary {
        background: linear-gradient(135deg, #64B5F6, #42A5F5);
        border: none;
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(100, 181, 246, 0.3);
        min-width: 120px;
        margin-top: 24px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
    }
    
    .search-panel .btn-primary:hover {
        background: linear-gradient(135deg, #42A5F5, #2196F3);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(100, 181, 246, 0.4);
    }
    
    .search-panel .btn-primary:active {
        transform: translateY(0);
    }
    
    .data-table .btn {
        padding: 8px 15px;
        border-radius: 10px;
        border: none;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-right: 8px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }
    
    .data-table .btn-info {
        background: linear-gradient(135deg, #64B5F6, #42A5F5);
        color: white;
        box-shadow: 0 2px 8px rgba(100, 181, 246, 0.3);
    }
    
    .data-table .btn-info:hover {
        background: linear-gradient(135deg, #42A5F5, #2196F3);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(100, 181, 246, 0.4);
    }
    
    .data-table .btn-success {
        background: linear-gradient(135deg, #66BB6A, #4CAF50);
        color: white;
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }
    
    .data-table .btn-success:hover {
        background: linear-gradient(135deg, #4CAF50, #388E3C);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
    }
    
    .status {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        text-align: center;
        display: inline-block;
        min-width: 60px;
    }
    
    .status-available {
        background: rgba(76, 175, 80, 0.2);
        color: #81C784;
        border: 1px solid rgba(76, 175, 80, 0.3);
    }
    
    .status-borrowed {
        background: rgba(255, 152, 0, 0.2);
        color: #FFB74D;
        border: 1px solid rgba(255, 152, 0, 0.3);
    }
    
    .overdue {
        color: #EF5350 !important;
        font-weight: bold;
    }
    
    .overdue-label {
        background: rgba(244, 67, 54, 0.2);
        color: #EF5350;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 10px;
        margin-left: 8px;
        border: 1px solid rgba(244, 67, 54, 0.3);
    }
    
    @media (max-width: 768px) {
        .search-filters {
            flex-direction: column;
            align-items: stretch;
        }
        
        .filter-group {
            min-width: auto;
        }
        
        .data-table {
            font-size: 12px;
        }
        
        .data-table th,
        .data-table td {
            padding: 10px 12px;
        }
    }
    
    .search-loading {
        text-align: center;
        padding: 60px 20px;
        color: #E8F4FD;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(100, 181, 246, 0.2);
        border-top: 4px solid #64B5F6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
        box-shadow: 0 0 20px rgba(100, 181, 246, 0.3);
    }
    
    .search-loading p {
        font-size: 16px;
        color: #B0BEC5;
        margin-top: 15px;
        animation: pulse 2s infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* 分类图书界面样式 */
    .category-books-detail {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    /* 分类图书模态框背景样式 - 与主背景一致 */
    .modal-content.category-books-modal {
        background: linear-gradient(135deg, rgba(0, 11, 30, 0.95) 0%, rgba(0, 18, 46, 0.98) 100%);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(100, 181, 246, 0.3);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    
    .category-books-container {
        padding: 0;
        background: transparent;
    }
    
    .category-header-info {
        display: flex;
        align-items: center;
        background: linear-gradient(135deg, rgba(100, 181, 246, 0.2), rgba(66, 165, 245, 0.1));
        border-radius: 15px;
        padding: 25px;
        margin-bottom: 25px;
        border: 1px solid rgba(100, 181, 246, 0.3);
        animation: fadeInUp 0.5s ease-out;
    }
    
    .category-icon {
        font-size: 48px;
        margin-right: 20px;
        background: linear-gradient(135deg, #64B5F6, #42A5F5);
        border-radius: 50%;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(100, 181, 246, 0.3);
    }
    
    .category-details {
        flex: 1;
    }
    
    .category-name {
        color: #64B5F6;
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 10px 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .category-description {
        color: #E8F4FD;
        font-size: 16px;
        margin: 0;
        line-height: 1.5;
        opacity: 0.9;
    }
    
    .books-summary {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 20px 25px;
        margin-bottom: 25px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: fadeInUp 0.5s ease-out 0.1s both;
    }
    
    .summary-icon {
        font-size: 24px;
        margin-right: 15px;
        background: linear-gradient(135deg, #64B5F6, #42A5F5);
        border-radius: 50%;
        width: 45px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(100, 181, 246, 0.3);
    }
    
    .summary-text {
        color: #E8F4FD;
        font-size: 18px;
        font-weight: 500;
    }
    
    .summary-text strong {
        color: #64B5F6;
        font-weight: 700;
    }
    
    .category-books-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;
        padding: 0;
    }
    
    .category-book-card {
        background: rgba(255, 255, 255, 0.08);
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 20px;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .category-book-card:hover {
        transform: translateY(-5px) scale(1.02);
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(100, 181, 246, 0.3);
        box-shadow: 0 8px 25px rgba(100, 181, 246, 0.2);
    }
    
    .book-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .book-title {
        color: #E8F4FD;
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        line-height: 1.3;
        flex: 1;
        margin-right: 15px;
    }
    
    .book-status-badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-align: center;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .book-status-badge.status-available {
        background: linear-gradient(135deg, #66BB6A, #4CAF50);
        color: white;
        border: 1px solid rgba(76, 175, 80, 0.3);
    }
    
    .book-status-badge.status-borrowed {
        background: linear-gradient(135deg, #FFB74D, #FF9800);
        color: white;
        border: 1px solid rgba(255, 152, 0, 0.3);
    }
    
    .book-card-content {
        margin-bottom: 20px;
    }
    
    .book-info-grid-compact {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 15px;
    }
    
    .book-info-item-compact {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #E8F4FD;
        opacity: 0.9;
    }
    
    .info-icon {
        font-size: 16px;
        margin-right: 8px;
        width: 20px;
        text-align: center;
    }
    
    .info-label {
        font-weight: 500;
        margin-right: 6px;
        color: #B0BEC5;
        min-width: 50px;
    }
    
    .info-value {
        font-weight: 400;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .book-description {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 12px;
        margin-top: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: flex-start;
    }
    
    .description-text {
        color: #E8F4FD;
        font-size: 13px;
        line-height: 1.5;
        margin-left: 8px;
        opacity: 0.9;
    }
    
    .book-card-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-start;
        flex-wrap: wrap;
    }
    
    .book-card-actions .btn {
        padding: 10px 16px;
        border-radius: 8px;
        border: none;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
        min-width: 100px;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .book-card-actions .btn-primary {
        background: linear-gradient(135deg, #64B5F6, #42A5F5);
        color: white;
    }
    
    .book-card-actions .btn-primary:hover {
        background: linear-gradient(135deg, #42A5F5, #2196F3);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(100, 181, 246, 0.4);
    }
    
    .book-card-actions .btn-success {
        background: linear-gradient(135deg, #66BB6A, #4CAF50);
        color: white;
    }
    
    .book-card-actions .btn-success:hover {
        background: linear-gradient(135deg, #4CAF50, #388E3C);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
    }
    
    .book-card-actions .btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: #B0BEC5;
        border: 1px solid rgba(255, 255, 255, 0.2);
        cursor: not-allowed;
    }
    
    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #E8F4FD;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        border: 2px dashed rgba(255, 255, 255, 0.2);
        animation: fadeInUp 0.5s ease-out 0.2s both;
    }
    
    .empty-icon {
        font-size: 64px;
        margin-bottom: 20px;
        background: linear-gradient(135deg, #64B5F6, #42A5F5);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        opacity: 0.7;
    }
    
    .empty-state h4 {
        color: #64B5F6;
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 15px 0;
    }
    
    .empty-state p {
        color: #B0BEC5;
        font-size: 16px;
        margin: 0;
        opacity: 0.8;
    }
    
    /* 响应式设计 */
    @media (max-width: 768px) {
        .category-books-grid {
            grid-template-columns: 1fr;
            gap: 15px;
        }
        
        .category-header-info {
            flex-direction: column;
            text-align: center;
            padding: 20px;
        }
        
        .category-icon {
            margin-right: 0;
            margin-bottom: 15px;
            width: 60px;
            height: 60px;
            font-size: 36px;
        }
        
        .category-name {
            font-size: 20px;
        }
        
        .book-info-grid-compact {
            grid-template-columns: 1fr;
            gap: 8px;
        }
        
        .book-card-actions {
            flex-direction: column;
        }
        
        .book-card-actions .btn {
            min-width: auto;
            width: 100%;
        }
    }
    
    @media (max-width: 480px) {
        .category-book-card {
            padding: 15px;
        }
        
        .book-title {
            font-size: 16px;
        }
        
        .books-summary {
            padding: 15px 20px;
        }
        
        .summary-text {
            font-size: 16px;
        }
    }
    
    .search-error {
        text-align: center;
        padding: 60px 20px;
        color: #E8F4FD;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        border: 1px solid rgba(244, 67, 54, 0.3);
    }
    
    .error-icon {
        font-size: 48px;
        margin-bottom: 20px;
        background: linear-gradient(135deg, #FF6B6B, #EF5350);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .search-error h3 {
        color: #FF6B6B;
        margin-bottom: 15px;
        font-size: 24px;
    }
    
    .search-error p {
        color: #B0BEC5;
        font-size: 16px;
    }
    
    .search-welcome {
        text-align: center;
        padding: 60px 20px;
        color: #E8F4FD;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin: 20px 0;
    }
    
    .search-welcome .welcome-icon {
        font-size: 64px;
        margin-bottom: 20px;
        background: linear-gradient(135deg, #64B5F6, #42A5F5);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .search-welcome h3 {
        color: #64B5F6;
        margin-bottom: 15px;
        font-size: 24px;
    }
    
    .search-welcome p {
        color: #B0BEC5;
        font-size: 16px;
        line-height: 1.6;
        max-width: 500px;
        margin: 0 auto;
    }
`;

// 添加样式到文档
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// 高级搜索功能
async function advancedSearch() {
    try {
        const searchType = document.getElementById('searchType').value;
        const keyword = document.getElementById('searchKeyword').value.trim();
        const status = document.getElementById('searchStatus').value;
        const categoryId = document.getElementById('searchCategory').value;
        
        const resultsContainer = document.getElementById('searchResults');
        
        // 显示加载动画
        resultsContainer.innerHTML = `
            <div class="search-loading">
                <div class="loading-spinner"></div>
                <p>搜索中...</p>
            </div>
        `;
        
        let results = [];
        let tableHTML = '';
        
        console.log('高级搜索参数:', { searchType, keyword, status, categoryId });
        
        switch (searchType) {
            case 'books':
                results = await api.searchBooks(keyword, status, categoryId);
                tableHTML = generateBooksTable(results);
                break;
            case 'categories':
                results = await api.searchCategories(keyword);
                tableHTML = generateCategoriesTable(results);
                break;
            case 'users':
                if (currentUserRole !== 'admin') {
                    showNotification('只有管理员可以搜索用户', 'error');
                    return;
                }
                results = await api.searchUsers(keyword, status);
                tableHTML = generateUsersTable(results);
                break;
            case 'borrow':
                if (currentUserRole !== 'admin') {
                    showNotification('只有管理员可以搜索借阅记录', 'error');
                    return;
                }
                results = await api.searchBorrows(keyword, status);
                tableHTML = generateBorrowsTable(results);
                break;
            default:
                showNotification('请选择搜索类型', 'error');
                return;
        }
        
        // 添加动画效果
        setTimeout(() => {
            resultsContainer.innerHTML = `
                <h3>搜索结果 (${results.length}条)</h3>
                ${tableHTML}
            `;
            resultsContainer.style.animation = 'fadeIn 0.5s ease-in';
        }, 300);
        
        console.log('高级搜索完成，结果数量:', results.length);
        
    } catch (error) {
        console.error('高级搜索失败:', error);
        showNotification('搜索失败: ' + error.message, 'error');
        
        // 显示错误信息
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = `
            <div class="search-error">
                <div class="error-icon">⚠️</div>
                <h3>搜索失败</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function generateBooksTable(books) {
    if (books.length === 0) {
        return '<p class="no-data">未找到匹配的图书</p>';
    }
    
    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>编号</th>
                    <th>书名</th>
                    <th>作者</th>
                    <th>出版社</th>
                    <th>分类</th>
                    <th>评分</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    books.forEach(book => {
        const statusText = book.status === 'available' ? '可借' : '已借出';
        const statusClass = book.status === 'available' ? 'status-available' : 'status-borrowed';
        const rating = book.average_rating ? `${book.average_rating}/5.0 (${book.review_count}评)` : '暂无评价';
        
        tableHTML += `
            <tr>
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.publisher}</td>
                <td>${book.category_name || '未分类'}</td>
                <td>${rating}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="showBookDetail(${book.id})">详情</button>
                    ${book.status === 'available' ? `<button class="btn btn-sm btn-success" onclick="borrowBook(${book.id})">借阅</button>` : ''}
                </td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    return tableHTML;
}

function generateCategoriesTable(categories) {
    if (categories.length === 0) {
        return '<p class="no-data">未找到匹配的分类</p>';
    }
    
    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>分类ID</th>
                    <th>分类名称</th>
                    <th>描述</th>
                    <th>创建时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    categories.forEach(category => {
        tableHTML += `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${category.description || '暂无描述'}</td>
                <td>${formatDate(category.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewCategoryBooks(${category.id})">查看图书</button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    return tableHTML;
}

function generateUsersTable(users) {
    if (users.length === 0) {
        return '<p class="no-data">未找到匹配的用户</p>';
    }
    
    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>用户ID</th>
                    <th>姓名</th>
                    <th>邮箱</th>
                    <th>电话</th>
                    <th>注册时间</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    users.forEach(user => {
        const statusText = user.status === 'active' ? '活跃' : '非活跃';
        const statusClass = user.status === 'active' ? 'status-available' : 'status-borrowed';
        
        tableHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || '未填写'}</td>
                <td>${formatDate(user.register_date)}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    return tableHTML;
}

function generateBorrowsTable(borrows) {
    if (borrows.length === 0) {
        return '<p class="no-data">未找到匹配的借阅记录</p>';
    }
    
    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>记录ID</th>
                    <th>用户</th>
                    <th>图书</th>
                    <th>借阅日期</th>
                    <th>应还日期</th>
                    <th>归还日期</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    borrows.forEach(borrow => {
        const statusText = borrow.status === 'borrowed' ? '借阅中' : '已归还';
        const statusClass = borrow.status === 'borrowed' ? 'status-borrowed' : 'status-available';
        const isOverdue = borrow.status === 'borrowed' && new Date(borrow.due_date) < new Date();
        
        tableHTML += `
            <tr>
                <td>${borrow.id}</td>
                <td>${borrow.user_name}</td>
                <td>${borrow.book_title}</td>
                <td>${formatDate(borrow.borrow_date)}</td>
                <td class="${isOverdue ? 'overdue' : ''}">${formatDate(borrow.due_date)}</td>
                <td>${borrow.return_date ? formatDate(borrow.return_date) : '-'}</td>
                <td>
                    <span class="status ${statusClass}">${statusText}</span>
                    ${isOverdue ? '<span class="overdue-label">逾期</span>' : ''}
                </td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    return tableHTML;
}

// 监听搜索类型变化，显示/隐藏相关筛选项
function setupAdvancedSearchEvents() {
    const searchTypeSelect = document.getElementById('searchType');
    const categoryFilterGroup = document.getElementById('categoryFilterGroup');
    const statusSelect = document.getElementById('searchStatus');
    
    if (searchTypeSelect && categoryFilterGroup) {
        searchTypeSelect.addEventListener('change', function() {
            const searchType = this.value;
            
            // 根据搜索类型显示/隐藏分类筛选
            if (searchType === 'books') {
                categoryFilterGroup.style.display = 'block';
                // 更新状态选项为图书状态
                statusSelect.innerHTML = `
                    <option value="">全部</option>
                    <option value="available">可借</option>
                    <option value="borrowed">已借出</option>
                `;
            } else if (searchType === 'users') {
                categoryFilterGroup.style.display = 'none';
                // 更新状态选项为用户状态
                statusSelect.innerHTML = `
                    <option value="">全部</option>
                    <option value="active">活跃</option>
                    <option value="inactive">非活跃</option>
                `;
            } else if (searchType === 'borrow') {
                categoryFilterGroup.style.display = 'none';
                // 更新状态选项为借阅状态
                statusSelect.innerHTML = `
                    <option value="">全部</option>
                    <option value="borrowed">借阅中</option>
                    <option value="returned">已归还</option>
                `;
            } else {
                categoryFilterGroup.style.display = 'none';
                statusSelect.innerHTML = '<option value="">全部</option>';
            }
        });
        
        // 初始化时触发一次
        searchTypeSelect.dispatchEvent(new Event('change'));
    }
}

// 加载高级搜索页面的分类选项
async function loadAdvancedSearchCategories() {
    try {
        const categories = await api.getCategories();
        const select = document.getElementById('searchCategory');
        
        if (select) {
            // 保留第一个选项
            select.innerHTML = '<option value="">全部分类</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('加载分类选项失败:', error);
    }
}
