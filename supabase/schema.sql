create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  appointment_date date not null,
  appointment_time time not null,
  client text not null check (char_length(trim(client)) between 1 and 160),
  service text not null check (char_length(trim(service)) between 1 and 160),
  status text not null default 'agendado' check (status in ('agendado', 'confirmado', 'em andamento', 'concluido')),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 160),
  phone text not null default '',
  email text not null default '',
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.procedures (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 160),
  price numeric(10, 2),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid,
  amount numeric(10, 2) not null check (amount > 0),
  client text not null,
  service text not null,
  sale_date date not null,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.appointments enable row level security;
alter table public.clients enable row level security;
alter table public.procedures enable row level security;
alter table public.sales enable row level security;

do $$
begin
  execute 'drop policy if exists "authenticated users can read appointments" on public.appointments';
  execute 'drop policy if exists "authenticated users can write appointments" on public.appointments';
  execute 'drop policy if exists "authenticated users can read clients" on public.clients';
  execute 'drop policy if exists "authenticated users can write clients" on public.clients';
  execute 'drop policy if exists "authenticated users can read procedures" on public.procedures';
  execute 'drop policy if exists "authenticated users can write procedures" on public.procedures';
  execute 'drop policy if exists "authenticated users can read sales" on public.sales';
  execute 'drop policy if exists "authenticated users can write sales" on public.sales';
end $$;

create policy "authenticated users can read appointments" on public.appointments for select to authenticated using (true);
create policy "authenticated users can write appointments" on public.appointments for all to authenticated using (true) with check (true);
create policy "authenticated users can read clients" on public.clients for select to authenticated using (true);
create policy "authenticated users can write clients" on public.clients for all to authenticated using (true) with check (true);
create policy "authenticated users can read procedures" on public.procedures for select to authenticated using (true);
create policy "authenticated users can write procedures" on public.procedures for all to authenticated using (true) with check (true);
create policy "authenticated users can read sales" on public.sales for select to authenticated using (true);
create policy "authenticated users can write sales" on public.sales for all to authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.appointments;
exception when duplicate_object then null;
end $$;