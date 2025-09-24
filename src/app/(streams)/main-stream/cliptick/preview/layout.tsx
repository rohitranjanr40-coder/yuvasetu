
'use client';

import React from 'react';

// This layout ensures that the cliptick editor and its child pages
// (preview, publish) don't inherit the main app layout with sidebars 
// and headers, allowing for a full-screen experience.
export default function ClipTickPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
