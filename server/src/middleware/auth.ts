/**
* Auth middleware for the MBTQ / Deaf First platform.
*
* Exports:
*  - authenticateApiKey  — company API-key gate (X-API-Key header)
*  - authenticateCreator — creator JWT bearer gate
*  - DeafAUTHMiddleware  — MBTQ identity cortex (JWT issue / verify / role gates)
*/
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db';
import { AuthRequest } from '../types';

export { AuthRequest };

const CREATOR_JWT_SECRET =
 process.env.CREATOR_JWT_SECRET ?? 'dev-creator-secret-change-in-prod';
const DEAFAUTH_JWT_SECRET =
 process.env.DEAFAUTH_JWT_SECRET ?? 'dev-deafauth-secret-change-in-prod';
const DEAFAUTH_JWT_EXPIRY = process.env.DEAFAUTH_JWT_EXPIRY ?? '24h';

// ─── Company API Key Auth ────────────────────────────────────────────────────

/**
* Authenticates requests using an API key supplied in the X-API-Key header.
* Sets req.companyId on success.
*/
export async function authenticateApiKey(
 req: AuthRequest,
 res: Response,
 next: NextFunction
): Promise<void> {
 const apiKey = req.headers['x-api-key'] as string | undefined;

 if (!apiKey) {
   res.status(401).json({
     error: 'Unauthorized',
     message: 'API key required. Provide it via the X-API-Key header.',
   });
   return;
 }

 try {
   const company = await db.company.findUnique({
     where: { apiKey },
     select: { id: true },
   });

   if (!company) {
     res.status(401).json({ error: 'Unauthorized', message: 'Invalid API key' });
     return;
   }

   req.companyId = company.id;
   next();
 } catch {
   res
     .status(500)
     .json({ error: 'Internal Server Error', message: 'Authentication failed' });
 }
}

// ─── Creator JWT Auth ────────────────────────────────────────────────────────

/**
* Authenticates creator requests using a ****** in the Authorization header.
* Sets req.creator on success.
*/
export async function authenticateCreator(
 req: AuthRequest,
 res: Response,
 next: NextFunction
): Promise<void> {
 const authHeader = req.headers.authorization;

 if (!authHeader?.startsWith('Bearer ')) {
   res.status(401).json({ error: 'Unauthorized', message: '****** required' });
   return;
 }

 const token = authHeader.slice(7);

 try {
   const payload = jwt.verify(token, CREATOR_JWT_SECRET) as jwt.JwtPayload;
   const creatorId = (payload.sub ?? payload.id) as string | undefined;

   if (!creatorId) {
     res.status(401).json({ error: 'Unauthorized', message: 'Invalid token payload' });
     return;
   }

   const creator = await db.creator.findUnique({
     where: { id: creatorId },
     select: { id: true, name: true, email: true },
   });

   if (!creator) {
     res
       .status(401)
       .json({ error: 'Unauthorized', message: 'Creator account not found' });
     return;
   }

   req.creator = creator;
   next();
 } catch {
   res
     .status(401)
     .json({ error: 'Unauthorized', message: 'Invalid or expired token' });
 }
}

// ─── DeafAUTH Middleware (MBTQ Identity Cortex) ─────────────────────────────

/**
* DeafAUTHMiddleware
* Identity cortex — verifies, issues, and refreshes MBTQ identities.
* Works as both an Express middleware adapter and a Socket.IO guard.
*/
export class DeafAUTHMiddleware {

 // ─── Token Ops ──────────────────────────────────────────────────────────────

 static async verifyToken(rawToken: string) {
   const token = rawToken?.replace(/^Bearer\s+/i, '');
   if (!token) throw new Error('No token provided');
   try {
     const payload = jwt.verify(token, DEAFAUTH_JWT_SECRET);
     return DeafAUTHMiddleware._normalizeIdentity(payload as jwt.JwtPayload);
   } catch (err: any) {
     console.warn('[deafauth] token.verify.failed', { error: err.message });
     throw new Error('Invalid or expired DeafAUTH token');
   }
 }

 static async issueToken(identity: {
   uid: string;
   role: string;
   email?: string | null;
   accessibilityClaims?: Record<string, any>;
   fibonroseScore?: number;
   daoMember?: boolean;
 }) {
   const payload = {
     uid: identity.uid,
     role: identity.role,
     email: identity.email ?? null,
     accessibilityClaims: identity.accessibilityClaims ?? {},
     fibonroseScore: identity.fibonroseScore ?? 0,
     daoMember: identity.daoMember ?? false,
     iss: 'deafauth',
     aud: 'deaffirst',
   };
   const token = jwt.sign(payload, DEAFAUTH_JWT_SECRET, {
     expiresIn: DEAFAUTH_JWT_EXPIRY,
   });
   console.info('[deafauth] token.issued', { uid: identity.uid, role: identity.role });
   return token;
 }

