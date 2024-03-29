# Week 4 — Postgres and RDS


To connect to psql via the psql client cli tool remember to use the host flag to specific localhost.

```
psql -Upostgres --host localhost
```

Common PSQL commands:

```sql
\x on -- expanded display when looking at data
\q -- Quit PSQL
\l -- List all databases
\c database_name -- Connect to a specific database
\dt -- List all tables in the current database
\d table_name -- Describe a specific table
\du -- List all users and their roles
\dn -- List all schemas in the current database
CREATE DATABASE database_name; -- Create a new database
DROP DATABASE database_name; -- Delete a database
CREATE TABLE table_name (column1 datatype1, column2 datatype2, ...); -- Create a new table
DROP TABLE table_name; -- Delete a table
SELECT column1, column2, ... FROM table_name WHERE condition; -- Select data from a table
INSERT INTO table_name (column1, column2, ...) VALUES (value1, value2, ...); -- Insert data into a table
UPDATE table_name SET column1 = value1, column2 = value2, ... WHERE condition; -- Update data in a table
DELETE FROM table_name WHERE condition; -- Delete data from a table
```

## Create (and dropping) our database

We can use the createdb command to create our database:

https://www.postgresql.org/docs/current/app-createdb.html

```
createdb cruddur -h localhost -U postgres
```

```sh
psql -U postgres -h localhost
```

```sql
\l
DROP database cruddur;
```




We can create the database within the PSQL client

```sql
CREATE database cruddur;
```

<img width="827" alt="image" src="https://user-images.githubusercontent.com/67248935/225837492-a3f6edb5-7d51-4909-a009-01d3f726615a.png">

## Import Script

We'll create a new SQL file called `schema.sql` , and create a new folder in a backend folder called db
and we'll place it in `backend-flask/db`

The command to import:
```
psql cruddur < db/schema.sql -h localhost -U postgres
```


## Add UUID Extension

We are going to have Postgres generate out UUIDs.
We'll need to use an extension called:

```sql
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```
prove:
<img width="583" alt="image" src="https://user-images.githubusercontent.com/67248935/225839583-198c49c6-8983-4c12-aa5b-94e9d9815400.png">

## Create our tables

https://www.postgresql.org/docs/current/sql-createtable.html

```sql
CREATE TABLE public.users (
  uuid UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  display_name text,
  handle text
  cognito_user_id text,
  created_at TIMESTAMP default current_timestamp NOT NULL
);
```

```sql
CREATE TABLE public.activities (
  uuid UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message text NOT NULL,
  replies_count integer DEFAULT 0,
  reposts_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  reply_to_activity_uuid integer,
  expires_at TIMESTAMP,
  created_at TIMESTAMP default current_timestamp NOT NULL
);
```

```sql
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.activities;
```

# https://aviyadav231.medium.com/automatically-updating-a-timestamp-column-in-postgresql-using-triggers-98766e3b47a0

```sql
DROP FUNCTION IF EXISTS func_updated_at();
CREATE FUNCTION func_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

```sql
CREATE TRIGGER trig_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE PROCEDURE func_updated_at();
CREATE TRIGGER trig_activities_updated_at 
BEFORE UPDATE ON activities 
FOR EACH ROW EXECUTE PROCEDURE func_updated_at();
```

```sql
DROP TRIGGER IF EXISTS trig_users_updated_at ON users;
DROP TRIGGER IF EXISTS trig_activities_updated_at ON activities;
```

## Shell Script to Connect to DB

For things we commonly need to do we can create a new directory called `bin`

We'll create an new folder called `bin` to hold all our bash scripts.

```sh
mkdir /workspace/aws-bootcamp-cruddur-2023/backend-flask/bin
```

```sh
export CONNECTION_URL="postgresql://postgres:pssword@127.0.0.1:5433/cruddur"
gp env CONNECTION_URL="postgresql://postgres:pssword@127.0.0.1:5433/cruddur"
```

We'll create a new bash script `bin/db-connect`

```sh
#! /usr/bin/bash

