-- Little Library Desk 초기 스키마 (PRD 7장)
-- 다른 앱 테이블과 섞이지 않도록 전용 스키마 little_library 를 사용한다.

create schema if not exists little_library;
set search_path = little_library;

-- ───────── 테이블 ─────────

create table libraries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text,
  fiscal_year_start smallint not null default 1 check (fiscal_year_start between 1 and 12),
  created_at timestamptz not null default now()
);

create table members (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references libraries(id) on delete cascade,
  name text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  is_active boolean not null default true,
  user_id uuid, -- 로그인 도입 시 사용
  created_at timestamptz not null default now()
);
-- 관리자는 도서관당 1명
create unique index members_one_admin_per_library on members (library_id) where role = 'admin' and is_active;

create table budgets (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references libraries(id) on delete cascade,
  fiscal_year int not null,
  total_amount bigint not null check (total_amount >= 0),
  created_at timestamptz not null default now(),
  unique (library_id, fiscal_year)
);

create table expense_categories (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references libraries(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  unique (library_id, name)
);

create table culture_ideas (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  title text not null,
  realm text,
  start_date date,
  end_date date,
  place text,
  area text,
  thumbnail_url text,
  url text,
  bookmarked boolean not null default false,
  memo text,
  source text not null default 'live' check (source in ('live', 'seed')),
  fetched_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references libraries(id) on delete cascade,
  title text not null,
  status text not null default 'planning' check (status in ('planning', 'preparing', 'running', 'done')),
  owner_id uuid references members(id) on delete set null,
  start_date date,
  end_date date,
  allocated_amount bigint not null default 0 check (allocated_amount >= 0),
  description text,
  source_idea_id uuid references culture_ideas(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index events_library_status_idx on events (library_id, status);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references libraries(id) on delete cascade,
  budget_id uuid not null references budgets(id) on delete restrict,
  event_id uuid references events(id) on delete set null,
  category_id uuid not null references expense_categories(id) on delete restrict,
  spent_on date not null,
  amount bigint not null check (amount > 0),
  payment_method text,
  memo text,
  created_by uuid references members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index expenses_budget_date_idx on expenses (budget_id, spent_on);
create index expenses_event_idx on expenses (event_id);

create table grants (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique, -- pblancId
  title text not null,
  agency text,
  apply_start date,
  apply_end date,
  summary text,
  url text,
  hashtags text,
  matched_keywords text[] not null default '{}',
  user_status text not null default 'new' check (user_status in ('new', 'interested', 'hold', 'excluded')),
  source text not null default 'live' check (source in ('live', 'seed')),
  fetched_at timestamptz not null default now()
);
create index grants_apply_end_idx on grants (apply_end);

create table sync_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('bizinfo', 'culture')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('success', 'fallback_cache', 'fallback_seed', 'failed')),
  error_code text,
  fetched_count int not null default 0,
  inserted_count int not null default 0,
  message text
);
create index sync_logs_source_started_idx on sync_logs (source, started_at desc);

-- ───────── 뷰 (잔액·소진율·분기 합계는 여기서만 계산) ─────────

create view budget_summary as
select
  b.id as budget_id,
  b.library_id,
  b.fiscal_year,
  b.total_amount,
  coalesce(sum(e.amount), 0)::bigint as spent,
  (b.total_amount - coalesce(sum(e.amount), 0))::bigint as remaining,
  case when b.total_amount > 0
    then round(coalesce(sum(e.amount), 0) * 100.0 / b.total_amount, 1)
    else 0 end as burn_rate
from budgets b
left join expenses e on e.budget_id = b.id
group by b.id;

-- 분기 1~4 전부, 지출 없는 분기도 0원으로 나온다. 회계연도가 1월 시작이라 달력 분기와 같다.
create view quarter_summary as
with grid as (
  select b.id as budget_id, b.library_id, b.fiscal_year, b.total_amount,
         q.quarter, c.id as category_id, c.name as category_name, c.sort_order
  from budgets b
  cross join generate_series(1, 4) as q(quarter)
  join expense_categories c on c.library_id = b.library_id
),
sp as (
  select budget_id, extract(quarter from spent_on)::int as quarter, category_id, sum(amount) as spent
  from expenses
  group by 1, 2, 3
),
j as (
  select g.*, coalesce(sp.spent, 0)::bigint as spent
  from grid g
  left join sp on sp.budget_id = g.budget_id and sp.quarter = g.quarter and sp.category_id = g.category_id
)
select
  budget_id, library_id, fiscal_year, quarter, category_id, category_name, sort_order, spent,
  (sum(spent) over (partition by budget_id, quarter))::bigint as quarter_spent,
  (sum(spent) over (partition by budget_id order by quarter range between unbounded preceding and current row))::bigint as cumulative_spent,
  (total_amount - sum(spent) over (partition by budget_id order by quarter range between unbounded preceding and current row))::bigint as remaining_at_quarter_end
from j;

create view event_spend as
select
  ev.id as event_id,
  ev.library_id,
  ev.title,
  ev.status,
  ev.allocated_amount,
  coalesce(sum(e.amount), 0)::bigint as spent,
  coalesce(sum(e.amount), 0) > ev.allocated_amount as over_budget
from events ev
left join expenses e on e.event_id = ev.id
group by ev.id;

-- ───────── 보안: RLS 켜고 anon/authenticated 권한 없음, 서버(service_role)만 접근 ─────────

alter table libraries enable row level security;
alter table members enable row level security;
alter table budgets enable row level security;
alter table expense_categories enable row level security;
alter table culture_ideas enable row level security;
alter table events enable row level security;
alter table expenses enable row level security;
alter table grants enable row level security;
alter table sync_logs enable row level security;

revoke all on schema little_library from public, anon, authenticated;
revoke all on all tables in schema little_library from public, anon, authenticated;
grant usage on schema little_library to service_role;
grant all on all tables in schema little_library to service_role;
alter default privileges in schema little_library revoke all on tables from public, anon, authenticated;
alter default privileges in schema little_library grant all on tables to service_role;

-- ───────── seed: 도서관 1개, 운영위원 6명(관리자 1명), 카테고리 6개, 총예산 5,000,000원 ─────────

with lib as (
  insert into libraries (name, region, fiscal_year_start) values ('작은도서관', null, 1) returning id
),
m as (
  insert into members (library_id, name, role)
  select lib.id, v.name, v.role
  from lib, (values
    ('운영위원 1(관리자)', 'admin'),
    ('운영위원 2', 'member'),
    ('운영위원 3', 'member'),
    ('운영위원 4', 'member'),
    ('운영위원 5', 'member'),
    ('운영위원 6', 'member')
  ) as v(name, role)
),
c as (
  insert into expense_categories (library_id, name, sort_order)
  select lib.id, v.name, v.ord
  from lib, (values
    ('강사비', 1), ('재료비', 2), ('홍보비', 3), ('다과비', 4), ('도서구입비', 5), ('기타', 6)
  ) as v(name, ord)
)
insert into budgets (library_id, fiscal_year, total_amount)
select id, 2026, 5000000 from lib;
