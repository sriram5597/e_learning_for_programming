import React, { useState, useEffect, useRef } from 'react';

//graphql
import { useQuery, useMutation } from '@apollo/react-hooks';
import { GET_COURSE } from '../../../graphql/queries/courseQueries';
import { UPDATE_COURSE, PUBLISH_COURSE } from '../../../graphql/mutation/courseMutations';

//draft-js
import { convertToRaw } from 'draft-js';

//components
import UpdateDialog from './UpdateDialog';

//utils
import TipButton from '../../../utils/TipButton';

//MUI
import { Typography, Paper, IconButton, CircularProgress, Button } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//MUI/icons
import { Edit } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    paper: {
        margin: 20,
        padding: 20,
        minHeight: 500,
    },

    content: {
        position: 'relative',
        marginTop: '5px',  
        marginBottom: '10px',
    },

    title: {
        display: 'flex',
        width: '30%',
        height: 30
    },

    editButton: {
        height: 40
    },

    labels: {
        paddingTop: 5,
    },

    loading: {
        position: 'relative',
        left: '40%', 
        top: '30%',
    },

    sampleTest: {
        position: 'relative',
        margin: 25,
    },

    button: {
        float: 'right',                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
        marginRight: 15,
    },

    list: {
        position: 'relative',
        top: '3%'
    },

    image: {
        position: 'relative',
        width: '25%',
        heigth: '10%',
        borderWidth: '1px',
        borderStyle: 'solid',
        top:'5%'
    },

    cover: {
        display: 'flex',
        height: '40%',
        padding: 10
    },

    head: {
        position: 'relative',
        marginTop: '10%',
        marginLeft: '5%',
        color: '#ffffff'
    },

    body: {
        marginTop: 10,
    },

    publish: {
        float: 'right'
    }
}));

