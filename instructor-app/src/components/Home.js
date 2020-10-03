import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

//context
import { AuthContext } from '../context';

//graphql
import { useQuery } from '@apollo/react-hooks';

//queries
import { GET_COURSES } from '../graphql/queries/courseQueries';

//redux
import { connect } from 'react-redux';

//MUI
import { Typography, Button, CircularProgress } from '@material-ui/core';

//MUI/styles
import { makeStyles } from '@material-ui/styles';

//components
import CourseList from './course_components/CourseList';
import ReAuthenticate from './authentication_components/ReAuthenticate';

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
    const { data, loading, error } = useQuery(GET_COURSES);

    const classes = useStyles();

    const handleCreateCourse = () => {
        window.location.pathname='/create/course';  
    }

    const course_view = !loading && !error ? data.getInstCourses.map( (course) => {
        return (
            <CourseList key={course.course_id} course={course} />
        );
    }) : (
        <Typography variant="body1">No courses to display...</Typography>
    );

    return (
        <div>
            { 
                authenticated  ? (
                    <div>
                        <div className={classes.header}>
                                <span>
                                    <Button color="primary" variant="contained" className={classes.button} onClick={handleCreateCourse}>
                                        Create New
                                    </Button>
                                </span>

                                <Typography variant="body1" color="primary" className={classes.title}>
                                    Your Courses
                                </Typography>
                            </div>
                        {course_view} 
                    </div>
                ) : (
                    <ReAuthenticate />
                )
            }
       </div>
    );
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps, null)(Home);