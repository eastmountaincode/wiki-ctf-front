type WikiframeProps = {
    src: string;
    width: number;
    height: number;
};

export default function Wikiframe({ src, width, height }: WikiframeProps) {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width, height, zIndex: 0 }}>
            <iframe
                src={src}
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    border: 'none',
                    zIndex: 0
                }}
                scrolling="no"
            />
            {/* Transparent overlay to block all pointer events */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width,
                    height,
                    zIndex: 1,
                    background: 'transparent',
                    pointerEvents: 'all'
                }}
            />
        </div>
    );
}
