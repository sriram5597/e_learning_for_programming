import React, { useState } from 'react';

//utils
import DraftView from '../../../../utils/customEditor/view/DraftView';
import TipButton from '../../../../utils/TipButton';

//components
import AddSampleTestcase from './add_problem/AddSampleTestcase';
import DeleteDialog from '../problem_components/update_problems/update_dialogs/DeleteDialog';

//MUI
import { Paper, Typography, IconButton, Button } from '@material-ui/core';
import { Table, TableHead, TableRow, TableContainer, TableBody, TableCell } from '@material-ui/core';

import { makeStyles } from '@material-ui/styles';

//MUI/icons
import { AddCircle, Edit } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    cell: {
        fontSize: '20px',
    },

    table: {
        width: '95%',
    },

    next: {
        margin: 5, 
        float: 'right',
    }
}));

const SampleTestcase = (props) => {
    const classes = useStyles();

    const { problem } = props;

    const [open, setOpen] = useState(false);
    const [update, setUpdate] = useState(false);
    const [index, setIndex] = useState();

    const handleOpen = () => {
        setUpdate(false);
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleUpdate = (ind) => () => {
        setUpdate(true);
        setIndex(ind);
        setOpen(true);
    }

    if(Object.keys(problem).length === 0)
        return 'No sample testcase found..';
    
    return (
        <div>
            <AddSampleTestcase open={open} handleClose={handleClose} update={update} index={index} problem={problem}
                updateAfterMutation={props.updateAfterMutation}            
            />
            {
                props.acctivateTab && (
                    <Button variant="contained" color="primary" onClick={() => props.activateTab()} className={classes.next}>
                        Next
                    </Button>
                )
            }

            <TableContainer component={Paper}>
                <span>
                    <IconButton color="primary" onClick={handleOpen}>
                        <AddCircle />
                    </IconButton>
                    add sample testase
                </span>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant="h6" color='primary'>
                                    Input
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="h6" color='primary'>
                                    Output
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="h6" color='primary'>
                                    Explanation
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="h6" color='primary'>
                                    Actions
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            problem.sample_testcases.map( (d, idx) => {
                                return (
                                    <TableRow key={idx} className={classes.cell}>
                                        <TableCell>
                                            {d.input}
                                        </TableCell>
                                        <TableCell>
                                            {d.output}
                                        </TableCell>
                                        <TableCell>
                                            <DraftView editorState={JSON.parse(d.explanation)}/>
                                        </TableCell>
                                        <TableCell>
                                            <DeleteDialog index={idx} sample={true} updateAfterMutation={props.updateAfterMutation} problem={problem} />
                                            <TipButton btnColor="primary" onClick={handleUpdate(idx)} tip="edit">
                                                <Edit />
                                            </TipButton>
                                        </TableCell> 
                                    </TableRow>
                                )
                            })
                        }
                    </TableBody> 
                </Table>
            </TableContainer>    
        </div>
    )
}

export default SampleTestcase;