import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    let game = 'mp1';
    try {
        const body = await request.json();
        if (body && typeof body.game === 'string') {
            game = body.game.toLowerCase();
        }
    } catch {
        // Fallback to default game if no JSON body provided
    }

    // Determine the root path to the tools directory
    // This assumes the Next.js app is in the 'web' folder
    const toolsDir = path.resolve(process.cwd(), '../tools');
    const aiLoopPath = path.join(toolsDir, 'ai_loop.py');

    const args = [aiLoopPath];
    if (['mp1', 'mp2', 'mp3', 'mp4'].includes(game)) {
        args.push('--nonmatchings-dir', `asm/nonmatchings/${game}`);
    }

    // Run the ai_loop python script
    // Note: We pass an env var LLM_API_KEY="MOCK_KEY" for safe autonomous execution
    const pythonProcess = spawn('python3', args, {
        cwd: path.resolve(process.cwd(), '../'),
        env: {
            ...process.env,
            LLM_API_KEY: process.env.LLM_API_KEY || "MOCK_KEY"
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
