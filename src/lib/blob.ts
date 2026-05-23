import { put, del } from '@vercel/blob';

export async function uploadPdf(
  file: File,
  nationalId: string,
): Promise<{ url: string; key: string }> {
  const { url, pathname } = await put(
    `tickets/${nationalId}/${file.name}`,
    file,
    {
      access: 'public',
      addRandomSuffix: true,
    },
  );
  return { url, key: pathname };
}

export async function deletePdf(blobKey: string) {
  await del(blobKey);
}
