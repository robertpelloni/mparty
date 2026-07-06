import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST() {
  try {
    // Determine the root path to the tools directory
    // This assumes the Next.js app is in the 'web' folder
    const toolsDir = path.resolve(process.cwd(), '../tools');
    const aiLoopPath = path.join(toolsDir, 'ai_loop.py');

    // Run the ai_loop python script
    // Note: We use "mock_src" just so it doesn't fail immediately,
    // or we can pass an env var LLM_API_KEY="MOCK_KEY"
    const pythonProcess = spawn('python3', [aiLoopPath], {
        env: {
            ...process.env,
            LLM_API_KEY: "MOCK_KEY"
        }
    });

    let output = '';

    // Collect stdout
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    // Collect stderr
    pythonProcess.stderr.on('data', (data) => {
        output += data.toString();
    });

    // Wait for the script to finish
    await new Promise((resolve) => {
        pythonProcess.on('close', resolve);
    });

    return NextResponse.json({
      success: true,
      logs: output,
    });
  } catch (error: any) {
      return NextResponse.json({
          success: false,
          logs: `Failed to execute AI loop: ${error.message}`
      });
  }
}