psql $CONNECTION_URL
```

We'll make it executable:

```sh
chmod u+x bin/db-connect
```

To execute the script:
```sh
./bin/db-connect
```

## Shell script to drop the database

`bin/db-drop`

```sh
#! /usr/bin/bash

NO_DB_CONNECTION_URL=$(sed 's/\/cruddur//g' <<<"$CONNECTION_URL") 
psql $NO_DB_CONNECTION_URL -c "DROP database cruddur;"
```
<img width="609" alt="image" src="https://user-images.githubusercontent.com/67248935/225860219-fabb3ff9-23cf-44b1-a97b-f0ef3739f1c2.png">


https://askubuntu.com/questions/595269/use-sed-on-a-string-variable-rather-than-a-file

## See what connections we are using

```sh
NO_DB_CONNECTION_URL=$(sed 's/\/cruddur//g' <<<"$CONNECTION_URL")
psql $NO_DB_CONNECTION_URL -c "select pid as process_id, \
       usename as user,  \
       datname as db, \
       client_addr, \
       application_name as app,\
       state \
from pg_stat_activity;"
```

> We could have idle connections left open by our Database Explorer extension, try disconnecting and checking again the sessions 

## Shell script to create the database

`bin/db-create`

```sh
#!/usr/bin/bash


echo "create database"
NO_DB_CONNECTION_URL=$(sed 's/\/croddur//g' <<<"$CONNECTION_URL") 
psql $NO_DB_CONNECTION_URL -c "create database croddur;"
```

## Shell script to load the schema

`bin/db-schema-load`

```sh
#! /usr/bin/bash

schema_path="$(realpath .)/db/schema.sql"

echo $schema_path

NO_DB_CONNECTION_URL=$(sed 's/\/cruddur//g' <<<"$CONNECTION_URL")
psql $NO_DB_CONNECTION_URL cruddur < $schema_path
```

## Shell script to load the seed data

```
#! /usr/bin/bash

#echo "== db-schema-load"


schema_path="$(realpath .)/db/schema.sql"

echo $schema_path

psql $CONNECTION_URL cruddur < $schema_path
```

## Easily setup (reset) everything for our database


```sh
#! /usr/bin/bash
-e # stop if it fails at any point

#echo "==== db-setup"

bin_path="$(realpath .)/bin"

source "$bin_path/db-drop"
source "$bin_path/db-create"
source "$bin_path/db-schema-load"
source "$bin_path/db-seed"
```

## Make prints nicer

We we can make prints for our shell scripts coloured so we can see what we're doing:

https://stackoverflow.com/questions/5947742/how-to-change-the-output-color-of-echo-in-linux


```sh
CYAN='\033[1;36m'
NO_COLOR='\033[0m'
LABEL="db-schema-load"
printf "${CYAN}== ${LABEL}${NO_COLOR}\n"
```

## Install Postgres Client

We need to set the env var for our backend-flask application:

```yml
  backend-flask:
    environment:
      CONNECTION_URL: "${CONNECTION_URL}"
```

https://www.psycopg.org/psycopg3/

We'll add the following to our `requirments.txt`

```
psycopg[binary]
psycopg[pool]
```

```
pip install -r requirements.txt
```



## Provision RDS Instance

```sh
aws rds create-db-instance \
  --db-instance-identifier cruddur-db-instance \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version  14.6 \
  --master-username root \
  --master-user-password huEE33z2Qvl383 \
  --allocated-storage 20 \
  --availability-zone ca-central-1a \
  --backup-retention-period 0 \
  --port 5432 \
  --no-multi-az \
  --db-name cruddur \
  --storage-type gp2 \
  --publicly-accessible \
  --storage-encrypted \
  --enable-performance-insights \
  --performance-insights-retention-period 7 \
  --no-deletion-protection
