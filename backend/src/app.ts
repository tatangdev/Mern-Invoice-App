import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import logger from './config/logger.js';
import routes from './routes/index.routes.js';
import { connectDatabase } from './db/conn.js';

const app: Express = express();
const port = config.port;

const morganFormat = config.nodeEnv === 'production' ? 'combined' : 'dev';

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }),
);
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

app.use('/api', routes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found',
    path: _req.originalUrl,
  });
});

app.use((err: Error, _req: Request, res: Response, _next: unknown) => {
  logger.error('Unhandled error', { error: err });
  res.status(500).json({
    message: 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { error: err.message }),
  });
});

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

startServer();
