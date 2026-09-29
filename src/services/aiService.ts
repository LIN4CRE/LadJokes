export interface BanterCoachRequest {
  prompt?: string;
  mode?: 'punchline' | 'witty_response' | 'story_polish' | 'chat';
  context?: string;
  history?: Array<{ role: 'user' | 'model'; content: string }>;
}

export interface BanterCoachResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

export async function askBanterCoach(request: BanterCoachRequest): Promise<string> {
  try {
    const response = await fetch('/api/banter-coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data: BanterCoachResponse = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to get banter coaching from Baz.');
    }

    return data.reply || 'Baz stared into his pint and nodded quietly.';
  } catch (error: any) {
    console.error('Error contacting Banter Coach:', error);
    throw error;
  }
}
