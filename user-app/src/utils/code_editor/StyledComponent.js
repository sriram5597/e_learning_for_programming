import styled from 'styled-components';

export const StyledEditor = styled.div`
    width:100%;
    margin:auto;
    box-shadow: 0px 2px 2px 2px rgba(0,0,0,0.5);
    height:500px;
    overflow-y: scroll;
    padding:20px;
    font-size: 18px;
    font-family: 'calibri', sans-serif;
`

export const Toolbar = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 80%;
    padding: 10px 20px;
    margin-bottom: 5px;
    top: 10px;
    text-align: center;
    height: 30px;
    z-index: 4;
`

export const Container = styled.div `
    position: "relative";
    margin-top: 10px;
    width: 98%;
    height: 75vh;
    background-color: #f5f5f5;
    box-shadow: 2px 2px 2px 2px  rgba(0,0,0,0.5);
`

export const ViewContainer = styled.div `
    position: "relative";
    margin-top: 10px;
    width: 98%;
    height: 30vh;
    background-color: #f5f5f5;
    box-shadow: 2px 2px 2px 2px  rgba(0,0,0,0.5);
`