```

> This will take about 10-15 mins

We can temporarily stop an RDS instance for 4 days when we aren't using it.

## Connect to RDS via Gitpod

In order to connect to the RDS instance we need to provide our Gitpod IP and whitelist for inbound traffic on port 5432.

```sh
GITPOD_IP=$(curl ifconfig.me)
```

We'll create an inbound rule for Postgres (5432) and provide the GITPOD ID.

We'll get the security group rule id so we can easily modify it in the future from the terminal here in Gitpod.

```sh
export DB_SG_ID="sg-0b725ebab7e25635e"
gp env DB_SG_ID="sg-0b725ebab7e25635e"
export DB_SG_RULE_ID="sgr-070061bba156cfa88"
gp env DB_SG_RULE_ID="sgr-070061bba156cfa88"
```

Whenever we need to update our security groups we can do this for access.
```sh
aws ec2 modify-security-group-rules \
    --group-id $DB_SG_ID \
    --security-group-rules "SecurityGroupRuleId=$DB_SG_RULE_ID,SecurityGroupRule={IpProtocol=tcp,FromPort=5432,ToPort=5432,CidrIpv4=$GITPOD_IP/32}"
```

https://docs.aws.amazon.com/cli/latest/reference/ec2/modify-security-group-rules.html#examples

## Test remote access

We'll create a connection url:

```
postgresql://root:huEE33z2Qvl383@cruddur-db-instance.czz1cuvepklc.ca-central-1.rds.amazonaws.com:5433/cruddur
```

We'll test that it works in Gitpod:

```sh
psql postgresql://root:huEE33z2Qvl383@cruddur-db-instance.czz1cuvepklc.ca-central-1.rds.amazonaws.com:5432/cruddur
```

We'll update your URL for production use case

```sh
export PROD_CONNECTION_URL="postgresql://root:huEE33z2Qvl383@cruddur-db-instance.czz1cuvepklc.ca-central-1.rds.amazonaws.com:5432/cruddur"
gp env PROD_CONNECTION_URL="postgresql://root:huEE33z2Qvl383@cruddur-db-instance.czz1cuvepklc.ca-central-1.rds.amazonaws.com:5432/cruddur"
```

## Update Bash scripts for production

```sh
if [ "$1" = "prod" ]; then
  echo "Running in production mode"
else
  echo "Running in development mode"
fi
```

We'll update:
- db-connect
- db-schema-load

## Update Gitpod IP on new env var

We'll add a command step for postgres:

```sh
    command: |
      export GITPOD_IP=$(curl ifconfig.me)
      source "$THEIA_WORKSPACE_ROOT/backend-flask/db-update-sg-rule"
```





## create db-seed.sql

-- this file was manually created
INSERT INTO public.users (display_name, handle, cognito_user_id)
VALUES
  ('Andrew Brown', 'andrewbrown' ,'MOCK'),
  ('Andrew Bayko', 'bayko' ,'MOCK');

INSERT INTO public.activities (user_uuid, message, expires_at)
VALUES
  (
    (SELECT uuid from public.users WHERE users.handle = 'andrewbrown' LIMIT 1),
    'This was imported as seed data!',
    current_timestamp + interval '10 day'
  )



  ### add psycopg for psql driver for python
 1. as per requirement file,please refer to requirement file

  `qe`
  
  content of requirement fille
  ```
  psycopg[binary]
psycopg[pool]
```
 this is to create connection pooling, connection pooling is like a proxy for db so they dont communicate by using existing connection

2. create db.py
https://www.psycopg.org/psycopg3/docs/advanced/pool.html

`lib/db.py`

```py
from psycopg_pool import ConnectionPool
import os

def query_wrap_object(template):
  sql = '''
  (SELECT COALESCE(row_to_json(object_row),'{}'::json) FROM (
  {template}
  ) object_row);
  '''

