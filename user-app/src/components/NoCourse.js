import React from 'react';
import { Link } from 'react-router-dom';

//mui
import { Typography } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        margin: 10
    },
    link: {
        textDecoration: 'none',
        color: theme.palette.secondary.main
    }
}))

const NoCourse = (props) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Typography variant='h4' color='primary'>
                No Courses Enrolled
            </Typography>
            <Typography variant='subtitle1'>
                Click <Link to='/courses' className={classes.link}>here</Link> to explore courses.
            </Typography>
        </div>
    )
}

export default NoCourse;