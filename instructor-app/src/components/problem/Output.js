import React, { useEffect, useRef } from 'react';

//redux
import { connect } from 'react-redux';

//mui
import { Card, CardHeader, CardContent } from '@material-ui/core';
import { CircularProgress } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        margin: 30,
        width: '90%',
    },

    head: {
        color: theme.palette.primary.main,
    },

    result: {
        padding: 30,
        margin: 5,
        backgroundColor: '#D3D3D3',
    },

    progress: {
        position: 'relative',
        left: '30%'
    }
}));

const Output = (props) => {
    const classes = useStyles();
    const scrollViewRef = useRef();

    const { output } = props;

    useEffect( () => {
        scrollViewRef.current.scrollIntoView({ behaviour: 'scroll' });
    }, []);

    return (
        <Card className={classes.root} ref={scrollViewRef}>
            <CardHeader component='div' className={classes.head} title="Output" />
            <CardContent>
                {
                    output ? (
                        <div className={classes.result}>
                            {output}
                        </div>
                    ) : (
                        <CircularProgress size={25} color='primary' className={classes.progress} />
                    )
                }
            </CardContent>
        </Card>
    )
}

export default Output;