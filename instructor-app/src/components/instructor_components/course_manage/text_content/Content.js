import React, { useState, useEffect, useRef } from 'react';

//graphql
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { UPDATE_CONTENT } from '../../../../graphql/mutation/contentMutation';
import { RUN_CODE } from '../../../../graphql/queries/problemQueries';

//components
import AddTitle from './AddTitle';
import Output from '../../../problem/Output';
import ContentView from '../../../content/ContentView';
import AddFlowchart from './AddFlowchart';

//draft-js
import { convertToRaw, EditorState, convertFromRaw } from 'draft-js';

//utils
import TipButton from '../../../../utils/TipButton';
import TextEditor from '../../../../utils/customEditor/text_editor/TextEditor';
import CodeEditor from '../../../../utils/code_editor/CodeEditor';
import UpdateSnackbar from '../../../../utils/UpdateSnackbar';

//mui
import { Grid, List, Paper, Typography, MenuItem, TextField, Button, CircularProgress, Backdrop } from '@material-ui/core';

//mui/icons
import { AddCircle, Save, Visibility, VisibilityOff, Delete, Edit } from '@material-ui/icons';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    select: {
        position: 'relative',
        width: '30%',
        margin: 25,
        float: 'right',
    },
    titles: {
        position: 'relative',
        margin: 30,
        padding: 20,
        minHeight: '50vh',
    },
    addButton: {
        position: 'relative',
        left: '40%',
    },
    root: {
        marginTop: 30
    },
    codeEditor: {
        position: 'relative',
        height: '50%',
    }
}));

