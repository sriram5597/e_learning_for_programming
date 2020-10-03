import React, { useState, useEffect } from 'react';

//colorcode
import { colorCodes } from '../../flowColors';

//redux
import { connect } from 'react-redux';
import { setPosition, moveComponent, connectComponent } from '../../../../redux/actions/flowChartAction';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        cursor: "move",
    }
}));

const Stop = (props) => { 
    const classes = useStyles();

    const { position, selectedComponent, isConnect, components } = props.flowChart;

    const [pos, setPos] = useState();
    const [drag, setDrag] = useState(false);

    useEffect( () => {
        if(Object.keys(position).indexOf('stop') === -1){
            const p = position['start'];

            props.setPosition({
                stop: {
                    ...p,
                    y: `${parseFloat(p.height) + 50}`,
                }
            });
        }
    }, []);

    useEffect( () => {
        setPos(position['stop'])
    }, [position]);

    const handleMouseUp = (e) => {
        e.preventDefault();
        props.setDragging(false);
        props.moveComponent(null);
        setDrag(false);
        props.setOffset({});
    }

    const handleMouseDown = (e) => {
        e.preventDefault();
        props.setDragging(true);
        props.moveComponent('stop');
        setDrag(true);
        
        const offset = props.getCoords(e);
        
        offset.x -= parseFloat(pos.x);
        offset.y -= parseFloat(pos.y);

        props.setOffset({
            ...offset,
        });
    }

    const handleClick = () => {
        if(isConnect){
            props.connectComponent(selectedComponent, props.component, position, components);
        }
    }

    if(!pos){
        return (
            <svg>
            </svg>
        )
    }

    return ( 
        <svg className={classes.root} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} style={drag ? {cursor: 'grab'} : null}
            onClick={handleClick}
        >
            <rect x={pos.x} y={pos.y} rx={pos.rx} ry={pos.ry} width={pos.width} height={pos.height} fill={colorCodes.STOP} 
                style={isConnect && selectedComponent.name !== 'stop' ? {stroke: 'red', strokeWidth: 3} : {stroke: 'white', strokeWidth: 1}}
            />
            <text x={parseInt(pos.x, 10) + parseInt(pos.width, 10) / 4} y={parseInt(pos.y, 10) + parseInt(pos.height, 10) / 1.5} fill="white" 
                    fontSize="30px" fontWeight="bold"
             >    
                STOP
            </text>
        </svg>
    )
}

const mapActionsToProps = {
    setPosition,
    moveComponent,
    connectComponent,
}

const mapStateToProps = (state) => ({
    flowChart: state.flowChart,
});

export default connect(mapStateToProps, mapActionsToProps)(Stop);