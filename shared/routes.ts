import { z } from 'zod';
import { insertInvoiceSchema, invoices, aiReports } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  paymentRequired: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  invoices: {
    list: {
      method: 'GET' as const,
      path: '/api/invoices',
      responses: {
        200: z.array(z.custom<typeof invoices.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/invoices/:id',
      responses: {
        200: z.custom<typeof invoices.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/invoices',
      input: insertInvoiceSchema,
      responses: {
        201: z.custom<typeof invoices.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/invoices/:id',
      input: insertInvoiceSchema.partial(),
      responses: {
        200: z.custom<typeof invoices.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/invoices/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  credits: {
    get: {
      method: 'GET' as const,
      path: '/api/credits',
      responses: {
        200: z.object({ balance: z.number() }),
      },
    },
    // Only for demo/testing since Stripe is skipped
    add: {
      method: 'POST' as const,
      path: '/api/credits/add', 
      input: z.object({ amount: z.number() }),
      responses: {
        200: z.object({ balance: z.number() }),
      },
    }
  },
  ai: {
    generateReport: {
      method: 'POST' as const,
      path: '/api/ai/report',
      input: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional(),
      responses: {
        200: z.custom<typeof aiReports.$inferSelect>(), // Returns the stored report
        402: errorSchemas.paymentRequired,
      },
    },
    listReports: {
        method: 'GET' as const,
        path: '/api/ai/reports',
        responses: {
            200: z.array(z.custom<typeof aiReports.$inferSelect>()),
        }
    }
  }
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
