import React, { useState, useRef, useEffect } from 'react';
import { useHistory } from 'react-router';

//redux
import { connect } from 'react-redux';

//graphql
import { useMutation, useLazyQuery, useQuery } from '@apollo/react-hooks';
import { RUN_CODE, LOAD_CODE } from '../../graphql/queries/problemQueries';
import { COMPILE_CODE, SAVE_CODE } from '../../graphql/mutation/problemMutation';
import { GET_CURRENT_COURSE } from '../../graphql/queries/currentCourseQueries';

//components
import Output from './Output';
import ProblemStatement from './ProblemStatement';
import SampleTestcase from './SampleTestcase';
import Testcase from './Testcase';
import Flowchart from '../flowchart/Flowchart';
import Head from '../Head';

//utils
import CodeEditor from '../../utils/code_editor/CodeEditor';
import UpdateSnackbar from '../../utils/UpdateSnackbar';

//mui
import { Paper, Button, TextField, Checkbox } from '@material-ui/core';
import { Grid, CircularProgress, Backdrop, Tabs, Tab } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
    paper: {
        position: "relative",
        height: '86vh',
        padding: "15px",
        overflowY: 'auto',
        wordWrap: 'break-word',
        textAlign: 'justify',
        margin: 5
    },

    actions: {
        position: "relative",
        left: "60%"
    },

    customInput: {
        margin: "20px"
    },

    progress: {
        position: 'relative',
        left: '48%',
        top: '30%'
    },

    outputHeader: {
        textAlign: 'center',
        color: '#fe7502'
    },

    scoreCard: {
        position: 'relative',
        width: '50%',
        boxShadow: '1px, 1px, 1px, 1px, rgba(0, 0, 0, 0.5)',
    },

    backdrop: {
        zIndex: 4,
        color: '#fff',
    },

    progressText: {
        position: 'relative',
        top: '33%',
        left: '45%',
    },

    codeTab: {
        position: 'relative',
        margin: 5,
    }
}));

