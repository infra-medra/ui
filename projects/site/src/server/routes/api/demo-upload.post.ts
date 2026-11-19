import { defineEventHandler, readFormData } from 'h3';

/**
 * Backs the FileUpload docs page's real-HTTP-upload demo — accepts whatever
 * was posted, reports its size back, and discards it. Nothing is persisted.
 */
export default defineEventHandler(async (event) => {
  const form = await readFormData(event);
  const file = form.get('file');
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { size: file instanceof File ? file.size : 0 };
});
