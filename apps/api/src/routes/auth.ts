import { Router } from 'express';
import { AuthService } from '../services/auth/AuthService.js';

export const createAuthRouter = (authService: AuthService) => {
  const router = Router();

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login(email, password);
    
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json(result);
  });

  return router;
};
