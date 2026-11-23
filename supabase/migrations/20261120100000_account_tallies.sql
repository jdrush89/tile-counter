create table public.account_tallies (
  user_id uuid primary key references auth.users (id) on delete cascade,
  revision bigint not null default 1 check (revision > 0),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint account_tallies_data_shape check ((
    jsonb_typeof(data) = 'object'
    and jsonb_typeof(data->'tallies') = 'array'
    and jsonb_typeof(data->'tallyEvents') = 'array'
    and jsonb_typeof(data->'dailyTallyNotes') = 'array'
  ) is true)
);

alter table public.account_tallies enable row level security;
revoke all on public.account_tallies from anon, authenticated;
grant select, insert, update on public.account_tallies to authenticated;

create policy "Users can read their own tallies"
  on public.account_tallies for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own tallies"
  on public.account_tallies for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own tallies"
  on public.account_tallies for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
