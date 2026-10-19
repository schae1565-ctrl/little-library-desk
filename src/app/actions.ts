"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertWritable, db } from "@/lib/supabase/server";
import { getLibrary } from "@/lib/db/queries";
import {
  budgetInputSchema,
  eventInputSchema,
  eventStatusSchema,
  expenseInputSchema,
} from "@/lib/validation";

export type ActionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): ActionResult {
  if (e instanceof z.ZodError) {
    return { ok: false, error: e.issues[0]?.message ?? "입력값이 올바르지 않습니다." };
  }
  return { ok: false, error: e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다." };
}

function refreshAll() {
  for (const p of ["/", "/budget", "/events"]) revalidatePath(p);
}

function yearOf(date: string) {
  return Number(date.slice(0, 4));
}

/** 지출 입력: 날짜의 회계연도(=달력 연도) 예산에 연결한다. */
export async function createExpense(input: unknown): Promise<ActionResult> {
  try {
    assertWritable();
    const v = expenseInputSchema.parse(input);
    const lib = await getLibrary();
    const { data: budget, error: bErr } = await db()
      .from("budgets")
      .select("id")
      .eq("library_id", lib.id)
      .eq("fiscal_year", yearOf(v.spent_on))
      .maybeSingle();
    if (bErr) throw new Error(bErr.message);
    if (!budget) throw new Error(`${yearOf(v.spent_on)}년 총예산이 설정되지 않았습니다. 설정 화면에서 먼저 등록하세요.`);
    const { error } = await db()
      .from("expenses")
      .insert({ ...v, library_id: lib.id, budget_id: budget.id });
    if (error) throw new Error(error.message);
    refreshAll();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateExpense(id: string, input: unknown): Promise<ActionResult> {
  try {
    assertWritable();
    const v = expenseInputSchema.parse(input);
    const lib = await getLibrary();
    const { data: budget } = await db()
      .from("budgets")
      .select("id")
      .eq("library_id", lib.id)
      .eq("fiscal_year", yearOf(v.spent_on))
      .maybeSingle();
    if (!budget) throw new Error(`${yearOf(v.spent_on)}년 총예산이 설정되지 않았습니다.`);
    const { error } = await db()
      .from("expenses")
      .update({ ...v, budget_id: budget.id, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    refreshAll();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  try {
    assertWritable();
    const { error } = await db().from("expenses").delete().eq("id", z.string().uuid().parse(id));
    if (error) throw new Error(error.message);
    refreshAll();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function createEvent(input: unknown): Promise<ActionResult> {
  try {
    assertWritable();
    const v = eventInputSchema.parse(input);
    const lib = await getLibrary();
    const { error } = await db().from("events").insert({ ...v, library_id: lib.id });
    if (error) throw new Error(error.message);
    refreshAll();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateEvent(id: string, input: unknown): Promise<ActionResult> {
  try {
    assertWritable();
    const v = eventInputSchema.parse(input);
    const { error } = await db()
      .from("events")
      .update({ ...v, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    refreshAll();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** 칸반 드래그 앤 드롭·키보드 상태 변경 */
export async function moveEvent(id: string, status: unknown): Promise<ActionResult> {
  try {
    assertWritable();
    const s = eventStatusSchema.parse(status);
    const { error } = await db()
      .from("events")
      .update({ status: s, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    refreshAll();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** 회계연도별 총예산 설정 (설정 화면, 관리자 확인 대화상자 뒤에 호출) */
export async function setTotalBudget(input: unknown): Promise<ActionResult> {
  try {
    assertWritable();
    const v = budgetInputSchema.parse(input);
    const lib = await getLibrary();
    const { error } = await db()
      .from("budgets")
      .upsert(
        { library_id: lib.id, fiscal_year: v.fiscal_year, total_amount: v.total_amount },
        { onConflict: "library_id,fiscal_year" },
      );
    if (error) throw new Error(error.message);
    refreshAll();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
