import { prisma } from "./index";

/**
 * Creates a Prisma client context scoped to a specific workspace.
 * All queries through this client will automatically filter by workspaceId.
 */
export function getTenantClient(workspaceId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          // Always enforce workspace scope — never trust caller-supplied workspaceId
          args.where = { ...args.where, workspaceId };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, workspaceId };
          return query(args);
        },
        async create({ args, query }) {
          // Always set workspaceId on create — don't trust caller
          (args.data as Record<string, unknown>).workspaceId = workspaceId;
          return query(args);
        },
        async update({ args, query }) {
          // Enforce workspace scope on updates to prevent cross-tenant writes
          args.where = { ...args.where, workspaceId };
          return query(args);
        },
        async delete({ args, query }) {
          // Enforce workspace scope on deletes to prevent cross-tenant deletes
          args.where = { ...args.where, workspaceId };
          return query(args);
        },
      },
    },
  });
}

export type TenantClient = ReturnType<typeof getTenantClient>;
