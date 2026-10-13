import { Router, Request, Response } from 'express';
import { sendSupportInquiryEmail } from '../utils/email';

const router = Router();

/**
 * POST /api/support
 * Public endpoint allowing platform visitors or authenticated users
 * to submit support inquiries delivered to chirehub@gmail.com.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, subject, message } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ error: 'Subject is required.' });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    await sendSupportInquiryEmail(email.trim(), subject.trim(), message.trim());

    return res.status(200).json({
      success: true,
      message: 'Support inquiry sent successfully.',
    });
  } catch (error) {
    console.error('[SUPPORT ROUTE ERROR]', error);
    return res.status(500).json({
      error: 'Failed to dispatch support inquiry. Please try again or email chirehub@gmail.com directly.',
    });
  }
});

export default router;

