import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#dc2626',
          color: 'white',
          borderRadius: 36,
          fontWeight: 800,
          fontSize: 110,
          fontFamily: 'system-ui',
        }}
      >
        S
      </div>
    ),
    { ...size }
  )
}
