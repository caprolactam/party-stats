import type { z } from 'zod'

export type ValueObject<Brand extends string> = z.core.$ZodBranded<z.ZodType, Brand>
