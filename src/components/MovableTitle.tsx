import React from 'react';

interface MovableTitleProps {
    x: number;
    y: number;
    text: string;
    width?: number;
    height?: number;
    // For ownership display:
    teamColor?: string;
    carrying?: boolean;
}

export default function MovableTitle({
    x,
    y,
    text,
    width = 240,
    height = 54
}: MovableTitleProps) {
    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width,
                height,
                zIndex: 26,
                pointerEvents: 'none', // change to 'auto' when interactable!
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Linux Libertine', Georgia, serif",
                fontWeight: 400,
                fontSize: 38,
                color: '#202122',

                userSelect: 'none',
                transition: 'box-shadow 0.18s',
            }}
        >
            {text}
        </div>
    );
}
