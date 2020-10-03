import React, { useState } from 'react';

//graphql
import { useQuery } from '@apollo/react-hooks';
import { GET_COURSE } from '../../../../../graphql/queries/courseQueries';

//function
import getSourceComponent from '../getSourceComponent';

//components
import DeleteFlow from '../DeleteFlow';
import UpdateFlow from '../UpdateFlow';
import PublishFlow from '../PublishFlow';
import MakeTrial from '../MakeTrial';

//utils
import TipButton from '../../../../../utils/TipButton';

//mui
import { Card, CardContent, CardActions, Typography, Button, Select, CardHeader, CircularProgress } from '@material-ui/core';
import { Dialog, DialogTitle, DialogContent, AppBar, Toolbar, MenuItem, Chip } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { AddCircle, Close } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    card: {
        width: 350,
        height: 300,
        margin: 10,
        overflowY: 'auto'
    },

    content: {
        height: 130,
    },

    button: {
        top: '30%',
        left: '20%',
    },

    dialogHead: {
        height: 50,
    },

    close: {
        color: '#ffffff',
    },

    select: {
        position: 'relative',
        width: '15%',
        margin: 15,
        color: '#ffffff',
        borderColor: '#ffffff'
    },

    deleteButton: {
        position: 'relative',
        left: '30%',
    },

    chip: {
        float: 'right'
    }
}));

const AddSource = (props) => {
    const classes = useStyles();

    const { flow } = props;
    const courseData = useQuery(GET_COURSE, {
        variables: {
            course_id: props.course_id
        }
    });
    

    const [open, setOpen] = useState(false);
    const [type, setType] = useState('VIDEO');
    const [data, setData] = useState({});

    const types = ['VIDEO', 'TEXT', 'MCQ', 'CODE'];

    const handleClose = () => {
        setOpen(false);
    }

    const handleOpen = () => {
        setOpen(true);
    }

    const handleType = (e) => {
        setType(e.target.value);
        setData({
            ...data,
            type: e.target.values,
        });
    }

    return (
        <div>
            {
                !courseData.data || !flow ? (
                    <CircularProgress size={30} color='primary' />
                ) : (
                    <Card className={classes.card}>
                        <CardHeader
                            title={`Scope: ${flow.scope_value === 'None' || flow.scope === 'init' ? flow.scope :  
                                courseData.data.getCourse.levels[parseInt(flow.scope.split('_')[1])].modules[parseInt(flow.scope_value)].title}`}
                            subheader={<div>{`Published: ${flow.published}`}</div>}
                        />
                        <CardContent className={classes.content}>
                            <MakeTrial title={flow.title} course_id={flow.course_id} trial={flow.isTrial} />
                            <Button color='primary' className={classes.button} onClick={handleOpen}>
                                <AddCircle color='primary' />
                                <Typography variant='h6'>
                                    Add Source
                                </Typography>
                            </Button>
                        </CardContent>
                        <CardActions>
                            <DeleteFlow level={flow.scope} title={flow.title}  course_id={flow.course_id} />
                            <UpdateFlow title={flow.title} course_id={flow.course_id} />
                            <PublishFlow title={flow.title} course_id={flow.course_id} published={flow.published} />
                        </CardActions>
                    </Card>
                )
            }
            <Dialog open={open} onClose={handleClose}  fullScreen>
                <DialogTitle className={classes.dialogHead}>
                    <AppBar>
                        <Toolbar>
                            <TipButton tip="close" onClick={handleClose}>
                                <Close className={classes.close} />
                            </TipButton>
                            <Typography variant='h5'>
                                Add Source
                            </Typography>
                            <Select value={type} onChange={handleType} variant='outlined' className={classes.select}>
                                {
                                    types.map( (t, index) => {
                                        return (
                                            <MenuItem key={index} value={t}>
                                                {t}
                                            </MenuItem>
                                        )
                                    })
                                }
                            </Select>
                        </Toolbar>
                    </AppBar>
                </DialogTitle>
                <DialogContent>
                    {getSourceComponent(type, setOpen, props.flow.title, props.course_id)}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddSource;