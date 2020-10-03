import React, { useState, useEffect, useRef } from 'react';

//graphql
import { useLazyQuery } from '@apollo/react-hooks';
import { RUN_CODE } from '../../graphql/queries/problemQueries';

//components
import Output from '../problem/Output';

//utils
import CodeView from '../../utils/code_editor/CodeView';
import TipButton from '../../utils/TipButton';

//mui
import { Button, TextField, Backdrop } from '@material-ui/core';

//mui/icons
import { Edit, Close } from '@material-ui/icons';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        position: 'relative',
        height: '30vh',
        padding: 10,
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
    const [viewOutput, setViewOutput] = useState(false);

    const codeEditor = useRef(null);

    const [runCode, runCodeData] = useLazyQuery(RUN_CODE, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: () => {
            setViewOutput(true);
        }
    })

    useEffect( () => {
        setData({
            code: props.code,
            language: props.language,
            input: "",
            filename: "Main.java",
        });
    }, []);

    const handleInput = (e) => {
        setData({
            ...data,
            input: e.target.value
        });
    }

    const handleExecute = () => {
        console.log(data);
        
        runCode({
            variables: {
                source_type: 'code',
                input: data.input ? data.input : "",
                code: {
                    code: data.code,
                    filename: data.filename,
                    language: "java"
                }
            }
        });
    }

    const toggleReadOnly = () => {
        setReadOnly(!readOnly);
    }

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
            <Backdrop loading={runCodeData.loading} className={classes.backdrop} />
            {
                runCodeData.data && (
                    <Output output={runCodeData.data.runCode.output} />
                )
            }
        </div>
    )
}

export default ViewCode;