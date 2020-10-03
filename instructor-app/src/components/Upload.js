import React from 'react';

import { useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const Upload = (props) => {
    const query = gql`
        mutation uploadFile($url: String, $filename: String){
            uploadFile(url: $url, filename: $filename){
                status
                message
            }
        }
    `;

    const [uploadFile] = useMutation(query, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: () => {
            console.log("Uploaded");
        }
    });

    const handleChange = (e) => {
        const reader = new FileReader();

        reader.readAsDataURL(e.target.files[0]);
        console.log(reader.result);
        let name = e.target.files[0].name;

        reader.addEventListener('load', () => {
                uploadFile({
                    variables: {
                        url: reader.result,
                        filename: name
                    }
                })
        });
    }

    return (
        <div>
            <input type="file" onChange={handleChange} />
        </div>
    )
}

export default Upload;