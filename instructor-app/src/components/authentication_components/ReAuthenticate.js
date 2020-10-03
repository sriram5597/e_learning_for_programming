import React from 'react';
import { useHistory } from 'react-router-dom';

//redux
import { connect } from 'react-redux';
import { refreshToken } from '../../redux/actions/authenticationAction';

//mui
import { Dialog, DialogActions, DialogTitle, DialogContent, Typography, Button } from '@material-ui/core';

const ReAuthenticate = (props) => {
    const history = useHistory();

    const handleRefresh = () => {
        props.refreshToken(history);
    }

    return (
        <Dialog open={true} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography color="primary">
                    Session Expired
                </Typography>
            </DialogTitle>
            <DialogContent>
                Your session is expired
            </DialogContent>
            <DialogActions>
                <Button variant='contained' color='primary' onClick={handleRefresh}>
                    Refresh
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const mapActionToProps = {
    refreshToken,
}

export default connect(null, mapActionToProps)(ReAuthenticate);