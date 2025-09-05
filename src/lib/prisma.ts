import 'server-only'

import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  var prismaClient: PrismaClient | undefined
}

// Prisma 7 ships a Rust-free client and requires an explicit driver adapter.
function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env['POSTGRES_PRISMA_URL'],
    }),
  })
}

// Cached on globalThis outside production so a dev-server hot reload reuses one
// connection pool instead of opening a new one per recompile.
export const prisma: PrismaClient =
  process.env['NODE_ENV'] === 'production'
    ? createPrismaClient()
    : (globalThis.prismaClient ??= createPrismaClient())
