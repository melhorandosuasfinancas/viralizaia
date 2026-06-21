"use client";

import React from "react";

const STYLES = `
  .loader15-wrapper { position: relative; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
  .loader15-svg-wrap { position: relative; width: 200px; height: 200px; }
  .loader15-gegga { width: 0; height: 0; }
  .loader15-snurra { filter: url(#loader15-gegga); position: absolute; inset: 0; }
  .loader15-stopp1 { stop-color: #f700a8; }
  .loader15-stopp2 { stop-color: #a855f7; }
  .loader15-halvan {
    animation: loader15-spin 10s infinite linear;
    stroke-dasharray: 180 800;
    fill: none;
    stroke: url(#loader15-gradient);
    stroke-width: 23;
    stroke-linecap: round;
  }
  .loader15-strecken {
    animation: loader15-spin 3s infinite linear;
    stroke-dasharray: 26 54;
    fill: none;
    stroke: url(#loader15-gradient);
    stroke-width: 23;
    stroke-linecap: round;
  }
  .loader15-skugga {
    filter: blur(5px);
    opacity: 0.3;
    position: absolute;
    inset: 0;
    transform: translate(3px, 3px);
  }
  .loader15-text {
    font-weight: 600;
    background: linear-gradient(90deg, #f700a8, #a855f7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.04em;
    animation: loader15-pulse 1.6s ease-in-out infinite;
  }
  @keyframes loader15-spin {
    0% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: -403px; }
  }
  @keyframes loader15-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
`;

interface Loader15Props {
  text?: string;
  className?: string;
}

const Loader15: React.FC<Loader15Props> = ({ text = "Carregando cortes", className }) => {
  return (
    <div className={`loader15-wrapper ${className ?? ""}`}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="loader15-svg-wrap">
        <svg className="loader15-gegga">
          <defs>
            <filter id="loader15-gegga">
              <feGaussianBlur in="SourceGraphic" stdDeviation={7} result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10"
                result="inreGegga"
              />
              <feComposite in="SourceGraphic" in2="inreGegga" operator="atop" />
            </filter>
          </defs>
        </svg>
        <svg className="loader15-snurra" width={200} height={200} viewBox="0 0 200 200">
          <defs>
            <linearGradient id="loader15-linear">
              <stop className="loader15-stopp1" offset={0} />
              <stop className="loader15-stopp2" offset={1} />
            </linearGradient>
            <linearGradient
              y2={160}
              x2={160}
              y1={40}
              x1={40}
              gradientUnits="userSpaceOnUse"
              id="loader15-gradient"
              xlinkHref="#loader15-linear"
            />
          </defs>
          <path
            className="loader15-halvan"
            d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776 -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64 0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736 -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64 64,-64"
          />
          <circle className="loader15-strecken" cx={100} cy={100} r={64} />
        </svg>
        <svg className="loader15-skugga" width={200} height={200} viewBox="0 0 200 200">
          <path
            className="loader15-halvan"
            d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776 -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64 0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736 -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64 64,-64"
          />
          <circle className="loader15-strecken" cx={100} cy={100} r={64} />
        </svg>
      </div>
      {text && <p className="loader15-text">{text}</p>}
    </div>
  );
};

export default Loader15;
