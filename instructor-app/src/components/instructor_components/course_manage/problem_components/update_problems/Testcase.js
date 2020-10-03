import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks'
import { UPLOAD_TESTCASE, DELETE_TESTCASES } from '../../../../../graphql/mutation/problemMutation';

//components
import ViewTestcase from './update_dialogs/ViewTestcase';
import DeleteDialog from './update_dialogs/DeleteDialog';
import AddTestcase from './update_dialogs/AddTestcase';

//MUI
import { Typography, Paper, Button, CircularProgress, Backdrop } from '@material-ui/core';
import { Table, TableBody, TableHead, TableContainer, TableCell, TableRow } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { Delete } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    testcase: {
        color: theme.palette.primary.main,
        fontSize: "20px",
        marginLeft: 10,
        marginRight: 10,
    },

    file: {
        margin: 15,
    },

    paper: {
        minHeight: 200,
    },

    error: {
        color: theme.palette.alert.contrastText,
        backgroundColor: theme.palette.alert.main,
    },

    button: {
        margin: 10,
    },

    backdrop: {
        color: '#fff',
        zIndex: 4
    }
}));

const Testcase = (props) => {
    const classes = useStyles();

    const { problem } = props;

    const [file, setFile] = useState();
    const[error, setError] = useState(false);

    const [deleteTestcases, deleteTestcasesData] = useMutation(DELETE_TESTCASES, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            props.updateAfterMutation(cache, data, 'deleteTestcases');
        }
    })

    const handleFile = (e) => {
        setFile(e.target.files[0]);
        setError(false);
    }

    const handleDelete = () => {
        deleteTestcases({
            variables: {
                problem_id: problem.problem_id
            }
        });
    }

    return (
        <Paper className={classes.paper}>
            <Typography variant="subtitle1">
                Testcase Count:
                <span className={classes.testcase}>
                    <strong>{problem.testcases.length}</strong>
                </span>
            </Typography>
            {
                problem.testcases.length === 0 ? (
                    <div className={classes.file}>
                        <AddTestcase problem_id={problem.problem_id} updateAfterMutation={props.updateAfterMutation} />
                    </div>
                ) : (
                    <div>
                        <Button variant='contained' color="secondary" onClick={handleDelete} disabled={deleteTestcasesData.loading}
                                className={classes.button}
                        >
                            {
                                    deleteTestcasesData.loading && (
                                        <CircularProgress color="secondary" size={25} />
                                    )
                            }
                            <Delete />
                            Delete All Testcases
                        </Button>

                        <TableContainer component="div">

                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <Typography variant="h6">
                                                Testcase
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant='h6'>
                                                Points
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="h6">
                                                Actions
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {
                                        problem.testcases.map( (test, index) => {
                                            return (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        {`Testcase - ${index + 1}`}
                                                    </TableCell>
                                                    <TableCell>
                                                        {test.points}
                                                    </TableCell>
                                                    <TableCell>
                                                        <ViewTestcase index={index} problem={problem} />
                                                        <DeleteDialog index={index} problem={problem}
                                                            updateAfterMutation={props.updateAfterMutation}
                                                        />
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
            <Backdrop open={deleteTestcasesData.loading} className={classes.backdrop}>
                <CircularProgress size={50} color='primary' />
            </Backdrop>
        </Paper>
    )
}

// const mapActionsToProps = {
//     uploadTestcase,
//     deleteTestcases,
//     getTestcase
// }

export default Testcase;