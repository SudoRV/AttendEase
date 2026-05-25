import { useEffect, useState } from "react";

export default function BrowserCheck({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    const vendor = navigator.vendor;

    const isChrome =
      ua.includes("Chrome") &&
      vendor === "Google Inc.";

    const isEdge = ua.includes("Edg");
    const isOpera = ua.includes("OPR") || ua.includes("Opera");
    const isFirefox = ua.includes("Firefox");
    const isSafari =
      ua.includes("Safari") &&
      !ua.includes("Chrome");

    const isBrave =
      navigator.brave &&
      typeof navigator.brave.isBrave === "function";

    const isAllowed =
      isChrome &&
      !isEdge &&
      !isOpera &&
      !isFirefox &&
      !isSafari &&
      !isBrave;

    setAllowed(isAllowed);
  }, []);

  if (allowed === null) {
    return null;
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">
            Unsupported Browser
          </h1>

          <p className="text-gray-400 mb-6">
            This website only works on Google Chrome.
          </p>

          <a
            href="https://www.google.com/chrome/"
            target="_blank"
            rel="noreferrer"
            className="inline-block px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition"
          >
            Open Chrome
          </a>
        </div>
      </div>
    );
  }

  return children;
}