 static async refreshIdentity(uid: string) {
   // TODO: fetch fresh identity from Firebase / DeafAUTH store
   console.info('[deafauth] identity.refresh', { uid });
   return { uid, role: 'member', refreshedAt: Date.now() };
 }

 static async authenticate(
   credential: any,
   provider: 'firebase' | 'google' | 'email' | 'dao'
 ) {
   const handlers: Record<string, (c: any) => Promise<any>> = {
     firebase: DeafAUTHMiddleware._authenticateFirebase,
     google: DeafAUTHMiddleware._authenticateOAuth,
     email: DeafAUTHMiddleware._authenticateEmail,
     dao: DeafAUTHMiddleware._authenticateDAO,
   };
   const handler = handlers[provider];
   if (!handler) throw new Error(`Unknown auth provider: ${provider}`);
   return handler(credential);
 }

 // ─── Express Adapter ────────────────────────────────────────────────────────

 /**
  * expressAdapter() — drops into any Express app as standard middleware.
  * Usage: app.use(DeafAUTHMiddleware.expressAdapter())
  */
 static expressAdapter(options: { required?: boolean; roles?: string[] | null } = {}) {
   const { required = false, roles = null } = options;

   return async (req: any, res: Response, next: NextFunction) => {
     const authHeader = req.headers.authorization as string | undefined;
     const cookieToken = req.cookies?.deafauth_token as string | undefined;
     const raw = authHeader ?? cookieToken;

     if (!raw) {
       if (required) {
         return res.status(401).json({
           ok: false,
           error: 'DEAFAUTH_TOKEN_REQUIRED',
           message: 'Authentication required',
         });
       }
       req.deafAuthIdentity = null;
       return next();
     }

     try {
       const identity = await DeafAUTHMiddleware.verifyToken(raw);
       req.deafAuthIdentity = identity;

       if (roles && !roles.includes(identity.role)) {
         return res.status(403).json({
           ok: false,
           error: 'DEAFAUTH_INSUFFICIENT_ROLE',
           required: roles,
           current: identity.role,
         });
       }
       next();
     } catch (err: any) {
       if (required) {
         return res.status(401).json({ ok: false, error: err.message });
       }
       req.deafAuthIdentity = null;
       next();
     }
   };
 }

 /**
  * requireRole() — role-specific gate, fully Express-compatible.
  * Usage: router.post('/admin', DeafAUTHMiddleware.requireRole('admin'), handler)
  */
 static requireRole(...roles: string[]) {
   return DeafAUTHMiddleware.expressAdapter({ required: true, roles });
 }

 /**
  * requireDeaf() — Deaf-first gate; only allows Deaf/HoH identity claims.
  */
 static requireDeaf() {
   return async (req: any, res: Response, next: NextFunction) => {
     const identity = req.deafAuthIdentity;
     if (!identity) {
       return res.status(401).json({ ok: false, error: 'DEAFAUTH_TOKEN_REQUIRED' });
     }
     const mode = identity.accessibilityClaims?.mode as string | undefined;
     const deafModes = ['deaf', 'hard-of-hearing', 'asl-primary', 'deaf-blind'];
     if (!mode || !deafModes.includes(mode)) {
       return res.status(403).json({
         ok: false,
         error: 'DEAFAUTH_DEAF_IDENTITY_REQUIRED',
         message: 'This resource requires a verified Deaf identity',
       });
     }
     next();
   };
 }

 // ─── Normalizer ─────────────────────────────────────────────────────────────

 static _normalizeIdentity(raw: jwt.JwtPayload) {
   return {
     uid: (raw['uid'] ?? raw.sub ?? raw['user_id']) as string,
     role: (raw['role'] ?? 'member') as string,
     email: (raw['email'] ?? null) as string | null,
     accessibilityClaims: (raw['accessibilityClaims'] ?? {}) as Record<string, any>,
     fibonroseScore: (raw['fibonroseScore'] ?? 0) as number,
     daoMember: (raw['daoMember'] ?? false) as boolean,
     iss: raw.iss,
     aud: raw.aud,
     iat: raw.iat,
     exp: raw.exp,
   };
 }

 // ─── Auth Handlers (stubs — wire to Firebase/DAO) ───────────────────────────

 static async _authenticateFirebase(_credential: any): Promise<any> {
   // TODO: verify Firebase ID token via admin.auth().verifyIdToken(credential)
   console.info('[deafauth] auth.firebase', { stub: true });
   throw new Error('Firebase auth — connect to Firebase Admin SDK');
 }

 static async _authenticateOAuth(_credential: any): Promise<any> {
   console.info('[deafauth] auth.oauth', { stub: true });
   throw new Error('OAuth auth — connect to your OAuth provider');
 }

 static async _authenticateEmail(_credential: any): Promise<any> {
   console.info('[deafauth] auth.email', { stub: true });
   throw new Error('Email auth — connect to your user store');
 }

 static async _authenticateDAO(_credential: any): Promise<any> {
   console.info('[deafauth] auth.dao', { stub: true });
   throw new Error('DAO auth — connect to Fibonrose/blockchain verifier');
 }
}
