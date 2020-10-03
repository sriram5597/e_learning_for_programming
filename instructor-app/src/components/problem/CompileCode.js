import React, { useState, useRef, useEffect } from 'react';
import { useHistory } from 'react-router';

//reudx
import { connect } from 'react-redux';

//graphql
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { RUN_CODE, LOAD_CODE } from '../../graphql/queries/problemQueries';
import { COMPILE_CODE, SAVE_CODE } from '../../graphql/mutation/problemMutation';

import SampleTestcase from './SampleTestcase';
import Testcase from './Testcase';
import ScoreDialog from './ScoreDialog';
import Flowchart from '../flowchart/Flowchart';

//utils
import CodeEditor from '../../utils/code_editor/CodeEditor';

//mui
import { Paper, Button, TextField, Checkbox } from '@material-ui/core';
import { Grid, CircularProgress, Backdrop } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';
import { useQuery } from '@apollo/client';

const useStyles = makeStyles(theme => ({
    paper: {
        position: "relative",
        height: '86vh',
        margin: "20px",
        padding: "15px",
        overflowY: 'scroll',
        wordWrap: 'break-word',
        textAlign: 'justify'
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
}));

const CompileCode = (props) => {
    const classes = useStyles();
    const history = useHistory();

    const problem = props.source.source;
    //const { sample_test_result, testcase_result, status } = props.code;
    const { components, position } = props.flowChart;

    const [isCustomInput, setIsCustomInput] = useState(false);
    const [isSample, setIsSample] = useState(false);
    const [language, setLanguage] = useState();
    const [input, setInput] = useState();
    const [filename, setFilename] = useState();
    const [isFlowchart, setIsFlowchart] = useState();
    const [open, setOpen] = useState(false);
    const [isSaveChart, setIsSaveChart] = useState(false);
    const [displayResult, setDisplayResult] = useState(false);

    const editor = useRef();

    const [runCode, runCodeData] = useLazyQuery(RUN_CODE, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: () => {
            setDisplayResult(true);
        }
    });

    const [saveCode] = useMutation(SAVE_CODE, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: () => {
            console.log("Code is saved");
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
        onCompleted: () => {
            setDisplayResult(true);
        }
    });

    useEffect( () => {
        if(problem['need_flowchart'] && problem['need_flowchart'] === 'YES'){
            setIsFlowchart(true);
        }
        else{
            setIsFlowchart(false);
        }
        setLanguage('java');
    }, []);

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

    const executeCode = (sample) => () => {
        setIsSample(sample);
        setDisplayResult(false);

        let data = {};
        const sourceType = isFlowchart ? 'flowchart' : 'code';

        setIsSaveChart(true);

        if(!isFlowchart){
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

        if(isFlowchart){
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
                type: 'preview'
            }
        }

        compileCode({
            variables: {
                ...variables
            }
        });
    }

    return (
        <div> 
            <div>
                <Grid container spacing={1}>
                    <Grid item sm={5}>
                        <Paper className={classes.paper}>
                            {
                                !problem || !problem.problem_description ? (
                                    <CircularProgress size={75} color='primary' className={classes.progress} />
                                ) : (
                                    <ProblemStatement source={props.source} setManage={props.setManage} />
                                )
                            }   
                        </Paper>
                    </Grid>
                    <Grid item sm={7}>
                        <div>
                            {
                                !isFlowchart ? (
                                    loadCodeData.loading ? (
                                        <CircularProgress size={50} color='primary' />
                                    ) : (
                                        <CodeEditor onSelect={onLanugageChange} selectedLanguage={language}
                                            code={loadCodeData.data ? loadCodeData.data.loadCode.code : ""} filename={filename} handleFilename={handleFilename} 
                                            editor={editor}
                                        />
                                    )
                                ) : (
                                    <Flowchart isSaveChart={isSaveChart} problem={props.source.source} />
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
                                <Testcase testcase_result={compileCodeData.data.compileCode.result} />
                                <ScoreDialog score={compileCodeData.data.compileCode.score} />
                            </div>
                       )
                    )
                )
            }
            <Backdrop open={runCodeData.loading || compileCodeData.loading} className={classes.backdrop}>
                <CircularProgress color='primary' size={30} />
            </Backdrop>
        </div>
    )   
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    flowChart: state.flowChart,
});

export default connect(mapStateToProps, null)(CompileCode);