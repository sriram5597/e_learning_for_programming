import React from 'react';
import { Helmet } from 'react-helmet';

const Head = (props) => {
    return (
        <Helmet>
            <meta charSet='utf-8' />
            <title>
                {props.title} | Artik Learn
            </title>
            {
                props.meta && (
                    Object.keys(props.meta).map( (key) => {
                        return (
                            <meta name={key} content={props.meta[key]} />
                        )
                    })
                )
            }
        </Helmet>
    )
}

export default Head;