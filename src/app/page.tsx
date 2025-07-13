'use client';
import { useState } from 'react';
import AvatarSelect, { AvatarSelection } from '../components/AvatarSelect';
import GameArea from '../components/GameArea';

export default function Home() {
    const [avatarSelection, setAvatarSelection] = useState<AvatarSelection | null>(null);

    if (!avatarSelection) {
        return <AvatarSelect onSelect={setAvatarSelection} />;
    }

    return <GameArea avatarSelection={avatarSelection} />;
}
