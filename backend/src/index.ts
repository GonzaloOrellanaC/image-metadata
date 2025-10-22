import express from 'express';
import cors from 'cors';
import path from 'path';
import photoRouter from './routes/photo';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/photo', photoRouter);

// Serve static files from the frontend dist directory
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Catch-all handler: send back index.html for any non-API routes (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

const port = process.env.PORT || 5051;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});
