import { Router } from 'express';
import { MessageController } from '../controllers/messageController';

const router = Router();
const messageController = new MessageController();

// Route to ingest messages from a CSV file
router.post('/ingest', messageController.ingestMessages);

// Route to retrieve messages
router.get('/', messageController.getMessages);

export default router;