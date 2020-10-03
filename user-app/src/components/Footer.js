import React from 'react';

//components
import Feedback from './Feedback';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
        height: '3vh',
        display: 'flex'
    },
    copy: {
        flexGrow: 0.5
    },
    statement: {
        flexGrow: 0.4
    }
}))

const Footer = (props) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <div className={classes.statement}>

            </div>
            <div className={classes.copy}>
                <strong>
                    Created by Artik Learn &copy; 2020
                </strong>
            </div>
            <Feedback />
        </div>
    )
}

export default Footer;