const Content = (props) => {
    const classes = useStyles();

    const codeEditor = useRef(null);

    const [contents, setContents] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [sourceTitle, setSourceTitle] = useState();
    const [type, setType] = useState('');
    const [preview, setPreview] = useState(false);
    const [isExecute, setIsExecute] = useState(false);
    const [editorState, setEditorState] = useState();
    const [code, setCode] = useState({});
    const [input, setInput] = useState();

    const [runCode, runCodeData] = useLazyQuery(RUN_CODE, {
        onError: (err) => {
            console.log(err);
        }
    });

    const [updateContent, updateContentData] = useMutation(UPDATE_CONTENT, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            props.updateAfterMutation(cache, data, 'updateContent');
        }
    });

    useEffect( () => {
        setSourceTitle(props.source.source_title);
        setContents(props.source.source.content);
    }, []);

    useEffect( () => {
        if(contents.length > 0 && selectedIndex !== -1){
            if(contents[selectedIndex].type === 'PARAGRAPH'){
                if(contents[selectedIndex].content !== ''){
                    setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(contents[selectedIndex].content))));
                }
                else{
                    setEditorState(EditorState.createEmpty());
                }
            }
            else{
                setCode({
                    language: contents[selectedIndex].lagnuage,
                    code: contents[selectedIndex].code
                });
            }   
        }
    }, [selectedIndex]);

    const handleAdd = () => {
        setType('ADD');
    }

    const handleNewContent = (data) => {
        const temp = [...contents, data];

        setContents(temp);
        setSelectedIndex(temp.length - 1);  
        setEditorState(EditorState.createEmpty());
        setType(data.type);
    }

    const handleSelectContent = (index, type) => () => {
        setSelectedIndex(index);
        setType(type);
    }
    
    const handleEditor = (edState) => {
        setEditorState(edState);
    }

    const handleFlowchart = (e) => {
        setFlowchartImage(e.target.files[0]);
    }

    const handleUpdateContent = () => {
        const data = contents.map( (con, index) => {
            console.log(con);
            if(con.type === 'PARAGRAPH'){
                if(index === selectedIndex){
                    return {
                        title: con.title,
                        type: con.type,
                        content: JSON.stringify(convertToRaw(editorState.getCurrentContent()))
                    }
                }
                return {
                    title: con.title,
                    type: con.type,
                    content: con.content
                }
            }

            if(index === selectedIndex){
                return {
                    title: con.title,
                    type: con.type,
                    code: codeEditor.current(),
                    language: code.language
                }
            }

            return {
                title: con.title,
                type: con.type,
                code: con.code,  
                language: con.language
            }
        });

        console.log(data);

        updateContent({
            variables: {
                content_id: props.source.source.content_id,
                content: data
            }
        });
    }

    const handleCodeLanguageSelect = (e) => {
        setCode({
            ...code,
            language: e.target.value
        })
    }

    const handleInput = (e) => {
        setInput(e.target.value);
    }

    const handleExecute = () => {
        runCode({
            variables: {
                source_type: 'code',
                input: input,
                code: {
                    code: code.code,
                    language: code.language,
                    filename: "Main.java"
                }
            }
        });

        setIsExecute(true);
    }

    const togglePreview = () => {
        setPreview(!preview);
    }

    const handleDeleteContent = () => {
        let data = contents.filter( (con, index) => index !== selectedIndex);

        setContents(data);
        
        const updatedData = data.map( (con) => {
            return {
                title: con.title,
                type: con.type,
                content: type === 'PARAGRAPH' ? con.content : '',
                code: type === 'CODE' ? con.code : '',
                language: type === 'CODE' ? con.language : ''
            }
        });

        updateContent({
            variables: {
                content_id: props.source.source.content_id,
                content: updatedData
            }
        });

        setType("");
        setSelectedIndex(-1);
    }

    const getComponent = (t) => {
        if(t){
            switch(t){
                case 'PARAGRAPH':
                    return editorState ? (
                            <TextEditor editorState={editorState} propsUpdate={handleEditor} />
                        ) : (
                            "Loading..."
                        )
                    
                case 'CODE':
                    return code ? (
                        <div>
                            <CodeEditor editor={codeEditor} filename="Main" language={code.language}
                                onSelect={handleCodeLanguageSelect} className={classes.codeEditor} code={code.code}
                            />
                            <TextField variant='outlined' onChange={handleInput} color='primary' multiline rows="4" value={input} />
                            <Button color='primary' variant='contained' onClick={handleExecute}>
                                Execute
                            </Button>
                            {
                                isExecute && (
                                    <Output output={runCodeData.data ? runCodeData.data.runCode.output : ""} />
                                )
                            }
                        </div>
                    ) : (
                        "Loading..."
                    )
                
                case 'FLOWCHART':
                    return <AddFlowchart content_id={props.source.source.content_id} index={selectedIndex} title={contents[selectedIndex].title} />
                
                case 'ADD':
                    return <AddTitle addContent={handleNewContent} />

                default:
                    return 'select content';
            }
        }
    }

    return (
        <div className={classes.root}>
            <span>
                <Typography variant='h4' color='primary'>
                    {sourceTitle}
                </Typography>
                <TipButton btnColor='primary' tip='Preview Content' onClick={togglePreview}>
                    {
                        !preview ? ( 
                            <Visibility fontSize='large' />
                        ) : (
                            <VisibilityOff fontSize='large' />
                        )
                    }
                </TipButton>
            </span>
            {
                !preview ? (
                    <Grid container spacing={2}>
                        <Grid item xs={2}>
                            <Paper className={classes.titles}>
                                <Typography variant='h6'>
                                    Title
                                </Typography>
                                <List>
                                    {
                                        contents.length > 0 && (
                                            contents.map( (con, index) => {
                                                return (
                                                    <MenuItem key={index} onClick={handleSelectContent(index, con.type)}>
                                                        {con.title}
                                                    </MenuItem>
                                                )
                                            })
                                        )
                                    }
                                    <TipButton btnColor='primary' tip='add content' className={classes.addButton} onClick={handleAdd}>
                                        <AddCircle />
                                    </TipButton>
                                </List>
                            </Paper>
                        </Grid>
                        <Grid item xs={10}>
                            {
                                selectedIndex !== -1 && (
                                    <span>
                                        <TipButton btnColor='primary' tip='Save Content' onClick={handleUpdateContent}>
                                            <Save fontSize='large' />
                                        </TipButton>
                                        <TipButton btnColor='secondary' tip='Delete Content' onClick={handleDeleteContent}>
                                            <Delete fontSize='large' />
                                        </TipButton>
                                    </span>
                               )
                            }
                            {getComponent(type)}
                        </Grid>
                    </Grid>
                ) : (
                    <ContentView contents={contents} title={sourceTitle} />
                )
            }
        </div>
    )
}

export default Content;