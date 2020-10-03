import React, { useState, useEffect } from 'react';
import "../styles/content.css";

import MdEditor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';
import subscript from 'markdown-it-sub';
import supscript from 'markdown-it-sup';

const MarkdownEditor = (props) => {
    const mdParser = new MarkdownIt({html: true, typographer: true, }).use(subscript).use(supscript);
    const [text, setText] = useState("Edit Your Content");

    useEffect( () => {
        setText(props.text);
    }, [props.text]);

    return (
            <MdEditor
                value={text}
                renderHTML={(text) => mdParser.render(text)}
                onChange={props.textEdit}
                config={{
                    view: {
                        menu: true,
                        html: true, 
                        md: true,
                        fullScreen: true
                    },
                    htmlClass: "content"
                }}
                style={{
                    position: "relative",
                    height: "700px",
                    width: "95%" 
                }}
            />
    );
}

export default MarkdownEditor;