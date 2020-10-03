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

const Decision = (props) => { 
    const classes = useStyles();

    const { position, components, isConnect, selectedComponent } = props.flowChart;

    const [pos, setPos] = useState();
    const [drag, setDrag] = useState(false);
    const [maxCount, setMaxCount] = useState();
    const [charsPerLine, setCharsPerLine] = useState();

    const CHARS_PER_LINE = 15;

    let p1, p2, p3, p4;

    const numP = {};
    if(pos){
        Object.keys(pos).forEach( (p) => {
            numP[p] = parseFloat(pos[p]);
        });
    }

    if(numP){
        p1 = `${numP.x},${numP.y + numP.height / 2}`;
        p2 = `${(numP.x + numP.width / 2)},${numP.y}`;
        p3 = `${numP.x + numP.width},${numP.y + numP.height / 2}`;
        p4 = `${numP.x + numP.width / 2},${numP.y + numP.height}`;
    }

    useEffect( () => {
        const x = position[components[components.length - 2].name].x;
        let y = position[components[components.length - 2].name].y;
        y = `${parseFloat(y) + 200}`;

        const count = parseInt(props.component.condition.length / CHARS_PER_LINE);
        setMaxCount(count + 1);
        setCharsPerLine(CHARS_PER_LINE + 5 * count);
        const p = {
            x,
            y,
            width: `${300 + count * 70}`,
            height: `${120 + count * 30}`
        }
        setPos(p);
        let data = {};

        data[props.component.name] = p;
        props.setPosition(data);
    }, [props.component.condition]);

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
            <polygon points={`${p1} ${p2} ${p3} ${p4}`}
                style={selectedComponent.name !== props.component.name ? (isConnect ? {stroke: 'red', strokeWidth: 3} : {stroke: 'white', strokeWidth: 1})
                    : {stroke: '#299947', strokeWidth: 4}
                }
                fill={colorCodes.DECISION}
            />
            <line x1={`${numP.x}`} y1={`${numP.y + numP.height / 2}`} x2={`${numP.x - 140}`} y2={`${numP.y + numP.height / 2}`}
                style={{stroke: 'white', strokeWidth: 2}}
            />

            <text x={`${numP.x - 100}`} y={`${numP.y + numP.height / 2 - 10}`} fontSize="15px" fill="white">
                TRUE
            </text>

            {
                props.component.branch === 'TWO' && (
                    <line x1={`${numP.x + numP.width}`} y1={`${numP.y + numP.height / 2}`} x2={`${numP.x + numP.width + 140}`} 
                        y2={`${numP.y + numP.height / 2}`} style={{stroke: 'white', strokeWidth: 2}}
                    />
                )
            }
            {
                props.component.branch === 'TWO' && (
                    <text x={`${numP.x + numP.width + 50}`} y={`${numP.y + numP.height / 2 - 10}`} fontSize="15px" fill="white">
                        FALSE
                    </text>    
                )
            }

            <text x={`${parseFloat(pos.x, 10) + parseFloat(pos.width) * 0.3 + 10}`} 
                y={`${parseFloat(pos.y, 10) + 45 + (maxCount - 1) * 10}`} fontSize="25px" fill="white" fontWeight="bold"
             >    
                Decision
            </text>
            {
                props.component.condition.length < charsPerLine ? (
                    <text x={`${parseFloat(pos.x, 10) + 60}`} y={`${parseFloat(pos.y, 10) + 85}`} 
                            fontSize="20px" fill="white" 
                    >    
                        {props.component.condition}
                    </text>
                ) : (
                    iterateComponents().map( (count) => {
                       return (
                            <text x={`${parseFloat(pos.x, 10) + 50 + count * 55}`} y={`${parseFloat(pos.y, 10) + count * 25 + 85 + (maxCount - 1) * 10}`} 
                                fontSize="20px" fill="white" key={count}
                            >    
                                {props.component.condition.slice(count * charsPerLine, count * charsPerLine + charsPerLine)}
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

export default connect(mapStateToProps, mapActionsToProps)(Decision);