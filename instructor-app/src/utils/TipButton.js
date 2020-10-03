import React from 'react';

//MUI
import ToolTip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

const TipButton = ({ children, onClick, tip, btnClassName, btnColor, tipClassName, component, to, disabled }) => (
    <ToolTip title={tip} className={tipClassName}>
        <IconButton className={btnClassName} onClick={onClick} color={btnColor} component={component} to={to} disabled={disabled}>
            {children}
        </IconButton>
    </ToolTip>
);

export default TipButton;