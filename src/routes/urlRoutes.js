import express from "express";
const router = express.Router();
import { showHome, createShortUrl, redirectToOriginal } from '../controllers/urlController.js';

router.get('/', showHome);
router.post('/shorten', createShortUrl);
router.get('/:code', redirectToOriginal);

export default router;