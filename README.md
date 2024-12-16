# Flat Earth Challenge

The app is currently in the final stages of development. 

A demo of the app can be found at [flatearthtest.com](https://flatearthtest.com). 

## Our Mission
Many people believe that the earth is flat, and there is good reason for this belief. Primarily, lived experience strongly suggests that this is the case. To any observer standing on the surface, the appearance of the Earth is clearly flat. But of course, appearances can be deceiving. 

As members of society, we inevitably must outsource facts about reality to others. Most of us are not astronauts or pilots, but these pilots and astronauts can provide us with information we do not have first hand access to. For this system to work smoothly, however, there is a presumption of trust. Unfortunately, trust in the integrity of institutions has collapsed, and it is not at historic lows. There are many reasons for this. Institutions are not immune to mission drift, ideological capture, and blatant self interest.

We cannot solve these problems here, but what we can do is introduce a trustless method where you can verify for yourself whether the earth is flat. You're smart, and it is through your own reasoning that you must convince yourself whether the earth is flat or not. Specifically, the only information we rely on is the distances between known major cities, which you could measure and confirm for yourself. Our claim is that nobody, not even you, will be able to fit the distances between the world’s cities in a planar configuration. We are putting up a million dollar reward to anyone that manages to do this.

Let’s see if you can do it!


## Hosting

The frontend is hosted on S3 and served with CloudFront. 

The backend is hosted with ECS in Fargate mode, behind an Application Load Balancer. It is currently setup for a 2AZ deployment in us-east-2, with private subnets for the containers and public ones for the load balancer. 

The database is an RDS Postgres cluster. 










