import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';

//mui
import { TextField, Dialog, DialogTitle, DialogActions, DialogContent, Button, Typography } from '@material-ui/core';
import { UPDATE_MCQ } from '../../../../graphql/mutation/mcqMutations';

const ScoreDialog = (props) => {
    const mcq = props.source.source;

    const [open, setOpen] = useState(false);
    const [state, setState] = useState({
        coins: mcq.coins,
        points: mcq.points,
    });

    const [updateMcq] = useMutation(UPDATE_MCQ, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            props.updateAfterMutation(cache, data, 'updateMcq');
        }
    })

    const handleOpen = () => {
        setOpen(true);
    }

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleSubmit = () => {
        let data = {};

        if(state.points !== mcq.points){
            data['points'] = parseInt(state.points);
        }
        if(state.coins !== mcq.coins){
            data['coins'] = state.coins;
        }

        updateMcq({
            variables: {
                mcq_id: props.source.source.mcq_id,
                mcq: {
                    ...data
                }
            }
        });

        setOpen(false);
    }

    return (
        <div>
            <Button variant='contained' color='primary' onClick={handleOpen}>
                Update Scores
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>
                    <Typography color='primary'>
                        <strong>
                            Update Scores
                        </strong>
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <TextField color='primary' label='Xp Points' defaultValue={mcq.points} name="points" onChange={handleChange} 
                        placeholder="Enter Xp Points"
                    /><br/><br/>
                    <TextField color='primary' label='Coins' defaultValue={mcq.coins} name="coins" onChange={handleChange} 
                        placeholder="Enter Coins"
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' color='secondary' onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant='contained' color='primary' onClick={handleSubmit} 
                        disabled={state.coins === mcq.coins && state.points === mcq.points ? true : false}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default ScoreDialog;