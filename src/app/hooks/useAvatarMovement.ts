import { useEffect, useRef, useState } from 'react';
import { IFRAME_WIDTH, IFRAME_HEIGHT, AVATAR_SIZE, MOVE_SPEED } from '../config/config';
import type { Avatar } from '../../types/Avatar';

export function useAvatarMovement(
    initialAvatar: Avatar,
    zoneIndex: number,
    onZoneChange: (avatar: Avatar, zoneIndex: number, setAvatar: React.Dispatch<React.SetStateAction<Avatar>>) => void
) {
    const [avatar, setAvatar] = useState<Avatar>(initialAvatar);
    const heldKeys = useRef<{ [key: string]: boolean }>({});
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ('wasd'.includes(e.key.toLowerCase())) {
                heldKeys.current[e.key.toLowerCase()] = true;
            }
            if (e.key.toLowerCase() === 'e') {
                onZoneChange(avatar, zoneIndex, setAvatar);
            }
        }
        function handleKeyUp(e: KeyboardEvent) {
            if ('wasd'.includes(e.key.toLowerCase())) {
                heldKeys.current[e.key.toLowerCase()] = false;
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [avatar, zoneIndex, onZoneChange]);

    useEffect(() => {
        function animate() {
            setAvatar((old) => {
                let { x, y } = old;
                if (heldKeys.current['w']) y -= MOVE_SPEED;
                if (heldKeys.current['s']) y += MOVE_SPEED;
                if (heldKeys.current['a']) x -= MOVE_SPEED;
                if (heldKeys.current['d']) x += MOVE_SPEED;
                x = Math.max(0, Math.min(IFRAME_WIDTH - AVATAR_SIZE, x));
                y = Math.max(0, Math.min(IFRAME_HEIGHT - AVATAR_SIZE, y));
                if (x !== old.x || y !== old.y) {
                    return { ...old, x, y };
                }
                return old;
            });
            animationRef.current = requestAnimationFrame(animate);
        }
        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return [avatar, setAvatar] as const;
}
