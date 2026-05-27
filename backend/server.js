const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// התחברות למסד הנתונים
const db = new sqlite3.Database('./shop.db', (err) => {
    if (err) {
        console.error("Database connection error: " + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// יצירת טבלת מוצרים אם אינה קיימת
db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL
)`);

// דף 1: שמירת מוצר חדש + סינון תווים קפדני (Input Validation)
app.post('/api/products', (req, res) => {
    const { name, price } = req.body;

    // 1. אבטחה: הגנה מול Burp Suite - חסימת מחיר שלילי בשרת
    if (price === undefined || price < 0 || isNaN(price)) {
        return res.status(400).json({ error: "Invalid price. Price must be 0 or higher." });
    }

    // 2. אבטחה: חסימת סימנים מוזרים (מאפשר רק אותיות בעברית/אנגלית, מספרים ורווחים)
    // חוסם גרש ('), גרשיים ("), סימן שווה (=), כוכביות וכו'
    const allowedCharacters = /^[a-zA-Z0-9\s\u0590-\u05FF]+$/;
    
    if (!name || !allowedCharacters.test(name)) {
        return res.status(400).json({ error: "Invalid product name. Special characters are not allowed." });
    }

    // 3. הרצת השאילתה המאובטחת (Prepared Statement)
    const query = `INSERT INTO products (name, price) VALUES (?, ?)`;
    
    db.run(query, [name, price], function(err) {
        if (err) {
            return res.status(500).json({ error: "Failed to save product" });
        }
        res.json({ message: "Product saved successfully!" });
    });
});


// דף 2: חיפוש מוצרים (מאובטח מפני SQL Injection)
app.get('/api/products/search', (req, res) => {
    const { query } = req.query;
    const sqlQuery = `SELECT * FROM products WHERE name LIKE ?`;
    const searchParam = `%${query}%`;

    db.all(sqlQuery, [searchParam], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Failed to search products" });
        }
        res.json(rows);
    });
});
// --- אפשרות חדשה: מחיקת מוצר לפי המזהה שלו (id) ---
app.delete('/api/products/:id', (req, res) => {
    // שליפת ה-id מתוך כתובת הבקשה
    const { id } = req.params;
    
    // אבטחה: שימוש בסימן שאלה מונע הזרקת SQL
    const query = `DELETE FROM products WHERE id = ?`;
    
    db.run(query, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: "Failed to delete product" });
        }
        // החזרת תשובה חיובית לאתר
        res.json({ message: "Product deleted successfully!" });
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
