export type MemberRole = "admin" | "member";
export type EventStatus = "planning" | "preparing" | "running" | "done";
export type GrantUserStatus = "new" | "interested" | "hold" | "excluded";

export interface Library {
  id: string;
  name: string;
  region: string | null;
  fiscal_year_start: number;
}

export interface Member {
  id: string;
  library_id: string;
  name: string;
  role: MemberRole;
  is_active: boolean;
}

export interface ExpenseCategory {
  id: string;
  library_id: string;
  name: string;
  sort_order: number;
}

export interface BudgetSummary {
  budget_id: string;
  library_id: string;
  fiscal_year: number;
  total_amount: number;
  spent: number;
  remaining: number;
  burn_rate: number;
}

export interface QuarterSummaryRow {
  budget_id: string;
  library_id: string;
  fiscal_year: number;
  quarter: number;
  category_id: string;
  category_name: string;
  sort_order: number;
  spent: number;
  quarter_spent: number;
  cumulative_spent: number;
  remaining_at_quarter_end: number;
}

export interface EventSpend {
  event_id: string;
  library_id: string;
  title: string;
  status: EventStatus;
  allocated_amount: number;
  spent: number;
  over_budget: boolean;
}

export interface EventRow {
  id: string;
  library_id: string;
  title: string;
  status: EventStatus;
  owner_id: string | null;
  start_date: string | null;
  end_date: string | null;
  allocated_amount: number;
  description: string | null;
  source_idea_id: string | null;
}

export interface ExpenseRow {
  id: string;
  library_id: string;
  budget_id: string;
  event_id: string | null;
  category_id: string;
  spent_on: string;
  amount: number;
  payment_method: string | null;
  memo: string | null;
  created_by: string | null;
}
