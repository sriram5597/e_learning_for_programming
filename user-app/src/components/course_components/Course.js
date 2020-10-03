import React, { useState } from 'react';
import { Link } from 'react-router-dom';

//redux
import { connect } from 'react-redux';

//graphql
import { useQuery, useMutation } from '@apollo/react-hooks';
import { GET_COURSE } from '../../graphql/queries/courseQueries';
import { GET_CURRENT_COURSE } from '../../graphql/queries/currentCourseQueries';
import { ENROLL_COURSE } from '../../graphql/mutation/currentCourseMutation';

//utils
import UpdateSnackbar from '../../utils/UpdateSnackbar';

//components
import Level from './Level';
import Head from '../Head';
import NavBar from '../NavBar';
import ReAuthenticate from '../authentication_components/ReAuthenticate';

//MUI
import  { Container, Typography, Grid, CircularProgress, Button, Backdrop } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

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
        float: 'right',
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
    },
    link: {
        textDecoration: 'none',
        color: '#ffffff',
        backgroundColor: theme.palette.primary.main,
    },
    backdrop: {
        color: '#fff',
        zIndex: 4
    }
}));

const Course = (props) => {
    const classes = useStyles();
    
    const course_id = props.match.params.courseId;
    const { user, authenticated } = props.auth;
    
    const [reauthenticate, setReauthenticate] = useState(false);

    const { data, loading, error } = useQuery(GET_COURSE, {
        variables: {
            course_id
        }
    });

    const course = data ? data.getCourse : {};

    const getCurrentCourseData = useQuery(GET_CURRENT_COURSE, {
        variables: {
            course_id
        }
    });

    const [enrollCourse, enrollCourseData] = useMutation(ENROLL_COURSE, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: () => {
            window.location.pathname = `/course/${course_id}/resume/`;
        }
    });

    console.log(user);

    const handleEnroll = () => {
        if(authenticated){
            enrollCourse({
                variables: {
                    course_id,
                    course_title: course.course_title,
                    email: user.email,
                    name: user.name
                }
            });
        }
        else{
            setReauthenticate(true);
        }
    }

    return (
        <div>
            <Head title={data ? data.getCourse.course_title : ""} />
            {
                error && (
                    <UpdateSnackbar status="ERROR" msg={error.message} />
                )
            }
            <NavBar />
            <Container className={classes.container}>
                { loading ? (
                    <CircularProgress color='primary' size={20} className={classes.loading}/>
                ) : (
                    <div className={classes.content}>
                        <div className={course.cover_image_key !== "" ? classes.header : classes.coverNoImg} 
                                style={{backgroundImage: `url(${course.cover_image_url})`, opacity: 0.8}}
                        >
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
                            {
                                !getCurrentCourseData.data && !getCurrentCourseData.loading ? (
                                    <Button variant='contained' color='primary' onClick={handleEnroll} className={classes.button}
                                        disabled={loading || getCurrentCourseData.loading}
                                    >
                                        Enroll
                                    </Button>
                                ) : (
                                    <Button variant='contained' color='primary' className={classes.button}>
                                        <Link to={`/course/${course.course_id}/resume/`} className={classes.link}>
                                            Resume
                                        </Link>
                                    </Button>
                                )
                            }
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
                            (data && data.getCourse.levels.length === 0) ? (
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
            <Backdrop open={enrollCourseData.loading} className={classes.backdrop}>
                <CircularProgress size={50} color='primary' />
            </Backdrop>
            {
                reauthenticate && (
                    <ReAuthenticate />
                )
            }
        </div>
    );
}

const mapStateToProps = (state) => ({
    auth: state.auth
});

export default connect(mapStateToProps, null)(Course);