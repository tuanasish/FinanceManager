import { getDatabase, getCategoriesCount } from './index';

export const seedDatabase = async () => {
    const db = getDatabase();
    const count = getCategoriesCount();

    // Nếu db đã có category thì không seed nữa để tránh ghi đè dữ liệu user
    if (count > 0) return;

    console.log('🌱 Bắt đầu seed data mẫu...');

    // 1. Seed Categories
    const initialCategories = [
        { name: 'Ăn uống', icon: 'food', color: '#F59E0B', type: 'expense' },
        { name: 'Di chuyển', icon: 'car', color: '#3B82F6', type: 'expense' },
        { name: 'Mua sắm', icon: 'shopping', color: '#EC4899', type: 'expense' },
        { name: 'Giải trí', icon: 'film', color: '#8B5CF6', type: 'expense' },
        { name: 'Khác', icon: 'dots-horizontal', color: '#6B7280', type: 'expense' },
        { name: 'Lương', icon: 'cash', color: '#10B981', type: 'income' },
        { name: 'Thưởng', icon: 'gift', color: '#84CC16', type: 'income' },
    ];

    try {
        db.execSync('BEGIN TRANSACTION;');

        for (const cat of initialCategories) {
            db.runSync(
                'INSERT INTO categories (name, icon, color, type) VALUES (?, ?, ?, ?)',
                [cat.name, cat.icon, cat.color, cat.type]
            );
        }

        // Lấy lại danh sách category vừa insert
        const categories = db.getAllSync<any>('SELECT * FROM categories');

        const eatCat = categories.find(c => c.name === 'Ăn uống');
        const travelCat = categories.find(c => c.name === 'Di chuyển');
        const shopCat = categories.find(c => c.name === 'Mua sắm');
        const salaryCat = categories.find(c => c.name === 'Lương');

        // 2. Seed Budgets
        const currentMonth = new Date().toISOString().substring(0, 7); // 'YYYY-MM'
        if (eatCat) db.runSync('INSERT INTO budgets (category_id, limit_amount, month) VALUES (?, ?, ?)', [eatCat.id, 5000000, currentMonth]);
        if (travelCat) db.runSync('INSERT INTO budgets (category_id, limit_amount, month) VALUES (?, ?, ?)', [travelCat.id, 1000000, currentMonth]);
        if (shopCat) db.runSync('INSERT INTO budgets (category_id, limit_amount, month) VALUES (?, ?, ?)', [shopCat.id, 3000000, currentMonth]);

        // 3. Seed Transactions
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        const dummyTransactions = [
            { category_id: salaryCat?.id, type: 'income', amount: 20000000, note: 'Lương tháng này', date: now - 5 * oneDay },
            { category_id: eatCat?.id, type: 'expense', amount: 50000, note: 'Ăn sáng', date: now - 3 * oneDay },
            { category_id: eatCat?.id, type: 'expense', amount: 150000, note: 'Ăn trưa & cafe', date: now - 2 * oneDay },
            { category_id: travelCat?.id, type: 'expense', amount: 200000, note: 'Đổ xăng', date: now - oneDay },
            { category_id: shopCat?.id, type: 'expense', amount: 1200000, note: 'Mua quần áo', date: now },
            { category_id: eatCat?.id, type: 'expense', amount: 350000, note: 'Ăn tối nhà hàng', date: now },
        ];

        for (const t of dummyTransactions) {
            if (t.category_id) {
                db.runSync(
                    'INSERT INTO transactions (amount, type, category_id, note, date, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                    [t.amount, t.type, t.category_id, t.note, t.date, now]
                );
            }
        }

        db.execSync('COMMIT;');
        console.log('✅ Đã seed data xong!');
    } catch (e) {
        db.execSync('ROLLBACK;');
        console.error('Lỗi khi seed data:', e);
    }
};
