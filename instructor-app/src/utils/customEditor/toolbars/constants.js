import React from 'react';

//mui/icons
import { FormatBold, FormatItalic, FormatUnderlined, Code, FormatAlignCenter, FormatAlignLeft,
            FormatAlignRight, FormatAlignJustify, FormatListBulleted,
} from '@material-ui/icons';

export const inlineStyles = [
    {
        label: "bold",
        style: "BOLD",
        icon: <FormatBold/>
    },

    {
        label: "italic",
        style: "ITALIC",
        icon: <FormatItalic/>
    },

    {
        label: "underline",
        style: "UNDERLINE",
        icon: <FormatUnderlined/>
    },

    {
        label: "code",
        style: "CODE",
        icon: <Code/>
    },

]

export const headerStyles = [
    {
        label: "H1",
        type: "header-one",
        style: {
            textSize: "24px"
        }
    },

    {
        label: "H2",
        type: "header-two",
        style: {
            textSize: "22px"
        }
    },

    {
        label: "H3",
        type: "header-three",
        style: {
            textSize: "20px"
        }
    },

    {
        label: "H4",
        type: "header-four",
        style: {
            textSize: "18px"
        }
    },

    {
        label: "H5",
        type: "header-five",
        style: {
            textSize: "16px"
        }
    },

    {
        label: "H6",
        type: "header-six",
        style: {
            textSize: "14px"
        }
    },
]

export const textAlignStyles = [
    {
        label: "Align-left",
        type: "left",
        icon: <FormatAlignLeft/>
    },

    {
        label: "Align-center",
        type: "center",
        icon: <FormatAlignCenter/>
    },

    {
        label: "Align-right",
        type: "right",
        icon: <FormatAlignRight/>
    },

    {
        label: "Align-justify",
        type: "justify",
        icon: <FormatAlignJustify/>
    },
]

export const BlockStyles = [
    {
        label: "unordered-list",
        type: 'unordered-list-item',
        icon: <FormatListBulleted />
    }
]
