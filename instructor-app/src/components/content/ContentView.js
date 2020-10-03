import React, { useState, useEffect } from 'react';

//components
import FlowchartView from './FlowchartView';

//utils
import DraftView from '../../utils/customEditor/view/DraftView';
import ViewCode from './ViewCode';

//mui
import { Typography, Paper } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        padding: 20,
        margin: 15,
        minHeight: '75vh',
    },
    image: {
        position: 'relative',
        margin: 30,
        left: '30%'
    },
    content: {
        marginBottom: 30,
    }
}))

const ContentView = (props) => {
    const classes = useStyles();

    console.log(props.contents);
    
    return (
        <Paper className={classes.root}>
            <Typography variant='h4' color='primary'>
                {props.title}
            </Typography>
            {
                props.contents.length > 0 ? (
                    <div>
                        {
                            props.contents.map( (con, index) => {
                                if(con.type === 'CODE'){
                                    return (
                                        <div key={index} className={classes.content}>
                                            <Typography variant='h5'>
                                                <strong>
                                                    {con.title}
                                                </strong>
                                            </Typography>
                                            <ViewCode code={con.code} key={index} language={con.language} />
                                        </div>
                                    )
                                }
                                
                                else if(con.type === 'FLOWCHART'){
                                    console.log(con);
                                    return (
                                        <div key={index} className={classes.content}>
                                            <div>
                                                <Typography variant='h5'>
                                                    <strong>
                                                        {con.title}
                                                    </strong>
                                                </Typography>   
                                            </div>
                                            <div>
                                                <FlowchartView url={con.url} title={con.title} />
                                            </div>
                                        </div>
                                    )
                                }

                                else{
                                    return (
                                        <div key={index} className={classes.content}>
                                            <Typography variant='h5'>
                                                <strong>
                                                    {con.title}
                                                </strong>
                                            </Typography>
                                            <DraftView editorState={typeof con.content === 'object' ? con.content : JSON.parse(con.content)} />
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>
                ) : (
                    <Typography variant='subtitle1'>
                        Loading...
                    </Typography>
                )
            }
        </Paper>
    )
}

export default ContentView;