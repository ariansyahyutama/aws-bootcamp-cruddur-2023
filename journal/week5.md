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

I seed the data to the prod instead local dynamo-db by running `./bin/ddb/seed-data prod` , so the following are the seeded data 
![image](https://github.com/ariansyahyutama/aws-bootcamp-cruddur-2023/assets/67248935/4c943710-abc1-4f52-b334-5520e03d98f7)

there are several accounts registered in my AWS Cognito with handles ariansyahy and lando
![image](https://github.com/ariansyahyutama/aws-bootcamp-cruddur-2023/assets/67248935/47522d72-8c2e-4cd1-ab9c-d921a30e9170)


## Implementing DynamoDB Streams
- run ```./schema-load prod``` 
- we can check in the dynamodb table now. We created 'cruddur-messages' as a table name
  ![image](https://github.com/ariansyahyutama/aws-bootcamp-cruddur-2023/assets/67248935/ae296890-1ff7-4eeb-a0ed-de25aad13bf0)

- click the table and go to 'Exports and Streams' and 'Turn On' button
- choose 'New Image' 'Turn on stream' and we have created DynamoDB stream
- we created VPC Endpoint to DynamoDB, so the traffic will not go publicly
  ![image](https://github.com/ariansyahyutama/aws-bootcamp-cruddur-2023/assets/67248935/f32a6c25-2c19-443c-9a32-a203e8b2aaf1)

- we created a Lambda function that will insert a message into the conversation via the DynamoDB stream
- click the table and go to 'Exports and Streams' and 'create trigger' button; following are the lambda function codes

  ```
  import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource(
 'dynamodb',
 region_name='us-east-1',
 endpoint_url="http://dynamodb.us-east-1.amazonaws.com"
)

def lambda_handler(event, context):
  print('event-data',event)

  eventName = event['Records'][0]['eventName']
  if (eventName == 'REMOVE'):
    print("skip REMOVE event")
    return
  pk = event['Records'][0]['dynamodb']['Keys']['pk']['S']
  sk = event['Records'][0]['dynamodb']['Keys']['sk']['S']
  if pk.startswith('MSG#'):
    group_uuid = pk.replace("MSG#","")
    message = event['Records'][0]['dynamodb']['NewImage']['message']['S']
    print("GRUP ===>",group_uuid,message)

    table_name = 'cruddur-messages'
    index_name = 'message-group-sk-index'
    table = dynamodb.Table(table_name)
    data = table.query(
      IndexName=index_name,
      KeyConditionExpression=Key('message_group_uuid').eq(group_uuid)
    )
    print("RESP ===>",data['Items'])

    # recreate the message group rows with new SK value
    for i in data['Items']:
      delete_item = table.delete_item(Key={'pk': i['pk'], 'sk': i['sk']})
      print("DELETE ===>",delete_item)

      response = table.put_item(
        Item={
          'pk': i['pk'],
          'sk': sk,
          'message_group_uuid':i['message_group_uuid'],
          'message':message,
          'user_display_name': i['user_display_name'],
          'user_handle': i['user_handle'],
          'user_uuid': i['user_uuid']
        }
      )
      print("CREATE ===>",response)
  ```

- in the end, we should use dynamodb table to connect our backend






