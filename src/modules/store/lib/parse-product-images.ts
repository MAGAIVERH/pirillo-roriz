export function parseProductImageUrls(
  imageUrl: string | null,
  galleryUrls: unknown,
): string[] {
  if (Array.isArray(galleryUrls)) {
    const urls = galleryUrls.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0,
    );

    if (urls.length > 0) {
      return urls;
    }
  }

  if (imageUrl?.trim()) {
    return [imageUrl];
  }

  return [];
}