const UpdateCourse = (props) => {
    const classes = useStyles();
    const fileUpload = useRef();

    const course = useQuery(GET_COURSE, {
        variables: {
            course_id: props.course_id
        }
    });
    const [ updateCourse, updateCourseOutput] = useMutation(UPDATE_COURSE, {
        onError: (err) => {
            console.log(err);
        }
    });
    const [ publishCourse ] = useMutation(PUBLISH_COURSE, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: (data) => {
            setData(data);        
        }
    })

    const[mouseOverIndex, setMouseOverIndex] = useState(null);
    const [editField, setEditField] = useState(null);
    const [open, setOpen] = useState(false);
    const [data, setData] = useState();
    const [isModified, setIsModified] = useState(false);

    const labels = {
        description: 'Description',
        outcomes: 'Outcomes',
        pre_requisites: 'Pre-Requisites',
        price: 'Price',
    }

    useEffect( () => {
        console.log(course);
        if(course.data){
            setData({
                course_title: course.data.getCourse.course_title ? course.data.getCourse.course_title : "",
                description: course.data.getCourse.description ? course.data.getCourse.description : null,
                outcomes: course.data.getCourse.outcomes ? course.data.getCourse.outcomes.join('\n') : "",
                pre_requisites: course.data.getCourse.pre_requisites ? course.data.getCourse.pre_requisites.join('\n') : "",
                price: course.data.getCourse.price ? course.data.getCourse.price : "",
                category: course.data.getCourse.category ? course.data.getCourse.category : "",
            });
        }
    }, [course]);

    const handleEdit = (lab) => () => {
        setEditField(lab);  
        setOpen(true);
    }

    const handleMouseIn = (ind) => () =>  {
        setMouseOverIndex(ind);
    }

    const handleMouseOut = () => {
        setMouseOverIndex(null);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleUpdate = () => {
        setOpen(false);
        let updateData = {};

        Object.keys(data).map( (d, index) => {
            if(data[d] !== course.data.getCourse[d]){
                if(d === 'outcomes' || d === 'pre_requisites'){
                    updateData[d] = data[d].split('\n');
                }
                else{
                    updateData[d] = data[d];
                }
            }
            return null;
        });
    
        setIsModified(false);

        console.log(updateData);
        console.log(props.course_id);
        updateCourse({
            variables: {
                course: updateData,
                course_id: props.course_id
            }
        });
    }

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
        setIsModified(true);
    }

    const handleFileUpload = () => {
        fileUpload.current.click();
    }

    const handleFile = (e) => {
        let data = new FormData();
        
        data.append('image', e.target.files[0], e.target.files[0].name);

       // props.uploadCourseImage(data, course.course_id, 'image');
    }

    const handleDescription = (editorState) => {
        setData({
            ...data,
            description: convertToRaw(editorState.getCurrentContent())
        });
        setIsModified(true);
    }

    const handlePublish = () => {
        publishCourse({
            variables: {
                course_id: props.course_id
            }
        })
    }

    return ( 
        <div>
            {
                !data ? (
                    <CircularProgress size={30} color='primary' className={classes.loading} />
                ) : (
                    <div>
                        <Paper className={classes.paper}>
                            {
                                course && !course.data.getCourse.published && (
                                    <Button variant='contained' onClick={handlePublish} color='primary' className={classes.publish}>
                                        Publish
                                    </Button>
                                )
                            }
                            <div className={classes.cover} style={{backgroundImage: `url(${course.cover_image_url})`}}>
                                <span>
                                    <img src={course.image_url} alt='course' className={classes.image}/>
                                    <TipButton tip="Upload Picture" onClick={handleFileUpload} btnColor='primary'>
                                        <Edit />
                                    </TipButton>
                                    <input type='file' hidden={true} onChange={handleFile} ref={fileUpload} />
                                </span>
                                    <Typography variant='h4' color='primary' className={classes.head}>
                                        <strong>{data.course_title}</strong>
                                    </Typography>
                            </div>
                            <div className={classes.body}>
                                <div>
                                    <Button color='primary' variant='contained' disabled={!isModified || updateCourseOutput.loading} onClick={handleUpdate} className={classes.button}>
                                        Make Changes
                                        {
                                            updateCourseOutput.loading && (
                                                <CircularProgress size={20} color='primary' />
                                            )
                                        }
                                    </Button>
                                </div>

                                <div>
                                    <div className={classes.title} onMouseEnter={handleMouseIn('description')} onMouseLeave={handleMouseOut}>
                                        <Typography variant="h5" color='primary'>
                                            Description
                                        </Typography>
                                        {
                                            'description' === mouseOverIndex && (
                                                <IconButton onClick={handleEdit('description')} color='primary' className={classes.editButton}>
                                                    <Edit fontSize='small'/>
                                                </IconButton>
                                            )
                                        }
                                    </div>
                                    <div className={classes.content}>
                                        <Typography variant="body1">
                                            {data.description}
                                        </Typography>
                                    </div>
                                </div>

                                <div>
                                    <div className={classes.title} onMouseEnter={handleMouseIn('outcomes')} onMouseLeave={handleMouseOut}>
                                        <Typography variant="h5" color='primary'>
                                            Outcomes
                                        </Typography>
                                        {
                                            'outcomes' === mouseOverIndex && (
                                                <IconButton onClick={handleEdit('outcomes')} color='primary' className={classes.editButton}>
                                                    <Edit fontSize='small'/>
                                                </IconButton>
                                            )
                                        }
                                    </div>
                                    <div className={classes.content}>
                                        <ul className={classes.list}>
                                            {
                                                data.outcomes.split('\n').map( (out, index) => {
                                                    return (
                                                        <li key={index}>
                                                            <Typography variant="body1">
                                                                {out}
                                                            </Typography>
                                                        </li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <div className={classes.title} onMouseEnter={handleMouseIn('pre_requisites')} onMouseLeave={handleMouseOut}>
                                        <Typography variant="h5" color='primary'>
                                            Pre Requisites
                                        </Typography>
                                        {
                                            'pre_requisites' === mouseOverIndex && (
                                                <IconButton onClick={handleEdit('pre_requisites')} color='primary' className={classes.editButton}>
                                                    <Edit fontSize='small'/>
                                                </IconButton>
                                            )
                                        }
                                    </div>
                                    <div className={classes.content}>
                                        <ul>
                                            {
                                                data.pre_requisites.split('\n').map( (req, index) => {
                                                    return (
                                                        <li key={index}>
                                                            <Typography variant="body1">
                                                                {req}
                                                            </Typography>
                                                        </li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <div className={classes.title} onMouseEnter={handleMouseIn('price')} onMouseLeave={handleMouseOut}>
                                        <Typography variant="h5" color='primary'>
                                            Price
                                        </Typography>
                                        {
                                            'price' === mouseOverIndex && (
                                                <IconButton onClick={handleEdit('price')} color='primary' className={classes.editButton}>
                                                    <Edit fontSize='small'/>
                                                </IconButton>
                                            )
                                        }
                                    </div>
                                    <div className={classes.content}>
                                        <Typography variant="body1">
                                            {data.price}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </Paper>

                        <UpdateDialog field={editField} label={labels[editField]} value={data[editField]} open={open} handleClose={handleClose} 
                                data={data} handleChange={handleChange} editorState={data.description} handleUpdate={handleUpdate}
                                handleDescription={handleDescription}
                        />
                    </div>
                )
            }
        </div>
    )
}

// const mapActionsToProps = {
//     updateCourse,
//     uploadCourseImage
// }

export default UpdateCourse;