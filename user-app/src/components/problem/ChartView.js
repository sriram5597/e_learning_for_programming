import React from 'react';

//redux
import { connect } from 'react-redux';

//utils
import TipButton from '../../utils/TipButton';

//mui/icons
import { KeyboardBackspace } from '@material-ui/icons';

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

    const handleBack = () => {
        props.view(false);
    }

    return (
        <div className={classes.container}>
            <TipButton tip='back' btnColor='primary' onClick={handleBack}>
                <KeyboardBackspace />
            </TipButton>
            <div className={classes.root}>
                <img src={src} />
            </div>
        </div> 
    )
}

const mapStateToProps = (state) => ({
    flowChart: state.flowChart,
});

export default connect(mapStateToProps, null)(ChartView);