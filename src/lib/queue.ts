import { Queue, Worker, Job } from 'bullmq';
import envConfig from '../config/env.config';
import { sendMail } from './nodemailer';

const connection = {
  host: envConfig.REDIS_HOST || '127.0.0.1',
  port: parseInt(envConfig.REDIS_PORT || '6379', 10),
};

// Create a Queue instance
export const emailQueue = new Queue('email-queue', { connection });

// Register error listener to prevent process crashes when Redis is offline
emailQueue.on('error', (err) => {
  console.error('[Queue] Redis connection error:', err.message);
});

// Create and start a Worker instance
export const startEmailWorker = () => {
  const worker = new Worker(
    'email-queue',
    async (job: Job) => {
      const { to, subject, html } = job.data;
      console.log(`[Worker] Processing email job ${job.id} for ${to}...`);
      await sendMail(to, subject, html);
      console.log(`[Worker] Email job ${job.id} sent successfully.`);
    },
    { connection }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err);
  });

  // Register error listener on worker to prevent crashes
  worker.on('error', (err) => {
    console.error('[Worker] Redis connection error:', err.message);
  });

  console.log('[Worker] Email background worker started.');
};