def query_wrap_array(template):
  sql = '''
  (SELECT COALESCE(array_to_json(array_agg(row_to_json(array_row))),'[]'::json) FROM (
  {template}
  ) array_row);
  '''

connection_url = os.getenv("CONNECTION_URL")
pool = ConnectionPool(connection_url)
```

3. create connection url in the docker compose

CONNECTION_URL: "${PROD_CONNECTION_URL}"

4. import at home activity

`from lib.db import pool`

disable xray related


In our home activities we'll replace our mock endpoint with real api call:

```py
from lib.db import pool, query_wrap_array

      sql = query_wrap_array("""
      SELECT
        activities.uuid,
        users.display_name,
        users.handle,
        activities.message,
        activities.replies_count,
        activities.reposts_count,
        activities.likes_count,
        activities.reply_to_activity_uuid,
        activities.expires_at,
        activities.created_at
      FROM public.activities
      LEFT JOIN public.users ON users.uuid = activities.user_uuid
      ORDER BY activities.created_at DESC
      """)
      print(sql)
      with pool.connection() as conn:
        with conn.cursor() as cur:
          cur.execute(sql)
          # this will return a tuple
          # the first field being the data
          json = cur.fetchone()
      return json[0]
```

<img width="1081" alt="image" src="https://user-images.githubusercontent.com/67248935/227786666-20ba8623-d42f-434e-863c-9f41b8801ca5.png">

<img width="1033" alt="image" src="https://user-images.githubusercontent.com/67248935/227889799-637d27a0-8ab0-40a3-b2bc-7089a2a8761f.png">

with joim query
<img width="1007" alt="image" src="https://user-images.githubusercontent.com/67248935/227919495-b887c3dd-2ee4-4e95-8098-b254086bf7df.png">

<img width="1033" alt="image" src="https://user-images.githubusercontent.com/67248935/227889799-637d27a0-8ab0-40a3-b2bc-7089a2a8761f.png">



## Setup Cognito post confirmation lambda

### Create the handler function

1. create lambda
- author from scratch
- python 3.8
- use default

- Create lambda in same vpc as rds instance Python 3.8
- Add a layer for psycopg2 with one of the below methods for development or production 

ENV variables needed for the lambda environment.
```
PG_HOSTNAME='cruddur-db-instance.czz1cuvepklc.ca-central-1.rds.amazonaws.com'
PG_DATABASE='cruddur'
PG_USERNAME='root'
PG_PASSWORD='huEE33z2Qvl383'
```
but  we're using the os module to access the getenv() function. We pass in the name of the environment variable we want to retrieve as a string. If the environment variable is set, getenv() will return its value as a string. If the environment variable is not set, getenv() will return None.

You can use os.getenv() to retrieve sensitive information such as API keys, database passwords, and other configuration values that you don't want to hardcode in your code. By setting these values as environment variables, you can easily change them without modifying your code.

The function

it is like this
    '''
    conn = psycopg2.connect(
    host="mydb.example.com",
    port="5432",
    database="mydatabase",
    user="myuser",
    password="mypassword"
    )
    '''

```
import json
import psycopg2
import os

def lambda_handler(event, context):
    user = event['request']['userAttributes']
    print('userAttributes')
    print(user)

    user_display_name  = user['name']
    user_email         = user['email']
    user_handle        = user['preferred_username']
    user_cognito_id    = user['sub']
    try:
      print('entered-try')
      sql = f"""
         INSERT INTO public.users (
          display_name, 
          email,
          handle, 
          cognito_user_id
          ) 
        VALUES(%s,%s,%s,%s)
      """
      print('SQL Statement ----')
      print(sql)
      conn = psycopg2.connect(os.getenv('CONNECTION_URL'))
      cur = conn.cursor()
      params = [
        user_display_name,
        user_email,
        user_handle,
        user_cognito_id
      ]
      cur.execute(sql,*params)
      conn.commit() 

    except (Exception, psycopg2.DatabaseError) as error:
      print(error)
    finally:
      if conn is not None:
          cur.close()
          conn.close()
          print('Database connection closed.')
    return event
