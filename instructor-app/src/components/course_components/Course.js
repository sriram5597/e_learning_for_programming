import React, { useEffect } from 'react';

//graphql
import { useQuery } from '@apollo/react-hooks';
import { GET_COURSE } from '../../graphql/queries/courseQueries';

//utils
import StatusBar from '../../utils/StatusBar';
import TipButton from '../../utils/TipButton';

//components
import Level from './Level';

//MUI
import  { Container, Typography, Button, Grid, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { Edit } from '@material-ui/icons';

const useStyles = makeStyles( theme => ({
    container: {
        position: 'relative',
        backgroundColor: '#ffff',
        marginTop: 30,
    },

    content: {
        padding: 20,

    },

    coverNoImg: {
        height: "350px",
        marginBottom: 0,
        backgroundColor: 'rgba(169, 169, 169, 0.3)'
    },

    title: {
        position: "relative",
        left: "5%",
        color: '#ffffff',
        zIndex: 4,
    },

    button: {
        position: "relative", 
        left: "70%",
        margin: 10,
    },

    header: {
        height: "350px",
        marginBottom: 0,
    },

    grid: {
        position: "relative",
        maxWidth: "100%",
        maxHeight: "50%",
        top: "28%"
    },

    list: {
        marginBottom: 10
    },

    loading: {
        left: '30%',
        top: '40%',
    },

    upload: {
        position: 'relative',
        left: '95%',
        top: '83%',
    }
}));

const Course = (props) => {
    const classes = useStyles();
    const course_id = props.match.params.courseId;
    
    const { data, loading, error } = useQuery(GET_COURSE, {
        variables: {
            course_id
        }
    });

    const course = data ? data.getCourse : {};

    const handleModify = () => {
        window.location.pathname = `/course/${course_id}/manage`;
    }
    
    const handleDelete = () => {
        //props.deleteCourse(courseId);
    }

    const handleUpload = () => {
        document.getElementById('file').click();
    }

    const handleFile = (e) => {
        const file = e.target.files[0];
        const ext = file.name.split('.')[1]
        if(ext !== 'jpg' && ext !== 'png'){
            alert('Invalid File Format');
            return;
        }

        let data = new FormData();
        data.append('image', file, file.name);
        //props.uploadCourseImage(data, courseId, 'cover');
    }
    
    return (
        <div>
            {
                error && (
                    <StatusBar status="ERROR" text={error.message} />
                )
            }
        
            <Container className={classes.container}>
                { loading ? (
                    <CircularProgress color='primary' size={20} className={classes.loading}/>
                ) : (
                    <div className={classes.content}>
                        <div className={course.cover_image_key !== "" ? classes.header : classes.coverNoImg} 
                                style={{backgroundImage: `url(${course.cover_image_url})`, opacity: 0.8}}
                        >
                            
                            <TipButton onClick={handleUpload} tip="upload picture" btnColor='primary' btnClassName={classes.upload}>
                                <Edit />
                            </TipButton>

                            <input type="file" id="file" onChange={handleFile} hidden={true} />

                            <Grid container spacing={3} className={classes.grid}>
                                <Grid item sm={8}>
                                    <div>
                                        <Typography variant="h2" className={classes.title}>
                                            {course.course_title}
                                        </Typography>
                                    </div>
                                </Grid>
                                <Grid item sm={4}>

                                </Grid>
                                <Grid container>
                                    <Grid item sm={10}>
                        
                                    </Grid>
                                    <Grid item sm={2}>
                                        
                                    </Grid>
                                </Grid>
                            </Grid>
                        </div>

                        <hr size="1"/>
                        <span>
                            <Button variant="contained" color="secondary" onClick={handleDelete} className={classes.button}>
                                Delete Course
                            </Button>
                            <Button variant="outlined" color="primary" onClick={handleModify} className={classes.button}>
                                Manage Course
                            </Button> 
                        </span>

                        <Typography variant="h5" component="h6" color="primary">
                            Description
                        </Typography>
                        <br/>
                        <Typography variant="body1" component="p">
                            {course.description}
                        </Typography>
                        <br/><br/>
                        <Typography variant="h5" component="h6" color="primary">
                            Outcomes
                        </Typography>
                        <ul>
                            {
                                course.outcomes && course.outcomes.map( (outcome, index) => {
                                    return <li key={index} className={classes.list}>{outcome}</li>
                                })
                            }
                        </ul>
                        <br/><br/>
                        <Typography variant="h5" component="h6" color="primary">
                            Pre-Requisites
                        </Typography>
                        <ul>
                            {
                            course.pre_requisites &&  course.pre_requisites.map( (requisite, index) => {
                                    return (
                                        <li key={index} className={classes.list}>
                                            {requisite}
                                        </li>
                                    );
                                })
                            }
                        </ul>
                        <br/><br/>
                        {
                            (course.levels.length === 0) ? (
                                <div>
                                    <Typography variant="h5" color="primary">
                                        Learning Path
                                    </Typography><br/>
                                </div>
                            ) : (
                                <Level levels={course.levels} />
                            )
                        }
                        
                    </div>
                )}
            </Container>
        </div>
    );
}

// const mapStateToProps = (state) => ({
//     course: state.course,
//     module: state.module,
// });

// const mapActionsToProps = {
//     getCourse,
//     getModules,
//     deleteCourse,
//     uploadCourseImage,

export default Course;