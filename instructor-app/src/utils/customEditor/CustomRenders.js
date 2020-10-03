import './custom_styles.css';

export const customStyles = {
    inlineStyles: {
        CODE: {
            style: {
                backgroundColor: '#10052b',
                color: '#c5c3b0',
                fontSize: 18,

            }
        },
    }
}

export const getBlockStyles = (block) => {
    switch(block.getType()){
        case "left":
                return 'align-left';

        case "center":
                return "align-center";

        case "right":
                return 'align-right';
        
        case "justify":
                return 'align-justify';

        case "header-one__center":
                return 'align-center';
        
        default: 
                return null;
    }
}

export const getBlockRenderer = (block) => {
    switch(block.getType()){
        case 'header-one__center':
            return ({
                component: 'h1',
            })
            
        default:
            return null;
    }
}