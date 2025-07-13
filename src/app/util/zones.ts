import { AVATAR_SIZE } from '../config/config';

export function isAvatarInZone(
    avatar: { x: number; y: number },
    zone: { left: number; top: number; width: number; height: number }
) {
    // Avatar bounding box
    const avatarLeft = avatar.x;
    const avatarRight = avatar.x + AVATAR_SIZE;
    const avatarTop = avatar.y;
    const avatarBottom = avatar.y + AVATAR_SIZE;

    // Zone bounding box
    const zoneLeft = zone.left;
    const zoneRight = zone.left + zone.width;
    const zoneTop = zone.top;
    const zoneBottom = zone.top + zone.height;

    // Check for overlap
    return (
        avatarLeft < zoneRight &&
        avatarRight > zoneLeft &&
        avatarTop < zoneBottom &&
        avatarBottom > zoneTop
    );
}
