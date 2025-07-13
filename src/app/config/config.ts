// config/config.ts

export const IFRAME_WIDTH = 1200;
export const IFRAME_HEIGHT = 7200;
export const AVATAR_SIZE = 32;
export const MOVE_SPEED = 7;

export const PAGES = [
    { name: 'Moss', url: 'https://en.wikipedia.org/wiki/Moss' },
    { name: 'Sphagnopsida', url: 'https://en.wikipedia.org/wiki/Sphagnopsida' },
    { name: 'Takakia', url: 'https://en.wikipedia.org/wiki/Takakia' },
];

export interface NavigationZone {
    left: number;
    top: number;
    width: number;
    height: number;
    goTo: number;   // index into PAGES
    label?: string; // for debugging
}

// Array-of-arrays: Each page gets its own array of zones

export const NAVIGATION_ZONES: NavigationZone[][] = [
    // Page 0 ("Moss") zones
    [
        {
            left: 270,
            top: 6183,
            width: 200,
            height: 35,
            goTo: 1, // To Sphagnopsida
            label: 'To Sphagnopsida',
        },
        {
            left: 680,
            top: 880,
            width: 200,
            height: 35,
            goTo: 2, // To Takakia
            label: 'To Takakia',
        },
    ],
    // Page 1 ("Sphagnopsida") zones
    [
        {
            left: 448,
            top: 207,
            width: 90,
            height: 40,
            goTo: 0, // To Moss
            label: 'To Moss',
        },
    ],
    // Page 2 ("Takakia") zones
    [
        {
            left: 507,
            top: 207,
            width: 90,
            height: 40,
            goTo: 0, // To Moss
            label: 'To Moss',
        },
    ],
];


import type { Team } from '@/components/AvatarSelect';

export const TEAM_COLORS: Record<Team, string> = {
    Sphagnopsida: '#8B5CF6', // purple
    Takakia: '#FACC15',      // yellow
};

export interface SpawnSettings {
    zoneIndex: number;
    x: number;
    y: number;
    windowScrollY?: number;
}

export const TEAM_STARTS: Record<Team, SpawnSettings> = {
    Sphagnopsida: { zoneIndex: 1, x: 300, y: 300, windowScrollY: 0 },
    Takakia: { zoneIndex: 2, x: 400, y: 400, windowScrollY: 0 },
};

export const NAV_SPAWNS: Record<string, SpawnSettings> = {
    '2->0': { zoneIndex: 0, x: 680, y: 880, windowScrollY: 600 }, // Takakia to Moss
    '1->0': { zoneIndex: 0, x: 430, y: 6160, windowScrollY: 5800 }, // Sphagnopsida to Moss
    '0->1': { zoneIndex: 1, x: 448, y: 207, windowScrollY: 0 }, // Moss to Sphagnopsida
    '0->2': { zoneIndex: 2, x: 507, y: 207, windowScrollY: 0 }, // Moss to Takakia
};

export interface TitleCover {
    left: number;
    top: number;
    width: number;
    height: number;
}

// Keyed by zoneIndex/pageIndex (number)
export const TITLE_COVERS: Record<number, TitleCover> = {
    1: { left: 260, top: 68, width: 200, height: 60 }, // Sphagnopsida (zoneIndex 1)
    2: { left: 250, top: 68, width: 200, height: 60 }, // Takakia (zoneIndex 2)
};


export interface TitleInitialPosition {
    x: number;
    y: number;
    width?: number;
    height?: number;
}

export const TITLE_INITIAL_POSITIONS: Record<number, TitleInitialPosition> = {
    1: { x: 254, y: 84 }, // Sphagnopsida (zoneIndex 1)
    2: { x: 205, y: 80 }, // Takakia (zoneIndex 2)
};