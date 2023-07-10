# Week 0 — Billing and Architecture

in this week-0,  
* We are going to create conceptual, logical and physical design. I created the designs by using free lucid chart version.
* Setting up AWS account including IAM user and Gropus (I have the account already few months before the bootcampt was started)
* Setting up Gitpod
* setting budget and alarm
* 
## Conceptual Design
![image](https://github.com/ariansyahyutama/aws-bootcamp-cruddur-2023/assets/67248935/3b4b94d7-266b-4eb7-b878-8082bab1d71b)

## Logical Design

I added CI/CD pipiline in the diagram, one of the function of the pipiline is to automate the deployment of ECS.
I put API gateway so the client in internet will communicate with the API gateway first, also I included the ACM for the certificate manager.

![Cloud Architecture (5)](https://user-images.githubusercontent.com/67248935/219820447-2dff8a51-0566-4289-abad-c3277708b207.jpeg)

source : 
https://lucid.app/lucidchart/3c298bb3-1036-4996-8ee2-f5ae08e54a1b/edit?viewport_loc=-3163%2C98%2C937%2C974%2C0_0&invitationId=inv_1369f12b-7802-4162-a901-35cb4ae95af2


## Budget Limit 
I put daily budget monitoring max 5 USD, one day I got charge up to 80 USD.

![image](https://user-images.githubusercontent.com/67248935/218673193-2fa80591-9475-4717-adb2-13ca8317421e.png)

### Create an AWS Budget using CLI

[aws budgets create-budget](https://docs.aws.amazon.com/cli/latest/reference/budgets/create-budget.html)

Get your AWS Account ID
```sh
aws sts get-caller-identity --query Account --output text
```

- Supply your AWS Account ID
- Update the json files
- This is another case with AWS CLI its just much easier to json files due to lots of nested json

```sh
aws budgets create-budget \
    --account-id AccountID \
    --budget file://aws/json/budget.json \
    --notifications-with-subscribers file://aws/json/budget-notifications-with-subscribers.json
```

## Add user on IAM

![image](https://user-images.githubusercontent.com/67248935/218676966-fe2422cf-8858-4ee2-a639-728da1820ed6.png)

## caller identity

![image](https://user-images.githubusercontent.com/67248935/218967528-7059d86f-2b10-49e2-8290-6aa0dc2f9826.png)

## Creating a Billing Alarm

### Create SNS Topic

- We need an SNS topic before we create an alarm.
- The SNS topic is what will delivery us an alert when we get overbilled
- [aws sns create-topic](https://docs.aws.amazon.com/cli/latest/reference/sns/create-topic.html)

We'll create a SNS Topic
```sh
aws sns create-topic --name billing-alarm
```
which will return a TopicARN for example "TopicArn": "arn:aws:sns:us-east-1:776552123053:billing-alarm"

We'll create a subscription supply the TopicARN and our Email
```sh
aws sns subscribe \
    --topic-arn "arn:aws:sns:us-east-1:776552123053:billing-alarm" \
    --protocol email \
    --notification-endpoint ghurafa2821@gmail.com
```

Check your email and confirm the subscription

#### SNS

<img width="882" alt="image" src="https://user-images.githubusercontent.com/67248935/218970382-17079fdc-0809-4f8b-95c7-86f57a70bf20.png">

<img width="884" alt="image" src="https://user-images.githubusercontent.com/67248935/218970561-b3e6f560-c851-4afa-9224-b7610fece7af.png">



#### Create Alarm

- [aws cloudwatch put-metric-alarm](https://docs.aws.amazon.com/cli/latest/reference/cloudwatch/put-metric-alarm.html)
- [Create an Alarm via AWS CLI](https://aws.amazon.com/premiumsupport/knowledge-center/cloudwatch-estimatedcharges-alarm/)
- We need to update the configuration json script with the TopicARN we generated earlier
- We are just a json file because --metrics is is required for expressions and so its easier to us a JSON file.

```sh
aws cloudwatch put-metric-alarm --cli-input-json file://aws/json/alarm_config.json
```

![image](https://user-images.githubusercontent.com/67248935/219821757-d72cc97e-246c-4115-9824-0473d2efb5a0.png)






