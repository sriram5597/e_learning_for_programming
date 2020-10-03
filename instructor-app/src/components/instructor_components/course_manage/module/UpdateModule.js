import React, { useEffect, useState } from 'react'

//graphql
import { useQuery } from '@apollo/react-hooks';
import { GET_COURSE } from '../../../../graphql/queries/courseQueries';

//redux
import { connect } from 'react-redux';

//components
import ModuleDialog from './ModuleDialog';
import ModuleExpansion from './ModuleExpansion';
import UpdateLevel from './UpdateLevel';

//MUI
import { Typography, Grid } from '@material-ui/core';
import { Card, CardContent, CardHeader } from '@material-ui/core';
import { List, ListItem, ListItemIcon, ListItemText, CircularProgress } from '@material-ui/core';

//MUI/icons
import { AssignmentOutlined } from '@material-ui/icons';

//MUI/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    panel: {
        position: "relative",
        width: "90%",
        wordWrap: 'word-wrap',
    },
    card: {
        position: "relative",
        height: 500,
        marginRight: 20
    },
    addButton: {
        margin: 20
    },

    menu: {
        position: 'relative',
        width: '99%',
    },

    root: {
        margin: 10
    }
}))

const UpdateModule = (props) => {
    const classes = useStyles();

    const { data, loading } = useQuery(GET_COURSE, {
        variables: {
            course_id: props.course_id
        }
    });

    const [level, setLevel] = useState();
    const [module, setModule] = useState();
    const [moduleIndex, setModuleIndex] = useState();

    const levels = data ? data.getCourse.levels : [];

    console.log(data);

    const setSelectedModule = (lvl, mod, index) => () => {
        setLevel(lvl);
        setModule(mod);
        setModuleIndex(index);
    } 

    if(loading){
        return (
            <CircularProgress size={30} color='primary' />
        )
    }

    return (
        <Grid container className={classes.root}>
            <Grid item sm={6}>
                <ModuleExpansion setModule={setSelectedModule} levels={levels} course_id={props.course_id} />
            </Grid>
            <Grid item sm={4}>
                <Card className={classes.card}>
                    <CardHeader
                        title={module ? module.title : "Select Module"}
                        subheader={level || level === 0  ? <UpdateLevel level={level} selectedModule={moduleIndex} course_id={props.course_id} /> : ""}
                        action={ <ModuleDialog selectedModule={{level, module, moduleIndex}} setModule={setSelectedModule} course_id={props.course_id} /> }
                    />
                    <CardContent>
                        <Typography variant="body1" color="primary">
                            Sub Modules
                        </Typography>
                        <List>
                            {
                                module ? (
                                    module.sub_modules.map( (sub, index) => {
                                        return (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <AssignmentOutlined color="primary"/>
                                                </ListItemIcon>
                                                <ListItemText >
                                                    {sub}
                                                </ListItemText>
                                            </ListItem>
                                        )
                                    })
                                ) : (
                                    <Typography variant='subtitle1' color='secondary'>
                                        Select Module
                                    </Typography>
                                )
                            }
                        </List>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

export default UpdateModule;