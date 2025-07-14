const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('API Running'));


const jobRoutes = require('./routes/jobs');
app.use('/jobs', jobRoutes);


const userRoutes = require('./routes/user'); 
app.use('/api/users', userRoutes); 


const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
