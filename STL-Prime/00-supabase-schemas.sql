-- Supabase Required Schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS graphql;
CREATE SCHEMA IF NOT EXISTS graphql_public;
CREATE SCHEMA IF NOT EXISTS realtime;

-- Supabase extensions (often required by auth or storage)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgjwt" SCHEMA public;

-- Initialize Storage baseline (so migrations have something to alter)
CREATE TABLE IF NOT EXISTS storage.buckets (
  id text not null primary key,
  name text not null unique,
  owner uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  public boolean default false,
  avif_autodetection boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid not null default uuid_generate_v4() primary key,
  bucket_id text references storage.buckets(id),
  name text,
  owner uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_accessed_at timestamptz default now(),
  metadata jsonb,
  version text
);
CREATE UNIQUE INDEX IF NOT EXISTS bucketid_objname ON storage.objects (bucket_id, name);

-- Supabase required roles
DO $$
BEGIN
  CREATE ROLE supabase_admin LOGIN NOINHERIT CREATEROLE CREATEDB REPLICATION BYPASSRLS;
  EXCEPTION WHEN DUPLICATE_OBJECT THEN RAISE NOTICE 'role supabase_admin already exists';
END
$$;

DO $$
BEGIN
  CREATE ROLE anon NOLOGIN NOINHERIT;
  EXCEPTION WHEN DUPLICATE_OBJECT THEN RAISE NOTICE 'role anon already exists';
END
$$;

DO $$
BEGIN
  CREATE ROLE authenticated NOLOGIN NOINHERIT;
  EXCEPTION WHEN DUPLICATE_OBJECT THEN RAISE NOTICE 'role authenticated already exists';
END
$$;

DO $$
BEGIN
  CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  EXCEPTION WHEN DUPLICATE_OBJECT THEN RAISE NOTICE 'role service_role already exists';
END
$$;

-- Grant schema usage so PostgREST can actually serve data
GRANT USAGE ON SCHEMA public   TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth     TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA storage  TO anon, authenticated, service_role;

-- Grant default table privileges (current + future tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA public   GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public   GRANT ALL    ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA storage  GRANT ALL    ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth     GRANT ALL    ON TABLES TO service_role;

-- Grant postgres ownership perms to supabase_admin
GRANT ALL ON SCHEMA auth    TO supabase_admin;
GRANT ALL ON SCHEMA storage TO supabase_admin;
GRANT ALL ON SCHEMA public  TO supabase_admin;
