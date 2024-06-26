import { GOOGLE_PLACES_API_KEY } from "@/config";
import db from "../db";
import { destination } from "../db/schema";
import { eq } from "drizzle-orm";

export const getPlaceId = async (id: number) => {
  const destinationQuery = await db
    .select({
      name: destination.name,
      country: destination.country,
      googlePlaceId: destination.googlePlaceId,
    })
    .from(destination)
    .where(eq(destination.id, id));

  if (destinationQuery.length === 0) return null;

  if (destinationQuery[0].googlePlaceId)
    return destinationQuery[0].googlePlaceId;

  const result = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify({
        textQuery: `${destinationQuery[0].name}, ${destinationQuery[0].country}`,
        languageCode: "en",
      }),
    }
  ).then((res) => res.json());

  if (!result.places || result.places.length === 0) return null;

  await db
    .update(destination)
    .set({ googlePlaceId: result.places[0].id })
    .where(eq(destination.id, id));

  return result.places[0].id;
};

export const getImageUrl = async (
  placeId: string,
  width = 800,
  height = 800
) => {
  const placeDetails = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`,
    {
      headers: {
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "photos",
      },
    }
  ).then((res) => res.json());

  if (!placeDetails.photos) return null;

  const imageName = placeDetails.photos[0].name;

  if (!imageName) return null;

  return await fetch(
    `https://places.googleapis.com/v1/${imageName}/media?key=${process.env.GOOGLE_PLACES_API_KEY}&maxWidthPx=${width}&maxHeightPx=${height}&skipHttpRedirect=true`
  )
    .then((res) => res.json())
    .then((res) => res.photoUri);
};

export const getImageUrls = async (placeId: string) => {
  const placeDetails = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`,
    {
      headers: {
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "photos",
      },
    }
  ).then((res) => res.json());

  if (!placeDetails.photos) return [];

  const imageUrls = await Promise.all(
    placeDetails.photos.slice(0, 5).map(async (photo: any) => {
      const imageName = photo.name;

      return await fetch(
        `https://places.googleapis.com/v1/${imageName}/media?key=${process.env.GOOGLE_PLACES_API_KEY}&maxWidthPx=800&maxHeightPx=800&skipHttpRedirect=true`
      )
        .then((res) => res.json())
        .then((res) => res.photoUri);
    })
  );

  return imageUrls;
};

export const takeUniqueOrThrow = <T extends any[]>(values: T): T[number] => {
  if (values.length !== 1)
    throw new Error("Found non unique or inexistent value");
  return values[0]!;
};

export const getDestinationImages = async (destinations: any[]) => {
  return await Promise.all(
    destinations.map(async (destination) => {
      const placeId = await getPlaceId(destination.id);
      if (!placeId) return destination;
      const thumbnail = await getImageUrl(placeId, 400, 400);
      return { ...destination, thumbnail };
    })
  );
};