# e-Learning Platform for Programming

## Project Description
    This platform is for end users who want to begin programming. They can watch videos, read text contents, 
    solve mcq and submit flowchart and code for problem statements provided in the platform. 
    
    There are two users in this platform.
        - Instructor -> upload video, create text content, create mcq, create problem statements with testcases
        - user -> Access all those things
    
## Features
    - Video Streaming
    - Content Management
    - MCQ
    - Online compiler
    - Flowchar Validator
    
## Technology Stack
    - Architecture -> Microservice
    - Frontend -> ReactJS, Redux, Material UI, Draft JS, Aplllo Graphql Client
    - Gateway -> Express JS, Apollo Graphql
    - Backend -> python flask
    - Database -> Dynamodb
    - User Management -> Aws Cognito
    
    This application is deployed in aws. 
      - The services are deployed as docker containers using ECS
      - The gateway is deployed using serverless
      - The Frontend is deployed using Amplify
      
