import { useState } from "react";

export function Headstock({ instrument }) {

    

    const [activeString, setActiveString] = useState(null);

    const handlePegClick = (stringId) => {
        setActiveString(activeString === stringId ? null : stringId);
    };

    const getPegFill = (stringId) => {
        return activeString === stringId ? '#10B981' : 'transparent';
    };

    const getPegStroke = (stringId) => {
        return activeString === stringId ? '#10B981' : '#000000';
    };

    if (instrument === "guitar") {
        return (
            <svg
                width="400"
                height="500"
                viewBox="0 0 210 297"
                version="1.1"
                className="max-w-full h-auto"
            >
                {/* Headstock body */}
                <path
                    style={{
                        fill: 'transparent',
                        stroke: '#000000',
                        strokeWidth: 2.32518,
                        strokeOpacity: 1
                    }}
                    d="M 64.966777,196.10263 C 71.461204,145.30912 71.1023,108.89707 59.233186,59.622389 92.33014,36.651029 121.3659,38.595133 147.33328,60.457796 136.71351,115.96824 134.97312,147.97916 141.47749,196.43849 Z"
                />

                {/* Left side tuning pegs (strings 6, 5, 4) */}
                <ellipse
                    id="peg-6"
                    style={{
                        fill: getPegFill(6),
                        stroke: getPegStroke(6),
                        strokeWidth: 1.58803,
                        strokeOpacity: 1,
                        cursor: 'pointer'
                    }}
                    cx="53.651386"
                    cy="91.49115"
                    rx="6.6219592"
                    ry="10.405935"
                    onClick={() => handlePegClick(6)}
                />
                <ellipse
                    id="peg-5"
                    style={{
                        fill: getPegFill(5),
                        stroke: getPegStroke(5),
                        strokeWidth: 1.58803,
                        strokeOpacity: 1,
                        cursor: 'pointer'
                    }}
                    cx="56.369587"
                    cy="125.40166"
                    rx="6.6219592"
                    ry="10.405935"
                    onClick={() => handlePegClick(5)}
                />
                <ellipse
                    id="peg-4"
                    style={{
                        fill: getPegFill(4),
                        stroke: getPegStroke(4),
                        strokeWidth: 1.58803,
                        strokeOpacity: 1,
                        cursor: 'pointer'
                    }}
                    cx="56.531563"
                    cy="159.61275"
                    rx="6.6219592"
                    ry="10.405935"
                    onClick={() => handlePegClick(4)}
                />

                {/* Right side tuning pegs (strings 3, 2, 1) */}
                <ellipse
                    id="peg-3"
                    style={{
                        fill: getPegFill(3),
                        stroke: getPegStroke(3),
                        strokeWidth: 1.58803,
                        strokeOpacity: 1,
                        cursor: 'pointer'
                    }}
                    cx="151"
                    cy="159.61275"
                    rx="6.6219592"
                    ry="10.405935"
                    onClick={() => handlePegClick(3)}
                />
                <ellipse
                    id="peg-2"
                    style={{
                        fill: getPegFill(2),
                        stroke: getPegStroke(2),
                        strokeWidth: 1.58803,
                        strokeOpacity: 1,
                        cursor: 'pointer'
                    }}
                    cx="149.78"
                    cy="125.40166"
                    rx="6.6219592"
                    ry="10.405935"
                    onClick={() => handlePegClick(2)}
                />
                <ellipse
                    id="peg-1"
                    style={{
                        fill: getPegFill(1),
                        stroke: getPegStroke(1),
                        strokeWidth: 1.58803,
                        strokeOpacity: 1,
                        cursor: 'pointer'
                    }}
                    cx="153"
                    cy="91.49115"
                    rx="6.6219592"
                    ry="10.405935"
                    onClick={() => handlePegClick(1)}
                />

                {/* Brand text */}
                <text
                    style={{
                        fontSize: '8.46667px',
                        letterSpacing: '2.11667px',
                        fill: '#000000',
                        stroke: 'none',
                        fontFamily: 'Arial, sans-serif'
                    }}
                    x="81.355515"
                    y="71.895561"
                >
                    DELUXE
                </text>
            </svg>
        )
    }
    else if (instrument === "ukulele") {
        return (
            <svg
                width="400"
                height="300"
                viewBox="0 0 210 200"
                version="1.1"
                className="max-w-full h-auto"
            >
                {/* Ukulele headstock body */}
                <path
                    style={{
                        fill: 'transparent',
                        stroke: '#000000',
                        strokeWidth: 2.00995,
                        strokeOpacity: 1
                    }}
                    d="M 65.903438,153.63488 C 72.422368,115.82269 72.06211,88.716492 60.148215,52.034969 93.37004,34.934412 122.51535,36.381661 148.5807,52.65687 137.92087,93.980479 136.17391,117.81035 142.70282,153.8849 Z"
                />

                {/* Left side tuning pegs (strings 4, 3) */}
                <ellipse
                    id="peg-4"
                    style={{
                        fill: getPegFill(4),
                        stroke: getPegStroke(4),
                        strokeWidth: 1.58803,
                        strokeOpacity: 1,
                        cursor: 'pointer'
                    }}
                    cx="53.651386"
                    cy="91.49115"
                    rx="6.6219592"
                    ry="10.405935"
                    onClick={() => handlePegClick(4)}
                />
                <ellipse
                    id="peg-3"
                    style={{
                        fill: getPegFill(3),
                        stroke: getPegStroke(3),
                        strokeWidth: 1.58803,
                        strokeOpacity: 1,
                        cursor: 'pointer'
                    }}
                    cx="56.369587"
                    cy="125.40166"
                    rx="6.6219592"
                    ry="10.405935"
                    onClick={() => handlePegClick(3)}
                />

                {/* Right side tuning pegs (strings 2, 1) */}
                <ellipse
                    id="peg-2"
                    style={{
                        fill: getPegFill(2),
                        stroke: getPegStroke(2),
                        strokeWidth: 1.58803,
                        strokeOpacity: 1,
                        cursor: 'pointer'
                    }}
                    cx="149.78"
                    cy="125.40166"
                    rx="6.6219592"
                    ry="10.405935"
                    onClick={() => handlePegClick(2)}
                />
                <ellipse
                    id="peg-1"
                    style={{
                        fill: getPegFill(1),
                        stroke: getPegStroke(1),
                        strokeWidth: 1.58803,
                        strokeOpacity: 1,
                        cursor: 'pointer'
                    }}
                    cx="152.5"
                    cy="91.49115"
                    rx="6.6219592"
                    ry="10.405935"
                    onClick={() => handlePegClick(1)}
                />

                {/* Brand text */}
                <text
                    style={{
                        fontSize: '8.46667px',
                        letterSpacing: '2.11667px',
                        fill: '#000000',
                        stroke: 'none',
                        fontFamily: 'Arial, sans-serif'
                    }}
                    x="81.355515"
                    y="71.895561"
                >
                    DELUXE
                </text>
            </svg>
        )
    }

    return <div>Graphics coming soon...</div>
}