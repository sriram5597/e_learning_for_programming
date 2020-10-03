import React, { useState, useEffect } from 'react';

//mui
import { Button, Dialog, DialogActions, DialogTitle, DialogContent, Typography, CircularProgress } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        marginRight: 10,
        marginLeft: 5
    }
}));

const Hint = (props) => {
    const classes = useStyles();

    const { hint, problem, status } = props.code;

    const [open, setOpen] = useState(false);

    const hintLoading = status.name === 'getHints' && status.status === 'LOADING';

    const handleHint = () => {
        props.getHints(problem.problem_id, 0);
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }
    
    return (
        <div className={classes.root}>
            <Button variant='outlined' color='primary' onClick={handleHint}>
                Hint
            </Button>

            <Dialog open={open} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Typography color='primary'>
                        Hint
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {
                        !hintLoading ? (
                            <Typography variant='h6'>
                                {hint}
                            </Typography>
                        ) : (
                            <CircularProgress size={30} color='primary' className={classes.progress} />
                        )
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' color='primary' onClick={handleClose}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Hint;