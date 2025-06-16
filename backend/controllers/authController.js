const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, email, password, role, education, skills } = req.body;
    if (!['seeker', 'employer'].includes(role)) return res.status(400).json({ msg: 'Invalid role' });
  
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await db.execute(
            'INSERT INTO users (name, email, password, role, education, skills) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role, education || '', skills?.join(',') || '']
        );
        res.status(201).json({ msg: 'User registered' });
    } catch (err) {
        res.status(500).json({ msg: 'Error registering user' });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, id: user.id, role: user.role, name: user.name });
    } catch (err) {
        res.status(500).json({ msg: 'Error logging in' });
    }
};
