--
-- PostgreSQL database dump
--

\restrict A8YzwbdyTKRSqzpwjKnDN0Lfr5xlWItQRtkedpgIgVfIKkSjnxZPKzmkoLFRK5D

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone',
    'recovery_code'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: ExpenseCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ExpenseCategory" AS ENUM (
    'VENUE',
    'FOOD',
    'PRINTING',
    'DECORATION',
    'GUEST_SPEAKER',
    'MISCELLANEOUS',
    'OTHER'
);


--
-- Name: ManualPaymentSubmissionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ManualPaymentSubmissionStatus" AS ENUM (
    'SUBMITTED',
    'VERIFIED',
    'REJECTED'
);


--
-- Name: MembershipStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MembershipStatus" AS ENUM (
    'PENDING_PAYMENT',
    'ACTIVE',
    'SUSPENDED',
    'CANCELLED',
    'DELETED'
);


--
-- Name: MembershipTier; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MembershipTier" AS ENUM (
    'FOUNDING_MEMBER',
    'MEMBER'
);


--
-- Name: NetworkingPartyType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NetworkingPartyType" AS ENUM (
    'member',
    'external'
);


--
-- Name: OnboardingStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OnboardingStatus" AS ENUM (
    'ONLINE',
    'MANUAL',
    'PRE_ONBOARDED'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'MEMBER'
);


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'SUSPENDED',
    'DELETED'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text,
	negate boolean
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
    revoke trigger on cron.job_run_details from postgres;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
