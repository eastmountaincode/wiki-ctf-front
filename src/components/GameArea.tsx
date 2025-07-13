'use client';

import { useState, useEffect } from 'react';
import WikiFrame from '@/components/WikiFrame';
import AvatarOverlay from '@/app/avatars/AvatarOverlay';
import ZoneTriggerBox from '@/components/ZoneTriggerBox';
import { useAvatarMovement } from '@/app/hooks/useAvatarMovement';
import { useAvatarsMultiplayer } from '@/app/hooks/useAvatarsMultiplayer';
import { useTitlesMultiplayer } from '@/app/hooks/useTitlesMultiplayer';
import {
    IFRAME_WIDTH,
    IFRAME_HEIGHT,
    AVATAR_SIZE,
    PAGES,
    NAVIGATION_ZONES,
    NavigationZone,
    TEAM_COLORS,
    TEAM_STARTS,
    NAV_SPAWNS, // add this import for per-transition spawns/scroll
    TITLE_COVERS,
    TITLE_INITIAL_POSITIONS,
} from '@/app/config/config';
import type { Avatar } from '@/types/Avatar';
import type { AvatarSelection } from '@/components/AvatarSelect';
import React from 'react';
import SphagnopsidaTitle from './SphagnopsidaTitle';
import TakakiaTitle from './TakakiaTitle';

const SOCKET_SERVER_URL = 'http://142.93.200.109:4000';

// Collision uses bounding box, not just center:
function isAvatarInZone(
    avatar: { x: number; y: number },
    zone: { left: number; top: number; width: number; height: number }
) {
    const avatarLeft = avatar.x;
    const avatarRight = avatar.x + AVATAR_SIZE;
    const avatarTop = avatar.y;
    const avatarBottom = avatar.y + AVATAR_SIZE;

    const zoneLeft = zone.left;
    const zoneRight = zone.left + zone.width;
    const zoneTop = zone.top;
    const zoneBottom = zone.top + zone.height;

    return (
        avatarLeft < zoneRight &&
        avatarRight > zoneLeft &&
        avatarTop < zoneBottom &&
        avatarBottom > zoneTop
    );
}

// Check if two avatars are colliding (touching) - with buffer for more lenient tagging
function areAvatarsColliding(avatar1: Avatar, avatar2: Avatar, buffer: number = 15): boolean {
    const avatar1Left = avatar1.x - buffer;
    const avatar1Right = avatar1.x + AVATAR_SIZE + buffer;
    const avatar1Top = avatar1.y - buffer;
    const avatar1Bottom = avatar1.y + AVATAR_SIZE + buffer;

    const avatar2Left = avatar2.x - buffer;
    const avatar2Right = avatar2.x + AVATAR_SIZE + buffer;
    const avatar2Top = avatar2.y - buffer;
    const avatar2Bottom = avatar2.y + AVATAR_SIZE + buffer;

    return (
        avatar1Left < avatar2Right &&
        avatar1Right > avatar2Left &&
        avatar1Top < avatar2Bottom &&
        avatar1Bottom > avatar2Top
    );
}

// Get the opponent team's title name
function getOpponentTitleName(team: string): string {
    return team === 'Sphagnopsida' ? 'takakia' : 'sphagnopsida';
}

// Get the initial position for a title
function getTitleInitialPosition(titleName: string): { x: number; y: number; zoneIndex: number } {
    if (titleName === 'sphagnopsida') {
        return { x: TITLE_INITIAL_POSITIONS[1].x, y: TITLE_INITIAL_POSITIONS[1].y, zoneIndex: 1 };
    } else {
        return { x: TITLE_INITIAL_POSITIONS[2].x, y: TITLE_INITIAL_POSITIONS[2].y, zoneIndex: 2 };
    }
}


