import React, { useState } from 'react';

//components
import StatementDialog from '../add_dialogs/StatementDialog';
import InputDialog from '../add_dialogs/InputDialog';
import PrintDialog from '../add_dialogs/PrintDialog';
import DecisionDialog from '../add_dialogs/DecisionDialog';

//redux
import { connect } from 'react-redux';
import { updateComponents } from '../../../../redux/actions/flowChartAction';

//mui
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, MenuItem } from '@material-ui/core';

//mui/icons
import { EditOutlined } from '@material-ui/icons';

const UpdateComponent = (props) => {
    const { selectedComponent, components, } = props.flowChart;

    const [open, setOpen] = useState(false);
    const [state, setState] = useState({});

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    }

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
        props.setAnchor(null);
    }

    const handleUpdate = () => {
        components[selectedComponent.index] = {
            ...components[selectedComponent.index],
            ...state,
        }

        props.updateComponents(components);
        setOpen(false);
        props.setAnchor(null);
    }

    const getComponent = (type) => {
        switch(type){
            case 'STATEMENT':
                return <StatementDialog component={selectedComponent} handleChange={handleChange} />
            
            case 'INPUT':
                return <InputDialog component={selectedComponent} handleChange={handleChange} />

            case 'PRINT':
                return <PrintDialog component={selectedComponent} handleChange={handleChange} />

            case 'DECISION':
                return <DecisionDialog component={selectedComponent} handleChange={handleChange} />            
            
            default:
                return null;
        }
    }

    return (
        <div>
            <MenuItem onClick={handleOpen}>
                <EditOutlined fontSize='small' />
                <Typography variant='subtitle1' >
                    <em>
                        Edit
                    </em>
                </Typography>
            </MenuItem> 

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Typography color='primary'>
                        {`Update ${selectedComponent.name}`}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {getComponent(selectedComponent.type)}
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' color='secondary' onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant='contained' color='primary' onClick={handleUpdate}>
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

const mapActionsToProps = {
    updateComponents,
}

const mapStateToProps = (state) => ({
    flowChart: state.flowChart,
})

export default connect(mapStateToProps, mapActionsToProps)(UpdateComponent);