begin
    if not exists (
        select 1
        from pg_catalog.pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8.0', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
            set search_path to ''
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: -
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: next_member_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.next_member_id() RETURNS bigint
    LANGUAGE sql
    AS $$
  SELECT nextval('member_id_seq');
$$;


--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    -- Reset the role on every FOR..LOOP batch execution.
                    -- The first batch of 10 rows is pre-fetched using the current connection role (PG internal behaviour)
                    -- then we have to reset it again otherwise it would use the role defined in the `set_config` above
                    -- to fetch the remaining rows when rows>10, which could be a user-defined role that lacks execution grants.
                    -- The flow is:
                    --   1. run batch with conn role
                    --   2. set_config working_role
                    --   3. execute walrus
                    --   4. reset role (revert)
                    --   5. repeat
                    perform set_config('role', null, true);

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;
$$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;
$$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;
$$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    RETURN _parts[array_length(_parts, 1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_prefix_len INT;
    v_prefix_start INT;
    v_combined_levels INT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_prefix_len := length(coalesce(prefix, ''));
    v_prefix_start := coalesce(array_length(string_to_array(coalesce(prefix, ''), v_delimiter), 1), 1);
    v_combined_levels := coalesce(array_length(string_to_array(v_prefix, v_delimiter), 1), 1);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT array_to_string(path_tokens[$1:$2], '/') AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $3 || '%%'
                  AND bucket_id = $4
                  AND array_length(objects.path_tokens, 1) <> $2
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT array_to_string(path_tokens[$1:$2], '/') AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $3 || '%%'
               AND bucket_id = $4
               AND array_length(objects.path_tokens, 1) = $2
             ORDER BY %I %s)
            LIMIT $5 OFFSET $6
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING v_prefix_start, v_combined_levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := substring(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter) from v_prefix_len + 1);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := substring(v_current.name from v_prefix_len + 1);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
    v_sort_order text;
    v_sort_column text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    -- Defense-in-depth: this function is independently reachable and must
    -- not trust p_sort_order/p_sort_column to already be validated by a
    -- caller. Normalize to the same strict allow-list storage.search_v2
    -- uses before interpolating anything into dynamic SQL below.
    v_sort_order := lower(coalesce(p_sort_order, 'asc'));
    IF v_sort_order NOT IN ('asc', 'desc') THEN
        v_sort_order := 'asc';
    END IF;

    v_sort_column := lower(coalesce(p_sort_column, 'updated_at'));
    IF v_sort_column NOT IN ('updated_at', 'created_at') THEN
        v_sort_column := 'updated_at';
    END IF;

    IF v_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        v_sort_column,
        v_cursor_op,
        v_sort_column,
        v_sort_order,
        v_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: mfa_recovery_code_sets; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_recovery_code_sets (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    mfa_factor_id uuid NOT NULL,
    failed_verification_count integer DEFAULT 0 NOT NULL,
    verification_locked_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT mfa_recovery_code_sets_failed_verification_count_check CHECK ((failed_verification_count >= 0))
);


--
-- Name: mfa_recovery_codes; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_recovery_codes (
    id uuid NOT NULL,
    mfa_recovery_code_set_id uuid NOT NULL,
    code_hash text NOT NULL,
    consumed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: scim_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.scim_tokens (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    token_hash text NOT NULL,
    prefix text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    revoked_at timestamp with time zone,
    last_used_at timestamp with time zone,
    CONSTRAINT scim_tokens_expires_at_future CHECK (((expires_at IS NULL) OR (expires_at > created_at))),
    CONSTRAINT scim_tokens_revoked_after_created CHECK (((revoked_at IS NULL) OR (revoked_at >= created_at))),
    CONSTRAINT scim_tokens_token_hash_check CHECK ((token_hash ~ '^[0-9a-f]{64}$'::text))
);


--
-- Name: scim_users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.scim_users (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    user_id uuid,
    resource jsonb NOT NULL,
    user_name text GENERATED ALWAYS AS (lower((resource ->> 'userName'::text))) STORED NOT NULL,
    external_id text GENERATED ALWAYS AS ((resource ->> 'externalId'::text)) STORED,
    active boolean GENERATED ALWAYS AS (COALESCE(((resource ->> 'active'::text))::boolean, true)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: business_certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_certificates (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    file_path text NOT NULL,
    file_name text NOT NULL,
    file_size_bytes integer NOT NULL,
    mime_type text NOT NULL,
    uploaded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_verified boolean DEFAULT false NOT NULL
);


--
-- Name: business_received; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_received (
    id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    referrer_id uuid,
    amount numeric(10,2) NOT NULL,
    description text,
    week_start timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    referrer_type public."NetworkingPartyType" DEFAULT 'member'::public."NetworkingPartyType" NOT NULL,
    external_name text,
    external_business text,
    external_contact text
);


--
-- Name: email_delivery_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_delivery_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    member_id uuid NOT NULL,
    template text NOT NULL,
    status text NOT NULL,
    brevo_message_id text,
    error_message text,
    sent_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: event_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_registrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    event_id uuid NOT NULL,
    registration_status text DEFAULT 'REGISTERED'::text NOT NULL,
    payment_status text DEFAULT 'PENDING'::text NOT NULL,
    attendance_status text DEFAULT 'NOT_MARKED'::text NOT NULL,
    registered_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    about_event text,
    image_url text,
    tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    event_date timestamp(3) without time zone NOT NULL,
    start_time text,
    end_time text,
    location text NOT NULL,
    registration_amount numeric(10,2) DEFAULT 0 NOT NULL,
    highlights jsonb DEFAULT '[]'::jsonb NOT NULL,
    status text DEFAULT 'PUBLISHED'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hub_id uuid NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    category public."ExpenseCategory" NOT NULL,
    amount numeric(10,2) NOT NULL,
    description text NOT NULL,
    receipt_url text,
    created_by uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: hubs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hubs (
    id uuid NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    coordinator_name text,
    description text,
    location text
);


--
-- Name: manual_payment_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manual_payment_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    membership_id uuid NOT NULL,
    reference text,
    ip_address text,
    status public."ManualPaymentSubmissionStatus" DEFAULT 'SUBMITTED'::public."ManualPaymentSubmissionStatus" NOT NULL,
    submitted_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    verified_at timestamp(3) without time zone,
    verified_by uuid
);


--
-- Name: meeting_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_attendance (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    week_start timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    responded_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: meeting_fee_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_fee_payments (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    month text NOT NULL,
    amount numeric(10,2) DEFAULT 1800.00 NOT NULL,
    payment_status text DEFAULT 'PENDING'::text NOT NULL,
    razorpay_order_id text,
    razorpay_payment_id text,
    razorpay_signature text,
    paid_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: member_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: member_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_profiles (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    full_name text,
    phone text,
    location text,
    profile_photo text,
    business_name text,
    business_category text,
    business_description text,
    business_location text,
    website text,
    instagram text,
    facebook text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    products_services text,
    hub_id uuid,
    business_type text,
    onboarding_status public."OnboardingStatus" DEFAULT 'ONLINE'::public."OnboardingStatus" NOT NULL
);


--
-- Name: membership_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_plans (
    id uuid NOT NULL,
    plan_code text NOT NULL,
    name text NOT NULL,
    badge text,
    amount numeric(10,2) NOT NULL,
    billing_cycle text DEFAULT 'LIFETIME'::text NOT NULL,
    benefits jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    base_amount numeric(10,2) NOT NULL,
    gst_percent numeric(5,2) DEFAULT 18.00 NOT NULL,
    active_from timestamp(3) without time zone,
    active_until timestamp(3) without time zone,
    description text
);


--
-- Name: memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memberships (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    member_id text,
    membership_type text DEFAULT 'FOUNDING_MEMBER'::text NOT NULL,
    membership_status public."MembershipStatus" DEFAULT 'PENDING_PAYMENT'::public."MembershipStatus" NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    payment_reference text,
    joined_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    razorpay_order_id text,
    razorpay_payment_id text,
    razorpay_signature text,
    paid_at timestamp(3) without time zone,
    expires_at timestamp(3) without time zone,
    suspended_at timestamp(3) without time zone,
    auto_delete_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone,
    previous_status public."MembershipStatus"
);


--
-- Name: notification_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    member_id uuid NOT NULL,
    hub_id uuid NOT NULL,
    type text NOT NULL,
    period text NOT NULL,
    status text NOT NULL,
    error_message text,
    sent_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    audience text DEFAULT 'MEMBER'::text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    related_user_id uuid
);


--
-- Name: payment_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_invoices (
    id uuid NOT NULL,
    invoice_number text NOT NULL,
    user_id uuid NOT NULL,
    payment_type text NOT NULL,
    payment_record_id uuid NOT NULL,
    item_name text NOT NULL,
    base_amount numeric(10,2) NOT NULL,
    gst_percent numeric(5,2) DEFAULT 18.00 NOT NULL,
    gst_amount numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    payment_method text NOT NULL,
    transaction_id text,
    html_snapshot text NOT NULL,
    emailed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: referrals_given; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referrals_given (
    id uuid NOT NULL,
    giver_id uuid NOT NULL,
    receiver_id uuid,
    amount numeric(10,2) NOT NULL,
    description text,
    week_start timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    receiver_type public."NetworkingPartyType" DEFAULT 'member'::public."NetworkingPartyType" NOT NULL,
    external_name text,
    external_business text,
    external_contact text
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text,
    password_hash text,
    role public."UserRole" DEFAULT 'MEMBER'::public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'PENDING'::public."UserStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    full_name text,
    profile_photo text,
    membership_tier public."MembershipTier"
);


--
-- Name: whatsapp_delivery_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_delivery_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    member_id uuid NOT NULL,
    template text NOT NULL,
    status text NOT NULL,
    meta_message_id text,
    error_message text,
    sent_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone DEFAULT now()
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL,
    versioning_status text DEFAULT 'DISABLED'::text NOT NULL,
    CONSTRAINT buckets_versioning_dark_check CHECK ((versioning_status = 'DISABLED'::text)),
    CONSTRAINT buckets_versioning_standard_only_check CHECK (((type = 'STANDARD'::storage.buckettype) OR (versioning_status = 'DISABLED'::text))),
    CONSTRAINT buckets_versioning_status_check CHECK ((versioning_status = ANY (ARRAY['DISABLED'::text, 'ENABLED'::text, 'SUSPENDED'::text])))
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    archived_at timestamp with time zone,
    is_delete_marker boolean DEFAULT false NOT NULL,
    is_versioned boolean DEFAULT false NOT NULL
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at, custom_claims_allowlist) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: mfa_recovery_code_sets; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_recovery_code_sets (id, user_id, mfa_factor_id, failed_verification_count, verification_locked_until, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_recovery_codes; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_recovery_codes (id, mfa_recovery_code_set_id, code_hash, consumed_at, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at, expires_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
20260625000000
20260821000000
20260821010000
20260824000000
20260824000001
20260831180000
\.


--
-- Data for Name: scim_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.scim_tokens (id, sso_provider_id, token_hash, prefix, created_at, expires_at, revoked_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: scim_users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.scim_users (id, sso_provider_id, user_id, resource, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
85e69a3e-e26a-4d9b-ba17-8ebb065c1ac1	b9fe57835b74f8cbc9cfbdc9830687d769dc250dbcc26a29aadaf7e5ff1843ee	2026-09-12 11:21:23.759872+00	20260912010000_add_manual_member_onboarding	\N	\N	2026-09-12 11:21:23.20886+00	1
58df0080-fb84-4684-b7de-c30ada42ec19	2e2b51ca9e3caf03070a655bbc8f750d5ea01447618cfd5ef02c8d0f55e24aca	2026-09-12 11:22:23.896686+00	20260912010100_allow_manual_member_missing_contact	\N	\N	2026-09-12 11:22:23.524173+00	1
cd776346-420c-4e1e-891d-8c3b88d00e7f	c79d1f5e6bafcea54e33b64232683a97b46ae3a6124145ecb340083aac377086	2026-09-16 11:05:29.97271+00	20260915000000_add_expenses	\N	\N	2026-09-16 11:05:29.558694+00	1
d1e967fb-b0c4-4b08-9f66-83b3b5d70e41	7b47f885bacf77a2f76abddbd6d20119a7a272680522276de392a759c537d61c	2026-08-25 11:42:49.142954+00	20260825000000_baseline		\N	2026-08-25 11:42:49.142954+00	0
aba53cb6-14b8-4375-bcdb-00d1eaa0510e	d9660515bc432b0608cd9420bcf9c84ea5c3ff42c10b81ff5baef3b678d3aec2	2026-08-26 06:14:59.153196+00	20260826000000_add_gst_breakdown_to_plans	\N	\N	2026-08-26 06:14:58.881764+00	1
27fa8335-e2e3-4d03-b37e-1eef6cded204	57ad85a248b7a62f27eb455c1b77c3222d589575d907dda8f47169c0ae83aa44	2026-09-16 11:05:30.415759+00	20260915010000_add_expense_notification_logs	\N	\N	2026-09-16 11:05:30.128282+00	1
9a03dacf-7a23-446d-a1e1-0c517500fc1f	7f9a59aafd0b6193c8e9a0f1d539bf934e4c17424e8241bb8adacb8926428bf6	2026-08-31 08:01:13.109401+00	20260831080000_add_notifications_and_invoices	\N	\N	2026-08-31 08:01:12.742456+00	1
7e7f1cd9-aa8f-4e25-b1a9-16102a7e6816	523a2914fcba75ece02cb2ba6e2fdf548afc43deee556d20d2da8d211c7b3563	2026-08-31 10:20:27.184392+00	20260831083000_add_admin_profile_photo	\N	\N	2026-08-31 10:20:26.89149+00	1
5aaf0255-013e-4389-b21f-19257a2748a3	e79a24d5c40f7866006939fa5dfc914d7bd4f8154b0be1a1ac0024c29e3135f0	2026-08-31 11:01:14.59062+00	20260831084500_update_founder_plan_amount	\N	\N	2026-08-31 11:01:14.33171+00	1
bc11dcc4-547c-4ab9-8584-c6b4413c869c	c92e9b91f20c650a0864c9b81eb6da03a34667e6548ec93bf88ce5b2ce038ee5	2026-09-16 11:05:30.836011+00	20260916000000_add_membership_tier	\N	\N	2026-09-16 11:05:30.551073+00	1
7a21073b-7c12-4d78-8651-a3fa81fb886b	b2b5ae436c7f9f288cb216382a8dc2607047fa87e08f1a5f439a844405fa9b37	2026-09-03 07:29:05.912573+00	20260903000000_add_external_networking_contacts	\N	\N	2026-09-03 07:29:05.597866+00	1
5177433a-0a86-4820-ac8a-48357b45df71	525026ddcc8d342dc085c2a539a457c63818329594b647a1da160369a9a42620	2026-09-12 10:15:48.851916+00	20260905000000_update_member_onboarding_plan	\N	\N	2026-09-12 10:15:48.447653+00	1
82fecd83-754f-441b-8a70-95d04a20c5ac	f30ed9e9c428b56d2cd20239b6abc0f0a58478059644ec5fc327af7422c666ab	2026-09-12 10:15:49.455648+00	20260912000000_member_lifecycle	\N	\N	2026-09-12 10:15:49.000786+00	1
b80997c0-c4ac-4f69-ab91-6258159680d0	b32231d03bea997a5468483f4b1ef983353bdb6be9a3b7d54b040acd59744d6f	2026-09-16 11:53:22.363284+00	20260916010000_add_manual_payment_submissions	\N	\N	2026-09-16 11:53:21.925432+00	1
44a6e23e-119f-4963-9502-ba68b29a85e7	70150ffb55fdb3043abe3cca75b167689101608bf7154ca0e97c16ddd2d31566	2026-09-17 07:03:14.679288+00	20260917060000_add_whatsapp_delivery_logs	\N	\N	2026-09-17 07:03:14.265285+00	1
cac832d1-eb19-4eb6-8601-3f5bb6714bd6	b963c40465ccd2cadf830600161798b92918304c4017f1e0f8243ad70657994c	2026-09-17 10:17:39.581759+00	20260917100000_add_email_delivery_logs	\N	\N	2026-09-17 10:17:39.255618+00	1
7e6fa13d-1653-499b-a0bb-5272e9c9011d	3f495e31b8798083fe784e8e03bc75dcc43678b2c9a4cc47c3f2d563253f0ec7	2026-09-17 10:52:12.129094+00	20260917110000_align_schema_defaults_with_live_database	\N	\N	2026-09-17 10:52:11.848832+00	1
\.


--
-- Data for Name: business_certificates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_certificates (id, user_id, file_path, file_name, file_size_bytes, mime_type, uploaded_at, is_verified) FROM stdin;
5d88176f-108b-41aa-b789-761164ad6157	a4b2177c-497f-47a7-8b54-45684a9b8156	a4b2177c-497f-47a7-8b54-45684a9b8156/1788777663608-1-ChatGPT_Image_Sep_2_2026_03_59_42_PM.png	ChatGPT Image Sep 2, 2026, 03_59_42 PM.png	1732154	image/png	2026-09-07 10:41:05.825	f
7048431e-fe3c-4fa1-b68d-c1dda9cbd35f	43a63f3b-5fc2-4e9c-83de-3694a15753e3	43a63f3b-5fc2-4e9c-83de-3694a15753e3/1788841734835-1-IMG-20260907-WA0031.jpg	IMG-20260907-WA0031.jpg	68231	image/jpeg	2026-09-08 04:28:56.309	f
\.


--
-- Data for Name: business_received; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_received (id, receiver_id, referrer_id, amount, description, week_start, created_at, referrer_type, external_name, external_business, external_contact) FROM stdin;
\.


--
-- Data for Name: email_delivery_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_delivery_logs (id, member_id, template, status, brevo_message_id, error_message, sent_at) FROM stdin;
\.


--
-- Data for Name: event_registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_registrations (id, user_id, event_id, registration_status, payment_status, attendance_status, registered_at) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, title, description, about_event, image_url, tags, event_date, start_time, end_time, location, registration_amount, highlights, status, created_at, updated_at) FROM stdin;
4f4f49c3-3719-4efe-8a5c-a8a17b7fd119	Poster Upload Verification One	Poster upload verification event.	Automated verification event.	https://aqmoddueqirmjfcarauv.supabase.co/storage/v1/object/public/event-posters/4f4f49c3-3719-4efe-8a5c-a8a17b7fd119/1788781978746-verification-poster.png	[]	2027-12-15 00:00:00	10:00 AM	11:00 AM	VedaConnect Test Venue	0.00	[]	PUBLISHED	2026-09-07 11:52:58.296	2026-09-07 11:52:59.915
3d6e06f5-b0f8-4cdb-a5d9-9e1c18086971	Poster Upload Verification Two	Updated without replacing poster.	Automated verification event.	https://aqmoddueqirmjfcarauv.supabase.co/storage/v1/object/public/event-posters/3d6e06f5-b0f8-4cdb-a5d9-9e1c18086971/1788782018345-verification-poster.png	[]	2027-12-15 00:00:00	10:00 AM	11:00 AM	VedaConnect Test Venue	0.00	[]	PUBLISHED	2026-09-07 11:53:37.227	2026-09-07 11:53:39.553
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, hub_id, date, category, amount, description, receipt_url, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: hubs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hubs (id, name, is_active, created_at, updated_at, coordinator_name, description, location) FROM stdin;
08e84686-0d66-4920-9761-2fcbf975964e	Tirunelveli	t	2026-08-27 11:36:03.534	2026-08-27 11:36:03.534	\N	\N	Tirunelveli, TN
d22d9b0c-b6dd-4109-8ae7-78e43b11ac84	Kovilpatti	t	2026-08-27 11:36:03.534	2026-08-27 11:36:03.534	\N	\N	Kovilpatti, TN
4d0a5cd2-28de-4b8d-a9ab-924ad02c6894	Tenkasi	t	2026-08-27 11:36:03.534	2026-08-27 11:36:03.534	\N	\N	Tenkasi, TN
19994b01-832c-4f6d-9dcc-3c3c5b1eef75	Nagercoil	t	2026-08-27 11:36:03.534	2026-08-27 11:36:03.534	\N	\N	Nagercoil, TN
fe79d8a8-b19a-42c9-b1cc-750da27d8b1d	Kanyakumari	t	2026-08-27 11:36:03.534	2026-08-27 11:36:03.534	\N	\N	Kanyakumari, TN
d24333bf-e6e9-4fd4-80c6-1fb80c4dd464	Thoothukudi	t	2026-08-27 11:36:03.534	2026-08-27 11:36:03.534	\N	\N	Thoothukudi, TN
\.


--
-- Data for Name: manual_payment_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.manual_payment_submissions (id, user_id, membership_id, reference, ip_address, status, submitted_at, verified_at, verified_by) FROM stdin;
\.


--
-- Data for Name: meeting_attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.meeting_attendance (id, user_id, week_start, status, responded_at, created_at) FROM stdin;
\.


--
-- Data for Name: meeting_fee_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.meeting_fee_payments (id, user_id, month, amount, payment_status, razorpay_order_id, razorpay_payment_id, razorpay_signature, paid_at, created_at) FROM stdin;
\.


--
-- Data for Name: member_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_profiles (id, user_id, full_name, phone, location, profile_photo, business_name, business_category, business_description, business_location, website, instagram, facebook, created_at, updated_at, products_services, hub_id, business_type, onboarding_status) FROM stdin;
f6bdadc0-d1cf-4099-af91-3989efc7d29d	a4b2177c-497f-47a7-8b54-45684a9b8156	VISHNUPRIYA	9876543213	Tirunelveli	\N	Vishnupriya Herbals	Herbal & Wellness	nkcefhiejienfke	Tirunelveli	\N	\N	\N	2026-09-07 10:40:04.528	2026-09-07 10:40:45.353	\N	\N	\N	ONLINE
82d0c1bb-f9f9-4a99-9aa9-3ffd7c3c9118	43a63f3b-5fc2-4e9c-83de-3694a15753e3	Nirmal	9786694697	Tirunelveli	\N	This	Natural Products	Solran	Tirunelveli, tamil nadu	\N	\N	\N	2026-09-08 04:28:10.4	2026-09-08 04:28:38.093	\N	\N	\N	ONLINE
c0f9b826-d383-4f82-b18d-cd7e4f61ab19	0b972f8e-6c4a-4a36-a6c4-d4f2b2c2da1b	A. Deepa	+919790583233	Ayikudy, Tenkasi	\N	Deeya Organic Products	Organic Products	\N	Ram Nagar, Tenkasi Main Road, Opposite Amar Seva Sangam, Ayikudy - 627852	\N	\N	\N	2026-09-12 11:25:17.597	2026-09-12 11:25:17.597	\N	4d0a5cd2-28de-4b8d-a9ab-924ad02c6894	\N	MANUAL
0fea0b33-37c8-4ac2-a1ec-5d466f8f98aa	d4fd8733-0773-4265-a48f-18f38145dcb4	Elgin Selva Sindhuja	\N	Tirunelveli	\N	Maria Fashions	Handmade Products	\N	\N	\N	\N	\N	2026-09-12 11:25:20.217	2026-09-12 11:25:20.217	Silk Thread Jewellery Making, Invisible Jewellery Making, Beads Bracelet Making, Chunky Yarn Bag Making, Knitting Blanket, Canvas Bag, Knitting Mat	08e84686-0d66-4920-9761-2fcbf975964e	\N	MANUAL
709abf19-57e4-437a-bf0b-b023b66084fe	cc384a2e-011f-4ae4-af25-6cd3c10f8228	N. Sankari	+919751572151	Tirunelveli	\N	Shree Women's Health Care (Femi9 Distributor)	Sanitary Pads, Baby Diapers	\N	KTC Nagar, Tirunelveli	\N	\N	\N	2026-09-12 11:25:21.582	2026-09-12 11:25:21.582	\N	08e84686-0d66-4920-9761-2fcbf975964e	\N	MANUAL
432af85c-8624-45af-b27e-56046011d24a	380bbf4b-19e0-49dd-9f57-3e8d9ad46187	\N	+919176025556	Tirunelveli	\N	Aaradhiya Foods	Homemade Traditional Food Products (postpartum care)	Traditional Care for New Mothers	\N	\N	\N	\N	2026-09-12 11:25:22.922	2026-09-12 11:25:22.922	Prasava Legiyam, Sukku Legiyam, Poondu Legiyam, Omam Legiyam, Marundhu Kuzhambu Masala, Marundhu Podi	08e84686-0d66-4920-9761-2fcbf975964e	\N	MANUAL
57e2f41f-4017-412a-af8e-b95d7d93e962	7f897b32-9a00-49a8-9cf7-70c542f0d567	L. Vanitha & G. Rajashankar	9842492955	Tirunelveli	\N	KARPA Herbals & Foods	Health and Wellness	Additional phone: +919994430743. Company number: +919940430743.	25/2A, Trivandrum Road, Opp Circuit House, Vannarpettai, Tirunelveli - 627003	\N	\N	\N	2026-09-12 11:25:18.885	2026-09-12 11:46:58.6	\N	08e84686-0d66-4920-9761-2fcbf975964e	\N	MANUAL
\.


--
-- Data for Name: membership_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.membership_plans (id, plan_code, name, badge, amount, billing_cycle, benefits, is_active, created_at, updated_at, base_amount, gst_percent, active_from, active_until, description) FROM stdin;
d919dc6a-d41d-4c65-8584-2f4b2643065f	STANDARD_MEMBER	Member	\N	15340.00	12 Months	["Access to community events", "Member directory access", "Event registration", "Networking sessions", "Business showcase opportunities", "Member-only workshops", "Community leadership opportunities"]	t	2026-09-07 11:23:19.997	2026-09-07 12:07:36.503	13000.00	18.00	\N	\N	
11111111-1111-4111-8111-111111111111	FOUNDING_MEMBER	Member Onboarding	POPULAR	8260.00	12 Months	["Lifetime founding member recognition", "Access to community events", "Member directory access", "Priority event registration", "Exclusive networking sessions", "Business showcase opportunities", "Member-only workshops", "Founding member badge", "Community leadership opportunities", "Exclusive founder events", "Featured business profile"]	t	2026-08-24 06:09:41.708	2026-09-12 10:15:48.216	7000.00	18.00	\N	\N	
\.


--
-- Data for Name: memberships; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.memberships (id, user_id, member_id, membership_type, membership_status, amount, payment_status, payment_reference, joined_at, created_at, updated_at, razorpay_order_id, razorpay_payment_id, razorpay_signature, paid_at, expires_at, suspended_at, auto_delete_at, deleted_at, previous_status) FROM stdin;
8fbb75e3-d66b-452b-a11e-e40ade2f6374	43a63f3b-5fc2-4e9c-83de-3694a15753e3	\N	FOUNDING_MEMBER	DELETED	8260.00	PENDING	\N	\N	2026-09-08 04:29:03.176	2026-09-12 10:26:50.501	order_TZPXXgWy7rUTKq	\N	\N	\N	\N	\N	\N	2026-09-12 10:26:48.395	\N
96cd117e-2616-4926-86ba-7d18754dff2f	a4b2177c-497f-47a7-8b54-45684a9b8156	\N	FOUNDING_MEMBER	DELETED	1.00	PENDING	\N	\N	2026-09-07 10:41:14.355	2026-09-12 10:27:09.141	order_TZ7OffWUbKpcyi	\N	\N	\N	\N	\N	\N	2026-09-12 10:27:07.039	\N
a9faea22-245d-415d-bf81-cc43f09703e7	0b972f8e-6c4a-4a36-a6c4-d4f2b2c2da1b	VC-FM-00005	FOUNDING_MEMBER	ACTIVE	0.00	PAID	MANUAL_OFFLINE_RECORD	2026-09-12 11:25:17.589	2026-09-12 11:25:17.597	2026-09-12 11:25:17.597	\N	\N	\N	2026-09-12 11:25:17.589	\N	\N	\N	\N	\N
c2fc7ced-c65f-4493-8383-2368aff8048e	7f897b32-9a00-49a8-9cf7-70c542f0d567	VC-FM-00006	FOUNDING_MEMBER	ACTIVE	0.00	PAID	MANUAL_OFFLINE_RECORD	2026-09-12 11:25:18.883	2026-09-12 11:25:18.885	2026-09-12 11:25:18.885	\N	\N	\N	2026-09-12 11:25:18.883	\N	\N	\N	\N	\N
1fc71588-16e1-464e-bd30-5dd2625b253b	d4fd8733-0773-4265-a48f-18f38145dcb4	VC-FM-00007	FOUNDING_MEMBER	ACTIVE	0.00	PAID	MANUAL_OFFLINE_RECORD	2026-09-12 11:25:20.215	2026-09-12 11:25:20.217	2026-09-12 11:25:20.217	\N	\N	\N	2026-09-12 11:25:20.215	\N	\N	\N	\N	\N
5ff9aa5c-4f1d-44ea-821f-c058b3374417	cc384a2e-011f-4ae4-af25-6cd3c10f8228	VC-FM-00008	FOUNDING_MEMBER	ACTIVE	0.00	PAID	MANUAL_OFFLINE_RECORD	2026-09-12 11:25:21.579	2026-09-12 11:25:21.582	2026-09-12 11:25:21.582	\N	\N	\N	2026-09-12 11:25:21.579	\N	\N	\N	\N	\N
b85fac7d-3675-4d56-9eb9-8e759d6357cb	380bbf4b-19e0-49dd-9f57-3e8d9ad46187	VC-FM-00009	FOUNDING_MEMBER	ACTIVE	0.00	PAID	MANUAL_OFFLINE_RECORD	2026-09-12 11:25:22.918	2026-09-12 11:25:22.922	2026-09-12 11:25:22.922	\N	\N	\N	2026-09-12 11:25:22.918	\N	\N	\N	\N	\N
\.


--
-- Data for Name: notification_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_logs (id, member_id, hub_id, type, period, status, error_message, sent_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, audience, type, title, message, link, is_read, created_at, related_user_id) FROM stdin;
\.


--
-- Data for Name: payment_invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_invoices (id, invoice_number, user_id, payment_type, payment_record_id, item_name, base_amount, gst_percent, gst_amount, total_amount, payment_method, transaction_id, html_snapshot, emailed_at, created_at) FROM stdin;
\.


--
-- Data for Name: referrals_given; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.referrals_given (id, giver_id, receiver_id, amount, description, week_start, created_at, receiver_type, external_name, external_business, external_contact) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, role, status, created_at, updated_at, full_name, profile_photo, membership_tier) FROM stdin;
0b972f8e-6c4a-4a36-a6c4-d4f2b2c2da1b	\N	\N	MEMBER	ACTIVE	2026-09-12 11:25:17.597	2026-09-12 11:25:17.597	A. Deepa	\N	FOUNDING_MEMBER
d4fd8733-0773-4265-a48f-18f38145dcb4	\N	\N	MEMBER	ACTIVE	2026-09-12 11:25:20.217	2026-09-12 11:25:20.217	Elgin Selva Sindhuja	\N	FOUNDING_MEMBER
cc384a2e-011f-4ae4-af25-6cd3c10f8228	sankariannam@gmail.com	\N	MEMBER	ACTIVE	2026-09-12 11:25:21.582	2026-09-12 11:25:21.582	N. Sankari	\N	FOUNDING_MEMBER
380bbf4b-19e0-49dd-9f57-3e8d9ad46187	\N	\N	MEMBER	ACTIVE	2026-09-12 11:25:22.922	2026-09-12 11:25:22.922	\N	\N	FOUNDING_MEMBER
7f897b32-9a00-49a8-9cf7-70c542f0d567	karpafoods@gmail.com	$2b$10$6SDo0.bvGZ77OqVV/BS7.OFVLQMSxd8yO4rEUQsfTkZAblb8qYLj2	MEMBER	ACTIVE	2026-09-12 11:25:18.885	2026-09-12 11:27:57.351	L. Vanitha & G. Rajashankar	\N	FOUNDING_MEMBER
43a63f3b-5fc2-4e9c-83de-3694a15753e3	nirmalakkiniraj@gmail.com	\N	MEMBER	DELETED	2026-09-08 04:28:10.03	2026-09-12 10:26:50.149	\N	\N	\N
a4b2177c-497f-47a7-8b54-45684a9b8156	vishnupriyavsoft@gmail.com	\N	MEMBER	DELETED	2026-09-07 10:40:04.153	2026-09-12 10:27:08.79	\N	\N	\N
9bd12fdf-1d70-4825-abd7-b67ed1809ccc	vedaconnecttvl@gmail.com	$2b$10$djIFIPomMsAf2u7G7awOyuVdN4AUyCikBpNF8vu/X6jU/AoOaqliS	ADMIN	ACTIVE	2026-08-31 07:13:16.256	2026-08-31 10:41:08.931	Vedaconnect	data:image/jpeg;base64,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	\N
\.


--
-- Data for Name: whatsapp_delivery_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_delivery_logs (id, member_id, template, status, meta_message_id, error_message, sent_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-08-22 08:54:21
20211116045059	2026-08-22 08:54:21
20211116050929	2026-08-22 08:54:21
20211116051442	2026-08-22 08:54:21
20211116212300	2026-08-22 08:54:21
20211116213355	2026-08-22 08:54:21
20211116213934	2026-08-22 08:54:21
20211116214523	2026-08-22 08:54:21
20211122062447	2026-08-22 08:54:21
20211124070109	2026-08-22 08:54:21
20211202204204	2026-08-22 08:54:21
20211202204605	2026-08-22 08:54:21
20211210212804	2026-08-22 08:54:21
20211228014915	2026-08-22 08:54:21
20220107221237	2026-08-22 08:54:21
20220228202821	2026-08-22 08:54:21
20220312004840	2026-08-22 08:54:21
20220603231003	2026-08-22 08:54:21
20220603232444	2026-08-22 08:54:21
20220615214548	2026-08-22 08:54:21
20220712093339	2026-08-22 08:54:21
20220908172859	2026-08-22 08:54:21
20220916233421	2026-08-22 08:54:21
20230119133233	2026-08-22 08:54:21
20230128025114	2026-08-22 08:54:21
20230128025212	2026-08-22 08:54:21
20230227211149	2026-08-22 08:54:21
20230228184745	2026-08-22 08:54:21
20230308225145	2026-08-22 08:54:21
20230328144023	2026-08-22 08:54:21
20231018144023	2026-08-22 08:54:21
20231204144023	2026-08-22 08:54:21
20231204144024	2026-08-22 08:54:21
20231204144025	2026-08-22 08:54:21
20240108234812	2026-08-22 08:54:21
20240109165339	2026-08-22 08:54:21
20240227174441	2026-08-22 08:54:21
20240311171622	2026-08-22 08:54:21
20240321100241	2026-08-22 08:54:21
20240401105812	2026-08-22 08:54:21
20240418121054	2026-08-22 08:54:21
20240523004032	2026-08-22 08:54:21
20240618124746	2026-08-22 08:54:21
20240801235015	2026-08-22 08:54:21
20240805133720	2026-08-22 08:54:21
20240827160934	2026-08-22 08:54:21
20240919163303	2026-08-22 08:54:21
20240919163305	2026-08-22 08:54:21
20241019105805	2026-08-22 08:54:21
20241030150047	2026-08-22 08:54:21
20241108114728	2026-08-22 08:54:21
20241121104152	2026-08-22 08:54:21
20241130184212	2026-08-22 08:54:21
20241220035512	2026-08-22 08:54:21
20241220123912	2026-08-22 08:54:21
20241224161212	2026-08-22 08:54:21
20250107150512	2026-08-22 08:54:21
20250110162412	2026-08-22 08:54:21
20250123174212	2026-08-22 08:54:21
20250128220012	2026-08-22 08:54:21
20250506224012	2026-08-22 08:54:21
20250523164012	2026-08-22 08:54:21
20250714121412	2026-08-22 08:54:21
20250905041441	2026-08-22 08:54:21
20251103001201	2026-08-22 08:54:21
20251120212548	2026-08-22 08:54:21
20251120215549	2026-08-22 08:54:21
20260218120000	2026-08-22 08:54:21
20260326120000	2026-08-22 08:54:21
20260514120000	2026-08-22 08:54:21
20260527120000	2026-08-22 08:54:21
20260528120000	2026-08-22 08:54:21
20260603120000	2026-08-22 08:54:21
20260605120000	2026-08-22 08:54:21
20260606110000	2026-08-22 08:54:21
20260616120000	2026-08-22 08:54:21
20260624120000	2026-08-22 08:54:21
20260626120000	2026-08-22 08:54:21
20260706120000	2026-08-22 08:54:21
20260707120000	2026-08-22 08:54:21
20260709120000	2026-08-22 08:54:21
20260714120000	2026-09-04 05:23:22
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type, versioning_status) FROM stdin;
business-certificates	business-certificates	\N	2026-08-24 09:25:00.282711+00	2026-08-24 09:25:00.282711+00	f	f	\N	\N	\N	STANDARD	DISABLED
event-posters	event-posters	\N	2026-09-07 11:44:12.496408+00	2026-09-07 11:44:12.496408+00	t	f	\N	\N	\N	STANDARD	DISABLED
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-08-22 08:54:21.727415
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-08-22 08:54:21.735387
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-08-22 08:54:21.739677
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-08-22 08:54:21.752905
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-08-22 08:54:21.778478
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-08-22 08:54:21.783408
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-08-22 08:54:21.788971
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-08-22 08:54:25.071399
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-08-22 08:54:25.08614
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-08-22 08:54:25.093102
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-08-22 08:54:25.100403
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-08-22 08:54:25.113342
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-08-22 08:54:25.12019
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-08-22 08:54:25.124639
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-08-22 08:54:25.128958
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-08-22 08:54:25.169823
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-08-22 08:54:25.176472
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-08-22 08:54:25.18301
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-08-22 08:54:25.187319
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-08-22 08:54:25.192103
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-08-22 08:54:25.195976
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-08-22 08:54:25.201163
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-08-22 08:54:25.215526
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-08-22 08:54:25.224557
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-08-22 08:54:25.22924
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-08-22 08:54:25.233017
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-08-22 08:54:25.236862
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-08-22 08:54:25.240232
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-08-22 08:54:25.243542
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-08-22 08:54:25.247114
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-08-22 08:54:25.250694
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-08-22 08:54:25.2539
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-08-22 08:54:25.257173
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-08-22 08:54:25.260413
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-08-22 08:54:25.26374
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-08-22 08:54:25.266859
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-08-22 08:54:25.270113
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-08-22 08:54:25.27341
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-08-22 08:54:25.277556
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-08-22 08:54:25.286821
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-08-22 08:54:25.290176
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-08-22 08:54:25.293838
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-08-22 08:54:25.297313
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-08-22 08:54:25.30054
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-08-22 08:54:25.303787
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-08-22 08:54:25.307824
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-08-22 08:54:25.31978
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-08-22 08:54:25.323675
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-08-22 08:54:25.327484
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-08-22 08:54:25.341916
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-08-22 08:54:25.34675
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-08-22 08:54:26.496359
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-08-22 08:54:26.507865
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-08-22 08:54:26.522055
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-08-22 08:54:26.524853
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-08-22 08:54:26.52694
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-08-22 08:54:26.533063
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-08-22 08:54:26.540406
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-08-22 08:54:26.544393
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-08-22 08:54:26.549076
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-08-22 08:54:26.5529
61	mark-filename-immutable	fe0096517ae9d60aaec1d110172ba9036dc66bb7	2026-08-22 08:54:26.557113
62	object-versioning-core	0b855f00ff3be0bfca91efee02a9858912491a9a	2026-08-22 08:54:26.560842
63	fix-search-name-relative-to-prefix	c7485e417624f795ce8bb2da21927f48e088904d	2026-08-24 05:12:16.496537
64	fix-search-by-timestamp-sqli	0af424ecd388a39bb1645184b222185a12149675	2026-08-24 05:12:16.529898
65	objects-key-version-index	603c1c55658e982d35839001e2c2b59a50703904	2026-09-08 04:29:01.240358
66	objects-current-version-index	191466c93aa2c46a00e36505577c5fcab8d7cb4b	2026-09-08 04:29:01.256549
67	objects-null-version-index	15bfe8c35b66642b6c78ba60060fa8793bd2207a	2026-09-08 04:29:01.267881
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, archived_at, is_delete_marker, is_versioned) FROM stdin;
b7fc02dc-8b15-4970-91e6-0952d622ebf3	business-certificates	ce803c35-940e-4cb2-8557-05d3069333a9/1787563724472-1-ChatGPT_Image_Aug_21_2026_01_00_40_PM.png	\N	2026-08-24 09:28:46.759732+00	2026-08-24 09:28:46.759732+00	2026-08-24 09:28:46.759732+00	{"eTag": "\\"57d09579796d3d74b1a14d36619a0fc0\\"", "size": 517779, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-24T09:28:47.000Z", "contentLength": 517779, "httpStatusCode": 200}	f6dfe21f-c73f-4c0f-8c98-1b5061585ae5	\N	{}	\N	f	f
e396bae6-b054-456f-a792-26f115dc6363	business-certificates	bc3c527d-4c26-4b44-8f28-4bf80a3fb271/1787567600777-1-P_Indira_resume.pdf	\N	2026-08-24 10:33:22.038009+00	2026-08-24 10:33:22.038009+00	2026-08-24 10:33:22.038009+00	{"eTag": "\\"83ca840e8530084957f730bc1d15826a\\"", "size": 90054, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-08-24T10:33:22.000Z", "contentLength": 90054, "httpStatusCode": 200}	9f8d1442-b4d5-42ae-849b-5f8d540d1f48	\N	{}	\N	f	f
e0ad2b2d-4544-41d4-a6da-9c9f6edeb5f2	business-certificates	59ec1343-d884-41a0-bf10-271611bdbcd3/1787638672092-1-ChatGPT_Image_Aug_21_2026_01_00_40_PM.png	\N	2026-08-25 06:17:55.010889+00	2026-08-25 06:17:55.010889+00	2026-08-25 06:17:55.010889+00	{"eTag": "\\"57d09579796d3d74b1a14d36619a0fc0\\"", "size": 517779, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-25T06:17:55.000Z", "contentLength": 517779, "httpStatusCode": 200}	ce59cdcf-d8d9-4075-9edc-d8d272ee82f7	\N	{}	\N	f	f
e14e2e5f-3657-40b9-b651-7d835b70ce0b	business-certificates	974a16a7-e8b7-4713-8cee-c78140e55049/1787745489557-1-ChatGPT_Image_Aug_21_2026_01_00_40_PM.png	\N	2026-08-26 11:58:12.884142+00	2026-08-26 11:58:12.884142+00	2026-08-26 11:58:12.884142+00	{"eTag": "\\"57d09579796d3d74b1a14d36619a0fc0\\"", "size": 517779, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-26T11:58:13.000Z", "contentLength": 517779, "httpStatusCode": 200}	8862f02a-caa6-479a-b973-c847d8971b53	\N	{}	\N	f	f
c92ac6aa-288a-4222-b1c0-58ac296d0c8d	business-certificates	22143e1f-f628-4bc5-95ba-e81a7b0d67f5/1787746022459-1-ChatGPT_Image_Aug_21_2026_01_00_40_PM.png	\N	2026-08-26 12:07:05.562508+00	2026-08-26 12:07:05.562508+00	2026-08-26 12:07:05.562508+00	{"eTag": "\\"57d09579796d3d74b1a14d36619a0fc0\\"", "size": 517779, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-26T12:07:06.000Z", "contentLength": 517779, "httpStatusCode": 200}	77b53f7e-ff3e-46b5-bd94-f5b62ce270ab	\N	{}	\N	f	f
f52bae33-89f3-484d-a142-39d9f79b2af5	business-certificates	eca68b5a-1fd0-48bd-b0c1-6754079881b7/1787825036829-1-P_Indira_resume.pdf	\N	2026-08-27 10:03:58.121514+00	2026-08-27 10:03:58.121514+00	2026-08-27 10:03:58.121514+00	{"eTag": "\\"83ca840e8530084957f730bc1d15826a\\"", "size": 90054, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-08-27T10:03:59.000Z", "contentLength": 90054, "httpStatusCode": 200}	797635ea-891a-4461-aa90-9f6bf0599819	\N	{}	\N	f	f
7068c416-27f0-4b9d-b4e4-da8f2cccb3ce	business-certificates	46035acd-2aef-477d-b939-e4d70f9d6f15/1787825658725-1-P_Indira_resume.pdf	\N	2026-08-27 10:14:19.771229+00	2026-08-27 10:14:19.771229+00	2026-08-27 10:14:19.771229+00	{"eTag": "\\"83ca840e8530084957f730bc1d15826a\\"", "size": 90054, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-08-27T10:14:20.000Z", "contentLength": 90054, "httpStatusCode": 200}	5be15778-f23a-440f-9b6c-d6c54a13c9bb	\N	{}	\N	f	f
36395a38-50a8-4070-988e-aac3625c7088	business-certificates	79c582f7-56d1-41c9-b4f7-e942a9521120/1787827390913-1-P_Indira_resume.pdf	\N	2026-08-27 10:43:11.882494+00	2026-08-27 10:43:11.882494+00	2026-08-27 10:43:11.882494+00	{"eTag": "\\"83ca840e8530084957f730bc1d15826a\\"", "size": 90054, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-08-27T10:43:12.000Z", "contentLength": 90054, "httpStatusCode": 200}	281ac5fb-fc21-4aed-9f81-5627ae732df9	\N	{}	\N	f	f
2e28e9f0-013b-40d9-b9ed-0c7bedc07114	business-certificates	af153ed3-fe76-49a4-bfc3-8a875ce07082/1787830886564-1-Vishnupriya.pdf	\N	2026-08-27 11:41:27.679735+00	2026-08-27 11:41:27.679735+00	2026-08-27 11:41:27.679735+00	{"eTag": "\\"18b7fd5c9c3a21570bbaf6158f104b7c\\"", "size": 260421, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-08-27T11:41:28.000Z", "contentLength": 260421, "httpStatusCode": 200}	fe2ee272-ff3d-4c48-8f28-ec3c7d18d015	\N	{}	\N	f	f
3fe0a533-b114-4bc9-a079-069cc439cfcf	business-certificates	bc908f30-c66c-4ef4-9b4c-a7064f109142/1787831875700-1-V_Vishnupriya.pdf	\N	2026-08-27 11:57:56.79756+00	2026-08-27 11:57:56.79756+00	2026-08-27 11:57:56.79756+00	{"eTag": "\\"f5b8377558f52ba8c7f4bbc59640016e\\"", "size": 290639, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-08-27T11:57:57.000Z", "contentLength": 290639, "httpStatusCode": 200}	5694f21d-87f9-4715-b9c0-e6c519a05f3e	\N	{}	\N	f	f
ec21aac0-e034-4492-81b0-0688ca24dbce	business-certificates	5d569064-8caf-4303-84d8-03d16177d6e9/1787898412105-1-V_Vishnupriya.pdf	\N	2026-08-28 06:26:54.353264+00	2026-08-28 06:26:54.353264+00	2026-08-28 06:26:54.353264+00	{"eTag": "\\"f5b8377558f52ba8c7f4bbc59640016e\\"", "size": 290639, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-08-28T06:26:55.000Z", "contentLength": 290639, "httpStatusCode": 200}	a400abf4-dbe0-4996-a8c1-7af50ebbccb8	\N	{}	\N	f	f
0fe54e57-c81b-4424-82c2-314ddc814abf	business-certificates	a4b2177c-497f-47a7-8b54-45684a9b8156/1788777663608-1-ChatGPT_Image_Sep_2_2026_03_59_42_PM.png	\N	2026-09-07 10:41:05.664598+00	2026-09-07 10:41:05.664598+00	2026-09-07 10:41:05.664598+00	{"eTag": "\\"2bb5058e5538536b1dbe64c6be71c9fe\\"", "size": 1732154, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-07T10:41:06.000Z", "contentLength": 1732154, "httpStatusCode": 200}	54c2dc00-d120-47ed-a32a-03a8c834bb99	\N	{}	\N	f	f
bd5797c3-afb7-4c8f-8084-20f8b2e9df1f	event-posters	4f4f49c3-3719-4efe-8a5c-a8a17b7fd119/1788781978746-verification-poster.png	\N	2026-09-07 11:53:05.282846+00	2026-09-07 11:53:05.282846+00	2026-09-07 11:53:05.282846+00	{"eTag": "\\"fabd3e68f49f55221f1348dbedfecc13\\"", "size": 68, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-07T11:53:06.000Z", "contentLength": 68, "httpStatusCode": 200}	e74fc814-7008-46f0-8345-720f61af902d	\N	{}	\N	f	f
e0eeb1d2-1f87-4c7e-bf63-2e88dcf631a7	event-posters	3d6e06f5-b0f8-4cdb-a5d9-9e1c18086971/1788782018345-verification-poster.png	\N	2026-09-07 11:53:44.27748+00	2026-09-07 11:53:44.27748+00	2026-09-07 11:53:44.27748+00	{"eTag": "\\"fabd3e68f49f55221f1348dbedfecc13\\"", "size": 68, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-07T11:53:45.000Z", "contentLength": 68, "httpStatusCode": 200}	3756be52-c0f9-4da9-a5b4-459999b5104c	\N	{}	\N	f	f
e0e87449-b6de-4da3-85b4-c92388da9be1	business-certificates	43a63f3b-5fc2-4e9c-83de-3694a15753e3/1788841734835-1-IMG-20260907-WA0031.jpg	\N	2026-09-08 04:28:56.102237+00	2026-09-08 04:28:56.102237+00	2026-09-08 04:28:56.102237+00	{"eTag": "\\"2b5f046191d94d94b4f0a0bbe57e386a\\"", "size": 68231, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-08T04:28:57.000Z", "contentLength": 68231, "httpStatusCode": 200}	c948f6e0-020a-4a19-ad0c-2e086150f6f6	\N	{}	\N	f	f
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: member_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.member_id_seq', 9, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_mfa_factor_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_mfa_factor_id_key UNIQUE (mfa_factor_id);


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_pkey PRIMARY KEY (id);


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_user_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_user_id_key UNIQUE (user_id);


--
-- Name: mfa_recovery_codes mfa_recovery_codes_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_recovery_codes
    ADD CONSTRAINT mfa_recovery_codes_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: scim_tokens scim_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.scim_tokens
    ADD CONSTRAINT scim_tokens_pkey PRIMARY KEY (id);


--
-- Name: scim_users scim_users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.scim_users
    ADD CONSTRAINT scim_users_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: business_certificates business_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_certificates
    ADD CONSTRAINT business_certificates_pkey PRIMARY KEY (id);


--
-- Name: business_received business_received_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_received
    ADD CONSTRAINT business_received_pkey PRIMARY KEY (id);


--
-- Name: email_delivery_logs email_delivery_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_delivery_logs
    ADD CONSTRAINT email_delivery_logs_pkey PRIMARY KEY (id);


--
-- Name: event_registrations event_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: hubs hubs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hubs
    ADD CONSTRAINT hubs_pkey PRIMARY KEY (id);


--
-- Name: manual_payment_submissions manual_payment_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manual_payment_submissions
    ADD CONSTRAINT manual_payment_submissions_pkey PRIMARY KEY (id);


--
-- Name: meeting_attendance meeting_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attendance
    ADD CONSTRAINT meeting_attendance_pkey PRIMARY KEY (id);


--
-- Name: meeting_fee_payments meeting_fee_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_fee_payments
    ADD CONSTRAINT meeting_fee_payments_pkey PRIMARY KEY (id);


--
-- Name: member_profiles member_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_pkey PRIMARY KEY (id);


--
-- Name: membership_plans membership_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_plans
    ADD CONSTRAINT membership_plans_pkey PRIMARY KEY (id);


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- Name: notification_logs notification_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payment_invoices payment_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_invoices
    ADD CONSTRAINT payment_invoices_pkey PRIMARY KEY (id);


--
-- Name: referrals_given referrals_given_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals_given
    ADD CONSTRAINT referrals_given_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_delivery_logs whatsapp_delivery_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_delivery_logs
    ADD CONSTRAINT whatsapp_delivery_logs_pkey PRIMARY KEY (id);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: mfa_recovery_codes_set_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_recovery_codes_set_id_idx ON auth.mfa_recovery_codes USING btree (mfa_recovery_code_set_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: scim_tokens_expires_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_tokens_expires_at_idx ON auth.scim_tokens USING btree (expires_at);


--
-- Name: scim_tokens_revoked_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_tokens_revoked_at_idx ON auth.scim_tokens USING btree (revoked_at);


--
-- Name: scim_tokens_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_tokens_sso_provider_id_idx ON auth.scim_tokens USING btree (sso_provider_id);


--
-- Name: scim_tokens_token_hash_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX scim_tokens_token_hash_key ON auth.scim_tokens USING btree (token_hash);


--
-- Name: scim_users_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_users_created_at_idx ON auth.scim_users USING btree (sso_provider_id, created_at, id) WHERE (deleted_at IS NULL);


--
-- Name: scim_users_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_users_deleted_at_idx ON auth.scim_users USING btree (deleted_at);


--
-- Name: scim_users_external_id_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX scim_users_external_id_key ON auth.scim_users USING btree (sso_provider_id, external_id) WHERE ((external_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: scim_users_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_users_id_idx ON auth.scim_users USING btree (sso_provider_id, id) WHERE (deleted_at IS NULL);


--
-- Name: scim_users_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_users_sso_provider_id_idx ON auth.scim_users USING btree (sso_provider_id);


--
-- Name: scim_users_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_users_updated_at_idx ON auth.scim_users USING btree (sso_provider_id, updated_at, id) WHERE (deleted_at IS NULL);


--
-- Name: scim_users_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_users_user_id_idx ON auth.scim_users USING btree (user_id);


--
-- Name: scim_users_user_name_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_users_user_name_idx ON auth.scim_users USING btree (sso_provider_id, user_name COLLATE "C", id) WHERE (deleted_at IS NULL);


--
-- Name: scim_users_user_name_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX scim_users_user_name_key ON auth.scim_users USING btree (sso_provider_id, user_name) WHERE (deleted_at IS NULL);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: business_received_receiver_id_week_start_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_received_receiver_id_week_start_idx ON public.business_received USING btree (receiver_id, week_start);


--
-- Name: business_received_referrer_id_week_start_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_received_referrer_id_week_start_idx ON public.business_received USING btree (referrer_id, week_start);


--
-- Name: business_received_referrer_type_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_received_referrer_type_created_at_idx ON public.business_received USING btree (referrer_type, created_at);


--
-- Name: email_delivery_logs_member_id_template_sent_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_delivery_logs_member_id_template_sent_at_idx ON public.email_delivery_logs USING btree (member_id, template, sent_at);


--
-- Name: event_registrations_user_id_event_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX event_registrations_user_id_event_id_key ON public.event_registrations USING btree (user_id, event_id);


--
-- Name: expenses_hub_id_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_hub_id_date_idx ON public.expenses USING btree (hub_id, date);


--
-- Name: hubs_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX hubs_name_key ON public.hubs USING btree (name);


--
-- Name: manual_payment_submissions_membership_id_status_submitted_at_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX manual_payment_submissions_membership_id_status_submitted_at_id ON public.manual_payment_submissions USING btree (membership_id, status, submitted_at);


--
-- Name: manual_payment_submissions_user_id_submitted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX manual_payment_submissions_user_id_submitted_at_idx ON public.manual_payment_submissions USING btree (user_id, submitted_at);


--
-- Name: meeting_attendance_user_id_week_start_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX meeting_attendance_user_id_week_start_key ON public.meeting_attendance USING btree (user_id, week_start);


--
-- Name: meeting_attendance_week_start_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meeting_attendance_week_start_status_idx ON public.meeting_attendance USING btree (week_start, status);


--
-- Name: meeting_fee_payments_month_payment_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meeting_fee_payments_month_payment_status_idx ON public.meeting_fee_payments USING btree (month, payment_status);


--
-- Name: meeting_fee_payments_user_id_month_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX meeting_fee_payments_user_id_month_key ON public.meeting_fee_payments USING btree (user_id, month);


--
-- Name: member_profiles_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX member_profiles_user_id_key ON public.member_profiles USING btree (user_id);


--
-- Name: membership_plans_plan_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX membership_plans_plan_code_key ON public.membership_plans USING btree (plan_code);


--
-- Name: memberships_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memberships_deleted_at_idx ON public.memberships USING btree (deleted_at);


--
-- Name: memberships_member_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX memberships_member_id_key ON public.memberships USING btree (member_id);


--
-- Name: memberships_membership_status_auto_delete_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memberships_membership_status_auto_delete_at_idx ON public.memberships USING btree (membership_status, auto_delete_at);


--
-- Name: memberships_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX memberships_user_id_key ON public.memberships USING btree (user_id);


--
-- Name: notification_logs_hub_id_type_sent_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_logs_hub_id_type_sent_at_idx ON public.notification_logs USING btree (hub_id, type, sent_at);


--
-- Name: notifications_user_id_is_read_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_id_is_read_created_at_idx ON public.notifications USING btree (user_id, is_read, created_at);


--
-- Name: payment_invoices_invoice_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX payment_invoices_invoice_number_key ON public.payment_invoices USING btree (invoice_number);


--
-- Name: payment_invoices_user_id_payment_type_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payment_invoices_user_id_payment_type_created_at_idx ON public.payment_invoices USING btree (user_id, payment_type, created_at);


--
-- Name: referrals_given_giver_id_week_start_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX referrals_given_giver_id_week_start_idx ON public.referrals_given USING btree (giver_id, week_start);


--
-- Name: referrals_given_receiver_id_week_start_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX referrals_given_receiver_id_week_start_idx ON public.referrals_given USING btree (receiver_id, week_start);


--
-- Name: referrals_given_receiver_type_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX referrals_given_receiver_type_created_at_idx ON public.referrals_given USING btree (receiver_type, created_at);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: whatsapp_delivery_logs_member_id_template_sent_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_delivery_logs_member_id_template_sent_at_idx ON public.whatsapp_delivery_logs USING btree (member_id, template, sent_at);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: idx_objects_current_version; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_objects_current_version ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE (archived_at IS NULL);


--
-- Name: idx_objects_null_version; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_objects_null_version ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE (NOT is_versioned);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_name_version_key; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_name_version_key ON storage.objects USING btree (bucket_id, name COLLATE "C", version) NULLS NOT DISTINCT;


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_mfa_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_mfa_factor_id_fkey FOREIGN KEY (mfa_factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_recovery_codes mfa_recovery_codes_mfa_recovery_code_set_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_recovery_codes
    ADD CONSTRAINT mfa_recovery_codes_mfa_recovery_code_set_id_fkey FOREIGN KEY (mfa_recovery_code_set_id) REFERENCES auth.mfa_recovery_code_sets(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: scim_tokens scim_tokens_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.scim_tokens
    ADD CONSTRAINT scim_tokens_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: scim_users scim_users_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.scim_users
    ADD CONSTRAINT scim_users_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: scim_users scim_users_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.scim_users
    ADD CONSTRAINT scim_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: business_certificates business_certificates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_certificates
    ADD CONSTRAINT business_certificates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_received business_received_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_received
    ADD CONSTRAINT business_received_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_received business_received_referrer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_received
    ADD CONSTRAINT business_received_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: email_delivery_logs email_delivery_logs_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_delivery_logs
    ADD CONSTRAINT email_delivery_logs_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_registrations event_registrations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_registrations event_registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: expenses expenses_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: expenses expenses_hub_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_hub_id_fkey FOREIGN KEY (hub_id) REFERENCES public.hubs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: manual_payment_submissions manual_payment_submissions_membership_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manual_payment_submissions
    ADD CONSTRAINT manual_payment_submissions_membership_id_fkey FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: manual_payment_submissions manual_payment_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manual_payment_submissions
    ADD CONSTRAINT manual_payment_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meeting_attendance meeting_attendance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attendance
    ADD CONSTRAINT meeting_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meeting_fee_payments meeting_fee_payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_fee_payments
    ADD CONSTRAINT meeting_fee_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_profiles member_profiles_hub_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_hub_id_fkey FOREIGN KEY (hub_id) REFERENCES public.hubs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: member_profiles member_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memberships memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_logs notification_logs_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_related_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_related_user_id_fkey FOREIGN KEY (related_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_invoices payment_invoices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_invoices
    ADD CONSTRAINT payment_invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: referrals_given referrals_given_giver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals_given
    ADD CONSTRAINT referrals_given_giver_id_fkey FOREIGN KEY (giver_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: referrals_given referrals_given_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals_given
    ADD CONSTRAINT referrals_given_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: whatsapp_delivery_logs whatsapp_delivery_logs_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_delivery_logs
    ADD CONSTRAINT whatsapp_delivery_logs_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: _prisma_migrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: business_certificates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_certificates ENABLE ROW LEVEL SECURITY;

--
-- Name: business_received; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_received ENABLE ROW LEVEL SECURITY;

--
-- Name: email_delivery_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_delivery_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: event_registrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: expenses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

--
-- Name: hubs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hubs ENABLE ROW LEVEL SECURITY;

--
-- Name: manual_payment_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.manual_payment_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: meeting_attendance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meeting_attendance ENABLE ROW LEVEL SECURITY;

--
-- Name: meeting_fee_payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meeting_fee_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: member_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: membership_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: memberships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: referrals_given; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.referrals_given ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_delivery_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_delivery_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: ensure_rls; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER ensure_rls ON ddl_command_end
         WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
   EXECUTE FUNCTION public.rls_auto_enable();


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict A8YzwbdyTKRSqzpwjKnDN0Lfr5xlWItQRtkedpgIgVfIKkSjnxZPKzmkoLFRK5D

