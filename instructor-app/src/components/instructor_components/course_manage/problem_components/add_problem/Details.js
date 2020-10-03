import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { ADD_SOURCE } from '../../../../../graphql/mutation/courseFlowMutations';

//utils
import TextEditor from '../../../../../utils/customEditor/text_editor/TextEditor';

//MUI
import { TextField, Button, Card, CardContent, CardActions, Typography, Select, MenuItem, Backdrop, CircularProgress } from '@material-ui/core';

//MUI/styles
import { makeStyles } from '@material-ui/styles';

//draft-js
import { EditorState, convertToRaw } from 'draft-js';

const useStyles = makeStyles( (theme) => ({
    title: {
        position: 'relative',
        marginTop: "20px",
        textAlign: "center",
        textDecoration: "bold"
    },

    card: {
        width: "99%",
        minHeight: "800px",
        postition: "relative"
    },

    content: {
        padding: "20px",
    },

    text: {
        position: "relative",
        marginLeft: "60px",
        width: "90%",
        marginTop: "30px",
        fontSize: "30px",
        padding: 8,
    },

    desc: {
        position: 'relative',
        marginTop: 15,
        left: '5%',
    },

    button: {
        left: "80%",
        width: "150px"
    },

    sub_module: {
        position: 'relative',
        marginLeft: '60px',
        width: '25%',
        marginTop: 25,
    },

    backdrop: {
        zIndex: 4,
        color: '#fff',
    }
}));

const Details = (props) => {
    const classes = useStyles();

    const ed_state = EditorState.createEmpty();

    const [editorState, setEditorState] = useState(ed_state);
    const [inputFormat, setInputFormat] = useState(EditorState.createEmpty());
    const [outputFormat, setOutputFormat] = useState(EditorState.createEmpty());
    const [constraints, setConstraints] = useState(EditorState.createEmpty());

    const [data, setData] = useState({
        need_flowchart: 'YES'
    });

    const [addSource, { loading }] = useMutation(ADD_SOURCE, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: () => {
            props.setOpen(false);
        },
        update: (cache, { data }) => {
            props.updateAfterMutation(cache, data.addSource);
        }
    });

    //ui
    const [err, setErr] = useState({});

    const handleChange = (event) => {
        setData({
            ...data,
            [event.target.name]: event.target.value
        });
    }

    const handleEditor = (editorState) => {
        setEditorState(editorState);
    }

    const handleInputFormat = (editorState) => {
        setInputFormat(editorState);
    }

    const handleOutputFormat = (editorState) => {
        setOutputFormat(editorState);
    }

    const handleConstraints = (editorState) => {
        setConstraints(editorState);
    }

    const handleSubmit = (event) => {   
        data.constraints = JSON.stringify(convertToRaw(constraints.getCurrentContent()));
        data.problem_description = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        data.input_format = JSON.stringify(convertToRaw(inputFormat.getCurrentContent()));
        data.output_format = JSON.stringify(convertToRaw(outputFormat.getCurrentContent()));

        addSource({
            variables: {
                course_id: props.course_id,
                title: props.title,
                source: {
                    source_title: data.source_title,
                    type: "CODE"
                },
                code: {
                    problem_description: data.problem_description,
                    constraints: data.constraints,
                    input_format: data.input_format,
                    output_format: data.output_format,
                    max_score: parseInt(data.max_score),
                    need_flowchart: data.need_flowchart
                }
            }
        });
    }

    return (
        <div>
            <Backdrop open={loading} className={classes.backdrop}>
                <CircularProgress size={50} color='primary' />
            </Backdrop>

            <Card className={classes.card}>
                <CardContent className={classes.content}>
                    <TextField name="source_title"  variant='filled' label='Problem Title' placeholder='Enter Problem Title'
                        className={classes.text} onChange={handleChange}
                        error={err['source_title'] ? true : false} helperText={err['source_title']} 
                    />
                    <span>
                        <Typography variant="h6" className={classes.desc}>
                            Problem Description
                        </Typography>
                        
                        <TextEditor placeholder="Write problem description" propsUpdate={handleEditor}/>
                    </span>
                    <span>
                        <Typography variant='h6' className={classes.desc}>
                            Input Format
                        </Typography>
                        <TextEditor placeholder="Enter Input Format" propsUpdate={handleInputFormat} />
                    </span>
                    <span>
                        <Typography variant='h6' className={classes.desc}>
                            Output Format
                        </Typography>
                        <TextEditor placeholder="Enter Output Format" propsUpdate={handleOutputFormat} />
                    </span>
                    <span>
                        <Typography variant='h6' className={classes.desc}>
                            Constraints
                        </Typography>
                        <TextEditor placeholder="Enter Testcase Constraints" propsUpdate={handleConstraints} />
                    </span>
                    
                    <div className={classes.desc}>
                        <Typography variant='h6'>
                            Need Flowchart?
                        </Typography>
                        <Select name="need_flowchart" value={data.need_flowchart} onChange={handleChange} variant='outlined'>
                            <MenuItem value="YES">
                                YES
                            </MenuItem>
                            <MenuItem value="NO">
                                NO
                            </MenuItem>
                        </Select>
                    </div>

                    <TextField name='max_score' variant='filled' label='Xp Points' placeholder="Enter Xp Points" onChange={handleChange}
                            error={err['max_score'] ? true : false} helperText={err['max_score']} fullWidth color='primary'
                            className={classes.text}
                    />
                </CardContent>

                <CardActions>
                    <Button variant='contained' color='primary' onClick={handleSubmit} className={classes.button}>
                        Create
                    </Button>
                </CardActions>
            </Card>          
        </div>

    );
}

export default Details;