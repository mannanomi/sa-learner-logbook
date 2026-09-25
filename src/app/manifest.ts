import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SA Learner Logbook",
    short_name: "Learner Logbook",
    description:
      "Record and track supervised driving sessions for your South Australian learner logbook.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1665d8",
    orientation: "portrait",
    icons: [
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
