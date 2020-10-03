import React, { useEffect, useState } from 'react';

//redux
import { connect } from 'react-redux';

const DecisionArrow = (props) => {
    const { position } = props.flowChart;
    const { source, dest1, dest2 } = props;

    let x1, x2, x3, x4, y1, y2, y3, y4;

    const [pos1, setPos1] = useState({});
    const [pos2, setPos2] = useState({});

    useEffect( () => {
        if(Object.keys(position).length > 0){
            const sourcePos = position[source.name];
            const dest1Pos = dest1 ? position[dest1.name] : null;
            const dest2Pos = dest2 ? position[dest2.name] : null;

            if(dest1){
                x1 = `${parseFloat(sourcePos.x) - 140}`;
                y1 = `${parseFloat(sourcePos.y) + parseFloat(sourcePos.height) / 2}`;
                
                x2 = `${parseFloat(dest1Pos.x) + parseFloat(dest1Pos.width) / 2}`;
                y2 = `${parseFloat(dest1Pos.y) - 15}`;
            }

            if(dest2){
                if(source.branch === 'TWO'){
                    x3 = `${parseFloat(sourcePos.x) + parseFloat(sourcePos.width) + 140}`;
                    y3 = `${parseFloat(sourcePos.y) + parseFloat(sourcePos.height) / 2}`;
                    
                    x4 = `${parseFloat(dest2Pos.x) + parseFloat(dest2Pos.width) / 2}`;
                    y4 = `${parseFloat(dest2Pos.y) - 15}`;
                }
                else{
                    x3 = `${parseFloat(sourcePos.x) + parseFloat(sourcePos.width) /2}`;
                    y3 = `${parseFloat(sourcePos.y) + parseFloat(sourcePos.height)}`;
                    
                    x4 = `${parseFloat(dest2Pos.x) + parseFloat(dest2Pos.width) / 2}`;
                    y4 = `${parseFloat(dest2Pos.y) - 15}`;
                }
            }

            setPos1({
                x1,
                y1,
                x2,
                y2,
            });
            setPos2({
                x1: x3,
                y1: y3,
                x2: x4,
                y2: y4,
            });
        }
    }, [position, source, dest1, dest2]);

    return (
        <svg>
            <defs>
                <marker id="arrow" markerWidth="20" markerHeight="20" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="white" />
                </marker>
            </defs>
            {
                dest1 && (
                    <line x1={pos1.x1} y1={pos1.y1} x2={pos1.x2} y2={pos1.y2} style={{stroke: 'white', strokeWidth: 2, markerEnd: "url(#arrow)"}} />
                )
            }
            {
                dest2 && (
                    <line x1={pos2.x1} y1={pos2.y1} x2={pos2.x2} y2={pos2.y2} style={{stroke: 'white', strokeWidth: 2, markerEnd: "url(#arrow)"}} />
                )
            }
        </svg>
    )
}

const mapStateToProps =  (state) => ({
    flowChart: state.flowChart,
});

export default connect(mapStateToProps, null)(DecisionArrow);