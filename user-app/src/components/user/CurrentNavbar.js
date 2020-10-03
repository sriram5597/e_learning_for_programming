import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

//styles
import { makeStyles } from '@material-ui/styles'

//css
import '../../styles/App.css';

//components
import ShareDialog from '../ShareDialog';
import UnenrollCourse from './UnenrollCourse';

//redux
import { connect } from 'react-redux';

//MUI
import { IconButton, AppBar, Typography, Toolbar, Chip, Popover } from '@material-ui/core';

//MUI Icons
import { MoreVert, ArrowBack } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
    menuButton: {
        float: 'right'
    },
    title: {
        letterSpacing: '10px',
    },
    primary: {
        color: theme.palette.primary.main,
    },
    secondary: {
        color: theme.palette.secondary.main
    },
    root: {
        display: 'flex',
        flexGrow: 1,
        justifyContent: 'space-between'
    },
    link: {
        textDecoration: "none",
    },
    backdrop: {
        zIndex: 4,
        color: '#fff'
    },
    navContent: {
        display: 'flex',
        justifyContent: 'space-evenly'
    }
}));

const NavBar = (props) => {
    const classes = useStyles();
    const hsitory = useHistory();

    const [anchorEl, setAnchorEl] = useState();

    const handleClose = () => {
        setAnchorEl(null);
    }

    const handleOpen = (e) => {
        setAnchorEl(e.target);
    }

    const handleBack = () => {
        history.back();
    }

    return (
        <div>
            <AppBar position="relative" color='inherit'>
                <Toolbar className='nav-container'>
                        <div className={classes.root}>
                            <div className={classes.navContent}>
                                <IconButton color='primary' onClick={handleBack}>
                                    <ArrowBack />
                                </IconButton>

                                <Link to="/" className={classes.link}>
                                    <Typography variant="h5">
                                        <span className={classes.primary}>
                                            ARTIK
                                        </span>
                                        <span className={classes.secondary}>
                                            LEARN
                                        </span> 
                                    </Typography>
                                </Link>
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <Typography variant='h4' color='primary'>
                                    {props.course_title}
                                </Typography>
                            </div>
                            <div className={classes.navContent}>
                                <div>
                                    <Chip label={<strong>{`Experience Points: ${props.xp}`}</strong>} color='primary' />
                                </div>
                                <div>
                                    <ShareDialog />
                                </div>
                                <div>
                                    <IconButton color='primary' onClick={handleOpen}>
                                        <MoreVert />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                        <Popover open={Boolean(anchorEl)} 
                            anchorEl={anchorEl} 
                            onClose={handleClose} 
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right'
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right'
                            }}
                        >
                            <UnenrollCourse course_id={props.course_id} course_title={props.course_title} />
                        </Popover>
                </Toolbar>
            </AppBar>
            
        </div>
    );
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps, null)(NavBar);