import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

//components
import MCQView from './MCQView';
import CourseProgress from '../user/CourseProgress';

//redux
import { connect } from 'react-redux';
import { getContent } from '../../redux/actions/contentAction';
import { getModuleMCQ } from '../../redux/actions/mcqAction';

//MUI
import { Stepper, StepButton, Step, StepLabel, Typography } from '@material-ui/core';
import { Button, Card, CardHeader, CardContent, CardActions } from '@material-ui/core';

//MUI/styles
import { makeStyles } from '@material-ui/styles';

//Mui/icons
import { ChevronLeft, ChevronRight } from '@material-ui/icons';

//utils/stepper
import { ModuleConnector, ModuleStepIcon } from '../../utils/CustomStepperConnector';
import TipButton from '../../utils/TipButton';

const useStyles = makeStyles( (theme) => ({
    stepper: {
        position: "relative",
        height: 25,
    },
    view: {
        backgroundColor: "#ffff",
        padding: 10,
    },
    content: {
        position: "relative",
        top: "60%",
    },
    next: {
        position: "relative",
        marginLeft: "40%"
    },
    prev: {
        position: "relative",
        marginRight: theme.spacing(6)
    },
    complete: {
        position: "relative",
        marginRight: theme.spacing(4)
    },
}));

const ContentView = (props) => {
    const classes = useStyles();

    const { module } = props.module;
    const { content } = props.content;
    const { mcq_scores } = props.current_course.current;

    const moduleId = module._id ? module._id['$oid'] : "";

    let steps = [];
    
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState(new Set());

    useEffect( () => {
        if(steps.length > 0 && steps[activeStep] !== 'mcq'){
            props.getContent(module._id['$oid'], steps[activeStep])
        }
        else if(steps.length > 0 && steps[activeStep] === 'mcq'){
            props.getModuleMCQ(module._id['$oid']);
        }

        if(mcq_scores && moduleId && Object.keys(mcq_scores).indexOf(moduleId) !== -1){
            const newCompleted = new Set(completed);
            newCompleted.add(steps.indexOf('mcq'));
            setCompleted(newCompleted);
        }
    }, [activeStep, module]);

    if(!module.sub_topic){
        return (
            <CourseProgress/>
        )
    }
        
    module.sub_topic.map( (sub, index) => {
        steps.push(sub);
        return null;
    });

    if(module.mcq && module.mcq.length > 0)
        steps.push('mcq');
    
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

    const handleNext = () => {
        const newActiveStep = isLastStep() && !allStepsCompleted() ? (
            steps.findIndex((step, i) => !completed.has(i))
        ) : (
            activeStep + 1  
        )

        setActiveStep(newActiveStep);
    }

    const handleBack = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    }

    const handleStep = (step) => () => {
        setActiveStep(step);
    }

    const handleComplete = () => {
        const newCompleted = new Set(completed);
        newCompleted.add(activeStep);
        setCompleted(newCompleted);

        if(completed.size !== totalSteps)
            handleNext();
    }

    const isStepCompleted = (step) => {
        return completed.has(step);
    }   

    return (
        <div>
            <div>
                <Stepper alternativeLabel nonLinear activeStep={activeStep} connector={<ModuleConnector/>} className={classes.stepper}>
                {
                    steps.map( (label, index) => {
                        return (
                            <Step key={index}>
                                <StepButton onClick={handleStep(index)} completed={isStepCompleted(index)}>
                                    <StepLabel StepIconComponent={ModuleStepIcon(module)}>
                                        {label}
                                    </StepLabel>
                                </StepButton>
                            </Step>
                        )
                    })
                }
                </Stepper>
            </div>
            <div>
                <Card className={classes.content}>
                    <CardHeader title={steps[activeStep]}/>
                    <CardContent>
                        {
                            steps[activeStep] !== 'mcq' ? (
                                <ReactMarkdown source={content.content} escapeHtml={false}/>
                            ) : (
                                (moduleId && mcq_scores && Object.keys(mcq_scores).indexOf(moduleId) !== -1) ? (
                                    <Typography>
                                        You have already taken this test and obtained <strong>{'\t'+ mcq_scores[moduleId]['score'] + '\t'}</strong>
                                        out of <strong>{mcq_scores[moduleId]['total']}</strong>
                                    </Typography>
                                ) : (
                                    <MCQView/>
                                )
                            )
                        }
                    </CardContent>
                    <CardActions> 
                        <span className={classes.next}>

                        </span>
                        <TipButton tip="previous" onClick={handleBack} btnColor="primary" disabled={activeStep === 0 ? true : false}
                               className={classes.prev}
                        >
                            <ChevronLeft/>
                        </TipButton>
                        <Button variant="contained" color="primary" onClick={handleComplete}>
                            Complete
                        </Button>
                        <TipButton tip="next" onClick={handleNext} btnColor="primary" className={classes.complete}>
                            <ChevronRight/>
                        </TipButton>
                    </CardActions>
                </Card>           
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    module: state.module,
    content: state.content,
    mcq: state.mcq,
    current_course: state.current_course,
});

const mapActionsToProps = {
    getContent,
    getModuleMCQ
}

export default connect(mapStateToProps, mapActionsToProps)(ContentView);