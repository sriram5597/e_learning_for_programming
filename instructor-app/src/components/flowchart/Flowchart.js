import React, { useEffect, useState, useRef } from 'react';
import saveSvgAsPng from 'save-svg-as-png';

//graphql
import { useMutation, useQuery } from '@apollo/react-hooks';
import { LOAD_COMPONENTS } from '../../graphql/queries/problemQueries';
import { SAVE_CHART } from '../../graphql/mutation/problemMutation';

//redux
import { connect } from 'react-redux';
import { addComponent, updateComponents, setPosition, updatePosition, setConnectedComponents,
} from '../../redux/actions/flowChartAction';

//components
import Start from './components/blocks/Start';
import Arrow from './components/blocks/Arrow';
import Tools from './components/Tools';
import Print from './components/blocks/Print';
import Stop from './components/blocks/Stop';
import Input from './components/blocks/Input';
import Statement from './components/blocks/Statement';
import Decision from './components/blocks/Decision';
import DecisionArrow from './components/blocks/DecisionArrow';
import Controls from './components/controls/Controls';

import { colorCodes } from './flowColors';

//mui
import { Paper, Popover, Dialog, DialogContent } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    paper: {
        padding: 15,
        width: '96%',
        height: '82vh',
        alignItems: 'center',
        alignContent: 'center',
        margin: 20,
        overflowX: 'scroll',
        overflowY: 'scroll',
        backgroundColor: '#161616',
    },

    button: {
        position: 'relative',
        margin: 20,
    },

    input: {
        margin: 30,
    },

    tools: {
        position: 'relative',
        overflowY: 'scroll',
        margin: 5,
    },

    block: {
        position: 'relative',
        padding: 20,
        backgroundColor: colorCodes.BLOCK[0],
        borderStyle: 'solid',
        borderWidth: '1px',
        width: '30vh',
        left: '40%',
    },

    svg: {
        minWidth: '400vh',
        minHeight: '400vh',
        overflowX: 'scroll',
        overflowY: 'scroll',
    }
}));

