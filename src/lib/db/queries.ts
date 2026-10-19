import "server-only";
import { db } from "@/lib/supabase/server";
import type {
  BudgetSummary,
  EventRow,
  EventSpend,
  ExpenseCategory,
  ExpenseRow,
  Library,
  Member,
  QuarterSummaryRow,
} from "./types";

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/** MVP는 도서관 1곳이므로 첫 번째 도서관을 쓴다. */
export async function getLibrary(): Promise<Library> {
  const rows = unwrap(
    await db().from("libraries").select("*").order("created_at").limit(1),
  ) as Library[];
  if (!rows[0]) throw new Error("도서관 정보가 없습니다. 마이그레이션 seed를 확인하세요.");
  return rows[0];
}

export async function listMembers(libraryId: string): Promise<Member[]> {
  return unwrap(
    await db()
      .from("members")
      .select("*")
      .eq("library_id", libraryId)
      .eq("is_active", true)
      .order("role")
      .order("name"),
  ) as Member[];
}

export async function listCategories(libraryId: string): Promise<ExpenseCategory[]> {
  return unwrap(
    await db().from("expense_categories").select("*").eq("library_id", libraryId).order("sort_order"),
  ) as ExpenseCategory[];
}

/** 잔액·소진율은 budget_summary 뷰에서만 가져온다. */
export async function getBudgetSummary(
  libraryId: string,
  fiscalYear: number,
): Promise<BudgetSummary | null> {
  const rows = unwrap(
    await db()
      .from("budget_summary")
      .select("*")
      .eq("library_id", libraryId)
      .eq("fiscal_year", fiscalYear)
      .limit(1),
  ) as BudgetSummary[];
  return rows[0] ?? null;
}

export async function getQuarterSummary(budgetId: string): Promise<QuarterSummaryRow[]> {
  return unwrap(
    await db()
      .from("quarter_summary")
      .select("*")
      .eq("budget_id", budgetId)
      .order("quarter")
      .order("sort_order"),
  ) as QuarterSummaryRow[];
}

export async function listEventSpend(libraryId: string): Promise<EventSpend[]> {
  return unwrap(
    await db().from("event_spend").select("*").eq("library_id", libraryId),
  ) as EventSpend[];
}

export async function listEvents(libraryId: string): Promise<EventRow[]> {
  return unwrap(
    await db().from("events").select("*").eq("library_id", libraryId).order("start_date", { nullsFirst: false }),
  ) as EventRow[];
}

export interface ExpenseFilter {
  budgetId: string;
  from?: string;
  to?: string;
  categoryId?: string;
  eventId?: string;
}

/** 최신순 지출 목록 */
export async function listExpenses(f: ExpenseFilter): Promise<ExpenseRow[]> {
  let q = db().from("expenses").select("*").eq("budget_id", f.budgetId);
  if (f.from) q = q.gte("spent_on", f.from);
  if (f.to) q = q.lte("spent_on", f.to);
  if (f.categoryId) q = q.eq("category_id", f.categoryId);
  if (f.eventId) q = q.eq("event_id", f.eventId);
  return unwrap(
    await q.order("spent_on", { ascending: false }).order("created_at", { ascending: false }),
  ) as ExpenseRow[];
}
