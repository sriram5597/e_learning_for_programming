import React, { useState, useEffect } from 'react';

//utils
import TipButton from '../../../../utils/TipButton';

//mui
import { TextField, List, ListItem } from '@material-ui/core';

//mui/icon
import { AddCircle, Clear } from '@material-ui/icons';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        position: "relative",
        margin: 75,
    },
    text: {
        position: "relative",
        width: '60%',
    }
}));

const ListContent = (props) => {
    const classes = useStyles();

    const [items, setItems] = useState([]);
    const [data, setData] = useState([]);

    const handleChange = (index) => (e) => {
        data[index] = e.target.value;
        setData(data);
        props.setListItem(data);
    }

    const handleAddItem = () => {
        setData([...data, ""]);
        setItems([...items, <TextField name={`${items.length}`} value={data[items.length]} variant='outlined' multiline rows="4" 
                onChange={handleChange(items.length)} className={classes.text} 
        />])
    }

    useEffect(() => {
        setData([...data, ""]);
        setItems([...items, <TextField name={`${items.length}`} variant='outlined' multiline rows="4" value={data[items.length]}
                onChange={handleChange(items.length)} className={classes.text} 
        />])
    }, []);

    return (
        <div className={classes.root}>
            <List>
                {
                    items.map( (item, index) => {
                        return (
                            <ListItem key={index}>
                                {item}
                            </ListItem>
                        )
                    })   
                }
            </List>
            <TipButton tip="add item" btnColor='primary' onClick={handleAddItem}>
                <AddCircle />
            </TipButton>
        </div>
    )
}

export default ListContent;