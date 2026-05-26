const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.urlencoded({ extended: true }));

let pool;

// 🔄 פונקציית חיבור דינמית המותאמת גם למחשב המקומי וגם לענן
async function initDB() {
    // Render או פלטפורמות ענן אחרות מזריקות אוטומטית משתנה בשם DATABASE_URL או MYSQL_URL
    const cloudConnectionString = process.env.DATABASE_URL || process.env.MYSQL_URL;
    
    if (cloudConnectionString) {
        // חיבור אוטומטי בענן
        pool = mysql.createPool(cloudConnectionString);
        console.log("Connected to Cloud Database.");
    } else {
        // חיבור מקומי למחשב שלך (XAMPP)
        pool = mysql.createPool({
            host: 'localhost',
            user: 'root',       
            password: '', 
            database: 'shop_db',  
            waitForConnections: true,
            connectionLimit: 10
        });
        console.log("Connected to Localhost Database.");
    }

    // יצירת הטבלה אוטומטית
    await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL
        )
    `);
}

app.get('/', (req, res) => {
    res.send(`
        <div style="direction: rtl; font-family: Arial; padding: 20px; max-width: 400px; margin: auto; border: 1px solid #ccc; border-radius: 5px; margin-top: 50px;">
            <h2>הכנסת מוצר חדש</h2>
            <form method="POST" action="/">
                <label>שם מוצר:</label><br>
                <input type="text" name="name" style="width: 100%; padding: 8px; margin: 5px 0;" required><br>
                <label>מחיר המוצר (₪):</label><br>
                <input type="number" step="0.01" name="price" style="width: 100%; padding: 8px; margin: 5px 0;" required><br><br>
                <button type="submit" style="background: #28a745; color: white; border: none; padding: 10px 15px; cursor: pointer; border-radius: 3px; width: 100%;">שמור מוצר</button>
            </form>
            <br>
            <a href="/search" style="text-decoration: none;"><button style="background: #007bff; color: white; border: none; padding: 10px 15px; cursor: pointer; border-radius: 3px; width: 100%;">לעבור לדף חיפוש מוצרים</button></a>
        </div>
    `);
});

app.post('/', async (req, res) => {
    const { name, price } = req.body;
    if (name && price) {
        // 🔒 שימוש ב-? מונע SQL Injection
        await pool.query('INSERT INTO products (name, price) VALUES (?, ?)', [name, parseFloat(price)]);
    }
    res.send('<script>alert("המוצר נשמר בהצלחה!"); window.location.href="/";</script>');
});

app.get('/search', async (req, res) => {
    const query = req.query.q || '';
    let resultsHTML = '';

    if (query) {
        // 🔒 מניעת הזרקת קוד בשאילתת החיפוש
        const [rows] = await pool.query('SELECT name, price FROM products WHERE name LIKE ?', [`%${query}%`]);
        
        if (rows.length > 0) {
            resultsHTML = '<table border="1" style="width: 100%; border-collapse: collapse; margin-top: 15px; text-align: right;"><tr style="background: #f2f2f2;"><th style="padding: 8px;">שם המוצר</th><th style="padding: 8px;">מחיר</th></tr>';
            rows.forEach(row => {
                resultsHTML += `<tr><td style="padding: 8px;">${row.name}</td><td style="padding: 8px;">${row.price} ₪</td></tr>`;
            });
            resultsHTML += '</table>';
        } else {
            resultsHTML = '<p style="color: red; margin-top: 15px;">לא נמצאו מוצרים תואמים לחיפוש.</p>';
        }
    }

    res.send(`
        <div style="direction: rtl; font-family: Arial; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #ccc; border-radius: 5px; margin-top: 50px;">
            <h2>חיפוש מוצרים במערכת</h2>
            <form method="GET" action="/search">
                <input type="text" name="q" value="${query}" placeholder="הקלד שם מוצר לחיפוש..." style="width: 70%; padding: 8px;">
                <button type="submit" style="background: #007bff; color: white; border: none; padding: 9px 15px; cursor: pointer;">חפש</button>
            </form>
            ${resultsHTML}
            <br><br>
            <a href="/" style="color: #007bff; text-decoration: none;">➡️ חזרה להכנסת מוצרים</a>
        </div>
    `);
});

// 🔄 פורט דינמי: בענן המערכת תקבל פורט אוטומטי, במחשב שלך זה ירוץ על 3000
const PORT = process.env.PORT || 3000;
initDB().then(() => {
    app.listen(PORT, () => console.log(`Site running on port ${PORT}`));
}).catch(err => console.error("Database connection error:", err));

