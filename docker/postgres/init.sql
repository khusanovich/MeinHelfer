-- Enable pgcrypto so gen_random_uuid() is available for UUID default values
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable pg_stat_statements for query performance monitoring (optional)
-- CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
