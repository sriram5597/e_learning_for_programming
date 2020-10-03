import React from 'react';

//graphql
import { useQuery } from '@apollo/react-hooks';
import { GET_COURSE } from '../../../../graphql/queries/courseQueries';

//components
import CreateModule from './CreateModule';

//MUI
import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary } from '@material-ui/core';
import { List, MenuItem, Typography } from '@material-ui/core';

//MUI/styles
import { makeStyles } from '@material-ui/styles';

//MUI/icons
import { ExpandMore } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    panel: {
        position: "relative",
        width: "90%",
    },

    menu: {
        margin: 2,
        width: '95%',
    },
}));

const ModuleExpansion = (props) => {
    const classes = useStyles();

    return (
        <div>
            {
                props.levels.map( (lvl, index) => {
                    return (
                        <ExpansionPanel key={index} className={classes.panel}>
                            <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                                <Typography variant="h6" color="primary">
                                    {`Level - ${index}`}
                                </Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <List className={classes.menu}>
                                    {
                                        lvl.modules.map( (mod, ind) => {
                                            return (
                                                <MenuItem key={mod.module_id} onClick={props.setModule(index, mod, ind)}>
                                                    {mod.title}
                                                </MenuItem>
                                            )
                                        })
                                    }
                                </List>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    )
                })
            }
            <CreateModule course_id={props.course_id} />       
        </div>
    )
}

export default ModuleExpansion;
