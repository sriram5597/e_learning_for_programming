import React, { useState, useEffect } from 'react';

//graphql
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { GET_FLOW, GET_LEVEL_FLOWS } from '../../graphql/queries/courseFlowQueries';
import { GET_CURRENT_COURSE } from '../../graphql/queries/currentCourseQueries';
import { GET_COURSE } from '../../graphql/queries/courseQueries';

//componenets
import FlowView from './flowView/FlowView';
import CurrentNavbar from './CurrentNavbar';
import ReAuthenticate from '../authentication_components/ReAuthenticate';
import InitView from './InitView';

//redux
import { connect } from 'react-redux';

//MUI
import { Typography, MobileStepper, IconButton, Stepper, StepButton, StepContent, Step, MenuItem, CircularProgress } from '@material-ui/core'
import { Grid, Paper, Button } from '@material-ui/core';

//MUI styles
import { makeStyles } from '@material-ui/styles';

//MUI icons
import { KeyboardArrowRight, KeyboardArrowLeft, VerticalAlignBottom } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    container: {
        margin: 20,
    },
    title: {
        margin: "2vh",
    },
    treeNode: {
        marginBottom: 5,
    },
    fab: {
        position: "relative",
        top: "10%"
    },

    prbLabel: {
        padding: 0,
    },

    paper: {
        padding: 15
    },

    scoreCard: {
        margin: 10,
        display: 'flex',
    },

    points: {
        margin: 20
    },

    loading: {
        position: 'relative',
        marginLeft: '40%',
        marginTop: '20%',
    },

    root: {
        marginTop: 5
    },

    selectedFlow: {
        color: theme.palette.primary.main,
        borderWidth: '0px 0px 0px 5px',
        borderColor: theme.palette.primary.main,
        borderStyle: 'solid'
    },
}));

