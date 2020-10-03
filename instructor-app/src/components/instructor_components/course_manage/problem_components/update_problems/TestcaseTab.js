import React, { useState } from 'react';

//components
import SampleTestcase from '../SampleTestcase';
import Testcase from './Testcase';
import Hint from './Hint';

//MUI
import { Tabs, Tab } from '@material-ui/core';
import { Paper } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        position: 'relative',
        width: '80%',
        left: '5%',
        margin: 20,
    }
}))

const TestcaseTab = (props) => {
    const classes = useStyles();

    const [tab, setTab] = useState(0);

    const getComponent = () => {
        switch(tab){
            case 0:
                return <SampleTestcase problem={props.problem} updateAfterMutation={props.updateAfterMutation} />
            
            case 1: 
                return <Testcase problem={props.problem} updateAfterMutation={props.updateAfterMutation} />

            case 2:
                return <Hint />
            
            default:
                return 'No Component for this tab';
        }
    }

    const handleTab = (e, newValue) => {
        setTab(newValue);
    }

    return (
        <div className={classes.root}>
            <Paper>
                <Tabs value={tab} onChange={handleTab} indicatorColor="primary" textColor='inherit' centered>
                    <Tab label="Sample Testcase" />
                    <Tab label="Testcase" />
                    <Tab label="Hints" />
                </Tabs>
            </Paper>
            <div>
                {getComponent()}
            </div>
        </div>
    )
}

export default TestcaseTab;