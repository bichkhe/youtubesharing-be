import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
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

const generateToken = (email: string) => {
    const token = jwt.sign(
        { email },
        process.env.TOKEN_KEY as string,
        {
            expiresIn: "12h",
        }
    );
    return token
}

export { hashPassword, comparePassword, generateToken }