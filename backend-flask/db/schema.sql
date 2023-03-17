CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

export CONNECTION_URL="postgresql://postgres:password@127.0.0.1:5432/croddur"
gp env CONNECTION_URL="postgresql://postgres:password@127.0.0.1:5432/croddur"

export PROD_CONN_URL="postgresql://postgres:password@127.0.0.1:5433/croddur" // TIME 1.06