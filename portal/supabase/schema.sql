create extension if not exists pgcrypto;

create type public.user_status as enum ('pending', 'approved', 'revoked');
create type public.user_role as enum ('user', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.user_role not null default 'user',
  status public.user_status not null default 'pending',
  vpn_username text unique,
  approved_at timestamptz,
  provisioned_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vpn_username_format check (
    vpn_username is null or vpn_username ~ '^[a-zA-Z0-9_-]{1,32}$'
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, lower(new.email), 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
$$;

create or replace function public.enforce_approved_user_limit()
returns trigger
language plpgsql
as $$
declare
  approved_count integer;
begin
  if new.status = 'approved' and tg_op = 'INSERT' then
    select count(*) into approved_count
    from public.profiles
    where status = 'approved';

    if approved_count >= 20 then
      raise exception 'UnitedVPN approved user limit reached';
    end if;
  end if;

  if new.status = 'approved' and tg_op = 'UPDATE' and old.status is distinct from 'approved' then
    select count(*) into approved_count
    from public.profiles
    where status = 'approved';

    if approved_count >= 20 then
      raise exception 'UnitedVPN approved user limit reached';
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_approved_user_limit
before insert or update of status on public.profiles
for each row execute function public.enforce_approved_user_limit();

create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Admins can read all profiles"
on public.profiles for select
to authenticated
using (public.is_admin(auth.uid()));

create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

comment on table public.profiles is
'Portal-only identity and approval state. WireGuard private keys and client configs stay on the VPS.';
