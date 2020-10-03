import React, { useState, useEffect } from 'react';

//colorcode
import { colorCodes } from '../../flowColors';

//redux
import { connect } from 'react-redux';
import { setPosition, selectComponent, moveComponent } from '../../../../redux/actions/flowChartAction';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        cursor: "move",
    }
}));

const Start = (props) => { 
    const classes = useStyles();

    const { position, selectedComponent, isConnect } = props.flowChart;

    const [pos, setPos] = useState();
    const [drag, setDrag] = useState(false);

    useEffect( () => {
        setPos(position['start']);
    }, [position]);

    const handleMouseUp = (e) => {
        e.preventDefault();
        props.setDragging(false);
        props.moveComponent(null);
        props.setOffset({});
        setDrag(false);
    }

    const handleMouseDown = (e) => {
        e.preventDefault();
        props.setDragging(true);
        props.moveComponent('start');
        setDrag(true);
        
        const offset = props.getCoords(e);
        
        offset.x -= parseFloat(pos.x);
        offset.y -= parseFloat(pos.y);

        props.setOffset({
            ...offset,
        });
    }

    const handleClick = (e) => {
        props.selectComponent(props.component);
    }

    const handleMenu = (e) => {
        e.preventDefault();
        setDrag(false);
        console.log(e.currentTarget);
        props.setAnchor(e.currentTarget);
    }

    if(!pos){
        return (
            <svg>
            </svg>
        )
    }

    return (
        <svg className={classes.root} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onClick={handleClick}
            style={drag ? {cursor: 'grab'} : null} onDoubleClick={handleMenu}
        >
            <rect x={pos.x} y={pos.y} rx={pos.rx} ry={pos.ry} width={pos.width} height={pos.height} 
                    fill={colorCodes.START} style={selectedComponent.name === 'start' ? {stroke: '#299947', strokeWidth: 4} : {stroke: 'white', strokeWidth: 1}}
            />
            <text x={parseInt(pos.x, 10) + parseInt(pos.width, 10) / 4} y={parseInt(pos.y, 10) + parseInt(pos.height, 10) / 1.5} fill="white" 
                    fontSize="30px" fontWeight="bold"
            >    
                START
            </text>
        </svg>
    )
}

const mapActionsToProps = {
    setPosition,
    selectComponent,
    moveComponent,
}

const mapStateToProps = (state) => ({
    flowChart: state.flowChart,
});

export default connect(mapStateToProps, mapActionsToProps)(Start);