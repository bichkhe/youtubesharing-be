import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { JwtPayload } from 'jsonwebtoken'
const saltRounds = 10
const hashPassword = async (password: Buffer) => {
    const hashed = bcrypt
        .genSalt(saltRounds)
        .then(async (salt: any) => {
            console.log('Salt: ', salt)
            return await bcrypt.hash(password, salt)
        })
    return hashed
}

const comparePassword = async (plaintextPassword: Buffer, hash: string) => {
    const result = await bcrypt.compare(plaintextPassword, hash);
    return result;
}

const generateToken = (email: string, expiresIn: string) => {
    const token = jwt.sign(
        { email },
        "dffdfdfdvdvcsdfdfsdfsdfsdfsdfdsfdsfdsfdsfdsfsd" as string,
        {
            expiresIn: expiresIn,
        }
    );
    return token
}
export interface Claim {
    email: string;
    iat: number;
    exp: number;
}
const verifyToken = (token: string) => {
    const claim = jwt.verify(token, "dffdfdfdvdvcsdfdfsdfsdfsdfsdfdsfdsfdsfdsfdsfsd" as string, {}) as Claim;
    return claim
}

export { hashPassword, comparePassword, generateToken, verifyToken }