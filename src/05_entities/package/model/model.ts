// File: 05_entities/package/model/model.ts
import { z } from 'zod';

// Định nghĩa trạng thái gói thầu
export const PackageStatusSchema = z.enum([
  'NEW',
  'REVIEWING',
  'IN_PROGRESS',
  'SUBMITTED',
  'WON',
  'LOST',
]);

// Zod Schema cho BiddingPackage
export const BiddingPackageSchema = z.object({
  hsmtId: z.number().int().positive(),         // hsmt_id
  tbmtCode: z.string().max(50),              // tbmt_code
  khlcntCode: z.string().max(50).optional().nullable(), // khlcnt_code
  projectName: z.string().max(500),            // project_name
  packageName: z.string().max(500),            // package_name
  investorName: z.string().max(255).optional().nullable(), // investor_name
  field: z.string().max(50).optional().nullable(),
  closingDate: z.string().datetime(),          // closing_date
  sourceType: z.enum(['CRAWL', 'MANUAL']),
  status: PackageStatusSchema,
  createdAt: z.string().datetime(),            // created_at
  rawFilesPath: z.string().max(500).optional().nullable(), // raw_files_path
});

export type BiddingPackage = z.infer<typeof BiddingPackageSchema>;
export type PackageStatus = z.infer<typeof PackageStatusSchema>;