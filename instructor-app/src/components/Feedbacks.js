import React from 'react';

//dayjs
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

//graphql
import { useQuery } from '@apollo/react-hooks';
import { GET_FEEDBACKS } from '../graphql/queries/currentCourseQueries';

//mui
import { Paper, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Typography, CircularProgress, Button } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        overflowX: 'auto',
        padding: 10,
        margin: 10
    },

    buttons: {
        display: 'flex'
    },

    prevButton: {
        flexGrow: 9
    }
}));

const Feedbacks = (props) => {
    const classes = useStyles();

    const { data, loading, error } = useQuery(GET_FEEDBACKS);

    dayjs.extend(relativeTime);

    if(error){
        console.log(error);
    }

    return (
        <div>
            <Typography variant='h3' color='primary'>
                User Feedbacks
            </Typography>
            <TableContainer component={Paper} className={classes.root}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                SNo
                            </TableCell>
                            <TableCell>
                                Category
                            </TableCell>
                            <TableCell>
                                Posted on
                            </TableCell>
                            <TableCell>
                                Issue
                            </TableCell>
                            <TableCell>
                                Comment
                            </TableCell>
                            <TableCell>
                                User Email
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            !data ? (
                                <CircularProgress color='primary' size={30} />
                            ) : (
                                data.getFeedbacks.feedbacks.map( (feedback, index) => {
                                    return (
                                        <TableRow key={feedback.feedback_id}>
                                            <TableCell>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                {feedback.category}
                                            </TableCell>
                                            <TableCell>
                                                {dayjs(feedback.date).fromNow()}
                                            </TableCell>
                                            <TableCell>
                                                {feedback.title}
                                            </TableCell>
                                            <TableCell>
                                                {feedback.comment}
                                            </TableCell>
                                            <TableCell>
                                                {feedback.email}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}

export default Feedbacks;