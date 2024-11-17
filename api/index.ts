// Vercel serverless functions require the entrypoint to be a file in the root directory
import 'tsconfig-paths/register';
import app from "../src/index";
export default app;