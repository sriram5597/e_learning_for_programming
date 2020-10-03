import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { ADD_QUESTION } from '../../../../graphql/mutation/mcqMutations';

//utils
import TipButton from '../../../../utils/TipButton';

//MUI
import { Button, Typography, TextField, Select, MenuItem, } from '@material-ui/core';
import { Dialog, DialogContent, DialogActions, DialogTitle } from '@material-ui/core';
import { RadioGroup, Radio, CircularProgress} from '@material-ui/core';

//MUI/icons
import { RemoveCircle, AddCircle } from "@material-ui/icons";

//MUI Styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    dialogContent: {
        padding: 20
    },
    content: {
        position: "relative",
        margin: 20
    },
    text: {
        position: "relative",
        margin: 20,
        width: "90%"
    }
}));

const AddMCQ = (props) => {
    const classes = useStyles();

    const [addQuestion, { loading }] = useMutation(ADD_QUESTION, {
        onError: (err) => {
            console.log(err);
            console.log(err.graphQLErrors);
            console.log(err.extraInfo);
        },
        update: (cache, { data }) => {
            props.updateAfterMutation(cache, data, 'addQuestion');
        },
        onCompleted: () => {
            setOpen(false);
        }
    });

    const [open, setOpen] = useState(false);

    const [opt, setOpt] = useState(['a', 'b', 'c', 'd']);
    const [selectedOption, setSelectedOption] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [type, setType] = useState('MCQ');
    
    const [data, setData] = useState({});
    const [options, setOptions] = useState([]);
    const [answer, setAnswer] = useState();

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleSelectOption = (op) => () => {
        setSelectedOption(op);
    }

    const handleChange = (event) => {
        setIsSubmitted(false);
        setData({
            ...data,
            [event.target.name]: event.target.value
        })   
    }

    const removeOption = (op) => () => {
        const temp = opt.filter( (o) => o !== op);
        setOpt(temp);
    }

    const handleOptions = (op) => (event) => {
        setIsSubmitted(false);
        const ind = parseInt(op, 10);
        const temp = options;
        temp[ind] = event.target.value;
        setOptions(temp);
    }

    const handleType = (e) => {
        setType(e.target.value);
    }

    const handleAnswer = (e) => {
        setAnswer(e.target.value);
    }

    const addMCQ = () => {
        setIsSubmitted(true);
        if(data.question === "" || type === "" || options === {} || data.explanation === "")
            return;

        data['type'] = type;
        data['answer'] = type === 'MCQ' ? `${selectedOption}` : answer.toLowerCase();
        
        if(type === 'MCQ'){
            data['options'] = options;
        }
        
        addQuestion({
            variables: {
                mcq_id: props.source.source.mcq_id,
                question: {
                    ...data
                }
            }
        });
    }

    const getOptions = (
        <RadioGroup value={selectedOption} name="option">
            {
                opt.map( (op, index) => {
                    return (
                        <span className={classes.content} key={op}>
                            <Radio checked={selectedOption === index} value={index} onChange={handleSelectOption(index)}/>
                            <TextField color="primary" style={{width: "70%"}} name={op} onChange={handleOptions(index)}
                                    error={(!isSubmitted) || (options[op] && options[op] !== "") ? false : true} 
                                    helperText={"Cannot be Empty"}
                            />
                            <TipButton tip="remove" btnColor="secondary" onClick={removeOption(op)}>
                                <RemoveCircle/>
                            </TipButton>
                        </span>
                    )
                })
            }
        </RadioGroup>
    )

    return (
        <div>
            <TipButton btnColor="primary" tip="add question" onClick={handleOpen}>
                <AddCircle />
            </TipButton>

            <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
                <DialogTitle>
                    <Typography color="primary">
                        Add MCQ
                    </Typography>
                </DialogTitle>
                <DialogContent className={classes.dialogContent}>
                    <TextField fullWidth label="Question" name="question" onChange={handleChange} 
                            error={!isSubmitted || (data.question && data.question !== "") ? false : true}
                            variant="filled" color="primary" placeholder="enter question" className={classes.text}
                            helperText={"Cannot be empty"} multiline rows={4}
                    />
                    Select Type: <Select value={type} onChange={handleType} className={classes.text}>
                        {
                            ['MCQ', 'NO CHOICE'].map( (t, index) => {
                                return (
                                    <MenuItem key={index} value={t}>
                                        {t}
                                    </MenuItem>
                                )
                            })
                        }
                    </Select>

                    {
                        type === 'MCQ' ? getOptions : (
                            <TextField fullWidth label="Answer" variant="filled" color="primary" palceholder="Enter Answer for this question"
                                name="explanation" className={classes.text} onChange={handleAnswer} 
                                error={!isSubmitted || (data.answer && data.answer !== "") ? false : true}
                                helperText={"Cannot be empty"}
                            />
                        )
                    }

                    <TextField fullWidth label="Explanation" variant="filled" color="primary" palceholder="Enter Explanation for this question"
                            name="explanation" className={classes.text} onChange={handleChange} multiline rows={4}
                            error={!isSubmitted || (data.explanation && data.explanation !== "") ? false : true}
                            helperText={"Cannot be empty"}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" variant="outlined" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button color="primary" variant="contained" onClick={addMCQ} disabled={loading}>
                        Create
                        {
                            loading && <CircularProgress size={30} color="primary"/>
                        }
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default AddMCQ;