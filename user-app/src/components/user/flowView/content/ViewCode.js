import React, { useState, useEffect, useRef } from 'react';

//graphql
import { useLazyQuery } from '@apollo/react-hooks';
import { RUN_CODE } from '../../../../graphql/queries/problemQueries';

//components
import Output from '../../../problem/Output';

//utils
import CodeView from '../../../../utils/code_editor/CodeView';
import TipButton from '../../../../utils/TipButton';
import UpdateSnackbar from '../../../../utils/UpdateSnackbar';

//mui
import { Button, TextField, Backdrop, CircularProgress } from '@material-ui/core';

//mui/icons
import { Edit, Close } from '@material-ui/icons';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        minHeight: '5vh'
    },
    controls: {
        margin: 20,
        float: 'right',
    },
    button: {
        float: 'right',
        margin: 10
    },
    text: {
        marginRight: 10,
        width: '50vh',
    },
    backdrop: {
        zIndex: 4,
        color: '#fff'
    }
}));

const ViewCode = (props) => {
    const classes = useStyles();

    const [readOnly, setReadOnly] = useState(true);
    const [data, setData] = useState({});
    const [error, setError] = useState();
    const [openSnack, setOpenSnack] = useState(false);
    const [message, setMessage] = useState();

    const codeEditor = useRef(null);

    const [runCode, runCodeData] = useLazyQuery(RUN_CODE, {
        onError: (err) => {
            setError(err.message);
            setOpenSnack(true);
        },
        onCompleted: () => {
            setMessage("code executed");
            setOpenSnack(true);
        }
    });

    useEffect( () => {
        setData({
            code: props.code,
            language: 'java',
            input: "",
            filename: "Main.java",
            source_type: "code"
        });
    }, []);

    const handleInput = (e) => {
        setData({
            ...data,
            input: e.target.value
        });
    }

    const handleExecute = () => {
        console.log(codeEditor.current());
        console.log({
            source_type: 'code',
            input: '',
            code: {
                code: codeEditor.current(),
                language: "java",
                filename: "Main.java"
            } 
        });

        runCode({
            variables: {
                source_type: 'code',
                input: data.input,
                code: {
                    code: codeEditor.current(),
                    language: "java",
                    filename: "Main.java"
                } 
            }
        });
    }

    const toggleReadOnly = () => {
        setReadOnly(!readOnly);
    }

    console.log(data);

    return (
        <div className={classes.root}>
            {
                readOnly ? (
                    <TipButton tip="Edit" onClick={toggleReadOnly} btnColor="primary" className={classes.button}>
                        <Edit />
                    </TipButton>
                ): (
                    <TipButton tip="cancel" onClick={toggleReadOnly} btnColor="secondary" className={classes.button}>
                        <Close />
                    </TipButton>
                )
            }
            
            <CodeView readOnly={readOnly} code={data.code} language={data.language} editor={codeEditor} />
            <div>
                {
                    !readOnly && (
                        <div className={classes.controls}>
                            <TextField variant='outlined' multiline rows="3" onChange={handleInput} placeholder="Enter Intput" label="Input" 
                                className={classes.text}
                            />
                            <Button variant='contained' color='primary' onClick={handleExecute}>
                                Run
                            </Button>
                        </div>
                    )
                }
                {
                    runCodeData.data && (
                        <Output output={runCodeData.data.runCode.output} />
                    )
                }
                <Backdrop open={runCodeData.loading} className={classes.backdrop}>
                    <CircularProgress size={50} color='primary' />
                </Backdrop>
            </div>
            <UpdateSnackbar status={error ? "ERROR" : "SUCCESS"} msg={error ? error : message} open={openSnack} />
        </div>
    )
}

export default ViewCode;