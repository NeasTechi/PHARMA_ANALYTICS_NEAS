-- Run in Supabase SQL editor, or: supabase db query --linked -f backend/supabase_rls.sql
-- Assumes an admin user exists in auth.users.
-- Safe to re-run: every policy is dropped before it is recreated.

-- Public read access
alter table fact_sales enable row level security;
alter table dim_product enable row level security;
alter table dim_customer enable row level security;
alter table dim_date enable row level security;
alter table dim_employee enable row level security;
alter table dim_payment enable row level security;
alter table dim_pharmacy enable row level security;
alter table dim_supplier enable row level security;
alter table pharmacy_table enable row level security;

drop policy if exists "public read fact_sales" on fact_sales;
create policy "public read fact_sales" on fact_sales for select using (true);

drop policy if exists "public read dim_product" on dim_product;
create policy "public read dim_product" on dim_product for select using (true);

-- dim_customer, dim_employee and dim_supplier expose names, dates of birth,
-- licence numbers and phone numbers to anyone holding the anon key.
drop policy if exists "public read dim_customer" on dim_customer;
create policy "public read dim_customer" on dim_customer for select using (true);

drop policy if exists "public read dim_date" on dim_date;
create policy "public read dim_date" on dim_date for select using (true);

drop policy if exists "public read dim_employee" on dim_employee;
create policy "public read dim_employee" on dim_employee for select using (true);

drop policy if exists "public read dim_payment" on dim_payment;
create policy "public read dim_payment" on dim_payment for select using (true);

drop policy if exists "public read dim_pharmacy" on dim_pharmacy;
create policy "public read dim_pharmacy" on dim_pharmacy for select using (true);

drop policy if exists "public read dim_supplier" on dim_supplier;
create policy "public read dim_supplier" on dim_supplier for select using (true);

drop policy if exists "public read pharmacy_table" on pharmacy_table;
create policy "public read pharmacy_table" on pharmacy_table for select using (true);

-- Admin write access: only authenticated users (treat any logged-in user as admin)
drop policy if exists "admin insert fact_sales" on fact_sales;
create policy "admin insert fact_sales" on fact_sales for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "admin update fact_sales" on fact_sales;
create policy "admin update fact_sales" on fact_sales for update
  using (auth.role() = 'authenticated');

drop policy if exists "admin delete fact_sales" on fact_sales;
create policy "admin delete fact_sales" on fact_sales for delete
  using (auth.role() = 'authenticated');