```

In Amazon Cognito, user attributes are custom data that you can store for each user in a user pool. User attributes can be used to store any information you want to associate with a user, such as their email address, phone number, or custom metadata.

Cognito provides some standard user attributes that you can use out-of-the-box, such as email, phone_number, given_name, and family_name. You can also create custom attributes for your specific use case.

When a user signs up or signs in, their user attributes are included in the authentication event sent to your Lambda function or other custom code. You can use this information to customize your application's behavior based on the user's attributes.

above code is an example of how to retrieve a user's attributes in a Lambda function

we're using the userAttributes attribute of the request object to retrieve the user's attributes. We're then accessing the email attribute of the user's attributes to retrieve their email address.

Note that the structure of the event object and the user attributes depends on the specific Cognito event that triggered the Lambda function, and the specific user pool configuration. You can customize the user attributes that are stored and retrieved by configuring your user pool's schema in the Cognito console or using the AWS CLI or SDK.

In Python, a cursor object is used to interact with a database after a connection has been established. A cursor is created from a database connection object, and it can be used to execute SQL queries, fetch results, and perform other database operations.

In this example, we're using the psycopg2 library to connect to a PostgreSQL database. After the connection is established, we create a new cursor object using the cursor() method on the connection object.

We then execute a SQL query using the execute() method on the cursor object, passing in a string containing the SQL query. After the query is executed, we fetch the results using the fetchall() method on the cursor object, which returns a list of rows.

Finally, we close the cursor object using the close() method, and close the database connection using the close() method on the connection object. It's important to always close the cursor and connection objects when you're done using them, to ensure that any resources used by them are properly released.

### Development
https://github.com/AbhimanyuHK/aws-psycopg2

`
This is a custom compiled psycopg2 C library for Python. Due to AWS Lambda missing the required PostgreSQL libraries in the AMI image, we needed to compile psycopg2 with the PostgreSQL libpq.so library statically linked libpq library instead of the default dynamic link.
`

`EASIEST METHOD`

Some precompiled versions of this layer are available publicly on AWS freely to add to your function by ARN reference.

https://github.com/jetbridge/psycopg2-lambda-layer

- Just go to Layers + in the function console and add a reference for your region

`arn:aws:lambda:ca-central-1:898466741470:layer:psycopg2-py38:1` replace accordingly by reffering this url https://github.com/jetbridge/psycopg2-lambda-layer

next go to lambda triger in cognito under userpool properties
<img width="918" alt="image" src="https://user-images.githubusercontent.com/67248935/228426292-ea3c473a-18d4-4813-b247-554be327212c.png">

- edit the vpc part in lambda to allow communicate with DB postgresql
- vpc part sg is important as well
- <img width="1179" alt="image" src="https://user-images.githubusercontent.com/67248935/228473644-f92e5382-c4ef-4098-9fd9-1b4c5253ba33.png">

runm db scheme and db-seed-load in the prod environement


Alternatively you can create your own development layer by downloading the psycopg2-binary source files from https://pypi.org/project/psycopg2-binary/#files

- Download the package for the lambda runtime environment: [psycopg2_binary-2.9.5-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl](https://files.pythonhosted.org/packages/36/af/a9f06e2469e943364b2383b45b3209b40350c105281948df62153394b4a9/psycopg2_binary-2.9.5-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl)

- Extract to a folder, then zip up that folder and upload as a new lambda layer to your AWS account

### Production

Follow the instructions on https://github.com/AbhimanyuHK/aws-psycopg2 to compile your own layer from postgres source libraries for the desired version.


## Add the function to Cognito 

Under the user pool properties add the function as a `Post Confirmation` lambda trigger.
