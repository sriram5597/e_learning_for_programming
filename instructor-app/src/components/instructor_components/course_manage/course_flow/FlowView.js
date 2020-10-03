import React, { useState, useEffect } from 'react';
import _ from 'lodash';

//graphql
import { useQuery, useMutation } from '@apollo/react-hooks';
import { GET_LEVEL_FLOWS } from '../../../../graphql/queries/courseFlowQueries';
import { GET_COURSE } from '../../../../graphql/queries/courseQueries';
import { ADD_TITLE } from '../../../../graphql/mutation/courseFlowMutations';

//mui
import { TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button, Paper, CircularProgress } from '@material-ui/core';
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Typography, MenuItem, List, Select } from '@material-ui/core';

//mui/alert
import { Alert } from '@material-ui/lab';

//mui/icons
import { ExpandMore, AddCircle } from '@material-ui/icons';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    levelNode: {
        marginBottom: 5,
        color: theme.palette.primary.main,
    },
    treeNode: {
        marginBottom: 5,
    },

    paper: {
        height: 750,
        overflowY: 'auto',
    },

    menu: {
        position: 'relative',
        width: '100%',
        margin: 2
    },

    scope: {
        marginTop: 30,
    },

    scopeSelect: {
        width: 300,
        marginTop: 15,
    },

}));

const FlowView = (props) => {
    const classes = useStyles();

    const { data, loading, error } = useQuery(GET_LEVEL_FLOWS, {
        variables: {
            course_id: props.course_id
        }
    });
    const courseData = useQuery(GET_COURSE, {
        variables: {
            course_id: props.course_id
        }
    });

    const [addTitle, addTitleData] = useMutation(ADD_TITLE,{
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            const cache_data = cache.readQuery({ query: GET_LEVEL_FLOWS, variables: { course_id: props.course_id }});

            let flows = cache_data.getLevelFlows;

            flows = [...flows, {
                title,
                scope: selectedLevel, 
                scope_value: `${scope}`
            }];

            cache.writeQuery({
                query: GET_LEVEL_FLOWS, 
                variables: { 
                    course_id: props.course_id 
                },
                data: {
                    getLevelFlows: flows
                }
            });
        }
    });
    
    const [open, setOpen] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState();
    const [title, setTitle] = useState();
    const [scope, setScope] = useState('None');
    const [levels, setLevels] = useState([]);

    useEffect( () => {
        if(courseData.data){
            setLevels(_.range(courseData.data.getCourse.levels.length));
        }
    }, [courseData]);
    
    let scopes = ['None'];
    if(selectedLevel !== undefined && selectedLevel !== 'init'){
        const titles = courseData.data ? courseData.data.getCourse.levels[selectedLevel].modules.map( (mod) => {
            return mod.title;
        }) : [];

        scopes = [...scopes, ...titles];
    }

    const handleChange = (e) => {
        setTitle(e.target.value);
    }

    const handleAddOpen = (lvl) => () => {
        setSelectedLevel(lvl);
        setOpen(true);
    }

    const handleFlows = (lvl) => () => {
        setSelectedLevel(lvl);
    }

    const handleFlow = (f) => () => {
        props.selectFlow(f);
    }
    
    const handleClose = () => {
        setOpen(false);
    }

    const handleSelect = (e) => {
        setScope(e.target.value);
    }

    const handleAdd = () => {
        if(selectedLevel === 'init'){
            addTitle({
                variables: {
                    title,
                    course_id: props.course_id,
                    scope: 'init',
                    scope_value: `${scope}`
                }
            });
        }
        else{
            addTitle({
                variables: {
                    title,
                    course_id: props.course_id,
                    scope: `level_${selectedLevel}`,
                    scope_value: `${scope}`
                }
            });
        }
        
        setOpen(false);
    }

    if(error){
        return (
            <Alert open={true} variant="filled" severity="error" >
                {error.message}
            </Alert>
        )
    }

    return (
        <div>
            {
                courseData.loading || loading ? (
                    <CircularProgress size={30} />
                ) : (
                    <Paper className={classes.paper}>
                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMore color='primary' />} onClick={handleFlows('init')}>
                                <Typography variant='h6' color='primary'>
                                    Course Structure
                                </Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelSummary>
                                <List>
                                    {
                                        data && data.getLevelFlows.filter( (flow) => flow.scope === 'init').map( (f, index) => {
                                            return (
                                                <MenuItem key={index} className={classes.menu} onClick={handleFlow(f.title)}>
                                                    <Typography variant='h6'>
                                                        {f.title}
                                                    </Typography>
                                                </MenuItem>
                                            )
                                        })
                                    }
                                    <MenuItem onClick={handleAddOpen('init')} className={classes.menu}>
                                        <span>
                                            <AddCircle fontSize='small' color='primary' /> Add Title
                                        </span>
                                    </MenuItem>
                                </List>
                            </ExpansionPanelSummary>
                        </ExpansionPanel>
                        {
                            levels.map( (lvl, index) => {
                                return (
                                    <ExpansionPanel key={index}>
                                        <ExpansionPanelSummary expandIcon={<ExpandMore color='primary' />} onClick={handleFlows(lvl)}>
                                            <Typography variant='h6' color='primary'>
                                                {`Level - ${lvl}`}
                                            </Typography>
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails>
                                            {
                                                <List>
                                                    {
                                                        data && data.getLevelFlows.filter((flow) => flow.scope === `level_${lvl}`).map( (f, ind) => {
                                                            return (
                                                                <MenuItem key={ind} className={classes.menu} onClick={handleFlow(f.title)}>
                                                                    <Typography variant='h6'>
                                                                        <strong>
                                                                            {f.title}
                                                                        </strong>
                                                                    </Typography>
                                                                </MenuItem>
                                                            )
                                                        }) 
                                                    }
                                                    <MenuItem onClick={handleAddOpen(lvl)} className={classes.menu}>
                                                        <span>
                                                            <AddCircle fontSize='small' color='primary' /> Add Title
                                                        </span>
                                                    </MenuItem>
                                                </List>
                                            }
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>
                                )
                            })
                        }
                    </Paper>
                )
            }

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth={'md'}>
                <DialogTitle>
                    Add Title
                </DialogTitle>
                <DialogContent>
                    <TextField color='primary' fullWidth name='title' onChange={handleChange} label="Flow Title" placeholder="Enter Flow Title"/>
                    <div className={classes.scope}>
                        Select Scope:<br/>
                        <Select value={scope} onChange={handleSelect} variant="outlined" className={classes.scopeSelect}>
                            {
                                selectedLevel !== undefined && (
                                    scopes.map( (sc, index) => {
                                        return (
                                            <MenuItem key={index} value={sc === 'None' ? sc : index - 1}>
                                                {sc}
                                            </MenuItem>
                                        )
                                    })
                                )
                            }
                        </Select>
                    </div>
                    
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" color='secondary' onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color='primary' onClick={handleAdd} 
                            disabled={addTitleData.loading}
                    >
                        {
                            addTitleData.loading && (
                                <CircularProgress size={20} color='primary' />
                            )
                        }
                        Add
                    </Button>
                </DialogActions>
            </Dialog>            
        </div>
    )
}

export default FlowView;