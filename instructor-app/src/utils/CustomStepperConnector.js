import React from 'react';

import clsx from 'clsx';

//redux


//MUI
import { StepConnector } from '@material-ui/core';

//MUI/styles
import { makeStyles, withStyles } from '@material-ui/styles';

//MUI/icons
import { LocalLibrary, FormatListBulleted, Check } from '@material-ui/icons';

export const ModuleConnector = withStyles({
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
  
const useColorlibStepIconStyles = makeStyles({
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
        backgroundColor: '#009900',
    },
});

export const ModuleStepIcon = (module) => (props) => {
    const classes = useColorlibStepIconStyles();
    const { active, completed } = props;

    const { sub_topic } = module;

    const module_icons = {};

    if(!sub_topic)
      return "Select Module"

    sub_topic.map( (sub, index) => {
      module_icons[index + 1] = <LocalLibrary/>;
      return null;
    });
    module_icons[sub_topic.length + 1] = <FormatListBulleted />

    const icons = {
        ...module_icons,
    };

    return (
        <div
          className={clsx(classes.root, {
              [classes.active]: active,
              [classes.completed]: completed,
          })}
        >
        {
            completed ? (
                <Check />
            ) : (
                icons[String(props.icon)]
            )
        }
        
        </div>
    );
}