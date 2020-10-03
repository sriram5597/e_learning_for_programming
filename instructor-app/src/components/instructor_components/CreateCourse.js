import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';

//hooks
import useForm from '../../hooks/useForm';

//graphql
import { useMutation, useQuery } from '@apollo/react-hooks';
import { CREATE_COURSE } from '../../graphql/mutation/courseMutations';
import { GET_CATEGORIES } from '../../graphql/queries/courseQueries';

//utils
import StatusBar from '../../utils/StatusBar';
import TipButton from '../../utils/TipButton';

//MUI
import { TextField, Button, Typography, Card, CardContent, CircularProgress } from '@material-ui/core';
import { Select, MenuItem } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent } from '@material-ui/core';

//MUI/styles
import { makeStyles } from '@material-ui/styles';

//MUI/icon
import { AddCircle } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    course_title: {
        position: 'relative',
        marginTop: "20px",
        textAlign: "center",
        textDecoration: "bold"
    },

    card: {
        width: "75%",
        marginLeft: "10%",
        minHeight: "800px",
        marginTop: "30px",
        postition: "relative"
    },

    content: {
        padding: "20px",
    },

    text: {
        position: "relative",
        marginLeft: "80px",
        width: "90%",
        marginTop: "30px",
        fontSize: "30px"
    },

    button: {
        margin: "20px",
        float: "right",
        marginRight: "150px",
        width: "150px"
    },

    category: {
        position: 'relative',
        width: '25%',
    },

    select: {
        position: 'relative',
        height: 35,
        left: '40%',
    }
}));

const CreateCourse = (props) => {
    const classes = useStyles();
    const [form, handleChange] = useForm({});

    const history = useHistory();
    
    const { data } = useQuery(GET_CATEGORIES);
    const [createCourse, { loading }] = useMutation(CREATE_COURSE, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: (data) => {
            console.log(data);
            history.push(`/course/${data.createCourse.message}/manage`);
        }
    });

    const [err, setErr] = useState({});
    const [category, setCategory] = useState();
    const [open, setOpen] = useState(false);
    const [cats, setCats] = useState();
    const [selectedCat, setSelectedCat] = useState();

    useEffect( () => {
        if(data){
            const temp = data.getCategories.map( (cat) => {
                return cat.category
            });
    
            setCats(temp);
        }
    }, [data]);

    const handleCategory = (e) => {
        setSelectedCat(e.target.value);
    }

    const handleNewCategory = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const addNewCategory = () => {
        setCats([...cats, category])
        setSelectedCat(category);
        setOpen(false);
    }

    const handleSubmit = (event) => {
        const msg = 'should not be empty';
        setErr({
            course_title: (!form.course_title) ? `Title ${msg}` : undefined,
            description: (!form.description) ? `Description ${msg}` : undefined,
            outcomes: (!form.outcomes) ? `Outcomes ${msg}` : undefined,
            pre_requisites: (!form.pre_requisites) ? `Pre-requisites ${msg}` : undefined 
        });
        
        if(!(err.course_title || err.description || err.outcomes || err.pre_requisites)){
            let outcome_array = form.outcomes.split('\n');
            let prerequisite_array = form.pre_requisites.split('\n');

            const data = {
                ...form,
                category: selectedCat,
                outcomes: outcome_array,
                pre_requisites: prerequisite_array,
            }

            createCourse({
                variables: {
                    course: data
                }
            });
        }
    }

    return (
        <div>
            <div>
                <Typography variant="h3" component="h3" color="primary" align="center" className={classes.course_title}>
                    Create Course
                </Typography>
            </div>

            <Card className={classes.card}>
                <CardContent className={classes.content}>
                        <TextField name="course_title" variant="outlined" 
                                    label="Title" placeholder="Enter Course Title"
                                    className={classes.text} onChange={handleChange}
                                    error={err.course_title ? true : false} helperText={(err.course_title) ? err.course_title : null}
                        /><br/>
                        <TextField name="description" multiline variant='outlined'
                                    rows="8" label="Description" placeholder="Enter Course Description"
                                    className={classes.text} onChange={handleChange}
                                    error={err.description ? true : false} helperText={err.description} 
                        /><br/>
                        <TextField name="outcomes" label="Outcome" variant="outlined" multiline rows="8"
                                    placeholder="Enter Outcomes each in a new line"
                                    className={classes.text} onChange={handleChange}
                                    error={err.outcomes ? true : false} helperText={err.outcomes}
                        /> 
                        <TextField  name="pre_requisites" label="Pre-requisites" multiline rows="5"
                                    className={classes.text} onChange={handleChange} variant="outlined"
                                    placeholder="Enter Pre-requisites" error={err.pre_requisites ? true : false} helperText={err.pre_requisites}
                        />
                        <TextField  name="price" label="Price" className={classes.text} onChange={handleChange} variant="outlined"
                                    placeholder="Enter Pre-requisites" error={err.price ? true : false} helperText={err.price}
                        /><br/>
                        <div className={classes.text}>
                            <Typography variant='subtitle1'>
                                <strong>
                                    Select Category
                                </strong>
                            </Typography>
                            <Select defaultValue={selectedCat} onChange={handleCategory} variant="outlined" className={classes.category}>
                                {
                                    cats && cats.map( (cat, index) => {
                                        return (
                                            <MenuItem key={index} value={cat}>
                                                {cat}
                                            </MenuItem>
                                        )
                                    })
                                }
                                <span className={classes.select}>
                                    <TipButton btnColor="primary" onClick={handleNewCategory} tip="Add new Category">
                                        <AddCircle fontSize="inherit"/>
                                    </TipButton>
                                </span>
                            </Select>

                        </div>
                </CardContent>
                    <Button name="submit" variant="contained" color="primary" disabled={loading} className={classes.button} 
                            onClick={handleSubmit}
                    >
                        Create
                        {loading && <CircularProgress size={30}/>}
                    </Button>
            </Card>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogContent>
                    <TextField variant='outlined' color='primary' onChange={(e) => setCategory(e.target.value)} label="Add New Category"
                            placeholder="Enter new category" fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button color='primary' variant='contained' onClick={addNewCategory}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </div>

    );
}

export default CreateCourse;