
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        // This logic is commented out but shows how you could add
        // server-side validation before allowing a file upload.
        // 
        // const { user } = auth();
        // if (!user) {
        //   throw new Error('Not authenticated');
        // }
        return {
          allowedContentTypes: ['video/webm', 'video/mp4', 'video/quicktime', 'image/jpeg', 'image/png', 'image/gif'],
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // You can use this callback to store blob details in your database.
        console.log('blob upload completed', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
}
