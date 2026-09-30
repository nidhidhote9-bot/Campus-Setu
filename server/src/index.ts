import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { connectDB } from './config/db';
import apiRoutes from './routes/apiRoutes';

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: true,
  credentials: true
}));

// API Routes
app.use('/api/v1', apiRoutes);

// Serve client static build in production mode if exists
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('CampusSetu API Server Running. Client SPA available at dev server port 5173.');
    }
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[CampusSetu Monolith] Express Server listening on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to start server:', err);
  });
}
