import React from 'react';
import { Link } from 'react-router-dom';

//MUI
import { Card, CardContent, CardActions } from '@material-ui/core';
import { Typography, Grid } from '@material-ui/core';
import { Button } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    cards: {
        marginBottom: 20,
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20,
        height: 350
    },

    content:{
        padding: 20
    },

    button: {
        position: 'relative',
        left: "90%",
   },

   image: {
       position: "relative",
       width: "90%",
       objectFit: "cover",
       padding: 0
   },

   desc: {
       textAlign: "justify",
       padding: 20
   },

   grid: {
       margin: 0,
       height: 280
   }
}));

const CourseList = (props) => {
    const course = props.course;
    const classes = useStyles();
    const  { image_url } = props.course;
    const btnText =  "View";
    const btnLink = `/course/${course.course_id}`; 
    
    return (
        <Card className={classes.cards}>
            <CardContent className={classes.content}>
                <Grid container spacing={2} className={classes.grid}>
                    <Grid item sm={3}>
                        <img src={image_url} alt="course" className={classes.image}/>
                    </Grid>
                    <Grid item sm={9}>
                        <Typography variant="h5" color="primary">{course.course_title}</Typography><br/>
                        <Typography variant="body1" className={classes.desc}>{course.description}</Typography>
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid item sm={6}>
                    </Grid>
                    <Grid item sm={6}>
                        <Button variant="contained" color="primary" component={Link} to={btnLink} className={classes.button}> 
                            {btnText}
                        </Button>
                </Grid>
                </Grid>
                
            </CardContent>
                
            <CardActions>
               
            </CardActions>
        </Card>
    );
}       

export default CourseList;