import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Avatar } from '../../types/Avatar';

export function useAvatarsMultiplayer(
    avatar: Avatar,
    zoneIndex: number,
    setAvatar: React.Dispatch<React.SetStateAction<Avatar>>,
    serverUrl: string
) {
    const [allAvatars, setAllAvatars] = useState<Avatar[]>([]);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = io(serverUrl);
        socket.on('connect', () => {
            socket.emit('join', { ...avatar, zoneIndex });
        });
        socket.on('avatars', (avatars: Avatar[]) => {
            setAllAvatars(avatars);
        });
        socketRef.current = socket;
        return () => { socket.disconnect(); };
    }, []);

    useEffect(() => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('move', { ...avatar, zoneIndex });
        }
    }, [avatar, zoneIndex]);

    return allAvatars;
}
