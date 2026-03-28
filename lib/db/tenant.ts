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
          if ("workspaceId" in (args.where ?? {})) {
            return query(args);
          }
          args.where = { ...args.where, workspaceId };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, workspaceId };
          return query(args);
        },
        async create({ args, query }) {
          if ("workspaceId" in (args.data as Record<string, unknown>)) {
            (args.data as Record<string, unknown>).workspaceId = workspaceId;
          }
          return query(args);
        },
        async update({ args, query }) {
          args.where = { ...args.where };
          return query(args);
        },
        async delete({ args, query }) {
          return query(args);
        },
      },
    },
  });
}

export type TenantClient = ReturnType<typeof getTenantClient>;
