export const PortraitPrompt = () => (
  <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center gap-5 text-white select-none">
    {/* Animated rotate icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-20 h-20 text-blue-400 animate-bounce"
    >
      {/* Phone outline */}
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      {/* Rotate arrows around the phone */}
      <path d="M1 12 C1 7 4 3 8 1.5" strokeDasharray="2 2" />
      <path d="M8 1.5 L6 0 M8 1.5 L9.5 3.5" />
      <path d="M23 12 C23 17 20 21 16 22.5" strokeDasharray="2 2" />
      <path d="M16 22.5 L18 24 M16 22.5 L14.5 20.5" />
    </svg>

    <div className="text-center space-y-2">
      <p className="text-xl font-semibold tracking-wide">Rotate your device</p>
      <p className="text-sm text-gray-400">This app works best in landscape mode</p>
    </div>

    {/* Horizontal phone illustration */}
    <div className="mt-2 opacity-40">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="w-24 h-12 text-gray-300"
      >
        <rect x="1" y="2" width="46" height="20" rx="3" ry="3" />
        <circle cx="44" cy="12" r="1.5" fill="currentColor" />
      </svg>
    </div>
  </div>
);
