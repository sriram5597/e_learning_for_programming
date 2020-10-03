import React, { useState, useEffect } from 'react';

//components
import CourseProgress from '../CourseProgress';
import TextContent from './content/TextContent';
import Test from './mcq/Test';
import StreamVideo from './videoStream/StreamVideo';
import Code from './code/Code';

//MUI
import { Stepper, StepButton, Step, StepLabel, Typography, Paper, CircularProgress, IconButton   } from '@material-ui/core';

//MUI/styles
import { makeStyles } from '@material-ui/styles';

//Mui/icons
import { ChevronLeft, ChevronRight } from '@material-ui/icons';

//utils/stepper
import { StepperConnector, FlowStepIcon } from '../../../utils/CustomStepperConnector';
import TipButton from '../../../utils/TipButton';

const useStyles = makeStyles( (theme) => ({
    stepper: {
        position: "relative",
    },
    view: {
        backgroundColor: "#ffff",
        padding: 10,
    },
    content: {
        position: "relative",
        padding: 10,
    },
    next: {
        position: "relative",
        marginLeft: '15vh'
    },
    complete: {
        position: "relative",
        marginRight: theme.spacing(4)
    },
    flowView: {
        height: "65vh",
        margin: 5,
        overflowY: 'auto'
    },
    head: {
        display: 'flex',
    },
    controls: {
        position: "relative",
        flexGrow: 0.2,
        marginLeft: '10vh'
    },
    stepperView: {
        align:"center"
    },
    title: {
        padding: 10,
        flexGrow: 1,
        textAlign: 'center'
    }
}));

const FlowView = (props) => {
    const classes = useStyles();

    const { flow } = props;
    
    const [activeStep, setActiveStep] = useState(null);
    const [completed, setCompleted] = useState(new Set());
    const [videoSource, setVideoSource] = useState();

    useEffect( () => {  
        if(flow){
            setActiveStep(0);
            console.log(flow.sources.length);
        }
        else{
            setActiveStep(null);
        }   
    }, [flow]);

    useEffect( () => {
        console.log('indide ste effect');
        if(flow){
            console.log(flow.sources.length);
        }
        
        if(flow && activeStep >= flow.sources.length){
            setActiveStep(0);
        }

        if(flow && flow.sources[activeStep].type === 'VIDEO'){
            console.log(flow.sources[activeStep].source.url);
            setVideoSource(flow.sources[activeStep].source.url);
        }
    }, [activeStep]);

    if(!flow){
        return (
            <div>
                <CircularProgress color='primary' size={50} />
            </div>
        )
    }
     
    let steps = flow.sources;

    const totalSteps = steps.length;

    const completedSteps = () => {
        return completed.size;
    }

    const allStepsCompleted = () => {
        return completedSteps() === totalSteps;
    }

    const isLastStep = () => {
        return activeStep === totalSteps - 1;
    }

    const handleStep = (step) => () => {
        setActiveStep(step);
    }

    const isStepCompleted = (step) => {
        return completed.has(step);
    }   

    const handlePrev = () => {
        if(activeStep > 0){
            setActiveStep(activeStep - 1);
        }
        else{
            setActiveStep(0);
            props.prevFlow();
        }
    }

    const handleNext = () => {
        if(activeStep < steps.length - 1){
            setActiveStep(activeStep + 1);
        }
        else{
            setActiveStep(0);
            props.nextFlow();
        }
    }

    const getComponent = () => {
        switch(steps[activeStep].type){
            case 'VIDEO':
                console.log(videoSource);
                return (
                    <StreamVideo source={videoSource} />
                );
            
            case "TEXT":
                return <TextContent source={steps[activeStep].source} course_id={flow.course_id} />;

            case "MCQ":
                return <Test source={steps[activeStep].source} course_id={flow.course_id} scope={flow.scope} />;

            case "CODE":
                return <Code source={steps[activeStep]} course_id={flow.course_id} scope={flow.scope} />;
            
            default:
                return null;
        }
    }

    console.log(activeStep);

    return (
        <div>
            {
                activeStep === null ||!steps || steps.length === 0 ? (
                    <CircularProgress color='primary' size={50} />
                ) : (
                    <div>
                        <div>
                            <Stepper alternativeLabel nonLinear activeStep={activeStep} connector={<StepperConnector/>} className={classes.stepper}>
                            {
                                steps.map( (source, index) => {
                                    return (
                                        <Step key={index}>
                                            <StepButton onClick={handleStep(index)} completed={isStepCompleted(index)}>
                                                <StepLabel StepIconComponent={FlowStepIcon(source.type)}>
                                                    <Typography color={index === activeStep ? 'primary' : 'inherit'}>
                                                        {source.type}
                                                    </Typography>
                                                </StepLabel>
                                            </StepButton>
                                        </Step>
                                    )
                                })
                            }
                            </Stepper>
                        </div> 

                        <Paper className={classes.content}>
                            <div className={classes.head}>
                                <div className={classes.controls}>
                                    <TipButton tip="previous" btnColor="primary" onClick={handlePrev} disabled={activeStep === 0 && !props.isPrevFlow}>
                                        <ChevronLeft fontSize="large" />
                                    </TipButton>
                                </div>
                                <div className={classes.title}>
                                    <Typography variant='h5'>
                                        {steps[activeStep].source_title}
                                    </Typography>
                                </div>
                                <div className={classes.controls}>
                                    <TipButton tip="next" btnColor="primary" onClick={handleNext} disabled={activeStep === steps.length - 1 && !props.isNextFlow}>
                                        <ChevronRight fontSize="large" />
                                    </TipButton>
                                </div>
                            </div>
                            <div className={classes.flowView}>
                                {getComponent()}
                            </div>
                        </Paper>    
                    </div>
                )
            }
                   
        </div>
    );
}

export default FlowView;