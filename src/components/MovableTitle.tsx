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
    height = 54,
    teamColor,
    carrying,
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
                color: teamColor || '#202122',
                backgroundColor: carrying ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                border: teamColor ? `2px solid ${teamColor}` : 'none',
                borderRadius: carrying ? '4px' : '0px',
                userSelect: 'none',
                transition: 'all 0.18s',
                boxShadow: carrying ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
            }}
        >
            {text}
        </div>
    );
}
