import React from 'react';
import clsx from 'clsx';

//MUI
import { StepConnector } from '@material-ui/core';

//MUI/styles
import { makeStyles, withStyles } from '@material-ui/styles';

//MUI/icons
import { Code, PlayCircleFilled, Description, FormatListBulleted, Check } from '@material-ui/icons';

export const StepperConnector = withStyles({
    alternativeLabel: {
      top: 22,
    },
    active: {
      '& $line': {
        backgroundColor:'#fe7502'
      },
    },
    completed: {
      '& $line': {
        backgroundColor: '#009900'
      },
    },
    line: {
      height: 3,
      border: 0,
      backgroundColor: '#fe7502',
      borderRadius: 1,
    },
})(StepConnector);
  
const useColorlibStepIconStyles = makeStyles( (theme) => ({
    root: {
        backgroundColor: '#ccc',
        zIndex: 1,
        color: '#fff',
        width: 50,
        height: 50,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    active: {
        backgroundColor: '#fe7502',
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    },
    completed: {
        backgroundColor: theme.palette.success.main,
    },
}));

export const FlowStepIcon = (type) => (props) => {
    const classes = useColorlibStepIconStyles();
    const { active, completed } = props;

    const icons = {
      VIDEO: <PlayCircleFilled />,
      TEXT: <Description />,
      MCQ: <FormatListBulleted />,
      CODE: <Code />
    }

    return (
        <div
          className={clsx(classes.root, {
              [classes.active]: active,
              [classes.completed]: completed,
          })}
        >
          {
            icons[type]
          }
        </div>
    );
}