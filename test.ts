import { config } from 'dotenv';
config(); // Load .env
import handler from './api/generate.js';

async function test() {
    const req = {
        method: 'POST',
        body: {
            text: 'Hello, please introduce yourself.',
            mode: 'translate'
        }
    };
    const res = {
        status: (code: number) => ({
            json: (data: any) => {
                console.log(`Status: ${code}`);
                console.log('Response:', JSON.stringify(data, null, 2));
            }
        })
    };

    await handler(req as any, res as any);
}

test();
