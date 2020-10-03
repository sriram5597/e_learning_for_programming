const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { merge } = require('lodash');

const query = require('./graphql/queries');
const mutations = require('./graphql/mutations');

const typeDefs = require('./graphql/typeDef');
const resolvers = require('./graphql/resolver');

const courseTypeDef = require('./graphql/course/courseTypeDef');
const courseResolver = require('./graphql/course/courseResolvers');

const moduleTypeDef = require('./graphql/module/moduleTypeDef');
const moduleResolver = require('./graphql/module/moduleResolvers');

const courseFlowTypeDef = require('./graphql/course_flow/courseFlowTypeDef');
const courseFlowResolver = require('./graphql/course_flow/courseFlowResolvers');

const problemTypeDef = require('./graphql/problem/problemTypeDef');
const problemResolver = require('./graphql/problem/problemResolver');

const mcqTypeDef = require('./graphql/mcq/mcqTypeDef');
const mcqResolver = require('./graphql/mcq/mcqResolvers');

const contentTypeDef = require('./graphql/content/contentTypeDef');
const contentResolver = require('./graphql/content/contentResolver');

const videoStreamTypeDef = require('./graphql/video_stream/videStreamTypeDef');
const videoStreamResolver = require('./graphql/video_stream/videoStreamResolver');

const currentCourseTypeDef = require('./graphql/current_course/currentCourseTypeDef');
const currenCourseResolver = require('./graphql/current_course/currentCourseResolver');

const app = express();
const server = new ApolloServer({ 
    typeDefs: [ typeDefs, courseTypeDef, moduleTypeDef, courseFlowTypeDef, problemTypeDef, mcqTypeDef, contentTypeDef, videoStreamTypeDef, 
                    currentCourseTypeDef, query, mutations 
                ], 
    resolvers: merge(resolvers, courseResolver, moduleResolver, courseFlowResolver, problemResolver, mcqResolver, contentResolver, videoStreamResolver, 
                    currenCourseResolver
                ),  
    context: ({req}) => {
        const token = req.headers.authorization ? req.headers.authorization : "";

        return {
            token
        };
    }
});

server.applyMiddleware({app, path: '/query'});

app.listen(4000, () => {
    console.log('graphql gateway listening to port 4000');
});