import { Router } from 'express';
import { OrgService } from '../services/org/OrgService.js';
import { ConfigService } from '../services/config/ConfigService.js';
import { createAuthMiddleware, requireRole } from '../middleware/auth.js';
import { AuthService } from '../services/auth/AuthService.js';
import { UserRole } from '../types/auth.js';

export const createOrgRouter = (
  orgService: OrgService, 
  configService: ConfigService, 
  authService: AuthService
) => {
  const router = Router();
  const authMiddleware = createAuthMiddleware(authService);

  router.use(authMiddleware);

  // Get My Org
  router.get('/me', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const org = await orgService.getById(req.user.orgId);
    if (!org) return res.status(404).json({ error: 'Organization not found' });
    
    res.json(org);
  });

  // Get Org Config
  router.get('/:id/config', async (req, res) => {
    // Ensure user belongs to this org
    if (req.user?.orgId !== req.params.id && req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const config = await configService.getConfig(req.params.id);
      res.json(config);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  // Update Org Config (Admin/Ops only)
  router.patch(
    '/:id/config', 
    requireRole([UserRole.ADMIN, UserRole.FINANCE_OPS]), 
    async (req, res) => {
      // Ensure user belongs to this org
      if (req.user?.orgId !== req.params.id && req.user?.role !== UserRole.ADMIN) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      try {
        const updatedOrg = await configService.updateConfig(req.params.id, req.body);
        res.json(updatedOrg);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  return router;
};
