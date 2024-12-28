# Flat Earth Challenge

The app is located at [flatearthchallenge.com](https://flatearthchallenge.com). 

## Our Mission
Many people believe that the earth is flat, and there is good reason for this belief. Primarily, lived experience strongly suggests that this is the case. To any observer standing on the surface, the appearance of the Earth is clearly flat. But of course, appearances can be deceiving. 

As members of society, we inevitably must outsource facts about reality to others. Most of us are not astronauts or pilots, but these pilots and astronauts can provide us with information we do not have first hand access to. For this system to work smoothly, however, there is a presumption of trust. Unfortunately, trust in the integrity of institutions has collapsed, and it is not at historic lows. There are many reasons for this. Institutions are not immune to mission drift, ideological capture, and blatant self interest.

We cannot solve these problems here, but what we can do is introduce a trustless method where you can verify for yourself whether the earth is flat. You're smart, and it is through your own reasoning that you must convince yourself whether the earth is flat or not. Specifically, the only information we rely on is the distances between known major cities, which you could measure and confirm for yourself. Our claim is that nobody, not even you, will be able to fit the distances between the world’s cities in a planar configuration. We are putting up a million dollar reward to anyone that manages to do this.

Let’s see if you can do it!


## Architecture

- The frontend is hosted on S3 and served with CloudFront. 
- The backend is ran serverless through API Gateway and AWS Lambda, and it is written in Go. The source code can be found in [this](https://github.com/LucaIgnatescu/FlatEarthBackend) repository. 
- The database is an RDS Postgres cluster, and it is in a private subnet.
- To provide internet connectivity for external apis, we use a custom NAT Instance hosted in a public subnet. 
- DNS is managed through Route53. 










