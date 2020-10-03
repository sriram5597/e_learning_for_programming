import React, { useState } from 'react';

//share
import { FacebookShareButton, FacebookIcon } from 'react-share';

//mui
import { Dialog, DialogActions, DialogTitle, DialogContent, Button } from '@material-ui/core';

const ShareDialog = (props) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <div>
            <Button variant='outlined' color='primary' onClick={handleOpen}>
                Share
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    <strong>
                        Share this Course
                    </strong>
                </DialogTitle>
                <DialogContent>
                    <FacebookShareButton quote="Java Course for Beginners" hashtag="#javacourse #programmingforbeginners" 
                        url="https://google.com"
                    >
                        <FacebookIcon size={32} round={true} />
                    </FacebookShareButton>
                </DialogContent>
            </Dialog>
        </div>     
    )
}

export default ShareDialog;