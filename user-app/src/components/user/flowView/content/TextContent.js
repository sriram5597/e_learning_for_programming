import React, { useState, useEffect } from 'react';

//components
import FlowchartView from './FlowchartView';

//utils
import DraftView from '../../../../utils/customEditor/view/DraftView';
import ViewCode from './ViewCode';

//mui
import { Typography } from '@material-ui/core';

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
    },
    textView: {
        marginLeft: '10px'
    }
}))

const TextContent = (props) => {
    const classes = useStyles();

    const { content } = props.source;
    
    console.log(content);

    return (
        <div className={classes.root}>
            {
                content.length > 0 ? (
                    <div>
                        {
                            content.map( (con, index) => {
                                if(con.type === 'CODE'){
                                    console.log(con);
                                    return (
                                        <div key={index} className={classes.content}>
                                            <div>
                                                <Typography variant='h6'>
                                                    <strong>
                                                        {con.title}
                                                    </strong>
                                                </Typography>
                                            </div>
                                            <ViewCode code={con.code} language={con.language} key={index}/>
                                        </div>
                                    )
                                }
                                else if(con.type === 'PARAGRAPH'){
                                    console.log(con.content);

                                    return (
                                        <div key={index} className={classes.content}>
                                            <div>
                                                <Typography variant='h6'>
                                                    <strong>
                                                        {con.title}
                                                    </strong>
                                                </Typography>
                                            </div>
                                            <span className={classes.textView}>
                                                {
                                                    con.content ? (
                                                        <DraftView editorState={JSON.parse(con.content)} />
                                                    ) : (
                                                        ""
                                                    )
                                                }
                                            </span>
                                        </div>
                                    )
                                }
                                else if(con.type === 'FLOWCHART'){
                                    return (
                                        <FlowchartView title={con.title} url={con.url} />
                                    )
                                }
                                else{
                                    return (
                                        null
                                    )
                                }
                            })
                        }
                    </div>
                ) : (
                    <Typography variant='subtitle1'>
                        <strong>
                            No Content    
                        </strong>
                    </Typography>
                )
            }
        </div>
    )
}

export default TextContent;