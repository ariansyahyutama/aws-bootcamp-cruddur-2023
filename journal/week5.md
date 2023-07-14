# Week 5 — DynamoDB and Serverless Caching



- we are adding Boto3 to the requirement file

- we are using local dynamodb first
- Andrew created a new folder 'db' but I keep using 'db-<script_name>', this challenges me so I will not follow 1-1 what Andrew does, which means I can not do copy paste only, my brain will do a little bit analysis
- we created db-setup to cover all the following scripts db-connect,db-create,db-drop,db-schema-load, and db-seed

- I created a folder 'ddb' 
- create scripts inside 'ddb', crated following scripts : schema-load, delete-table, seed, list-tables

- create DynamoDB local
- following is the content of schema-load file:
  
```bash
#!/usr/bin/env python


import boto3
import sys

attrs = {
    'endpoint_url' : 'http://localhost:8000'
}

if len (sys.argv) == 2:
    if "prod" in sys.argv[1]:
        attrs = {}

dynamodb = boto3.client('dynamodb',**attrs)

table_name = 'cruddur-messages'

response = dynamodb.create_table(
    TableName=table_name,
    AttributeDefinitions=[
        {
            'AttributeName': 'message_group_uuid',
            'AttributeType': 'S'
        },        
        {
            'AttributeName': 'pk',
            'AttributeType': 'S'
        },
                {
            'AttributeName': 'sk',
            'AttributeType': 'S'
        },
    ],

    KeySchema=[
        {
            'AttributeName': 'pk',
            'KeyType': 'HASH'
        },
        {
            'AttributeName': 'sk',
            'KeyType': 'RANGE'
        },
    ],
    
    GlobalSecondaryIndexes= [{
        'IndexName':'message-group-sk-index',
        'KeySchema':[{
        'AttributeName': 'message_group_uuid',
        'KeyType': 'HASH'
        },{
        'AttributeName': 'sk',
        'KeyType': 'RANGE'
        }],
        'Projection': {
        'ProjectionType': 'ALL'
        },
        'ProvisionedThroughput': {
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
        },
    }],
    BillingMode='PROVISIONED',
    ProvisionedThroughput ={
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }

)
```
 

- run in terminal 
```
./bin/ddb/schema-load
```

- create `list-tables`

  ![image](https://github.com/ariansyahyutama/aws-bootcamp-cruddur-2023/assets/67248935/9827708d-88f5-4cb7-abed-c1b08cefae74)

- create `drop` script 


- we are going to use cognito user pool , I registered 2 username to log in to Cruddur app later
![image](https://github.com/ariansyahyutama/aws-bootcamp-cruddur-2023/assets/67248935/6b29f830-6a64-48d6-9bff-7b560db82a2f)

    
- I created script for seeding data into the DynamoDB table, I named it seed-data, important to run db-setup first.
![image](https://github.com/ariansyahyutama/aws-bootcamp-cruddur-2023/assets/67248935/fe3502b7-17ba-44ad-809d-81410dfe5c8f)


- if we want to use prod RDS we can change `db.py` change CONNECTION_URL to PROD_CONNECTION_URL, following are the different
```
PROD_CONNECTION_URL=postgresql://root:cruddurfdfdf@db-cruddur.c9vosxfdfdq6wz.us-east-3.rds.amazonaws.com:5432/dbcruddur
CONNECTION_URL=postgresql://postgres:pasdfd@localhost:5432/cruddur
```

- I created 'scan' in the ddb folder then run it, we will see the conversation as follow
![image](https://github.com/ariansyahyutama/aws-bootcamp-cruddur-2023/assets/67248935/42a9ce82-187a-4589-bcd6-3fd7854f5d45)

- also we created `get-conversation` and `list-conversations`.


 on a DynamoDB table](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/iam-policy-example-data-crud.html)

```sh
./bin/ddb/schem-load
```

- I created update_cognito_user_ids but recently while I am working on week-8 the code suddenly didn't work, I joined an office hour for asking some help and Andrew suggested to do it manually since it will consume much time to debug it
      

## Create New Message
- sign up user called Ariansyah with handle @ariansyahy
  ![image](https://github.com/ariansyahyutama/aws-bootcamp-cruddur-2023/assets/67248935/d94ec5bd-d761-41e5-b9ce-5d19e339b796)

- following are content of seeded data, quite random but it works based on my case
```
INSERT INTO public.users (display_name, handle, email, cognito_user_id)
VALUES
  ('Andrew Brown', 'andrewbrown' , 'test@email.com', 'MOCK'),
  ('ariansyah', 'ariansyahy' , 'ariansyahy@yahoo.com', 'MOCK'),
  ('Andrew Bayko', 'bayko' , 'ghurafa2821@gmail.com' , 'MOCK'),
  ('lando', 'lando' , 'lando@gmail.com' , 'MOCK');

INSERT INTO public.activities (user_uuid, message, expires_at)
VALUES
  (
    (SELECT uuid from public.users WHERE users.handle = 'ariansyahy' LIMIT 1),
    'This was imported as seed data! handle ariansyah',
    current_timestamp + interval '10 day'
  ),
    (
    (SELECT uuid from public.users WHERE users.handle = 'andrewbrown' LIMIT 1),
    'This was imported as seed data! handle andrew brown',
    current_timestamp + interval '10 day'
  )
```
   
