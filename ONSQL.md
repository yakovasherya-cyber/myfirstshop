# 🔒 Security Report: Potential Attacks & Mitigations

This document explains in simple terms the cyber attacks that could have targeted our application, what an attacker types during an attack, and exactly how our code blocks them.

---

## 1. SQL Injection (SQLi)

### What is the attack and what does the attacker type?
When a user types text into a text field, an attacker might try to inject database commands instead of a real product name. 

* **The Attacker's Input:** An attacker might type something like: `' OR 1=1 --` into the search or add field.
* **The Danger:** If the server blindly glued this input directly into the SQL command, the database would execute:
  ```sql
  SELECT * FROM products WHERE name = '' OR 1=1 --'
  ```
  Since `1=1` is always true, the database gets bypassed and will expose **all products** inside the store at once, or allow the attacker to manipulate the database.

### How we fixed it in code (Prepared Statements)
Instead of gluing text strings together, we used question marks (`?`) which act as separate, secure placeholders:
```javascript
const query = `INSERT INTO products (name, price) VALUES (?, ?)`;
db.run(query, [name, price], ...);
```
**How it protects us:** The database compiles the query structure *before* looking at the user input. It understands that the attacker's input (`' OR 1=1 --`) is strictly **plain text (data)**, never executable code. The database will literally look for a product named exactly `"' OR 1=1 --"`. Since no such product exists, the attack fails completely.

---

## 2. Bypassing Frontend Protections (Traffic Manipulation via Burp Suite)

### What is the attack and what does the attacker type?
Attackers can use proxy tools like Burp Suite to intercept and change network data "in the air" between the browser and the server. This allows them to bypass any restrictions we put on the website's forms.

* **The Attacker's Input:** Even if the website UI blocks them from typing negative numbers or symbols, they use Burp Suite to inject a price like `-999` or inject forbidden characters like single quotes (`'`) and equals signs (`=`) directly into the network request.

### How we fixed it in code (Server-Side Validation)
We did not rely only on the browser. We added strict validation **inside the backend server** to filter and check the data before it ever touches the database:

1. **Blocking Negative Prices:** The server explicitly ensures that the price must be 0 or higher, instantly rejecting negative numbers sent via Burp Suite:
   ```javascript
   if (price < 0) { return res.status(400).json({ error: "Invalid price" }); }
   ```
2. **Blocking Bad Characters (Regex):** We created a strict rule that allows product names to contain **only** regular letters (English/Hebrew) and numbers. Any malicious characters used in SQL hacking (like `'`, `"`, `=`, `;`) are instantly caught and rejected with an error:
   ```javascript
   const allowedCharacters = /^[a-zA-Z0-9\s\u0590-\u05FF]+\$/;
   if (!allowedCharacters.test(name)) { return res.status(400).json({ error: "Invalid name" }); }
   ```

---

## Summary
The application is fully secured with two layers of defense (parameterized queries and server-side validation), making it completely safe against common cyber inputs and bypass tools.
