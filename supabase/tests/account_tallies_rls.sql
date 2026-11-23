-- Run in the SQL Editor after an account has synced at least once.
begin;

do $$
begin
  if has_table_privilege('anon', 'public.account_tallies', 'select')
    or has_table_privilege('anon', 'public.account_tallies', 'insert')
    or has_table_privilege('anon', 'public.account_tallies', 'update') then
    raise exception 'Anonymous users have unexpected table privileges';
  end if;
  if not exists (select 1 from public.account_tallies) then
    raise exception 'Sign in and sync an account before running this test';
  end if;
end $$;

select set_config('test.account_user_id', (select user_id::text from public.account_tallies limit 1), true);
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.account_user_id'), true);

do $$
begin
  if (select count(*) from public.account_tallies where user_id = current_setting('test.account_user_id')::uuid) <> 1 then
    raise exception 'The owner cannot read their own data';
  end if;
end $$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000000', true);
do $$
declare affected integer;
begin
  if exists (select 1 from public.account_tallies) then
    raise exception 'Another user can read account data';
  end if;
  update public.account_tallies set revision = revision + 1;
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'Another user can update account data';
  end if;
  begin
    insert into public.account_tallies (user_id, data)
      values (current_setting('test.account_user_id')::uuid, '{"tallies":[],"tallyEvents":[],"dailyTallyNotes":[]}'::jsonb);
    raise exception 'Another user can insert account data';
  exception when insufficient_privilege then
    null;
  end;
end $$;

rollback;
