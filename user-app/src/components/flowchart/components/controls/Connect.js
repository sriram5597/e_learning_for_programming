import React, { useEffect } from 'react';

//redux
import { connect } from 'react-redux';
import { setConnect } from '../../../../redux/actions/flowChartAction';

//mui
import { MenuItem, Typography } from '@material-ui/core';

//mui/icons
import { SwapVerticalCircleOutlined } from '@material-ui/icons';

const Connect = (props) => {
    const handleConnect = () => {
        props.setAnchor(null);
        props.setConnect(true);
    }

    return (
        <MenuItem onClick={handleConnect}>
            <SwapVerticalCircleOutlined fontSize='small' />
            <Typography variant='subtitle1' >
                <em>
                    Connect
                </em>
            </Typography>
        </MenuItem>
    )
}

const mapActionsToProps = {
    setConnect,
}

const mapStateToProps = (state) => ({
    flowChart: state.flowChart,
})

export default connect(mapStateToProps, mapActionsToProps)(Connect);