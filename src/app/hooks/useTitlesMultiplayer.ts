import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface TitleState {
    id: string;
    x: number;
    y: number;
    currentZoneIndex: number;
    carriedBy: string | null; // socket.id or null
    teamColor: string | null;
}

export function useTitlesMultiplayer(serverUrl: string) {
    const [titles, setTitles] = useState<TitleState[]>([]);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = io(serverUrl);

        socket.on('titles', (serverTitles: TitleState[]) => {
            setTitles(serverTitles);
        });

        socketRef.current = socket;

        return () => { socket.disconnect(); };
    }, [serverUrl]);

    // Call this to send a title move to the server
    function emitTitleMove(title: TitleState) {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('titleMove', title);
            console.log('Emitting title move', title);
        }
    }

    return { titles, emitTitleMove };
}
