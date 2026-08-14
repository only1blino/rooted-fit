import { resolveFoodLocation, type FoodCountry } from "./food-catalogue";

const THUMBNAILS = {
  lagos: "/manus-storage/rootedfit-lagos-recipes_36f98f79.png",
  accra: "/manus-storage/rootedfit-accra-recipes_fa9dc3e0.png",
  nairobi: "/manus-storage/rootedfit-nairobi-recipes_25f6e264.png",
  mombasa: "/manus-storage/rootedfit-nairobi-recipes_25f6e264.png",
  toronto: "/manus-storage/rootedfit-toronto-recipes_25acbb56.png",
  vancouver: "/manus-storage/rootedfit-vancouver-recipes_25ae6f18.png",
  montreal: "/manus-storage/rootedfit-montreal-recipes_36626aa3.png",
  johannesburg: "/manus-storage/rootedfit-johannesburg-recipes_ca7a43ae.png",
  capeTown: "/manus-storage/rootedfit-johannesburg-recipes_ca7a43ae.png",
  london: "/manus-storage/rootedfit-london-recipes_228216ee.png",
  birmingham: "/manus-storage/rootedfit-london-recipes_228216ee.png",
  houston: "/manus-storage/rootedfit-toronto-recipes_25acbb56.png",
  losAngeles: "/manus-storage/rootedfit-toronto-recipes_25acbb56.png",
  manila: "/manus-storage/rootedfit-manila-recipes_04023077.png",
  addis: "/manus-storage/rootedfit-addis-recipes_2bc5678c.png",
  mumbai: "/manus-storage/rootedfit-mumbai-recipes_c70f90af.png",
  karachi: "/manus-storage/rootedfit-karachi-recipes_d40bc638.png",
  dhaka: "/manus-storage/rootedfit-dhaka-recipes_c08f3034.png",
  kampala: "/manus-storage/rootedfit-kampala-recipes_5c050c91.png",
  dar: "/manus-storage/rootedfit-dar-recipes_b689ef1c.png",
} as const;

const COUNTRY_FALLBACKS: Record<FoodCountry, string> = {
  Nigeria: THUMBNAILS.lagos,
  Ghana: THUMBNAILS.accra,
  Kenya: THUMBNAILS.nairobi,
  "South Africa": THUMBNAILS.johannesburg,
  "United Kingdom": THUMBNAILS.london,
  "United States": THUMBNAILS.houston,
  Canada: THUMBNAILS.toronto,
  Other: THUMBNAILS.manila,
};

/** Returns a lightweight visual anchored to the resolved city pack, never the user's previous country default. */
export function recipeThumbnailFor(country: FoodCountry, city = "", matchChoice: "auto" | "confirmed" | "manual" = "auto") {
  const resolved = resolveFoodLocation(country, city, matchChoice);
  const aliases = resolved.pack?.aliases ?? [];
  if (aliases.some((alias) => ["lagos", "abuja"].includes(alias))) return THUMBNAILS.lagos;
  if (aliases.some((alias) => ["accra", "kumasi"].includes(alias))) return THUMBNAILS.accra;
  if (aliases.some((alias) => ["mombasa", "malindi", "kilifi"].includes(alias))) return THUMBNAILS.mombasa;
  if (aliases.some((alias) => ["nairobi", "kiambu", "kikuyu"].includes(alias))) return THUMBNAILS.nairobi;
  if (aliases.some((alias) => ["vancouver", "surrey", "burnaby", "richmond"].includes(alias))) return THUMBNAILS.vancouver;
  if (aliases.some((alias) => ["montreal", "montréal", "laval", "longueuil"].includes(alias))) return THUMBNAILS.montreal;
  if (aliases.some((alias) => ["toronto", "north york", "scarborough", "etobicoke", "mississauga", "brampton", "markham"].includes(alias))) return THUMBNAILS.toronto;
  if (aliases.some((alias) => ["cape town", "stellenbosch"].includes(alias))) return THUMBNAILS.capeTown;
  if (aliases.some((alias) => ["johannesburg", "soweto", "pretoria", "durban", "umhlanga"].includes(alias))) return THUMBNAILS.johannesburg;
  if (aliases.some((alias) => ["birmingham", "manchester", "leeds"].includes(alias))) return THUMBNAILS.birmingham;
  if (aliases.some((alias) => ["london"].includes(alias))) return THUMBNAILS.london;
  if (aliases.some((alias) => ["los angeles", "san diego", "phoenix", "el paso"].includes(alias))) return THUMBNAILS.losAngeles;
  if (aliases.some((alias) => ["houston", "atlanta", "new orleans", "dallas", "new york", "chicago", "detroit", "boston"].includes(alias))) return THUMBNAILS.houston;
  if (aliases.some((alias) => ["mumbai", "delhi", "bengaluru", "bangalore", "hyderabad", "pune"].includes(alias))) return THUMBNAILS.mumbai;
  if (aliases.some((alias) => ["karachi", "lahore", "islamabad"].includes(alias))) return THUMBNAILS.karachi;
  if (aliases.some((alias) => ["dhaka", "chittagong"].includes(alias))) return THUMBNAILS.dhaka;
  if (aliases.some((alias) => ["manila", "cebu", "davao"].includes(alias))) return THUMBNAILS.manila;
  if (aliases.some((alias) => ["addis", "addis ababa"].includes(alias))) return THUMBNAILS.addis;
  if (aliases.some((alias) => ["dar es salaam", "dar", "arusha", "dodoma"].includes(alias))) return THUMBNAILS.dar;
  if (aliases.some((alias) => ["kampala", "entebbe"].includes(alias))) return THUMBNAILS.kampala;
  return COUNTRY_FALLBACKS[resolved.country];
}
