// components/AvatarOverlay.tsx
import Avatar from './Avatar';

type AvatarType = {
    x: number;
    y: number;
    color?: string;
    label?: string;
};

type AvatarOverlayProps = {
    avatars: AvatarType[];
    width: number;
    height: number;
};

export default function AvatarOverlay({ avatars, width, height }: AvatarOverlayProps) {
    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width,
                height,
                pointerEvents: 'none',
                zIndex: 1,
            }}
        >
            {avatars.map((avatar, idx) => (
                <Avatar
                    key={idx}
                    x={avatar.x}
                    y={avatar.y}
                    color={avatar.color}
                    label={avatar.label}
                />
            ))}
        </div>
    );
}
