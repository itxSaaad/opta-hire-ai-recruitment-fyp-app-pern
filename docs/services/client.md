# Client service

`client/src/` is a React 18/Vite SPA using React Router, Redux Toolkit/RTK Query, Axios, Socket.IO and Stripe Elements. Role screens are grouped under `pages/{auth,candidate,recruiter,interviewer,admin,user,interview}`. Router and guards define navigation; feature API/state modules hold client data access.

Axios calls relative `/api/v1` with cookies and a 10-second timeout. Hosted Vercel rewrites preserve the same origin; inspect local Vite proxy behavior separately. `VITE_*` values are public and baked into client assets. Keep authorization in Express; guards only improve UX.

Chat uses `/chat`; interview signaling uses `/video-interviews`; browser peers exchange actual media through WebRTC. See [features](../features/README.md), [realtime](../api/realtime.md), [local setup](../development/local-setup.md).
