---
import { get } from 'astro:content';
import { ImageResponse } from 'astro:assets';

export async function get({ request }) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Kattakath Technologies Inc.';
  const description = searchParams.get('desc') || 'AI-first startup building generative AI career tools.';
  // You can add more params as needed

  return new ImageResponse(
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '1200px',
      height: '630px',
      background: '#fff',
      color: '#222',
      fontFamily: 'sans-serif',
      border: '2px solid #eee',
      padding: '40px',
    }}>
      <img src="https://kattakath.com/images/animated-logo.svg" width="120" style={{marginBottom: '32px'}} />
      <h1 style={{ fontSize: '64px', margin: 0 }}>{title}</h1>
      <p style={{ fontSize: '32px', marginTop: '24px' }}>{description}</p>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
---
