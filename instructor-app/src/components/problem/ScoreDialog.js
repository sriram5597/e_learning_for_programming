import React, { useState } from 'react';

//mui
import { Dialog, DialogActions, DialogContent, Button, Typography } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    score: {
        color: theme.palette.primary.main,
        padding: 10,
    }
}));

const ScoreDialog = (props) => {
    const classes = useStyles();

    const { score } = props;

    const [open, setOpen] = useState(true);

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogContent>
                <Typography variant="h6">
                    Congragulations!!! your have scored  
                    <span className={classes.score}><strong>{score}</strong></span>  
                    points
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={handleClose}>
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ScoreDialog;