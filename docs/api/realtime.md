# Realtime chat and interview sessions

Socket.IO attaches to the same Node HTTP server as Express. The browser uses the current host and WebSocket transport. Namespaces are `/chat` and `/video-interviews`; exact event names and payloads are implemented in `server/sockets/chat.socket.js`, `server/sockets/webrtc.socket.js`, and client socket hooks/components.

- Chat data is persisted through the API; sockets deliver live events. Reload should fetch history from durable storage.
- Interview events announce membership and exchange WebRTC offer, answer, ICE candidates, and call state.
- WebRTC carries audio/video peer-to-peer; Socket.IO carries signaling only.
- Room/participant maps are process-local; restart clears presence, and instances do not share membership.

Authenticate socket handshakes, check room membership/ownership when joining, and revalidate on reconnect. Handle denied media permission, stale candidates, duplicate join/leave, refreshed tabs and peer disconnect. Do not log tokens or SDP/ICE payloads. Verify real hosted WebSocket lifetime before promising stable long interviews.
