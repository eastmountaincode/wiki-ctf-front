// components/Avatar.tsx
type AvatarProps = {
    x: number;
    y: number;
    color?: string;
    label?: string;
};

export default function Avatar({ x, y, color = 'blue', label = 'A' }: AvatarProps) {
    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 32,
                height: 32,
                background: color,
                borderRadius: '50%',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 16,
                pointerEvents: 'auto',
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
        >
            {label}
        </div>
    );
}
