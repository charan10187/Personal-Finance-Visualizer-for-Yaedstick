import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const filePath = path.resolve('./transactions.json');

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const data = await fs.readFile(filePath, 'utf8');
        res.status(200).json(JSON.parse(data));
    }
    else if (req.method === 'POST') {
        const { date, description, amount } = req.body;
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
        const newTransaction = { id: uuidv4(), date, description, amount };
        data.push(newTransaction);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        res.status(201).json({ message: "Transaction added successfully!" });
    }
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        let data = JSON.parse(await fs.readFile(filePath, 'utf8'));
        const filtered = data.filter(transaction => transaction.id !== id);
        await fs.writeFile(filePath, JSON.stringify(filtered, null, 2));
        res.status(200).json({ message: "Transaction deleted successfully!" });
    }
    else {
        res.status(405).end();
    }
}
