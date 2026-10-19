import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식은 YYYY-MM-DD 입니다.");
const uuid = z.string().uuid();
const optionalUuid = z.preprocess((v) => (v === "" ? null : v), uuid.nullable().optional());
const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z.string().trim().max(2000).nullable().optional(),
);

/** 금액: 0보다 큰 정수만 허용 */
export const amountSchema = z.coerce
  .number()
  .int("금액은 정수여야 합니다.")
  .positive("금액은 0보다 커야 합니다.");

export const expenseInputSchema = z.object({
  spent_on: date,
  amount: amountSchema,
  category_id: uuid,
  event_id: optionalUuid,
  payment_method: optionalText,
  memo: optionalText,
  created_by: optionalUuid,
});
export type ExpenseInput = z.infer<typeof expenseInputSchema>;

export const eventStatusSchema = z.enum(["planning", "preparing", "running", "done"]);

export const eventInputSchema = z.object({
  title: z.string().trim().min(1, "행사명을 입력하세요.").max(200),
  status: eventStatusSchema.default("planning"),
  owner_id: optionalUuid,
  start_date: z.preprocess((v) => (v === "" ? null : v), date.nullable().optional()),
  end_date: z.preprocess((v) => (v === "" ? null : v), date.nullable().optional()),
  allocated_amount: z.coerce.number().int().min(0).default(0),
  description: optionalText,
  source_idea_id: optionalUuid,
});
export type EventInput = z.infer<typeof eventInputSchema>;

export const budgetInputSchema = z.object({
  fiscal_year: z.coerce.number().int().min(2000).max(2100),
  total_amount: z.coerce.number().int().min(0),
});
