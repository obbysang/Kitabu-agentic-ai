import { Response, CookieOptions } from 'express';

const IS_PROD = process.env.NODE_ENV === 'production';

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax',
  path: '/',
};

export const setSecureCookie = (res: Response, name: string, value: string, options: CookieOptions = {}) => {
  res.cookie(name, value, {
    ...COOKIE_OPTIONS,
    ...options,
  });
};

export const clearSecureCookie = (res: Response, name: string) => {
  res.clearCookie(name, {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
};
