import React, { useEffect, useRef } from 'react';
import MovableTitle from './MovableTitle';
import { AVATAR_SIZE } from '@/app/config/config';
import type { Avatar } from '@/types/Avatar';
import type { TitleState } from '@/app/hooks/useTitlesMultiplayer';

interface SphagnopsidaTitleProps {
    titles: TitleState[];
    avatar: Avatar;
    emitTitleMove: (title: TitleState) => void;
    currentZoneIndex: number;
}

function isAvatarNearTitle(
    avatar: { x: number; y: number },
    title: { x: number; y: number },
    pickupRange = 100
) {
    const avatarCenterX = avatar.x + AVATAR_SIZE / 2;
    const avatarCenterY = avatar.y + AVATAR_SIZE / 2;
    const titleCenterX = title.x + 120;
    const titleCenterY = title.y + 27;
    const distance = Math.sqrt(
        Math.pow(avatarCenterX - titleCenterX, 2) +
        Math.pow(avatarCenterY - titleCenterY, 2)
    );
    return distance <= pickupRange;
}

export default function SphagnopsidaTitle({
    titles,
    avatar,
    emitTitleMove,
    currentZoneIndex,
}: SphagnopsidaTitleProps) {
    // Wait until titles is non-empty and contains the right title
    const title = titles.find(t => t.id === 'sphagnopsida');
    
    // Keep track of the last emitted position to avoid unnecessary emissions
    const lastEmittedPosition = useRef<{x: number, y: number} | null>(null);
    // Use ref to capture current avatar position without causing effect to restart
    const avatarRef = useRef(avatar);
    avatarRef.current = avatar;

    // Listen for E to pick up/drop (only for this user)
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const currentTitle = titlesRef.current.find(t => t.id === 'sphagnopsida');
            if (!currentTitle) return; // Guard against undefined title
            if (e.key.toLowerCase() !== 'e') return;
            if (avatarRef.current.zoneIndex !== currentTitle.currentZoneIndex) return;
            if (!avatarRef.current.id) return; // Guard against undefined avatar.id (before socket connection)

            // Drop if carried by this user
            if (currentTitle.carriedBy === avatarRef.current.id) {
                const newTitle = { ...currentTitle, carriedBy: null };
                emitTitleMove(newTitle);
                lastEmittedPosition.current = { x: newTitle.x, y: newTitle.y };
            }
            // Pick up if not carried and close enough
            else if (!currentTitle.carriedBy && isAvatarNearTitle(avatarRef.current, currentTitle)) {
                const newTitle = { ...currentTitle, carriedBy: avatarRef.current.id ?? null, teamColor: avatarRef.current.color };
                emitTitleMove(newTitle);
                lastEmittedPosition.current = { x: newTitle.x, y: newTitle.y };
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [emitTitleMove]); // Only depend on emit function

    // Use refs to avoid effect restarts
    const titlesRef = useRef(titles);
    titlesRef.current = titles;

    // Periodically sync position to server when carrying (not on every movement)
    useEffect(() => {
        const syncInterval = setInterval(() => {
            const currentTitle = titlesRef.current.find(t => t.id === 'sphagnopsida');
            if (!currentTitle || currentTitle.carriedBy !== avatarRef.current.id || avatarRef.current.zoneIndex !== currentTitle.currentZoneIndex) {
                return; // Don't sync if not carrying or in wrong zone
            }

            const newX = avatarRef.current.x + AVATAR_SIZE / 2 - 120;
            const newY = avatarRef.current.y - 60;
            
            console.log('Syncing Sphagnopsida position:', newX, newY);
            
            // Only emit if position has changed significantly to reduce server traffic
            if (!lastEmittedPosition.current || 
                Math.abs(newX - lastEmittedPosition.current.x) > 20 || 
                Math.abs(newY - lastEmittedPosition.current.y) > 20) {
                
                console.log('Position changed significantly, emitting to server');
                const updatedTitle = {
                    ...currentTitle,
                    x: newX,
                    y: newY,
                    teamColor: avatarRef.current.color,
                };
                emitTitleMove(updatedTitle);
                lastEmittedPosition.current = { x: newX, y: newY };
            }
        }, 100); // Sync every 100ms to reduce server traffic

        return () => clearInterval(syncInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only depend on emit function - most stable

    // Only render if title is defined and in this zone - moved after hooks
    if (!title || title.currentZoneIndex !== currentZoneIndex) return null;

    // Calculate display position (local for smooth movement when carrying)
    const displayX = title.carriedBy === avatarRef.current.id 
        ? avatarRef.current.x + AVATAR_SIZE / 2 - 120  // Always use local position when I'm carrying
        : title.x;                          // Use server position when not carrying or someone else is carrying
    const displayY = title.carriedBy === avatarRef.current.id 
        ? avatarRef.current.y - 60                     // Always use local position when I'm carrying
        : title.y;                          // Use server position when not carrying or someone else is carrying

    return (
        <MovableTitle
            x={displayX}
            y={displayY}
            text="Sphagnopsida"
            teamColor={title.carriedBy ? (title.carriedBy === avatarRef.current.id ? avatarRef.current.color : title.teamColor || undefined) : undefined}
            carrying={!!title.carriedBy}
        />
    );
}
