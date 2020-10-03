import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router';

//redux
import { connect } from 'react-redux';

//mui
import { Paper, Button, Typography } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    paper: {
        position: 'relative',
        padding: 20,
        margin: 10,
        width: '50%',
        top: "25%",
        left: '20%',
        height: 150,
        boxShadow: '0px 2px 2px 0px rgba(0, 0, 0, 0.7)',
    },

    button: {
        position: 'relative',
        left: '45%',
        top: '10%',
    },

    content: {
        margin: 10,
        textAlign: 'center',
        fontSize: '18px',
    }
}))

const CurrentProblem = (props) => {
    const classes = useStyles();
    const history = useHistory();

    const { index } = props;
    const { problems_by_level } = props.code;
    
    console.log(index);

    let problem = problems_by_level[index];

    const handleProblem = () => {
        history.push(`/problem/${problem.id}/solve`);        
    }
    
    return (
        <Paper className={classes.paper}>
            <Typography variant="h5" color="primary">
                {problem.title}
            </Typography>
            <Typography variant="caption">
                {`Tags: ${problem.tags}`}
            </Typography>
            <Typography variant="body1" component="p" className={classes.content}>
                <em>Solve this problem by hitting the button</em>
            </Typography>
            <Button variant="contained" color="primary" className={classes.button} onClick={handleProblem}>
                Solve
            </Button>
        </Paper>
    )
}

CurrentProblem.propTypes = {
    index: PropTypes.number,
}

const mapStateToProps = (state) => ({
    code: state.code,
});

export default connect(mapStateToProps, null)(CurrentProblem);