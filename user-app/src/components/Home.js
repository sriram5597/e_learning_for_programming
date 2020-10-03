import React from 'react';

//graphql
import { useQuery } from '@apollo/react-hooks';
import { GET_USER_COURSES } from '../graphql/queries/currentCourseQueries';

//redux
import { connect } from 'react-redux';

//components
import CourseList from './course_components/CourseList';
import Head from './Head';
import ReAuthenticate from './authentication_components//ReAuthenticate';
import NavBar from './NavBar';
import NoCourse from './NoCourse';

//MUI
import { Typography, CircularProgress } from '@material-ui/core';

//MUI/styles
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles( (theme) => ({
    button: {
        marginBottom: 10,
    },

    title: {
        fontSize: 30,
    },

    header: {
        margin: 20,
    },

}));

const Home = (props) => {
    const { authenticated } = props.auth;
    
    const classes = useStyles();

    const { data, loading } = useQuery(GET_USER_COURSES)

    return (
        <div>
            <Head title='home' />
            <NavBar />
            { 
                authenticated  ? (
                    data && data.getUserCourses.length > 0 ? (
                        <div>
                            <div className={classes.header}>
                                <Typography variant="body1" color="primary" className={classes.title}>
                                    Your Courses
                                </Typography>
                            </div>
                            {
                                data.getUserCourses.map( (course) => {
                                    return (
                                        <CourseList key={course.course_id} course={course} isView={false} />
                                    )
                                })
                            }
                        </div>
                    ) : (
                        <NoCourse />
                    )
                ) : (
                    <ReAuthenticate />
                )
            }
            {
                loading && (
                    <CircularProgress size={30} color='primary' />
                )
            }
       </div>
    );
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps, null)(Home);