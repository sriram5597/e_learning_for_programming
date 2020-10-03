import React, { useState, useEffect } from 'react';

//mui
import { DialogTitle, DialogActions, DialogContent, Select, MenuItem, Button } from '@material-ui/core';

const Demo = (props) => {
    const [state, setState] = useState("HELLO WORLD");
    const [open, setOpen] = useState();

    const demo = ['HELLO WORLD', 'SUM'];
    
    const URL = 'https://stacle-web-app.s3.ap-south-1.amazonaws.com/assets/';

    const file = {
        'HELLO WORLD': URL + 'hello-world.mp4',
    }

    useEffect( () => {
        setOpen(props.open);  
    }, [props.open]);

    const handleClose = () => {
        setOpen(false);
    }

    const handleChange = (e) => {
        setState(e.target.value);
    }

    return (
        <div>
            <DialogTitle>
                Select Demo:
                <Select value={state} onChange={handleChange} variant='outlined' color='primary'>
                    {
                        demo.map( (d, index) => {
                            return (
                                <MenuItem key={index} value={d}>
                                    {d}
                                </MenuItem>
                            )
                        })
                    }
                </Select>
            </DialogTitle>
            <DialogContent>
                    <video controls width="95%" height="95%" autoPlay loop>
                        <source src={file[state]} type="video/mp4" />
                    </video>
            </DialogContent>
        </div>
    )
}

export default Demo;