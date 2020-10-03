import React from 'react';

//redux
import { connect } from 'react-redux';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        backgroundColor: '#161616'
    }
}))

const ChartView = (props) => {
    const classes = useStyles();

    const { src } = props.flowChart;

    return (
        <div className={classes.root}>
            <img src={src} />
        </div>
    )
}

const mapStateToProps = (state) => ({
    flowChart: state.flowChart,
});

export default connect(mapStateToProps, null)(ChartView);