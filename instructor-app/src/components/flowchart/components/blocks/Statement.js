import React, { useState, useEffect, } from 'react';

//colorcode
import { colorCodes } from '../../flowColors';

//redux
import { connect } from 'react-redux';
import { setPosition, selectComponent, moveComponent, connectComponent } from '../../../../redux/actions/flowChartAction';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        cursor: "move",
    }
}));

const Statement = (props) => { 
    const classes = useStyles();

    const { position, components, isConnect, selectedComponent } = props.flowChart;

    const [pos, setPos] = useState();
    const [drag, setDrag] = useState(false);
    const [maxCount, setMaxCount] = useState();

    const CHARS_PER_LINE = 30;

    useEffect( () => {
        const x = position[components[components.length - 2].name].x;
        let y = position[components[components.length - 2].name].y;
        y = `${parseFloat(y) + 200}`;
        
        const count = parseInt(props.component.statement.length / CHARS_PER_LINE);
        setMaxCount(count + 1);

        const p = {
            x,
            y,
            width: props.component.length < 20 ? '120' : '400', 
            height: count + 1 === 1 ? "70" : `${70 + (count) * 25}`,
        }
        setPos(p);
        let data = {};

        data[props.component.name] = p;
        props.setPosition(data);
    }, [props.component.statement]);

    useEffect( () => {
        setPos(position[props.component.name]);
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
        props.moveComponent(props.component.name);
        setDrag(true);
        
        const offset = props.getCoords(e);
        
        offset.x -= parseFloat(pos.x);
        offset.y -= parseFloat(pos.y);

        props.setOffset({
            ...offset,
        });
    }

    const handleClick = (e) => {
        if(isConnect){
            props.connectComponent(selectedComponent, props.component, position, components);
        }
        else{
            props.selectComponent(props.component);
        }
    }

    const handleMenu = (e) => {
        e.preventDefault();
        props.setAnchor(e.currentTarget);
    }

    const iterateComponents = () => {
        let arr = [];

        for(let count = 0; count < maxCount; count++){
            arr = [...arr, count];
        }
        return arr;
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
            <rect x={pos.x} y={pos.y} width={pos.width} height={pos.height} fill={colorCodes.STATEMENT} 
                style={selectedComponent.name !== props.component.name ? isConnect ? {stroke: 'red', strokeWidth: 3} : {stroke: 'white', strokeWidth: 1} 
                    : {stroke: '#299947', strokeWidth: 4}
                }
            />
            <text x={`${parseFloat(pos.x, 10) + parseFloat(pos.width) / 4}`} 
                y={`${parseFloat(pos.y, 10) + 25}`} fontSize="25px" fill="white" fontWeight="bold"
             >    
                STATEMENT
            </text>
            {
                props.component.statement.length < CHARS_PER_LINE ? (
                    <text x={`${parseFloat(pos.x, 10) + 20}`} y={`${parseFloat(pos.y, 10) + 55}`} 
                            fontSize="20px" fill="white" 
                    >    
                        {props.component.statement}
                    </text>
                ) : (
                    iterateComponents().map( (count, index) => {
                       return (
                            <text x={`${parseFloat(pos.x, 10) + 20}`} y={`${parseFloat(pos.y, 10) + count * 25 + 55}`} 
                                fontSize="20px" fill="white" key={count}
                            >    
                                {props.component.statement.slice(CHARS_PER_LINE * count, CHARS_PER_LINE * count + CHARS_PER_LINE)}
                            </text>
                       )
                    })
                )
            }
        </svg>
    )
}

const mapActionsToProps = {
    setPosition,
    selectComponent,
    moveComponent,
    connectComponent,
}

const mapStateToProps = (state) => ({
    flowChart: state.flowChart,
});

export default connect(mapStateToProps, mapActionsToProps)(Statement);