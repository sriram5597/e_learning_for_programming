import React, { useEffect, useState } from 'react';

//graphql
import { useLazyQuery } from '@apollo/react-hooks';
import { GET_FLOW } from '../../../../graphql/queries/courseFlowQueries';

//components
import FlowView from './FlowView';
import Source from './source/Source';
import AddSource from './source/AddSource';

//mui
import { Grid, CircularProgress, Typography } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/Alrt
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles( (theme) => ({
    root: {
        margin: 30,
        minHeight: 400,
        padding: 20,
    },

    progress: {
        position: 'relative',
        left: '40%'
    },

    sources: {
        display: 'flex',
        flexWrap: 'wrap',
        
    },
}));

const Flow = (props) => {
    const classes = useStyles();

    const [getFlow, { data, loading, error }] = useLazyQuery(GET_FLOW);

    const [title, setTitle] = useState();


    useEffect( () => {
        if(title){
            getFlow({
                variables: {
                    course_id: props.course_id,
                    title,
                    role: "instructor"
                }
            });
        }
    }, [title]);

    const handleFlow = (title) => {
        setTitle(title);
    }

    if(error){
        console.log(error.message);
    }

    return (
        <div className={classes.root}>
            {
                error && (
                    <Alert severity="error" open={true} >
                        {error.message}
                    </Alert>
                )
            }
            <Grid container spacing={2}>
                <Grid item xs={2}>
                    <FlowView course_id={props.course_id} selectFlow={handleFlow} />
                </Grid>
                <Grid item xs={10}>
                    {
                        data ? (
                            <div className={classes.sources}>
                                <AddSource flow={data.getFlow} course_id={props.course_id} />
                                {
                                    data.getFlow.sources && (
                                        data.getFlow.sources.map( (src, index) => {
                                        
                                            return (
                                                <Source source={src} key={index} title={data.getFlow.title} course_id={props.course_id} index={index} />
                                            )
                                        })
                                    )
                                }
                            </div>
                        ) : loading ? (
                            <CircularProgress size={50} color='primary' />
                        ) : (
                            <Typography variant="h6">
                                Select Level and Flow title
                            </Typography>
                        )
                    }
                </Grid>
            </Grid>
        </div>
    )
}

export default Flow;