import React, { useEffect, useState } from 'react';

//redux
import { connect } from 'react-redux';

const Arrow = (props) => {
    const { position } = props.flowChart;

    const [pos, setPos] = useState({});
    const [loop, setLoop] = useState(false);
    const { source, dest } = props;

    useEffect( () => {
        if(Object.keys(position).length > 0){
            const sourcePos = position[source.name];
            const destPos = position[dest.name];

            let x1, x2, y1, y2;
            const decisionRange = parseFloat(destPos.x) + parseFloat(destPos.width) / 2;
            const decisionY = parseFloat(destPos.y) + parseFloat(destPos.height);
            if(dest.type === 'DECISION' && decisionRange > parseFloat(sourcePos.x) && decisionY < parseFloat(sourcePos.y) ){
                setLoop(true);
            }
            
            x1 = `${parseFloat(sourcePos.x) + parseFloat(sourcePos.width) / 2}`;
            y1 = `${parseFloat(sourcePos.y) + parseFloat(sourcePos.height)}`;

            x2 = `${parseFloat(destPos.x) + parseFloat(destPos.width) / 2}`;
            y2 = `${parseFloat(destPos.y) - 15}`;

            setPos({
                x1,
                y1,
                x2,
                y2,
                height: destPos.height
            });
        }
    }, [position, source, dest]);

    if(Object.keys(pos).length === 0){
        return (
            <svg></svg>
        )
    }

    return (
        <svg>
            <defs>
                <marker id="arrow" markerWidth="20" markerHeight="20" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="white" />
                </marker>
            </defs>
            {
                loop ? (
                    <svg>
                        <line x1={`${pos.x1}`} y1={`${pos.y1}`} x2={`${pos.x1}`} y2={`${parseFloat(pos.y1) + 60}`} 
                            style={{stroke: 'white', strokeWidth: 2 }} 
                        />
                        <line x1={`${pos.x1}`} y1={`${parseFloat(pos.y1) + 60}`} x2={`${pos.x2}`} y2={`${parseFloat(pos.y1) + 60}`} 
                            style={{stroke: 'white', strokeWidth: 2 }} 
                        />
                        <line x1={`${pos.x2}`} y1={`${parseFloat(pos.y1) + 60}`} x2={`${pos.x2}`} y2={`${parseFloat(pos.y2) + parseFloat(pos.height) + 30}`} 
                            style={{stroke: 'white', strokeWidth: 2, markerEnd: "url(#arrow)"}}
                        />
                    </svg>
                ) : (
                    <line x1={pos.x1} y1={pos.y1} x2={pos.x2} y2={pos.y2} style={{stroke: 'white', strokeWidth: 2, markerEnd: "url(#arrow)"}} />
                )
            }
        </svg>
    )
}

const mapStateToProps =  (state) => ({
    flowChart: state.flowChart,
});

export default connect(mapStateToProps, null)(Arrow);