const CurrentCourse = (props) => {
    const classes = useStyles();

    const course_id = props.match.params.id;
    const { authenticated } = props.auth;

    const [activeStep, setActiveStep] = useState(0);
    const [moduleStep, setModuleStep] = useState(0);
    const [nextFlow, setNextFlow] = useState();
    const [prevFlow, setPrevFlow] = useState();
    const [nextModule, setNextModule] = useState();
    const [directSelect, setDirectSelect] = useState(false);
    const [prevModule, setPrevModule] = useState();
    const [initView, setInitView] = useState(false);

    const getLevelFlowsData = useQuery(GET_LEVEL_FLOWS, {
        variables: {
            course_id
        }
    });

    const getCourseData = useQuery(GET_COURSE, {
        variables: {
            course_id
        }
    });

    const getCurrentCourseData = useQuery(GET_CURRENT_COURSE, {
        variables: {
            course_id
        }
    });

    const [getFlow, getFlowData] = useLazyQuery(GET_FLOW, {
        onError: (err) => {
            console.log(err.message);
        },
        onCompleted: (data) => {
            if(!directSelect){
                const scope_val = data.getFlow.scope_value !== 'None' ? parseInt(data.getFlow.scope_value) : 'None';
                const nextPos = moveToNextFlow(nextFlow, scope_val);
                const prevPos = moveToPrevFlow(prevFlow, scope_val);
                
                setNextFlow(nextPos.nextFlow);
                setNextModule(nextPos.nextModule);
                setPrevFlow(prevPos.prevFlow);
                setPrevModule(prevPos.prevModule);
            }
            else{
                setDirectSelect(false);
            }
            setModuleStep(parseInt(data.getFlow.scope_value));
            window.localStorage.setItem('last_flow', data.getFlow.title);
            window.localStorage.setItem('scope_value', data.getFlow.scope_value);
        }
    });

    useEffect( () => {
        if(getCurrentCourseData.data && getCourseData.data){
            const last_flow = window.localStorage.getItem('last_flow');

            if(last_flow){
                setDirectSelect(true);
                const index = parseInt(window.localStorage.getItem('index'));
                const scope_value = parseInt(window.localStorage.getItem('scope_value'));
                const nextPos = moveToNextFlow(index, scope_value);
                const prevPos = moveToPrevFlow(index, scope_value);

                setNextFlow(nextPos.nextFlow);
                setNextModule(nextPos.nextModule);
                setPrevFlow(prevPos.prevFlow);
                setPrevModule(prevPos.prevModule);

                getFlow({
                    variables: {
                        course_id,
                        title: last_flow,
                        pay_status: getCurrentCourseData.data.getCurrentCourse.pay_status
                    }
                });
            }
            else{
                setInitView(true);
            }
        }
    }, [getCurrentCourseData.data, getCourseData.data]);

    const moveToNextFlow = (index, scope_value) => {
        if(getLevelFlowsData.data && index + 1 < getLevelFlowsData.data.getLevelFlows.filter((f) => f.scope_value === `${scope_value}`
            && f.scope === `level_${activeStep}`).length){
            return {
                nextFlow: index + 1,
                nextModule: -1
            }
        }
        else if(getCourseData.data && scope_value !== 'None' && scope_value + 1 < getCourseData.data.getCourse.levels[activeStep].modules.length){
            return {
                nextModule: scope_value + 1,
                nextFlow: 0
            }
        }
        else if(getLevelFlowsData.data && scope_value !== 'None' &&
            getLevelFlowsData.data.getLevelFlows.filter((f) => f.scope_value === 'None' && f.scope === `level_${activeStep}`).length > 0){
            return {
                nextModule: 'None',
                nextFlow: 0
            }
        }
        else{
            return {
                nextFlow: -1,
                nextModule: -1
            }
        }
    }

    const moveToPrevFlow = (index, scope_value) => {
        if(getLevelFlowsData.data && index - 1 >= 0){
            return {
                prevFlow: index - 1,
                prevModule: -1
            }
        }
        else if(getCourseData.data && scope_value !== 'None' && scope_value - 1 >= 0){
            return {
                prevModule: scope_value - 1,
                prevFlow: getLevelFlowsData.data.getLevelFlows.filter( f => f.scope_value === `${scope_value - 1}`).length - 1
            }
        }
        else if(scope_value === 'None'){
            const sc = getCourseData.data.getCourse.levels[activeStep].modules.length - 1;
            return {
                prevModule: sc,
                prevFlow: getLevelFlowsData.data.getLevelFlows.filter( f => f.scope_value === `${sc}`).length - 1
            }
        }
        else{
            return {
                prevFlow: -1,
                prevModule: -1
            }
        }
    }

    const levels = getCourseData.data ? getCourseData.data.getCourse.levels.length : 0;

    const handleSelectFlow = (title, index, scope_value) => () => {
        const nextPos = moveToNextFlow(index, scope_value);
        const prevPos = moveToPrevFlow(index, scope_value);

        setNextFlow(nextPos.nextFlow);
        setNextModule(nextPos.nextModule);
        setPrevFlow(prevPos.prevFlow);
        setPrevModule(prevPos.prevModule);
        setDirectSelect(true);
        setInitView(false);

        const variables = {
            course_id,
            title,
            pay_status: getCurrentCourseData.data.getCurrentCourse.pay_status
        }

        window.localStorage.setItem('index', index);
        window.localStorage.setItem('scope_value', scope_value);
        
        getFlow({
            variables: {
                ...variables
            }
        });
    }

    const handleNextFlow = () => {
        const scope_flows = nextModule === -1 ? getLevelFlowsData.data.getLevelFlows.filter( (f) => f.scope_value === `${moduleStep}`) : 
                nextModule !== 'None' ? getLevelFlowsData.data.getLevelFlows.filter((f) => f.scope_value === `${nextModule}`) :
                    getLevelFlowsData.data.getLevelFlows.filter((f) => f.scope_value === nextModule && f.scope === `level_${activeStep}`);

        setDirectSelect(false);
        window.localStorage.setItem('index', nextFlow);

        getFlow({
            variables: {
                course_id,
                title: scope_flows[nextFlow].title,
                pay_status: getCurrentCourseData.data.getCurrentCourse.pay_status
            }
        });
    }

    const handlePrevFlow = () => {
        const scope_flows = prevModule === -1 ? getLevelFlowsData.data.getLevelFlows.filter( (f) => f.scope_value === `${moduleStep}`) : 
                prevModule !== 'None' ? getLevelFlowsData.data.getLevelFlows.filter((f) => f.scope_value === `${prevModule}`) :
                    getLevelFlowsData.data.getLevelFlows.filter((f) => f.scope_value === prevModule && f.scope === `level_${activeStep}`);

        setDirectSelect(false);
        window.localStorage.setItem('index', prevFlow);

        getFlow({
            variables: {
                course_id,
                title: scope_flows[prevFlow].title,
                pay_status: getCurrentCourseData.data.getCurrentCourse.pay_status
            }
        });
    }

    const handleBack = () => {
        setActiveStep( (prevStep) => prevStep - 1);
    }

    const handleNext = () => {
        setActiveStep( (prevStep) => prevStep + 1);
    }

    const handleModuleStep = (index) => () => {
        setModuleStep(index);
    }

    const handleInitView = () => {
        setInitView(true);
    }

    return (
        <div className={classes.container}>
            {
                getCourseData.loading || getLevelFlowsData.loading || getCurrentCourseData.loading || !getLevelFlowsData.data ? (
                    <CircularProgress color='primary' size={50} className={classes.loading} />
                ) : (
                    <div>
                        <CurrentNavbar course_title={getCourseData.data && getCourseData.data.getCourse.course_title}
                            xp={getCurrentCourseData.data ? getCurrentCourseData.data.getCurrentCourse.xp : 0}
                            course_id={course_id}
                        />
                        <Grid container spacing={2} className={classes.root}>
                            <Grid item xs={2}>
                                <Paper className={classes.paper}>
                                    <Button variant='outlined' color='primary' onClick={handleInitView}>
                                        About this Course
                                    </Button>
                                    <Typography variant="h5" color="primary">
                                        Level - {activeStep}
                                    </Typography>
                                    <MobileStepper steps={levels} variant="progress" position="static" activeStep={activeStep}
                                        nextButton={
                                            <IconButton onClick={handleNext} disabled={activeStep === levels - 1}>
                                                <KeyboardArrowRight fontSize="small" />
                                            </IconButton>
                                        }
                                        backButton={
                                            <IconButton onClick={handleBack} disabled={activeStep === 0}>
                                                <KeyboardArrowLeft fontSize="small" />
                                            </IconButton>
                                        }
                                    />
                                    <div>
                                        <Stepper nonLinear orientation="vertical" activeStep={moduleStep}>
                                            {   
                                                getCourseData.data && getCourseData.data.getCourse.levels[activeStep].modules.map( (mod, index) => {
                                                    return (
                                                        <Step key={mod.module_id}>
                                                            <StepButton onClick={handleModuleStep(index)}>
                                                                {mod.title}
                                                            </StepButton>
                                                            <StepContent>
                                                                {
                                                                    getLevelFlowsData.data.getLevelFlows.filter( (f) => f.scope_value === `${index}` && 
                                                                            f.scope === `level_${activeStep}`)
                                                                        .map( (flow, index) => {
                                                                            return (
                                                                                <MenuItem key={index} onClick={handleSelectFlow(flow.title, index, parseInt(flow.scope_value))}
                                                                                    className={getFlowData.data && getFlowData.data.getFlow.title  === flow.title ?
                                                                                        classes.selectedFlow : null}
                                                                                >
                                                                                    {flow.title}
                                                                                </MenuItem>
                                                                            )
                                                                        })
                                                                }
                                                            </StepContent>
                                                        </Step>
                                                    )
                                                })
                                            }
                                        </Stepper>
                                    </div>
                                    {
                                            getLevelFlowsData.data && getLevelFlowsData.data.getLevelFlows.filter( (f) => f.scope === `level_${activeStep}` 
                                                    && f.scope_value === 'None')
                                                .map( (flow, index) => {
                                                    return (
                                                        <MenuItem onClick={handleSelectFlow(flow.title, index, flow.scope_value)} 
                                                            className={getFlowData.data && getFlowData.data.getFlow.title  === flow.title ?
                                                                classes.selectedFlow : null}
                                                        >
                                                            {flow.title}
                                                        </MenuItem>
                                                    )
                                                })
                                    }
                                </Paper>
                            </Grid>
                            <Grid item xs={10}>
                                <div>
                                    {
                                        initView ? (
                                            <InitView levelFlows={getLevelFlowsData.data.getLevelFlows} course_id={course_id} 
                                                pay_status={getCurrentCourseData.data.getCurrentCourse.pay_status}
                                            />
                                        ) : (
                                            <FlowView flow={getFlowData.data ? getFlowData.data.getFlow : null} nextFlow={handleNextFlow} 
                                                isNextFlow={nextModule !== - 1 || nextFlow !== -1} prevFlow={handlePrevFlow} 
                                                isPrevFlow={prevFlow !== -1 || prevModule !== -1} activeStep={0}
                                            />
                                        )
                                    }
                                </div>
                            </Grid>
                        </Grid>
                    </div>
                )
            }
            {
                !authenticated && (
                    <ReAuthenticate />
                )
            }
        </div>    
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps, null)(CurrentCourse);