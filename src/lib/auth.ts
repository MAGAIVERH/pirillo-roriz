import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { db } from '@/lib/db';

function createAuth() {
  return betterAuth({
    database: prismaAdapter(db, {
      provider: 'postgresql',
    }),

    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',

    emailAndPassword: {
      enabled: true,
    },

    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },

    experimental: {
      joins: true,
    },
  });
}

type AuthInstance = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as typeof globalThis & {
  auth?: AuthInstance;
};

function getAuthInstance(): AuthInstance {
  if (globalForAuth.auth) {
    return globalForAuth.auth;
  }

  const instance = createAuth();
  globalForAuth.auth = instance;
  return instance;
}

export const auth = new Proxy({} as AuthInstance, {
  get(_target, property, receiver) {
    const instance = getAuthInstance();
    const value = Reflect.get(instance, property, receiver);

    if (typeof value === 'function') {
      return value.bind(instance);
    }

    return value;
  },
});