const CompileCode = (props) => {
    const classes = useStyles();

    const problem = props.source.source;
    const { components, position } = props.flowChart;
    const { authenticated } = props.auth;

    const [isCustomInput, setIsCustomInput] = useState(false);
    const [isSample, setIsSample] = useState(false);
    const [language, setLanguage] = useState('java');
    const [input, setInput] = useState();
    const [filename, setFilename] = useState();
    const [viewTab, setViewTab] = useState(false);
    const [tab, setTab] = useState(1);
    const [displayResult, setDisplayResult] = useState(false);    
    const [status, setStatus] = useState({
        status: "",
        msg: ""
    });
    const [openBar, setOpenBar] = useState(false);

    const editor = useRef();

    const [runCode, runCodeData] = useLazyQuery(RUN_CODE, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: () => {
            setDisplayResult(true);
            setStatus({
                status: "SUCCESS",
                msg: "Code Executed"
            });
            setOpenBar(true);
        }
    });

    const [saveCode] = useMutation(SAVE_CODE, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: () => {
            setStatus({
                status: "SUCCESS",
                msg: "Your code is saved"
            });
            setOpenBar(true);
        }
    });

    const [loadCode, loadCodeData] = useLazyQuery(LOAD_CODE, {
        onError: (err) => {
            console.log(err);
        }
    });

    const [compileCode, compileCodeData] = useMutation(COMPILE_CODE, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: (data) => {
            console.log(data);
            setDisplayResult(true);
            setStatus({
                status: "SUCCESS",
                msg: "Your code is executed"
            });
            setOpenBar(true);
        },
        refetchQueries: [
            {
                query: GET_CURRENT_COURSE,
                variables: {
                    course_id: props.course_id,
                }
            }
        ]
    });

    const getCurrentCourseData = useQuery(GET_CURRENT_COURSE, {
        variables: {
            course_id: props.course_id
        }
    });
    
    useEffect( () => {
        if(getCurrentCourseData.data){
            console.log(getCurrentCourseData.data.getCurrentCourse.completed_tasks);
            console.log(JSON.parse(getCurrentCourseData.data.getCurrentCourse.completed_tasks));

            const tasks = getCurrentCourseData.data.getCurrentCourse.completed_tasks.length > 3 ? 
                        JSON.parse(getCurrentCourseData.data.getCurrentCourse.completed_tasks) : null;
            
            if(tasks && tasks[props.source.source.problem_id].flowchart >= problem.max_score / 4){
                setViewTab(true);
            }
            else{
                setViewTab(false);
            }
        }
    }, [problem]);

    useEffect( () => {
        console.log('loading code in effect')
        loadCode({
            variables: {
                problem_id: props.source.source.problem_id,
                language
            }
        });
    }, [language]);

    const language_ext = {
        java: '.java',
        python: '.py'
    }

    const handleCustomInput = (event) => {
        setIsCustomInput(event.target.checked);
    }

    const handleInput = (e) => {
        setInput(e.target.value);
    }

    const onLanugageChange = (event) => {
        setLanguage(event.target.value);
    }

    const handleFilename = (event) => {
        setFilename(event.target.value);
    }

    const handleTab = (e, newValue) => {
        setTab(newValue);
        setIsFlowchart(newValue === 0 ? true : false);
    }

    const executeCode = (sample) => () => {
        setIsSample(sample);

        setIsSample(sample);
        setDisplayResult(false);

        let data = {};
        const sourceType = !viewTab || tab === 0 ? 'flowchart' : 'code';

        if(viewTab && tab !== 0){
            saveCode({
                variables: {
                    problem_id: props.source.source.problem_id,
                    filename: filename + language_ext[language],
                    code: editor.current()
                }
            });
        }

        let variables = {
            source_type: sourceType,
        }

        if(!viewTab || tab === 0){
            variables = {
                ...variables,
                flowchart: {
                    components: JSON.stringify(components),
                    position: JSON.stringify(position)
                }
            }
        }
        else{
            variables = {
                ...variables,
                code:{
                    filename: filename + language_ext[language],
                    code: editor.current(),
                    language
                }
            }
        }
        
        if(isCustomInput && sample){
            data.input = input ? input : 'dummy';

            variables = {
                ...variables,
                input: input ? input : '',
                problem_id: props.source.source.problem_id
            }
    
            console.log(variables);

            runCode({
                variables: {
                    ...variables
                }
            });
            return;
        }

        variables = {
            ...variables,
            problem_id: props.source.source.problem_id,
        }

        if(sample){
            variables = {
                ...variables,
                type: 'sample'
            }
        }
        else{
            variables = {
                ...variables,
                type: 'validate',
                scope: props.scope
            }
        }

        console.log(variables);

        compileCode({
            variables: {
                ...variables
            }
        });
    }

    const getComponent = () => {
        switch(tab){
            case 0:
                return (
                    <Flowchart problem={problem} />
                )

            case 1: 
                return (
                    <CodeEditor onSelect={onLanugageChange} selectedLanguage={language}
                            code={loadCodeData.data ? loadCodeData.data.loadCode.code : ""} filename={filename} handleFilename={handleFilename} 
                            editor={editor}
                    />
                );

            default:
                return null;
        }
    }

    return (
        <div> 
            <Head title={props.source.source_title} />
            <div>
                <Grid container spacing={1}>
                    <Grid item sm={5}>
                        <Paper className={classes.paper}>
                            <ProblemStatement problem={problem} />
                        </Paper>
                    </Grid>
                    <Grid item sm={7}>
                        <div>
                            {
                                viewTab ? (
                                    <div>
                                        <Paper square>
                                            <Tabs onChange={handleTab} value={tab} textColor='primary' indicatorColor='primary' className={classes.codeTab}
                                                centered
                                            >
                                                <Tab label="Flowchart" />
                                                <Tab label="Code Editor" />
                                            </Tabs>
                                        </Paper>
                                        {getComponent()}
                                    </div>
                                ) : (
                                    problem.need_flowchart === 'NO' ? (
                                        <CodeEditor onSelect={onLanugageChange} selectedLanguage={language}
                                                code={saved_code} filename={filename} handleFilename={handleFilename} editor={editor}
                                        />
                                    ) : (
                                        <Flowchart problem={problem} />
                                    )
                                )
                            }

                            <div className={classes.controls}>
                                <Grid container spacing={1} className={classes.customInput}>
                                    <Grid item xs={6}>
                                        <span>
                                            <Checkbox onChange={handleCustomInput}/> Provide Custom Input 
                                        </span>
                                        {
                                            isCustomInput && (
                                                <TextField label="Custom Input" id="custom-input" multiline rows="5" fullWidth variant="outlined"
                                                         onChange={handleInput} value={input}  color="primary" autoFocus
                                                />
                                            )
                                        }
                                    </Grid>
                                    <Grid item xs={4}>
                                        <span className={classes.actions}>
                                            <Button variant="outlined" color="primary" style={{marginRight: "10px"}} 
                                                    onClick={executeCode(true)}
                                            >
                                                Run
                                            </Button>
                                            <Button variant="contained" color="primary" onClick={executeCode(false)}>
                                                Submit
                                            </Button>
                                        </span>
                                    </Grid>
                                </Grid>
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </div>
            {
                displayResult && (
                    isSample ? (
                        isCustomInput ? (
                           runCodeData.data &&  <Output output={runCodeData.data.runCode.output} />
                        ) : (
                            compileCodeData.data && <SampleTestcase sample_result={compileCodeData.data.compileCode.result} />
                        )
                    ) : (
                       compileCodeData.data && (
                            <div>
                                <Testcase testcase_result={compileCodeData.data.compileCode.result} problem={props.source.source} />
                                {/*<ScoreDialog score={compileCodeData.data.compileCode.score} />*/}
                            </div>
                       )
                    )
                )
            }
            <Backdrop open={runCodeData.loading || compileCodeData.loading} className={classes.backdrop}>
                <CircularProgress color='primary' size={30} />
            </Backdrop>
            <UpdateSnackbar status={status.status} msg={status.msg} open={openBar} />
        </div>
    )   
}

const mapStateToProps = (state) => ({
    flowChart: state.flowChart,
    auth: state.auth
})

export default connect(mapStateToProps, null)(CompileCode);