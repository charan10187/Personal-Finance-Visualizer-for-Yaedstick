import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.resolve('./transactions.json');

export default async function handler(req, res) {
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

    const monthlyExpenses = {};
    const categoryExpenses = {
        "Housing": 0,
        "Food": 0,
        "Transport": 0,
        "Entertainment": 0
    };

    for (const transaction of data) {
        const date = new Date(transaction.date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        monthlyExpenses[monthYear] = (monthlyExpenses[monthYear] || 0) + transaction.amount;

        const desc = transaction.description.toLowerCase();
        if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('utility')) {
            categoryExpenses.Housing += transaction.amount;
        } else if (desc.includes('food') || desc.includes('groceries') || desc.includes('restaurant')) {
            categoryExpenses.Food += transaction.amount;
        } else if (desc.includes('car') || desc.includes('transport') || desc.includes('bus')) {
            categoryExpenses.Transport += transaction.amount;
        } else if (desc.includes('movie') || desc.includes('game') || desc.includes('subscription')) {
            categoryExpenses.Entertainment += transaction.amount;
        }
    }

    res.status(200).json({
        monthly_expenses: monthlyExpenses,
        category_expenses: categoryExpenses
    });
}
