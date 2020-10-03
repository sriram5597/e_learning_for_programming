import React from 'react';

//graphql
import { useQuery } from '@apollo/react-hooks';
import { GET_ALL_COURSES } from '../graphql/queries/courseQueries';

//components
import CourseList from './course_components/CourseList';
import Head from './Head';
import NavBar from './NavBar';

//MUI
import { Typography } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        position: "relative",
        overflowY: "auto"
    }
}))

const ExploreCourse = (props) => {
    const classes = useStyles();

    const { data, loading } = useQuery(GET_ALL_COURSES);

    const course_view = data && data.getAllCourses.map( (course) => {
        return (
            <div>
                <CourseList key={course.course_title} course={course} isView={true} />
            </div>
        );
    });
    
    if(data && data.getAllCourses.length === 0)
        return <Typography variant="body1">No courses to display...</Typography>

    return (
        <div>
            <Head title="All Courses" />
            <NavBar />
            {course_view}
        </div>
    )
}

export default ExploreCourse;