import * as SQLite from 'expo-sqlite';

// Types
export interface CategoryRow {
    id: number;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
}

export interface TransactionRow {
    id: number;
    amount: number;
    type: string;
    category_id: number;
    budget_id: number | null;
    note: string | null;
    date: number; // timestamp
    created_at: number;
}

export interface BudgetRow {
    id: number;
    name: string;
    category_id: number;
    limit_amount: number;
    month: string; // 'YYYY-MM'
}

// Extended type with joined category info
export interface TransactionWithCategory extends TransactionRow {
    category_name: string;
    category_icon: string;
    category_color: string;
    category_type: string;
    budget_name: string | null;
}

// Extended budget with category info
export interface BudgetWithCategory extends BudgetRow {
    category_name: string;
    category_icon: string;
    category_color: string;
}

// Database instance (synchronous API - expo-sqlite v15+)
let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
    if (!db) {
        db = SQLite.openDatabaseSync('quanlychitieu.db');
        initDatabase(db);
    }
    return db;
}

function initDatabase(database: SQLite.SQLiteDatabase): void {
    database.execSync(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT NOT NULL,
            color TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense'))
        );
        
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount INTEGER NOT NULL,
            type TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            budget_id INTEGER,
            note TEXT,
            date INTEGER NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
            FOREIGN KEY (category_id) REFERENCES categories(id),
            FOREIGN KEY (budget_id) REFERENCES budgets(id)
        );
        
        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL DEFAULT '',
            category_id INTEGER NOT NULL,
            limit_amount INTEGER NOT NULL,
            month TEXT NOT NULL,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
        CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id);
        CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
    `);

    // Migration: add columns if missing
    try {
        database.runSync("SELECT name FROM budgets LIMIT 1");
    } catch {
        try { database.execSync("ALTER TABLE budgets ADD COLUMN name TEXT NOT NULL DEFAULT ''"); } catch { }
    }
    try {
        database.runSync("SELECT budget_id FROM transactions LIMIT 1");
    } catch {
        try { database.execSync("ALTER TABLE transactions ADD COLUMN budget_id INTEGER"); } catch { }
    }

    // Tạo categories mặc định nếu chưa có
    const catCount = database.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
    if (!catCount || catCount.count === 0) {
        const defaultCategories = [
            { name: 'Ăn uống', icon: 'food', color: '#F59E0B', type: 'expense' },
            { name: 'Di chuyển', icon: 'car', color: '#3B82F6', type: 'expense' },
            { name: 'Mua sắm', icon: 'shopping', color: '#EC4899', type: 'expense' },
            { name: 'Giải trí', icon: 'film', color: '#8B5CF6', type: 'expense' },
            { name: 'Hóa đơn', icon: 'receipt', color: '#EF4444', type: 'expense' },
            { name: 'Sức khỏe', icon: 'hospital', color: '#14B8A6', type: 'expense' },
            { name: 'Giáo dục', icon: 'school', color: '#F97316', type: 'expense' },
            { name: 'Khác', icon: 'dots-horizontal', color: '#6B7280', type: 'expense' },
            { name: 'Lương', icon: 'cash', color: '#10B981', type: 'income' },
            { name: 'Thưởng', icon: 'gift', color: '#84CC16', type: 'income' },
            { name: 'Đầu tư', icon: 'trending-up', color: '#0EA5E9', type: 'income' },
            { name: 'Thu nhập khác', icon: 'wallet', color: '#A855F7', type: 'income' },
        ];
        for (const cat of defaultCategories) {
            database.runSync(
                'INSERT INTO categories (name, icon, color, type) VALUES (?, ?, ?, ?)',
                [cat.name, cat.icon, cat.color, cat.type]
            );
        }
        console.log('✅ Đã tạo categories mặc định');
    }
}

// ===== CATEGORY QUERIES =====

export function getAllCategories(): CategoryRow[] {
    return getDatabase().getAllSync<CategoryRow>('SELECT * FROM categories ORDER BY name');
}

export function getCategoriesByType(type: 'income' | 'expense'): CategoryRow[] {
    return getDatabase().getAllSync<CategoryRow>(
        'SELECT * FROM categories WHERE type = ? ORDER BY name',
        [type]
    );
}

export function getCategoryById(id: number): CategoryRow | null {
    return getDatabase().getFirstSync<CategoryRow>(
        'SELECT * FROM categories WHERE id = ?',
        [id]
    );
}

export function getCategoriesCount(): number {
    const result = getDatabase().getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
    return result?.count ?? 0;
}

// ===== TRANSACTION QUERIES =====

export function getAllTransactions(): TransactionWithCategory[] {
    return getDatabase().getAllSync<TransactionWithCategory>(`
        SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color, c.type as category_type,
               b.name as budget_name
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN budgets b ON t.budget_id = b.id
        ORDER BY t.date DESC
        `);
}

export function getTransactionsByMonth(month: number, year: number): TransactionWithCategory[] {
    const startDate = new Date(year, month - 1, 1).getTime();
    const endDate = new Date(year, month, 0, 23, 59, 59, 999).getTime();

    return getDatabase().getAllSync<TransactionWithCategory>(`
        SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color, c.type as category_type,
               b.name as budget_name
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN budgets b ON t.budget_id = b.id
        WHERE t.date >= ? AND t.date <= ?
        ORDER BY t.date DESC
            `, [startDate, endDate]);
}

export function addTransaction(amount: number, type: string, categoryId: number, note: string | null, date: number, budgetId: number | null = null): void {
    getDatabase().runSync(
        'INSERT INTO transactions (amount, type, category_id, budget_id, note, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [amount, type, categoryId, budgetId, note, date, Date.now()]
    );
}

export function updateTransaction(id: number, amount: number, type: string, categoryId: number, note: string | null, date: number): void {
    getDatabase().runSync(
        'UPDATE transactions SET amount = ?, type = ?, category_id = ?, note = ?, date = ? WHERE id = ?',
        [amount, type, categoryId, note, date, id]
    );
}

export function deleteTransaction(id: number): void {
    getDatabase().runSync('DELETE FROM transactions WHERE id = ?', [id]);
}

// ===== BUDGET QUERIES =====

export function getAllBudgets(): BudgetWithCategory[] {
    return getDatabase().getAllSync<BudgetWithCategory>(`
        SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        `);
}

export function getBudgetsByMonth(month: string): BudgetWithCategory[] {
    return getDatabase().getAllSync<BudgetWithCategory>(`
        SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.month = ?
        `, [month]);
}

export function addBudget(name: string, categoryId: number, limitAmount: number, month: string): void {
    getDatabase().runSync(
        'INSERT INTO budgets (name, category_id, limit_amount, month) VALUES (?, ?, ?, ?)',
        [name, categoryId, limitAmount, month]
    );
}

export function updateBudget(id: number, name: string, limitAmount: number): void {
    getDatabase().runSync('UPDATE budgets SET name = ?, limit_amount = ? WHERE id = ?', [name, limitAmount, id]);
}

export function deleteBudget(id: number): void {
    getDatabase().runSync('DELETE FROM budgets WHERE id = ?', [id]);
}

export function getSpentAmountForBudget(budgetId: number, month: number, year: number): number {
    const startDate = new Date(year, month - 1, 1).getTime();
    const endDate = new Date(year, month, 0, 23, 59, 59, 999).getTime();

    const result = getDatabase().getFirstSync<{ total: number | null }>(`
        SELECT SUM(amount) as total
        FROM transactions
        WHERE budget_id = ? AND date >= ? AND date <= ?
        `, [budgetId, startDate, endDate]);

    return result?.total ?? 0;
}

export function getSpentAmountForCategory(categoryId: number, month: number, year: number): number {
    const startDate = new Date(year, month - 1, 1).getTime();
    const endDate = new Date(year, month, 0, 23, 59, 59, 999).getTime();

    const result = getDatabase().getFirstSync<{ total: number | null }>(`
        SELECT SUM(ABS(amount)) as total
        FROM transactions
        WHERE category_id = ? AND date >= ? AND date <= ? AND amount < 0
        `, [categoryId, startDate, endDate]);

    return result?.total ?? 0;
}

// ===== RESET =====

export function resetDatabase(): void {
    const database = getDatabase();
    database.execSync(`
        DELETE FROM transactions;
        DELETE FROM budgets;
        DELETE FROM categories;
    `);
}
