import Home from '@/app/(streams)/main-stream/page';

/**
 * This is the root page of the application.
 * It directly renders the main content from the "/main-stream" route
 * to align with the redirect set up in next.config.ts.
 * This ensures that the root URL ("/") has a valid entry point,
 * preventing 404 errors on deployment platforms like Vercel.
 */
export default Home;
