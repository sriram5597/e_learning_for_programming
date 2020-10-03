import React from 'react';

//redux
import { connect } from 'react-redux';
import { updateComponents } from '../../../../redux/actions/flowChartAction';

//mui
import { MenuItem, Typography } from '@material-ui/core';

//mui/icons
import { DeleteOutline } from '@material-ui/icons';

const DeleteComponent = (props) => {
    const { selectedComponent, components, } = props.flowChart;

    const handleDelete = () => {
        const data = components.filter( (comp) => comp.name !== selectedComponent.name);

        components.forEach(comp => {
            if(comp.connectedTo === selectedComponent.index){
                console.log(components.indexOf(selectedComponent));
                comp.connectedTo = '';
            }
        });

        props.updateComponents(data);
        props.setAnchor(null);
    }

    return (
        <MenuItem onClick={handleDelete}>
            <DeleteOutline fontSize='small' />
            <Typography variant='subtitle1' >
                <em>
                    Delete
                </em>
            </Typography>
        </MenuItem>
    )
}

const mapActionsToProps = {
    updateComponents,
}

const mapStateToProps = (state) => ({
    flowChart: state.flowChart,
})

export default connect(mapStateToProps, mapActionsToProps)(DeleteComponent);