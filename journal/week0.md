# Week 0 — Billing and Architecture

## Architecture Diagram

![Cloud Architecture (3)](https://user-images.githubusercontent.com/67248935/218667247-eccfc8be-d910-4eb8-82fd-588fa505dc47.jpeg)



source : https://lucid.app/lucidchart/3c298bb3-1036-4996-8ee2-f5ae08e54a1b/edit?viewport_loc=-2121%2C-97%2C3115%2C1616%2C0_0&invitationId=inv_1369f12b-7802-4162-a901-35cb4ae95af2


## Budget Limit 

![image](https://user-images.githubusercontent.com/67248935/218673193-2fa80591-9475-4717-adb2-13ca8317421e.png)

## Add user on IAM

![image](https://user-images.githubusercontent.com/67248935/218676966-fe2422cf-8858-4ee2-a639-728da1820ed6.png)


## Creating a Billing Alarm

### Create SNS Topic

- We need an SNS topic before we create an alarm.
- The SNS topic is what will delivery us an alert when we get overbilled
- [aws sns create-topic](https://docs.aws.amazon.com/cli/latest/reference/sns/create-topic.html)

We'll create a SNS Topic
```sh
aws sns create-topic --name billing-alarm
```
which will return a TopicARN

We'll create a subscription supply the TopicARN and our Email
```sh
aws sns subscribe \
    --topic-arn TopicARN \
    --protocol email \
    --notification-endpoint ghurafa2821@gmail.com
```

Check your email and confirm the subscription

#### Create Alarm

- [aws cloudwatch put-metric-alarm](https://docs.aws.amazon.com/cli/latest/reference/cloudwatch/put-metric-alarm.html)
- [Create an Alarm via AWS CLI](https://aws.amazon.com/premiumsupport/knowledge-center/cloudwatch-estimatedcharges-alarm/)
- We need to update the configuration json script with the TopicARN we generated earlier
- We are just a json file because --metrics is is required for expressions and so its easier to us a JSON file.

```sh
aws cloudwatch put-metric-alarm --cli-input-json file://aws/json/alarm_config.json
```

## Create an AWS Budget

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



