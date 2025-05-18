"use client";

import React from "react";
import { SEOSectionsComponent } from "@/components/sections_component";
import { SEOHymnsComponent } from "@/components/seo_hymns_component";

export default function SEOWrapper() {
  return (
    <>
      <SEOSectionsComponent />
      <SEOHymnsComponent />
    </>
  );
}
