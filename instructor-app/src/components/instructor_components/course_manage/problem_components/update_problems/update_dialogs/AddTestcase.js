import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { UPLOAD_TESTCASE } from '../../../../../../graphql/mutation/problemMutation';

//mui
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@material-ui/core';

const AddTestcase = (props) => {
    const [count, setCount] = useState();
    const [open, setOpen] = useState(false);
    const [viewForm, setViewForm] = useState(false);

    const [uploadTestcase, { data, loading }] = useMutation(UPLOAD_TESTCASE, {
        onError: (err) => {
            console.log(err.message);
        },
        onCompleted: () => {
            setViewForm(true);
        },
        update: (cache, { data }) => {
            console.log(data['uploadTestcase']);
            //props.updateAfterMutation(cache, data['uploadTestcase'], 'problem')
        }
    });

    const handleOpen = () => {
        setOpen(true);
    }

    const handleChange = (e) => {
        setCount(e.target.value);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleCredentials = () => {
        uploadTestcase({
            variables: {
                problem_id: props.problem_id,
                ext: 'zip',
                test_count: parseInt(count)
            }
        });
    }

    if(data){
        console.log(data.uploadTestcase.credentials.url);
    }
    

    return (
        <div>
            <Button variant='contained' color='primary' onClick={handleOpen}>
                Add Testcase
            </Button>
            <Dialog open={open} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Typography color='primary'>
                        Add Testcase
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <TextField variant='outlined' color='primary' onChange={handleChange} label="Testcase Count" placeholder="Enter testcase count" />
                    <Button variant='contained' color='primary' onClick={handleCredentials} disabled={viewForm}>
                        Fetch credentials
                    </Button>
                    {
                        viewForm && (
                            <form method="post" action={data.uploadTestcase.credentials.url} encType="multipart/form-data" >
                                {
                                    Object.keys(JSON.parse(data.uploadTestcase.credentials.fields)).map( (cred, index) => {
                                        return (
                                            <input type="text" value={JSON.parse(data.uploadTestcase.credentials.fields)[cred]} key={index} name={cred} />
                                        )
                                    })
                                }
                                <input type="file" name="file" />
                                <input type="submit" value="Upload Testcase" />
                            </form>
                        )
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" color='primary' onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default AddTestcase;