import { Portal } from '@portalsdk/core';

export const portalClient = new Portal({
  apiKey: process.env.NEXT_PUBLIC_PORTAL_API_KEY!,
});