import styled from 'styled-components';

export const ToolbarItem = styled.div`
    width: 28px;
    height: 27px;
    display: flex;
    align-items: center;
    margin-right: 5px;
    border: 1px solid;
    box-shadow: 0px 1px 11px 1px rgba(15, 15, 15, 0.2);
    transition: all 250ms ease-in-out;
    cursor: pointer;

    ${props => props.isActive && 
        `
            transform: translateY(1px);
            background-color: #c4c1be;
            border: 1px solid;
            box-shadow: none;
        `
    }

    &:hover {
        transform: translateY(1px);
        backgorund-color: transparent;
        box-shadow: none;
    }
`;

export const Container = styled.div`
    display: flex;
    margin-right: 7px;
`;

