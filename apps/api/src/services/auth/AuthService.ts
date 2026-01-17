import { User, UserRole, AuthTokenPayload } from '../../types/auth.js';
import { OrgService } from '../org/OrgService.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  private users: Map<string, User> = new Map();
  private orgService: OrgService;
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod';

  constructor(orgService: OrgService) {
    this.orgService = orgService;
    this.initializeDemoUsers();
  }

  private async initializeDemoUsers() {
    const org = await this.orgService.getDefaultOrg();
    if (!org) return;

    // Create Admin User
    const adminPass = await bcrypt.hash('admin123', 10);
    this.createUser({
      email: 'admin@kitabu.finance',
      passwordHash: adminPass,
      name: 'Alice Admin',
      role: UserRole.ADMIN,
      orgId: org.id
    });

    // Create Finance Ops User
    const opsPass = await bcrypt.hash('ops123', 10);
    this.createUser({
      email: 'ops@kitabu.finance',
      passwordHash: opsPass,
      name: 'Bob Ops',
      role: UserRole.FINANCE_OPS,
      orgId: org.id
    });
  }

  private createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = uuidv4();
    const now = Date.now();
    const user: User = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(user.email, user); // Index by email for easier login
    return user;
  }

  async login(email: string, password: string): Promise<{ token: string; user: User } | null> {
    const user = this.users.get(email);
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId
    };

    const token = jwt.sign(payload, this.JWT_SECRET, { expiresIn: '24h' });

    return { token, user };
  }

  async validateToken(token: string): Promise<AuthTokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as AuthTokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
