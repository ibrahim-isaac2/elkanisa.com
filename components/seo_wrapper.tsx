"use client";

import React from "react";
import SectionsComponent from "@/components/sections_component";
import SEOSongsComponent from "@/components/seo_songs_component";

export default function SEOWrapper() {
  return (
    <>
      <SectionsComponent />
      <SEOSongsComponent />
    </>
  );
}
