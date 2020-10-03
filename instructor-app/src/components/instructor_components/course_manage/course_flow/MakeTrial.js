import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { MAKE_FLOW_TRIAL } from '../../../../graphql/mutation/courseFlowMutations';
import { GET_FLOW } from '../../../../graphql/queries/courseFlowQueries';

//utils
import TipButton from '../../../../utils/TipButton';

//mui
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, CircularProgress, Backdrop, FormControlLabel, Switch } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    deleteButton: {
        position: 'relative',
        left: '30%',
    },
    backdrop: {
        zIndex: 6,
        color: '#fff'
    }
}));

const MakeTrial = (props) => {
    const classes = useStyles();

    const { course_id, trial, title } = props;

    const [makeFlowTrial, { loading }] = useMutation(MAKE_FLOW_TRIAL, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            cache.writeQuery({
                query: GET_FLOW,
                variables: {
                    title,
                    course_id,
                    role: "instructor"
                },
                data: {
                    getFlow: {
                        ...data.makeFlowTrial
                    }
                }
            })
        }
    });

    const [flowTrial, setFlowTrial] = useState(trial)

    const handleTrial = () => {
        setFlowTrial(!trial);
        const data = {
            course_id,
            title,
            trial: trial ? false : true
        }

        console.log(data);

        makeFlowTrial({
            variables: {
                ...data
            }
        });
    }

    return (
        <div className={classes.deleteButton}>
            <FormControlLabel control={<Switch checked={flowTrial} onChange={handleTrial} />} label="Make Trial" />

            <Backdrop open={loading} className={classes.backdrop}>
                <CircularProgress size={50} color='primary' />
            </Backdrop>
        </div>
    )
}

export default MakeTrial;