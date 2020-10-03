import React, { useState, useEffect } from 'react';

import MonacoEditor from '@monaco-editor/react';

//styled components
import { ViewContainer } from './StyledComponent';

//mui
import { CircularProgress } from '@material-ui/core';

const CodeView = (props) => {
  const code = props.code;
  
  const [state, setState] = useState(code);

  useEffect( () => {
    setState(code);
  }, [props.code]);

  const handleDidMount = (_editor) => {
    props.editor.current = _editor;
  }

  console.log(props.readOnly);

  return (
    <ViewContainer>
      <MonacoEditor
        width="100%"
        height="100%"
        value={state}
        editorDidMount={handleDidMount}
        language={props.language}
        theme="dark"
        options={{
          fontSize: 16,
          colorDecorators: true,
          readOnly: props.readOnly
        }}
        loading={<CircularProgress color='primary' />}
      />
    </ViewContainer>
  );
}

export default CodeView;