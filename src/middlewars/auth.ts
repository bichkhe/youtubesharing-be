import { prisma } from '../prisma'
import { NextFunction, Response, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { Claim, verifyToken } from '../utils';

const APIS_NO_AUTH = ["/api/register", "/api/login"]

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (APIS_NO_AUTH.includes(req.path)) {

        next()
    } else {
        const authHeader = req.headers['authorization']
        let token = ""
        if (authHeader?.startsWith("Bearer")) {
            token = authHeader?.substring("Bearer ".length)
        }
        console.log('authMiddleware:token:', token);
        try {
            const claim = verifyToken(token) as Claim
            if (claim.email) {
                res.locals.email = claim.email
                next()
            }
        } catch (error: any) {
            if (req.path == "/api/videos") {
                next()
            } else {
                res.status(400).send({
                    code: -1000,
                    error_message: 'Not authentication'
                })
            }
        }
    }
}

export default authMiddleware;