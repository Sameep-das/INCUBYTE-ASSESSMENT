import bcrypt from "bcrypt"

export async function hash(password: string) {
    const pwdHash = await bcrypt.hash(password, 10);
    return pwdHash;
}

export async function compare(password: string, hash: string) {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
}