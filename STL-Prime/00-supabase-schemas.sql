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

-- Supabase required roles
DO $$
BEGIN
  CREATE ROLE anon NOLOGIN NOINHERIT;
  EXCEPTION WHEN DUPLICATE_OBJECT THEN RAISE NOTICE 'not creating role anon -- it already exists';
END
$$;

DO $$
BEGIN
  CREATE ROLE authenticated NOLOGIN NOINHERIT;
  EXCEPTION WHEN DUPLICATE_OBJECT THEN RAISE NOTICE 'not creating role authenticated -- it already exists';
END
$$;

DO $$
BEGIN
  CREATE ROLE service_role NOLOGIN NOINHERIT;
  EXCEPTION WHEN DUPLICATE_OBJECT THEN RAISE NOTICE 'not creating role service_role -- it already exists';
END
$$;

