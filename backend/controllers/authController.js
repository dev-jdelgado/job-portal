const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTER SEEKER USER ---
exports.register = async (req, res) => {
    const { name, email, password, role, education, skills, disabilityStatus } = req.body;

    // Only seekers can register via this route
    if (role !== 'seeker') {
        return res.status(403).json({ msg: 'Only seekers can register' });
    }

    const pwdIdImage = req.file ? req.file.filename : null;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db.execute(
            `INSERT INTO users (name, email, password, role, education, skills, disability_status, pwd_id_image)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                email,
                hashedPassword,
                role,
                education || '',
                skills || '',
                disabilityStatus || 'Non-PWD',
                pwdIdImage || ''
            ]
        );

        res.status(201).json({ msg: 'User registered' });
    } catch (err) {
        console.error(err);

        // Handle duplicate email
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ msg: 'This email is already registered' });
        }

        res.status(500).json({ msg: 'Error registering user' });
    }
};

// --- LOGIN USER ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            pds_url: user.pds_url || null,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error logging in' });
    }
};

// --- CREATE ADMIN USER ---
exports.createAdminUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ msg: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'admin']
        );

        res.status(201).json({ msg: 'Admin user created' });
    } catch (err) {
        console.error(err);

        // Handle duplicate email
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ msg: 'This email is already registered' });
        }

        res.status(500).json({ msg: 'Error creating admin user' });
    }
};
