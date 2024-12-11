# Flat Earth Challenge

The app is currently in the final stages of deployment. 

A demo of the app can be found at [flatearthtest.com]. 

## Hosting

The frontend is hosted on S3 and served with CloudFront. 

The backend is hosted with ECS in Fargate mode, behind an Application Load Balancer. It is currently setup for a 2AZ deployment in us-east-2, with private subnets for the containers and public ones for the containers.

The database is an RDS Postgres cluster. 