const Flowchart = (props) => {
    const classes = useStyles();    

    const svgRef = useRef(null);

    const { components, status, output, selectedComponent, position, moveComponent } = props.flowChart;

    const [open, setOpen] = useState(false);
    const [src, setSrc] = useState();
    const [anchorEl, setAnchorEl] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState();

    const { data, loading } = useQuery(LOAD_COMPONENTS, {
        variables: {
            problem_id: props.problem.problem_id,
        }
    });

    const [saveChart] = useMutation(SAVE_CHART, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: () => {
            console.log('saved chart');
        }
    });

    useEffect( () => {
        if(!data){
            const data = {
                name: 'start',
                type: 'START',
                connectedTo: "",
                index: 0,
            }
    
            const stop = {
                name: 'stop',
                type: 'STOP',
                index: 1,
            }
    
            const comp = [data, stop];
            props.updateComponents(comp);

            props.setPosition({
                start: {
                    x: '200',
                    y: '10',
                    width: '190',
                    height: '60',
                    rx: '30',
                    ry: '30',
                },
            });
        }
        else{
            props.updateComponents(JSON.parse(data.loadComponents.components));
            props.setPosition(JSON.parse(data.loadComponents.position));
        }  
    }, [data]);

    const getSvgCoord = (e) => {
            const ctm = svgRef.current.getScreenCTM();

            const x = (e.clientX - ctm.e) / ctm.a;
            const y = (e.clientY - ctm.f) /ctm.d;

            return {
                x, 
                y
            }
    }

    const handleMouseMove = (e) => {
        if(dragging && moveComponent){
            e.preventDefault();

            const { x, y } = getSvgCoord(e);
            const pos = position;

            pos[moveComponent] = {
                ...position[moveComponent],
                x: x - offset.x,
                y: y - offset.y,
            }

            props.updatePosition(pos)
        }
    }

    useEffect( () => {
        if(props.isSaveChart){
            const svgId = document.getElementById("svgId");
            
            saveSvgAsPng.svgAsPngUri(svgId, { scale: 0.9}).then( (uri) => { 
                console.log(uri);
                
                saveChart({
                    variables: {
                        chart: uri,
                        problem_id: props.problem.problem_id
                    }
                })
            });
        }
    }, [props.isSaveChart]);

    const handleChange = (e) => {
        setInput(e.target.value);
    }

    const handleClose = () => {
        setAnchorEl(null);
        setOpen(false);
    }

    const getComponent = (comp) => {
        switch(comp.type){
            case 'START':
                return <Start component={comp} key={comp.name} setDragging={setDragging} setOffset={setOffset} getCoords={getSvgCoord} 
                            setAnchor={setAnchorEl}
                        />
            
            case 'STOP':
                return <Stop component={comp} key={comp.name} setDragging={setDragging} setOffset={setOffset} getCoords={getSvgCoord} 
                            setAnchor={setAnchorEl}
                       />
        
            case 'STATEMENT':
                return <Statement component={comp} key={comp.name} setDragging={setDragging} setOffset={setOffset} getCoords={getSvgCoord} 
                            setAnchor={setAnchorEl}
                       />

            case 'INPUT':
                return <Input component={comp} key={comp.name} setDragging={setDragging} setOffset={setOffset} getCoords={getSvgCoord}
                            setAnchor={setAnchorEl}
                        />
            
            case 'PRINT':
                return <Print component={comp} key={comp.name} setDragging={setDragging} setOffset={setOffset} getCoords={getSvgCoord}
                            setAnchor={setAnchorEl}
                        />
            
            case 'DECISION':
                return <Decision component={comp} key={comp.name} setDragging={setDragging} setOffset={setOffset} getCoords={getSvgCoord}
                            setAnchor={setAnchorEl}
                        />
            
            default:
                return null;
        }
    }

    return (
        <div>
            <Tools />
            
            <Paper className={classes.paper} onMouseMove={handleMouseMove} >
                <svg className={classes.svg}  ref={svgRef} id="svgId">
                    {
                        !loading ? (
                            components.map( (comp, index) => {
                                return (
                                    <svg key={index}>
                                        {getComponent(comp)}
                                        {
                                            comp.connectedTo && (
                                                comp.type === 'DECISION' ? (
                                                    comp.branch === 'TWO' ? (
                                                        <DecisionArrow source={comp} 
                                                            dest1={comp.connectedTo.trueBlock ? components[comp.connectedTo.trueBlock] : null} 
                                                            dest2={comp.connectedTo.falseBlock ? components[comp.connectedTo.falseBlock] : null}
                                                        />
                                                    ) : (
                                                        <DecisionArrow source={comp} 
                                                            dest1={comp.connectedTo.trueBlock ? components[comp.connectedTo.trueBlock] : null} 
                                                            dest2={comp.connectedTo.outerBlock ? components[comp.connectedTo.outerBlock] : null}
                                                        />
                                                    )
                                                ) : (
                                                    <Arrow source={comp} dest={components[comp.connectedTo]} />
                                                )
                                            )
                                        }
                                    </svg>
                                ) 
                            })
                        ) : (
                            <text x={50} y={30} fill='white' fontSize="30px" fontStyle="italic">
                                Loading...
                            </text>
                        )
                    }
                </svg>
            </Paper>
            
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                }}
            >
                <Controls setAnchor={setAnchorEl} />
            </Popover>

            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <img src={src}  />
                </DialogContent>
            </Dialog>
        </div>
    )
}

const mapStateToProps = (state) => ({
    flowChart: state.flowChart,
});

const mapActionsToProps = {
    addComponent,
    updateComponents,
    setPosition,
    updatePosition,
    setConnectedComponents,
}

export default connect(mapStateToProps, mapActionsToProps)(Flowchart);