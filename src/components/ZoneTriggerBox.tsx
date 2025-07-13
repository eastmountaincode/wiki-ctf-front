import type { NavigationZone } from '@/app/config/config';

export default function ZoneTriggerBox({ z }: { z: NavigationZone }) {
    // Try to show a friendly label (e.g. "To Sphagnopsida"), fallback if missing
    return (
        <div
            style={{
                position: 'absolute',
                left: z.left,
                top: z.top,
                width: z.width,
                height: z.height,
                background: 'rgba(255, 200, 0, 0.25)',
                border: '2px dashed orange',
                zIndex: 10,
                pointerEvents: 'none'
            }}
        >
            <span style={{
                color: '#b8860b',
                fontWeight: 700,
                fontSize: 18,
                position: 'absolute',
                left: 8,
                top: 2,
            }}>
            </span>
        </div>
    );
}
