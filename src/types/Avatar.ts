// types/Avatar.ts
import type { Team } from '@/components/AvatarSelect';

export interface Avatar {
    x: number;
    y: number;
    color: string;
    label: string;
    zoneIndex: number;
    team: Team;
    id?: string; // id is assigned by the server
}
