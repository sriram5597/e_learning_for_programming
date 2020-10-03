import React, { useState } from 'react';

//graphql
import { useQuery } from '@apollo/react-hooks';
import { ADD_FLOWCHART } from '../../../../graphql/queries/contentQueries';

//mui
import { Typography, CircularProgress } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        margin: '0 auto',
    }
}))

const AddFlowchart = (props) => {
    const classes = useStyles();

    const { data, loading } = useQuery(ADD_FLOWCHART, {
        variables: {
            content_id: props.content_id,
            index: props.index,
            title: props.title
        }
    });

    console.log(data);

    const fields = data ? JSON.parse(data.addFlowchart.fields) : {};

    return (
        <div className={classes.root}>
            <Typography variant="h4">
                Add Flowchart
            </Typography>
            {
                loading || !data ? (
                    <CircularProgress size={30} color='primary' />
                ) : (
                    <form action={data.addFlowchart.url}  method="post" enctype="multipart/form-data">
                        {
                            Object.keys(fields).map( (field) => {
                                return (
                                    <input type="type" name={field} value={fields[field]} />
                                )
                            })
                        }
                        <input type="file" name="file" /><br/>
                        <input type="submit" value="Upload" />
                    </form>
                )
            }           
        </div>
    )
}

export default AddFlowchart;