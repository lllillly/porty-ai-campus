create extension if not exists pgcrypto;

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text check (char_length(display_name) between 1 and 40),
    campus text check (campus in ('공주', '천안', '예산')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.user_settings (
    user_id uuid primary key references auth.users(id) on delete cascade,
    theme text not null default 'light' check (theme in ('light', 'dark', 'system')),
    meal_preferences jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.chat_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null default '새 대화' check (char_length(title) between 1 and 80),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.chat_messages (
    id bigint generated always as identity primary key,
    session_id uuid not null references public.chat_sessions(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('user', 'assistant')),
    content text not null check (char_length(content) between 1 and 10000),
    sources jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now()
);

create table public.message_feedback (
    id bigint generated always as identity primary key,
    message_id bigint not null references public.chat_messages(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    rating smallint not null check (rating in (-1, 1)),
    comment text check (char_length(comment) <= 500),
    created_at timestamptz not null default now(),
    unique (message_id, user_id)
);

create table public.knowledge_documents (
    id bigint generated always as identity primary key,
    source_key text not null unique,
    title text not null default '공주대학교 안내',
    category text not null default '대학 정보',
    content text not null,
    source_url text,
    reference_date date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index chat_sessions_user_updated_idx
    on public.chat_sessions (user_id, updated_at desc);
create index chat_messages_session_created_idx
    on public.chat_messages (session_id, created_at);
create index knowledge_documents_category_idx
    on public.knowledge_documents (category);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger user_settings_set_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

create trigger chat_sessions_set_updated_at
before update on public.chat_sessions
for each row execute function public.set_updated_at();

create trigger knowledge_documents_set_updated_at
before update on public.knowledge_documents
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, display_name)
    values (
        new.id,
        coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), 'PORTY 사용자')
    );

    insert into public.user_settings (user_id)
    values (new.id);

    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.message_feedback enable row level security;
alter table public.knowledge_documents enable row level security;

create policy "users read own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "users update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "users manage own settings"
on public.user_settings for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "users manage own chat sessions"
on public.chat_sessions for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "users manage own chat messages"
on public.chat_messages for all
to authenticated
using ((select auth.uid()) = user_id)
with check (
    (select auth.uid()) = user_id
    and exists (
        select 1
        from public.chat_sessions chat_session
        where chat_session.id = session_id
          and chat_session.user_id = (select auth.uid())
    )
);

create policy "users manage own message feedback"
on public.message_feedback for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "knowledge is publicly readable"
on public.knowledge_documents for select
to anon, authenticated
using (true);

grant usage on schema public to anon, authenticated;
grant select on public.knowledge_documents to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete
    on public.user_settings,
       public.chat_sessions,
       public.chat_messages,
       public.message_feedback
    to authenticated;
grant usage, select on all sequences in schema public to authenticated;
