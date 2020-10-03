import React, { useState, useEffect } from 'react';

import MonacoEditor from '@monaco-editor/react';

//styled components
import { Container, Toolbar } from './StyledComponent';

//mui
import { Select, MenuItem, Typography, CircularProgress } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    language: {
      position: 'relative',
      height: 40,
      width: 125,
    },

    header:{
      left: "5%",
      fontFamily: "sans-serif"
    },

    filename: {
      width: "200px",
      height: "30px",
    },

    editHead: {
      color: '#808080',
    }
}));

const CodeEditor = (props) => {
  const classes = useStyles();

  const code = props.code;
  
  const [state, setState] = useState(code);

  useEffect( () => {
    setState(code);
  }, [props.code]);

  const languages = {
    java: 'Java',
    python: 'Python3',
  }

  const handleDidMount = (_editor) => {
    props.editor.current = _editor;
  }
  console.log(props.selectedLanguage);

  return (
    <Container>
      <Toolbar>
        <Typography variant='h6' className={classes.header}>
          Stacle Code Editor
        </Typography>
        <input type="text" name="filename" defaultValue={props.filename} onChange={props.handleFilename} className={classes.filename}
            placeholder="Enter Filename" 
        />
        <Select variant='outlined' value={props.selectedLanguage} onChange={props.onSelect} className={classes.language}>
          {
            Object.keys(languages).map( (lang, index) => {
              return (
                <MenuItem key={index} value={lang}>
                  {languages[lang]}
                </MenuItem> 
              )
            })
          }
        </Select>
      </Toolbar>
      
      <MonacoEditor
        width="100%"
        height="93%"
        value={state}
        editorDidMount={handleDidMount}
        language={props.selectedLanguage}
        theme="dark"
        options={{
          fontSize: 16,
          colorDecorators: true,
        }}
        loading={<CircularProgress color='primary' />}
      />
    </Container>
  );
}

export default CodeEditor;