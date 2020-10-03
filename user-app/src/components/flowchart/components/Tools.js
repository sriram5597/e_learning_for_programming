import React, { useState, useEffect } from 'react';

//redux
import { connect } from 'react-redux';
import { createComponent, setPosition, addComponent } from '../../../redux/actions/flowChartAction';

//components
import PrintDialog from '../components/add_dialogs/PrintDialog';
import InputDialog from '../components/add_dialogs/InputDialog';
import StatementDialog from '../components/add_dialogs/StatementDialog';
import DecisionDialog from '../components/add_dialogs/DecisionDialog';
import Demo from '../Demo';

//mui
import { Paper, MenuItem, List, Typography, Button } from '@material-ui/core';
import { Dialog, DialogActions, DialogTitle, DialogContent } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    paper: {
        padding: 5,
        display: 'flex',
        width: '96%',
        flexGrow: 1,
        backgroundColor: '#f0f0f0'
    },
    list: {
        display: 'flex',
        flexGrow: 1,
    },
    controls: {
        margin: 10,
    },
    demoControl: {
        margin: 10,
        color: theme.palette.primary.main,
        borderStyle:'solid',
        fontWeight: 'bold',
        fontSize: '1.5rem',
        borderWidth: '2px 2px 2px 2px',
    }
}));

const Tools = (props) => {
    const classes = useStyles();

    const { components, createdComponents } = props.flowChart;

    const [item, setItem] = useState();
    const [open, setOpen] = useState(false);
    const [state, setState] = useState({});

    const items = {
        Input: 'INPUT',
        Statement: 'STATEMENT',
        Print: 'PRINT',
        Decision: 'DECISION',
        Demo: 'DEMO',
    }

    useEffect( () => {
        if(Object.keys(createdComponents).length === 0){
            let comps = {};
            Object.keys(items).forEach( (i) => {
                comps[items[i]] = 0;
            });
            props.createComponent(comps);
        }
    }, []);

    const handleItem = (it) => () => {
        setItem(it);
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    }

    const handleAdd = () => {
        let data = {
            ...state,
            name: `${item}-${createdComponents[items[item]]++}`,
            type: items[item],
            index: components.length,
        }

        if(!data.branch){
            data.branch = 'ONE';
        }

        props.addComponent(data);
        setOpen(false);
        setState({});
    }

    const getComponent = () => {
        switch(items[item]){
            case 'PRINT':
                return <PrintDialog handleChange={handleChange} />
            
            case 'INPUT':
                return <InputDialog handleChange={handleChange} />

            case 'STATEMENT':
                return <StatementDialog handleChange={handleChange} />

            case 'DECISION':
                return <DecisionDialog handleChange={handleChange} />
            
            case 'DEMO':
                return <Demo open={open} />

            default:
                return null;
        }
    }

    return (
        <div>
            <Paper className={classes.paper}>
                <Typography variant='h5'>
                    <strong>
                        Tools
                    </strong>
                </Typography>
                <List className={classes.list}>
                    {
                        Object.keys(items).map( (i, index) => {
                            return (
                                <MenuItem key={index} onClick={handleItem(i)} className={i === 'Demo' ? classes.demoControl : classes.contorls}>
                                    {i}
                                </MenuItem>
                            )
                        })
                    }
                </List>
            </Paper>
            {
                items[item] === 'DEMO' ? (
                    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
                        {getComponent()}
                    </Dialog>
                ) : (
                    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                        <DialogTitle>
                            Inserting {item}
                        </DialogTitle>
                        <DialogContent>
                            {getComponent()}
                        </DialogContent>
                        <DialogActions>
                            <Button variant='outlined' color='secondary' onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant='contained' color='primary' onClick={handleAdd}>
                                Insert
                            </Button>
                        </DialogActions>
                    </Dialog>
                )
            }
        </div>
    )
}

const mapStateToProps = (state) => ({
    flowChart: state.flowChart,
});

const mapActionsToProps = {
    createComponent,
    setPosition,
    addComponent,
}

export default connect(mapStateToProps, mapActionsToProps)(Tools);