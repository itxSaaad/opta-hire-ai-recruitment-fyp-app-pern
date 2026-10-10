# Interviews, chat, and feedback

Interview scheduling/status is persisted through the interview API. Interviewer and candidate pages lead into the shared interview experience; feedback/rating screens record post-session evaluation. Recruiter/interviewer chat pages use chat-room APIs and the `/chat` Socket.IO namespace.

## Interview interaction

Participants join an authorized interview room. Socket.IO announces membership and exchanges WebRTC offer, answer, and ICE-candidate signaling. Browser peers carry media directly; the server is not a video relay. Audio/video toggles and join/leave notifications are transient. Persist interview metadata and feedback through the API.

## Edge cases

Handle unavailable camera/microphone permission, browser without compatible WebRTC, late/duplicate join, peer refresh, socket loss, stale interview link, mismatched ICE network, unauthorized room ID, and interview status changed while a participant is on-screen. A socket reconnect requires fresh auth and room membership validation. Do not treat online presence as proof that an interview record or feedback was saved.

Socket maps are process-local; scale-out/deploy may disconnect or split room participants. Verify actual Vercel WebSocket runtime before retiring other hosts. See [realtime contract](../api/realtime.md).
