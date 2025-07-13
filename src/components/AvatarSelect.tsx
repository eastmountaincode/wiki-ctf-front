import { useState } from 'react';

export type Team = 'Sphagnopsida' | 'Takakia';

export interface AvatarSelection {
    label: string;
    team: Team;
}

const TEAM_OPTIONS: { name: Team; color: string }[] = [
    { name: 'Sphagnopsida', color: '#8B5CF6' }, // purple
    { name: 'Takakia', color: '#FACC15' },      // yellow
];

export default function AvatarSelect({ onSelect }: { onSelect: (choice: AvatarSelection) => void }) {
    const [label, setLabel] = useState('');
    const [team, setTeam] = useState<Team>('Sphagnopsida');
    const [error, setError] = useState('');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const letter = label.trim().toUpperCase();
        if (!/^[A-Z0-9]$/.test(letter)) {
            setError('Please enter a single letter or number.');
            return;
        }
        onSelect({ 
            label: letter, 
            team 
        });
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <form 
                onSubmit={handleSubmit} 
                className="bg-black p-8 flex flex-col items-center gap-6"
                style={{ minWidth: 320 }}
            >
                <div className="mb-3 text-xl font-bold text-white">Choose Your Letter</div>
                <input
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    maxLength={1}
                    className="border border-white bg-black text-white px-3 py-2 text-center text-2xl w-16"
                    placeholder=""
                    autoFocus
                />

                <div className="text-lg font-semibold text-white mt-8 mb-4">Choose Your Team</div>
                <div className="flex gap-4">
                    {TEAM_OPTIONS.map(opt => (
                        <button
                            type="button"
                            className="cursor-pointer"
                            key={opt.name}
                            style={{
                                background: opt.color,
                                border: team === opt.name ? '2px solid white' : '2px solid transparent',
                                color: opt.name === 'Takakia' ? 'black' : 'white',
                                minWidth: 120,
                                fontWeight: 'bold',
                                fontSize: '16px',
                                padding: '8px 16px'
                            }}
                            onClick={() => setTeam(opt.name)}
                        >
                            {opt.name}
                        </button>
                    ))}
                </div>

                {error && <div className="text-white font-semibold">{error}</div>}
                <button 
                    type="submit" 
                    className="mt-4 bg-black text-white border border-white px-5 py-2 font-bold text-lg hover:bg-white hover:text-black"
                >
                    Enter
                </button>
            </form>
        </div>
    );
}
