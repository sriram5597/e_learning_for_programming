import React, { useState, useEffect } from 'react';

//MUI
import { MobileStepper, Typography, Button } from '@material-ui/core';  
import { Card, CardHeader, CardContent } from '@material-ui/core';
import { List, ListItem, ListItemIcon,ListItemText, Tooltip } from '@material-ui/core';

//MUI/icons
import { KeyboardArrowLeft, KeyboardArrowRight, AssignmentOutlined } from '@material-ui/icons';

//MUI/styles
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        maxWidth: 800,
        flexGrow: 1,
        marginLeft: "20%",
    },
    card: {
        height: 400,
        backgroundColor: '#EEEEEE'
    },
    stepper: {
        backgroundColor: '#EEEEEE'
    },
    title: {
        textAlign: "center"
    }
}));

const Level = (props) => {
    const classes = useStyles();

    const levels = props.levels;

    const [ activeState, setActiveState ] = useState(0);

    const maxLevel = levels.length;

    const handleNext = () => {
        setActiveState(prevActiveState => prevActiveState + 1);
    }

    const handlePrev = () => {
        setActiveState(prevActiveState => prevActiveState - 1);
    }

    return(
        <div className={classes.root}>
            <Card className={classes.card}>
                <CardHeader 
                    title={
                        <Typography variant="h5" color="primary" className={classes.title}>
                            {`Level - ${activeState}`}
                        </Typography>
                    }
                    color="primary"
                />
                <CardContent>
                    <Typography variant="h6">
                        Modules
                    </Typography>
                    <List>
                        {
                            levels[activeState].modules.map( (module) => {
                                return (
                                    <ListItem key={module.module_id}>
                                        <ListItemIcon>
                                            <AssignmentOutlined color="primary"/>
                                        </ListItemIcon>
                                        <ListItemText>
                                            <Tooltip arrow placement="left-start" title={
                                                    <div>
                                                        <Typography variant='h6'>
                                                            Sub Modules
                                                        </Typography>
                                                        <hr size="1"/>
                                                        <List>
                                                            {
                                                                module.sub_modules.map( (sub, ind) => {
                                                                    return (
                                                                        <ListItem key={ind}>
                                                                            <Typography variant='subtitle1'>
                                                                                {sub}
                                                                            </Typography>
                                                                        </ListItem>
                                                                    )
                                                                })
                                                            }
                                                        </List>
                                                    </div>
                                                }
                                            >
                                                <Typography variant='h6'>
                                                    {module.title}
                                                </Typography>
                                            </Tooltip>
                                        </ListItemText>
                                    </ListItem>
                                )
                            })
                        }
                    </List>
                </CardContent>
            </Card>
            
            <MobileStepper
                className={classes.stepper}
                steps={maxLevel}
                position={"static"}
                variant="text"
                activeStep={activeState}
                nextButton={
                    <Button size="small" onClick={handleNext} disabled={activeState === maxLevel - 1}>
                        Next
                        <KeyboardArrowRight/>
                    </Button>
                }
                backButton={
                    <Button size="small" onClick={handlePrev} disabled={activeState ===  0}>
                        Prev
                        <KeyboardArrowLeft/>
                    </Button>
                }
            />
        </div>
    );
}

export default Level;