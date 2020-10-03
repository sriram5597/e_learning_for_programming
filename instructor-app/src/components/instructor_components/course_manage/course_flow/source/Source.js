import React from 'react';

//graphql
import { GET_FLOW } from '../../../../../graphql/queries/courseFlowQueries';

//components
import Video from '../flow_dialog/Video';
import DeleteSource from './DeleteSource';
import MCQ from '../flow_dialog/MCQDialog';
import Code from '../flow_dialog/CodeDialog';
import Text from '../flow_dialog/TextDialog';
import ChangeOrder from './ChangeOrder';

//utils
import TipButton from '../../../../../utils/TipButton';

//mui
import { Card, CardHeader, CardContent, CardActions, } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { Edit, Visibility } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    card: {
        width: 350,
        height: 300,
        margin: 10,
        overflowY: 'auto'
    },

    controls: {
        display: 'flex',
        flex: 1,
    },

    content: {
        minHeight: 120,
    },
}));

const Source = (props) => {
    const classes = useStyles();

    const { course_id, title, index } = props;

    const updateAfterMutation = (cache, data, mutation) => {
        const cache_data = cache.readQuery({ query: GET_FLOW, variables: { course_id, title, role: "instructor" } });

        let flows = cache_data.getFlow.sources;

        console.log(flows);
        let sources = flows.map( (src, ind) => {
            return ind !== index ? src : { ...src, source: data[mutation] }
        });

        cache.writeQuery({
            query: GET_FLOW,
            variables: {
                title,
                course_id,
                role: "instructor"
            },
            data: {
                getFlow: {
                    ...cache_data.getFlow,
                    sources: {
                        ...sources
                    }
                }
            }
        });
    }

    const getComponent = () => {
        switch(props.source.type){
            case 'VIDEO': 
                return <Video source={props.source} sourceIndex={props.index} title={props.title} course_id={props.course_id} 
                    updateAfterMutation={updateAfterMutation}
                />
            
            case 'MCQ':
                return <MCQ source={props.source} sourceIndex={props.index} title={props.title} course_id={props.course_id} 
                    updateAfterMutation={updateAfterMutation}
                />

            case 'CODE':
                return <Code source={props.source} title={props.title} course_id={props.course_id} 
                    updateAfterMutation={updateAfterMutation}
                />

            case 'TEXT':
                return <Text source={props.source} sourceIndex={props.index} title={props.title} course_id={props.course_id}
                    updateAfterMutation={updateAfterMutation}
                />

            default:
                return null;
        }
    }

    return (
        <Card className={classes.card}>
            <CardHeader title={props.source.source_title} subheader={props.source.type} />
            <CardContent className={classes.content}>
                {getComponent()}
            </CardContent>
            <CardActions className={classes.controls}>
                <ChangeOrder old_index={props.index} title={props.title} course_id={props.course_id} />
                <DeleteSource className={classes.controls} source={props.source.source_title} title={props.title} course_id={props.course_id} />
            </CardActions>
        </Card>
    )
}

export default Source;