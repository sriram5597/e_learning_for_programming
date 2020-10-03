import React from 'react';

//reudx
import { connect } from 'react-redux';

//components
import Delete from './Delete';
import Connect from './Connect';
import Update from './Update';

//mui
import { List } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        position: 'relative',
        backgroundColor: '#696969',
        color: '#ffffff'
    },
}))

const Controls = (props) => {
    const classes = useStyles();

    const { selectedComponent } = props.flowChart;

    return (
        <div className={classes.root}>
            <Connect setAnchor={props.setAnchor} />
            {
                selectedComponent.name !== 'start' && (
                    <Delete setAnchor={props.setAnchor} />
                )
            }
            {
                selectedComponent.name !== 'start' && (
                    <Update setAnchor={props.setAnchor} />
                )
            }
        </div>
    )
}

const mapStateToProps = (state) => ({
    flowChart: state.flowChart,
});

export default connect(mapStateToProps, null)(Controls);