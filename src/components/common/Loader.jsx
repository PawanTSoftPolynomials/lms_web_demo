"use client";

// Same markup as react-loader-spinner's <TailSpin height={40} width={40} />
// (strokeWidth 2, radius 1), inlined: that package pulls styled-components,
// stylis and tinycolor2 (~18KB compressed) into every dashboard page just to
// draw this SVG, which animates on its own via SMIL.
const COLOR = "#f2c7c7";

export default function Loader() {
  return (
    <div className="flex justify-center items-center">
      <div className="flex" aria-label="loading" data-testid="tail-spin-loading">
        <svg width="40" height="40" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd">
            <g transform="translate(1 1)">
              <path d="M36 18c0-9.94-8.06-18-18-18" stroke={COLOR} strokeWidth="2">
                <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite" />
              </path>
              <circle fill="#fff" cx="36" cy="18" r="1">
                <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite" />
              </circle>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
