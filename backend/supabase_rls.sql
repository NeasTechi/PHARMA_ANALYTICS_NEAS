-- Run in Supabase SQL editor to enforce role-based access.
-- Assumes an admin user exists in auth.users.

-- Public read access
alter table fact_sales enable row level security;
alter table dim_product enable row level security;

create policy "public read fact_sales" on fact_sales for select using (true);
create policy "public read dim_product" on dim_product for select using (true);

-- Admin write access: only authenticated users (treat any logged-in user as admin)
create policy "admin insert fact_sales" on fact_sales for insert
  with check (auth.role() = 'authenticated');
create policy "admin update fact_sales" on fact_sales for update
  using (auth.role() = 'authenticated');
create policy "admin delete fact_sales" on fact_sales for delete
  using (auth.role() = 'authenticated');