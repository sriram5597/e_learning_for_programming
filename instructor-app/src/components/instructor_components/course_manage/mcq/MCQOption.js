import React, { useState } from 'react';

//utils
import TipButton from '../../../../utils/TipButton';

//MUI
import { Typography, FormControl, FormControlLabel, RadioGroup, Radio, FormLabel } from '@material-ui/core';
import { TextField } from '@material-ui/core';

//MUI/styles
import { makeStyles } from '@material-ui/styles';

//MUI/icons
import { CheckCircle, Edit, Close, Add, Cancel } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    check: {
        position: "relative",
    },
    edit: {
        position: "absloute",
        float: "right",
    },
    updateButton: {
        position: "relative",
        float: "right"
    },
    saveButton: {
        position: "absolute",
        float: "right"
    },
    answer: {
        color: theme.palette.success.main,
        textDecoration: 'bold',
    }
}));

const MCQOption = (props) => {
    const classes = useStyles();

    const [options, setOptions] = useState(props.mcq.options);
    const [selectedOption, setSelectedOption] = useState(props.mcq.answer);
    const [editOption, setEditOption] = useState();
    const [newOption, setNewOption] = useState();
    const [addError, setAddError] = useState();

    const [optionChange, setOptionChange] = useState();
    const [optionAdd, setOptionAdd] = useState();

    const answer = props.mcq.answer;

    //------Adding new Option
    const handleNewOption = (event) => {
        setNewOption(event.target.value);
        setAddError(undefined);
    }

    const addNewOption = () => {
        if(!newOption || newOption === ""){
            setAddError("Cannot be empty");
            return;
        }
        
        const data = [...options, newOption];
        
        const form = {
            options: data,
        }
        setOptions(data);

        props.update(form, props.index)
        setOptionAdd(false);
    }

    const handleOptionAdd = () => {
        setOptionAdd(true);
    }
//----------------------------------

    const handleDelete = (op) => () => {
        const temp = options.filter( (opt) => options[op] !== opt);
        setOptions(temp);
        const form = {
            options: temp
        }
        props.update(form, props.index);
    }

    const updateAnswer = (event) => {
        setSelectedOption(event.target.value);
        const data = {
            answer: event.target.value,
        }
        
        props.update(data, props.index);
    }

    const handleUpdateOption = (op) => () => {
        setEditOption(op);
    }

    const handleOptionChange = (event) => {
        setOptionChange(event.target.value);
    }

    const handleSubmitOption = (op) => () => {
        let data = options;
        data[op] = optionChange;
        setOptions(data);
        
        const form = {
            options: data
        }
        props.update(form, props.index);

        setEditOption(-1);
    }

    const handleCancelOption = () => {
        setEditOption(false);
        setOptionAdd(false);
    }

    const getRadioComponent = (
        <FormControl component="fieldset">
            <FormLabel component="legend">
                options
                <TipButton tip="add option" btnColor="primary" onClick={handleOptionAdd}>
                    <Add/>
                </TipButton>
            </FormLabel>
            <RadioGroup aria-label="options" name="option" value={selectedOption} onChange={updateAnswer}>
                {
                    options.map( (op, index) => {
                        return (
                            <span key={index}>
                                {
                                    editOption !== op && (
                                        <span>
                                            <FormControlLabel key={index} value={`${index}`} label={op} control={<Radio/>}/>
                                            <TipButton tip="delete option" btnColor="secondary" onClick={handleDelete(index)}>
                                                <Close/>
                                            </TipButton>
                                            <TipButton tip="edit option" btnColor="primary" onClick={handleUpdateOption(op)}>
                                                <Edit/>
                                            </TipButton>
                                        </span>
                                    )
                                }
                                
                                {
                                    editOption === op && (
                                        <span>
                                            <TextField fullWidth defaultValue={op} onChange={handleOptionChange}/>
                                            <TipButton tip="Ok" btnColor="primary" onClick={handleSubmitOption(index)} 
                                                        disabled={op !== optionChange ? false : true}
                                            >
                                                <CheckCircle/>
                                            </TipButton>
                                            <TipButton tip="cancel" btnColor="secondary" onClick={handleCancelOption}>
                                                <Cancel/>
                                            </TipButton>
                                        </span>
                                    )
                                }
                                
                            </span>
                        )
                    })
                }
                {
                    optionAdd && (
                        <span>
                            <TextField fullWidth onChange={handleNewOption} placeholder="Ex: Option-Text for option" label="Option"
                                    error={addError ? true : false} helperText={addError}
                            />
                            <TipButton tip="Ok" btnColor="primary" onClick={addNewOption}>
                                <CheckCircle/>
                            </TipButton>
                            <TipButton tip="cancel" btnColor="secondary" onClick={handleCancelOption}>
                                <Cancel/>
                            </TipButton>
                        </span>

                    )
                
                }
            </RadioGroup>
        </FormControl>
    )

    return (
        <div>
            {
                !props.isEdit ? (
                    <Typography variant="subtitle1">
                        Options
                    </Typography>
                ) : (
                    getRadioComponent      
                )
            }
             
            {   
                Object.keys(options).map((op, index) => {
                   return ( 
                       <div key={index}>
                            <Typography variant="h6" className={(parseInt(answer, 10) === index) ? classes.answer : null}>
                                
                                {
                                    !props.isEdit && (
                                        options[op]
                                    )
                                }
                                {
                                    !props.isEdit && answer && parseInt(answer, 10) === index && (
                                        <span>
                                            <CheckCircle fontSize="small" className={classes.check}/>
                                        </span>
                                    )
                                    
                                }
                            </Typography>                                                               
                        </div>
                   )
                })
            }
           
        </div>
    )
}

export default MCQOption;