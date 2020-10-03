import React, { useState, useEffect } from 'react';

//graphql
import { useLazyQuery } from '@apollo/react-hooks';
import { GET_FLOW } from '../../graphql/queries/courseFlowQueries';

//components
import FlowView from './flowView/FlowView';

//mui
import { Tabs, Tab, Paper, CircularProgress } from '@material-ui/core';

const InitView = (props) => {
    const [value, setValue] = useState(0);

    const flows = props.levelFlows.filter((f) => f.scope === 'init');
    const { course_id, pay_status } = props;

    const [getFlow, {data, loading}] = useLazyQuery(GET_FLOW, {
        onError: (err) => {
            console.log(err.message);
        },
        onCompleted: (data) => {
            console.log(data);
        }
    });

    useEffect( () => {
        getFlow({
            variables: {
                course_id,
                pay_status,
                title: flows[value].title
            }
        });
    }, []);

    const handleChange = (e, newValue) => {
        setValue(newValue);
        getFlow({
            variables: {
                course_id,
                pay_status,
                title: flows[value].title
            }
        });
    }
    
    return (
        <div>
            <Paper>
                <Tabs value={value} onChange={handleChange} indicatorColor='primary' textColor='primary' centered>
                    {
                        flows.map( (f) => {
                            return (
                                <Tab label={f.title} />
                            )
                        })
                    }
                </Tabs>
            </Paper>
            {
                loading ? (
                    <CircularProgress color='primary' size={40} />
                ) : (
                    <FlowView flow={data ? data.getFlow : null} isPrevFlow={false} isNextFlow={false} />
                )
            }
        </div>
    )
}

export default InitView;