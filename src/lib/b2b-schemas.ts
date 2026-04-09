import { z } from "zod";

export const loginSchema = z.object({
  code: z.string().trim().min(3, "Agency code is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export const masterLoginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const createVendorSchema = z.object({
  agencyName: z.string().trim().min(1, "Agency name is required").max(200),
  code: z.string().trim().min(3, "Agency code must be at least 3 characters").max(64),
  password: z.string().min(4, "Password must be at least 4 characters").max(128),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid email"),
  phone: z.string().trim().max(40).optional(),
});

export const ratesFilterSchema = z.object({
  checkIn: z.string().min(1, "Check-in is required"),
  checkOut: z.string().min(1, "Check-out is required"),
  occupancy: z.coerce.number().int().min(1).max(3).optional(),
});

export const quoteLineSchema = z.object({
  roomTypeName: z.string().min(1, "Room type name is required"),
  occupancy: z.coerce.number().int().min(1).max(10),
  roomCount: z.coerce.number().int().min(1).max(500),
  targetRate: z.coerce.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});

export const createQuoteSchema = z.object({
  propertyId: z.coerce.number().int().positive(),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  totalRoomsRequired: z.coerce.number().int().positive(),
  totalGuests: z.coerce.number().int().positive().optional(),
  requirementText: z.string().max(4000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  lines: z.array(quoteLineSchema).min(1),
});
