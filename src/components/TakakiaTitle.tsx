import React, { useState, useEffect } from 'react';
import MovableTitle from './MovableTitle';
import { TITLE_INITIAL_POSITIONS, AVATAR_SIZE } from '@/app/config/config';
import type { Avatar } from '@/types/Avatar';

interface TakakiaTitleProps {
    currentZoneIndex: number;
    avatar: Avatar;
    onTitleMove?: (titleId: string, newZoneIndex: number) => void;
}

// Check if avatar is near the title (within pickup range)
function isAvatarNearTitle(
    avatar: { x: number; y: number },
    title: { x: number; y: number },
    pickupRange: number = 100
) {
    const avatarCenterX = avatar.x + AVATAR_SIZE / 2;
    const avatarCenterY = avatar.y + AVATAR_SIZE / 2;
    const titleCenterX = title.x + 120; // half of title width (240/2)
    const titleCenterY = title.y + 27;  // half of title height (54/2)

    const distance = Math.sqrt(
        Math.pow(avatarCenterX - titleCenterX, 2) + 
        Math.pow(avatarCenterY - titleCenterY, 2)
    );

    return distance <= pickupRange;
}

export default function TakakiaTitle({ 
    currentZoneIndex, 
    avatar, 
    onTitleMove 
}: TakakiaTitleProps) {
    const originalZoneIndex = 2; // Takakia is always zoneIndex 2
    const initialPos = TITLE_INITIAL_POSITIONS[originalZoneIndex];
    
    const [titleState, setTitleState] = useState({
        x: initialPos.x,
        y: initialPos.y,
        currentZoneIndex: originalZoneIndex,
        carriedBy: null as string | null,
    });

    // Handle E key press for pickup/drop
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key.toLowerCase() === 'e') {
                // Only handle if avatar is in the same zone as the title
                if (avatar.zoneIndex === titleState.currentZoneIndex) {
                    if (titleState.carriedBy) {
                        // Drop the title
                        setTitleState(prev => ({
                            ...prev,
                            carriedBy: null,
                        }));
                    } else if (isAvatarNearTitle(avatar, titleState)) {
                        // Pick up the title
                        setTitleState(prev => ({
                            ...prev,
                            carriedBy: avatar.label, // Use avatar label as ID
                        }));
                    }
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [avatar, titleState]);

    // Update title position when being carried
    useEffect(() => {
        if (titleState.carriedBy && avatar.zoneIndex === titleState.currentZoneIndex) {
            setTitleState(prev => ({
                ...prev,
                x: avatar.x + AVATAR_SIZE / 2 - 120, // Center title on avatar
                y: avatar.y - 60, // Position above avatar
            }));
        }
    }, [avatar.x, avatar.y, titleState.carriedBy, avatar.zoneIndex, titleState.currentZoneIndex]);

    // Handle zone changes when title is being carried
    useEffect(() => {
        if (titleState.carriedBy && avatar.zoneIndex !== titleState.currentZoneIndex) {
            setTitleState(prev => ({
                ...prev,
                currentZoneIndex: avatar.zoneIndex,
            }));
            onTitleMove?.('takakia', avatar.zoneIndex);
        }
    }, [avatar.zoneIndex, titleState.carriedBy, titleState.currentZoneIndex, onTitleMove]);

    // Only render if the title is in the current zone
    if (titleState.currentZoneIndex !== currentZoneIndex) {
        return null;
    }

    return (
        <MovableTitle
            x={titleState.x}
            y={titleState.y}
            text="Takakia"
            teamColor={titleState.carriedBy ? avatar.color : undefined}
            carrying={!!titleState.carriedBy}
        />
    );
} 