export default function GameArea({ avatarSelection }: { avatarSelection: AvatarSelection }) {
    const initialStart = TEAM_STARTS[avatarSelection.team];
    const [zoneIndex, setZoneIndex] = useState(initialStart.zoneIndex);
    const { titles, emitTitleMove } = useTitlesMultiplayer(SOCKET_SERVER_URL);

    // Track title movements (for future server sync)
    const handleTitleMove = (titleId: string, newZoneIndex: number) => {
        console.log(`Title ${titleId} moved to zone ${newZoneIndex}`);
        // TODO: Sync with server
    };

    // Track scroll for browser window
    const [scrollY, setScrollY] = useState<number>(initialStart.windowScrollY ?? 0);

    // Handle navigation when E is pressed in a navigation zone
    const onZoneChange = (
        avatar: Avatar,
        zoneIndex: number,
        setAvatar: React.Dispatch<React.SetStateAction<Avatar>>
    ) => {
        const zones = NAVIGATION_ZONES[zoneIndex];
        // Use bounding box for collision detection
        const foundZone = zones.find((z: NavigationZone) =>
            isAvatarInZone(avatar, z)
        );
        if (foundZone) {
            const navKey = `${zoneIndex}->${foundZone.goTo}`;
            const navSpawn = NAV_SPAWNS?.[navKey];

            // Check if avatar is carrying any titles and update their zone
            const carriedTitles = titles.filter(title => title.carriedBy === avatar.id);
            carriedTitles.forEach(title => {
                const updatedTitle = {
                    ...title,
                    currentZoneIndex: foundZone.goTo,
                    // Update position to follow avatar to new zone
                    x: (navSpawn?.x || 100) + AVATAR_SIZE / 2 - 120,
                    y: (navSpawn?.y || 100) - 60,
                };
                console.log(`Moving title ${title.id} to zone ${foundZone.goTo}`);
                emitTitleMove(updatedTitle);
            });

            setZoneIndex(foundZone.goTo);

            // If you have a specific spawn/scroll for this navigation, use it; otherwise fallback
            if (navSpawn) {
                setAvatar(a => ({
                    ...a,
                    x: navSpawn.x,
                    y: navSpawn.y,
                    zoneIndex: foundZone.goTo,
                }));
                setScrollY(navSpawn.windowScrollY ?? 0);
                window.scrollTo({ top: navSpawn.windowScrollY ?? 0, behavior: 'smooth' });
            } else {
                setAvatar(a => ({
                    ...a,
                    x: 100,
                    y: 100,
                    zoneIndex: foundZone.goTo,
                }));
                setScrollY(0);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    // Initialize avatar at team start
    const [avatar, setAvatar] = useAvatarMovement(
        {
            x: initialStart.x,
            y: initialStart.y,
            color: TEAM_COLORS[avatarSelection.team],
            label: avatarSelection.label,
            zoneIndex: initialStart.zoneIndex,
            team: avatarSelection.team,
        },
        zoneIndex,
        onZoneChange
    );
    const allAvatars = useAvatarsMultiplayer(avatar, zoneIndex, setAvatar, SOCKET_SERVER_URL);

    // Only show avatars currently in this zone/page
    const avatarsToShow = allAvatars.filter((a) => a.zoneIndex === zoneIndex);

    // Get all navigation zones for the current page
    const navZones = NAVIGATION_ZONES[zoneIndex];

    // Scroll window to spawn point on mount/zone change
    // (also catches initial load and team change)
    React.useEffect(() => {
        window.scrollTo({ top: scrollY, behavior: 'smooth' });
    }, [scrollY, zoneIndex]);

    // Check for tagging in the neutral zone (zone 0)
    React.useEffect(() => {
        if (zoneIndex !== 0) return; // Only check tagging in neutral zone

        const checkTagging = () => {
            const opponentTitleName = getOpponentTitleName(avatar.team);
            const opponentTitle = titles.find(t => t.id === opponentTitleName);
            
            // Only check if I'm carrying the opponent's title
            if (!opponentTitle || opponentTitle.carriedBy !== avatar.id) return;

            // Check collision with all other avatars from opposing team
            const opponentAvatars = allAvatars.filter(a => 
                a.id !== avatar.id && // Not myself
                a.team !== avatar.team && // From opposing team
                a.zoneIndex === 0 // In the neutral zone
            );

            for (const opponent of opponentAvatars) {
                if (areAvatarsColliding(avatar, opponent)) {
                    console.log(`Tagged by ${opponent.team} player! Resetting ${opponentTitleName} title`);
                    
                    // Reset title to initial position
                    const initialPos = getTitleInitialPosition(opponentTitleName);
                    const resetTitle = {
                        ...opponentTitle,
                        x: initialPos.x,
                        y: initialPos.y,
                        currentZoneIndex: initialPos.zoneIndex,
                        carriedBy: null,
                        teamColor: null,
                    };
                    
                    emitTitleMove(resetTitle);
                    break; // Only need to be tagged once
                }
            }
        };

        const tagInterval = setInterval(checkTagging, 50); // Check every 50ms for responsive tagging
        return () => clearInterval(tagInterval);
    }, [zoneIndex, avatar, allAvatars, titles, emitTitleMove]);

    return (
        <div
            style={{
                width: IFRAME_WIDTH,
                height: IFRAME_HEIGHT,
                position: 'relative',
                margin: '0 auto',
                border: '2px solid #bbb',
            }}
        >
            <WikiFrame
                src={PAGES[zoneIndex].url}
                width={IFRAME_WIDTH}
                height={IFRAME_HEIGHT}
            />
            {/* ---- TITLE COVER RECTANGLE (WHITE) ---- */}
            {TITLE_COVERS[zoneIndex] && (
                <div
                    style={{
                        position: 'absolute',
                        left: TITLE_COVERS[zoneIndex].left,
                        top: TITLE_COVERS[zoneIndex].top,
                        width: TITLE_COVERS[zoneIndex].width,
                        height: TITLE_COVERS[zoneIndex].height,
                        background: '#fff',
                        zIndex: 25,
                        pointerEvents: 'none',

                    }}
                />
            )}

            {/* Render separate title components */}
            <SphagnopsidaTitle
                currentZoneIndex={zoneIndex}
                avatar={avatar}
                emitTitleMove={emitTitleMove}
                titles={titles}
            />
            <TakakiaTitle
                currentZoneIndex={zoneIndex}
                avatar={avatar}
                emitTitleMove={emitTitleMove}
                titles={titles}
            />

            <AvatarOverlay
                avatars={avatarsToShow}
                width={IFRAME_WIDTH}
                height={IFRAME_HEIGHT}
            />
            {/* Render all navigation zones as overlays */}
            {navZones.map((z, idx) => (
                <ZoneTriggerBox key={idx} z={z} />
            ))}
        </div>
    );
}
