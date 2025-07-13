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
