import db from "@/config/db.config.js";
import { users, userRefreshTokens } from "@/db/schema/users.js";
import ApplicationError from "@/errors/application.error.js";
import { eq, sql } from "drizzle-orm";
import type { NewUser, UserRefreshToken, RefreshTokenUpdate } from "@/types/auth.types.js";

/*
    CREATE USER
    @PARAMS : USERSCHEMA OBJ, { REFRESHTOKEN AND EXPIRY DATE } AS OBJECT
    @RETURN : USER OBJECT

    STEP 1 : START A TRANSACTION
    STEP 2 : INSERT THE USER INTO THE USERS TABLE AND GET THE USER-ID, USERNAME AND USEREMAIL
    STEP 3 : USE THE USER-ID TO INSERT THE REFRESH TOKEN INTO THE USER_REFRESH_TOKENS TABLE
    STEP 4 : COMMIT THE TRANSACTION AND RETURN THE USER OBJECT
*/

async function createUser(newUser: NewUser, userMetaData: { refreshToken: string; expiresAt: Date; }) {
    return db.transaction(async (tx) => {
        const [user] = await tx.insert(users).values(newUser)
            .returning(
                {
                    userId: users.userId,
                    userName: users.userName,
                    userEmail: users.userEmail,
                }
            );

        if (!user) throw new ApplicationError("Failed to create user");
        await tx.insert(userRefreshTokens).values(
            {
                userId: user.userId,
                ...userMetaData
            }
        );

        return user;
    });
}

// RETURNS USER DETAILS IF USER EXISTS - USES EMAIL ID

async function findByEmail(email: string) {
    const user = await db.select().from(users).where(eq(users.userEmail, email));
    return user[0];
}

// RETURNS USER DETAILS IF USER EXISTS - USES USER-ID

async function findById(id: string) {
    const user = await db.select().from(users).where(eq(users.userId, id));
    return user[0];
}

// RETURNS USER-ID IF USER EXISTS - USES EMAIL ID

async function getUserId(email: string) {
    const user = await db.select({ userId: users.userId }).from(users).where(eq(users.userEmail, email));
    return user[0]?.userId;
}

// UPDATES PASSWORD FOR USER - USES USER-ID

async function updatePassword(id: string, password: string) {
    const user = await db.update(users).set({ passwordHash: password }).where(eq(users.userId, id)).returning({ userId: users.userId, userEmail: users.userEmail });
    return user[0];
}

async function updatePasswordByEmail(email: string, password: string) {
    const user = await db.update(users).set({ passwordHash: password }).where(eq(users.userEmail, email)).returning({ userId: users.userId, userEmail: users.userEmail });
    return user[0];
}

async function updateRefreshToken(id: string, token: string, expiresAt: Date) {
    const user = await db.update(userRefreshTokens).set({ refreshToken: token, expiresAt: expiresAt, createdAt: new Date() }).where(eq(userRefreshTokens.userId, id)).returning({ userId: userRefreshTokens.userId, refreshToken: userRefreshTokens.refreshToken });
    return user[0];
}

/*
    ROTATE REFRESH TOKEN
    @PARAMS : USER-ID, CALLBACK FUNCTION
    @RETURN : {
        user: {
            userName: string;
            userEmail: string;
        };
        refreshToken: string;
        accessToken: string;
        userId: string;
    }

    STEP 1: FETCH THE USER ID USING EMAIL ID.
    STEP 2: START A TRANSACTION
    STEP 3: GET THE REFRESH TOKEN RECORD FOR THE USER
    STEP 4: CALL THE CALLBACK FUNCTION WITH THE RECORD AS PARAMS TO GET THE UPDATED REFRESH TOKEN HASH
    STEP 5: DELETE THE OLD REFRESH TOKEN RECORD
    STEP 6: INSERT THE NEW REFRESH TOKEN RECORD
    STEP 7: COMMIT THE TRANSACTION AND RETURN THE USER DETAILS, ACCESS TOKEN AND REFRESH TOKEN
*/

async function rotateRefreshToken(
    userEmail: string,
    callback: (record: UserRefreshToken) => Promise<{
        updatedData: RefreshTokenUpdate;
        response: {
            user: {
                userName: string;
                userEmail: string;
            };
            refreshToken: string;
            accessToken: string;
        }
    }>
) {
    const userId = await getUserId(userEmail);
    if(!userId) return null;
    return db.transaction(async (tx) => {

        const result = await tx.execute(sql`
            SELECT *
            FROM user_refresh_tokens
            WHERE user_id = ${userId}
            FOR UPDATE
        `);

        if (result.length === 0) {
            return null;
        }

        const record = result[0] as UserRefreshToken;

        const data = await callback(record);

        await tx
            .delete(userRefreshTokens)
            .where(
                eq(userRefreshTokens.userId, userId)
            );
        
        await tx.insert(userRefreshTokens).values({
            userId: userId,
            refreshToken: data.updatedData.refreshToken,
            expiresAt: data.updatedData.expiresAt
        });
        return {
            userId: userId,
            ...data.response
        };
    });
};

// INSERT A ROW IN THE USER_REFRESH_TOKENS TABLE - USES USER-ID, REFRESH TOKEN AND EXPIRY DATE

async function addRefreshToken(id: string, token: string, expiresAt: Date) {
    const user = await db.insert(userRefreshTokens).values({ userId: id, refreshToken: token, expiresAt: expiresAt }).returning({ userId: userRefreshTokens.userId, refreshToken: userRefreshTokens.refreshToken });
    return user[0];
}
// RETRIEVE THE REFRESH TOKEN FOR A USER - USES USER-ID

async function getRefreshToken(userId: string) {
    const record = await db.select().from(userRefreshTokens).where(eq(userRefreshTokens.userId, userId)).limit(1);
    return record[0];
}

// DELETE THE REFRESH TOKEN FOR A USER - USES USER-ID

async function deleteRefreshToken(userId: string) {
    const record = await db.delete(userRefreshTokens).where(eq(userRefreshTokens.userId, userId)).returning({ userId: userRefreshTokens.userId});
    return record[0];
}

export { createUser, findByEmail, findById, getRefreshToken, deleteRefreshToken, updatePassword, updateRefreshToken, rotateRefreshToken, addRefreshToken, getUserId };