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

const Input = (props) => { 
    const classes = useStyles();

    const { position, components, isConnect, selectedComponent } = props.flowChart;

    const [pos, setPos] = useState();
    const [drag, setDrag] = useState(false);

    const numP = {};
    if(pos){
        Object.keys(pos).forEach( (p) => {
            numP[p] = parseFloat(pos[p]);
        });
    }

    useEffect( () => {
        if(Object.keys(position).indexOf(props.component.name) === -1){
            const x = position[components[components.length - 2].name].x;
            let y = position[components[components.length - 2].name].y;
            y = `${parseFloat(y) + 200}`;

            const p = {
                x,
                y,
                width: '200',
                height: props.component.var < 10 ? "70" : "105",
            }
            setPos(p);
            let data = {};

            data[props.component.name] = p;
            props.setPosition(data);
        }
    }, []);

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

    if(!pos){
        return (
            <svg>
            </svg>
        )
    }

    console.log(props.component.isArray);

    return ( 
        <svg className={classes.root} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onClick={handleClick}
            style={drag ? {cursor: 'grab'} : null} onDoubleClick={handleMenu}
        >
            <polygon points={`${numP.x + 10},${numP.y} ${numP.x + numP.width + 50},${numP.y} ${numP.x + numP.width - 10},${numP.y + numP.height} ${numP.x - 50},${numP.y + numP.height}`}
                style={selectedComponent.name !== props.component.name ? (isConnect ? {stroke: 'red', strokeWidth: 3} : {stroke: 'white', strokeWidth: 1})
                    : {stroke: '#299947', strokeWidth: 4}
                }
                fill={colorCodes.INPUT}
            />
            <text x={`${parseFloat(pos.x, 10) + parseFloat(pos.width) / 4}`} 
                y={`${parseFloat(pos.y, 10) + parseFloat(pos.height) / 3}`} fontSize="25px" fill="white" fontWeight='bold'
             >    
                Read
            </text>
                    <text x={`${parseFloat(pos.x, 10) + parseFloat(pos.width, 10) / 8}`} y={`${parseFloat(pos.y, 10) + parseFloat(pos.height, 10) / 2 + 10}`} 
                            fontSize="20px" fill="white" textDecoration="italic"
                    >    
                       {
                           props.component.var.length < 10 ? (
                                props.component.isArray ? `${props.component.var}[ ] As ${props.component.varType}` : 
                                    `${props.component.var} As ${props.component.varType}`
                           ) : (
                                props.component.isArray ? `${props.component.var}[ ]` : props.component.var
                           )
                       } 
                    </text>
                ) 
                {
                    props.component.var.length >= 10 && ( 
                        <text x={`${parseFloat(pos.x, 10) + parseFloat(pos.width, 10) / 8}`}  
                            y={`${parseFloat(pos.y, 10) + parseFloat(pos.height, 10) / 2 + 40}`} fontSize="20px" fill="white" textDecoration='italic'
                        >    
                            As {props.component.varType}
                        </text>
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

export default connect(mapStateToProps, mapActionsToProps)(Input);