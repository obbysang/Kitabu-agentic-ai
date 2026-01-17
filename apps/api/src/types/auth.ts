export enum UserRole {
  ADMIN = 'admin',
  FINANCE_OPS = 'finance-ops',
  VIEWER = 'viewer'
}

export interface User {
  id: string;
  email: string;
  passwordHash: string; // Hashed password
  name: string;
  role: UserRole;
  orgId: string;
  createdAt: number;
  updatedAt: number;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  orgId: string;
}
