import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

//components
import UpdateCourse from '../instructor_components/course_manage/UpdateCourse';
import UpdateModule from '../instructor_components/course_manage/module/UpdateModule';
import Flow from '../instructor_components/course_manage/course_flow/Flow';
import ReAuthenticate from '../authentication_components/ReAuthenticate';

//redux
import { connect } from 'react-redux';

//mui
import { Paper, Tabs, Tab, Button }  from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    paper: {
        padding: 20
    },

    tab: {
        position: 'relative',
        width: '60%',
        top: '10%',
        left: '15%'
    },
    publish: {
        margin: 20,
        float: 'right'
    }
}));

const CourseManage = (props) => {
    const classes = useStyles();

    const location = useLocation();

    const { authenticated } = props.auth;

    const [selectedTab, setSelectedTab] = useState(0);

    const getComponent = (index) => {
        switch(index){
            case 0:
                return (
                    <UpdateCourse course_id={props.match.params.courseId} />
                )
            
            case 1:
                return (
                    <UpdateModule course_id={props.match.params.courseId} />
                )
            
            case 2:
                return (
                    <Flow course_id={props.match.params.courseId} />
                )
            
            default:
                return null;
        }
    }

    const handleChange = (e, newValue) => {
        setSelectedTab(newValue);
    }

    return (
        <div>
            <Paper className={classes.tab}>
                <Tabs value={selectedTab} onChange={handleChange} centered>
                    <Tab label="Edit Course" />
                    <Tab label="Levels and Modules" />
                    <Tab label="Flow" />
                </Tabs>
            </Paper>
            
            {getComponent(selectedTab)}

            {
                !authenticated && (
                    <ReAuthenticate open={authenticated} />
                )
            }
        </div>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth
});

export default connect(mapStateToProps, null)(CourseManage);