import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fieldRoutes from './routes/fields.js';

// Debug logging
console.log('Starting server...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('PORT:', process.env.PORT || 3000);

if (!process.env.SUPABASE_URL) {
  console.error('ERROR: SUPABASE_URL is not defined in .env file!');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// Attach user info from headers (for development)
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    req.headers['x-user-id'] = req.headers['x-user-id'] || 'demo-user';
    req.headers['x-user-role'] = req.headers['x-user-role'] || 'admin';
  }
  next();
});

app.use('/api/fields', fieldRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});