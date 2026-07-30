import { createUser, findByEmail, rotateRefreshToken, deleteRefreshToken, getRefreshToken,  updateRefreshToken, getUserId, addRefreshToken } from "@/repositories/user.repository.js";
import { compare, hash } from "@/utils/bcrypt.utils.js";
import { generateToken, verifyToken } from "@/utils/jwt.utils.js";
import {AuthenticationError, DuplicateUserError, InvalidCredentialsError, TokenExpiredError} from "@/errors/auth.errors.js";
import type SignUpDTO from "@/dtos/SignUpDTO.js";
import env from "@/config/env.config.js";
import { type UserRefreshToken } from "@/types/auth.types.js";


/*
    SIGNUP SERVICE 
    @params : SignUpDTO
    @return {
        user: {
            userId: user.userId,
            userName: user.userName,
            userEmail: user.userEmail,
        },
        accessToken: accessToken,
        refreshToken: refreshToken
    };
    
    STEP 1 : CHECK FOR EXISTING USER. IF ANY -> REJECT THE REQUEST <DuplicateUserError>
    STEP 2 : HASH THE PASSWORD
    STEP 3 : GENERATE THE USER ACCORDING TO THE SCHEMA
    STEP 4 : GENERATE ACCESS AND REFRESH TOKENS
    STEP 5 : HASH THE REFRESH TOKEN
    STEP 6 : CALL THE TRANSACTIONAL FUNCTION TO CREATE USER AND STORE REFRESH TOKEN IN THE DATABSE IN ONE ATOMIC TRANSACTION
    STEP 7 : RETURN THE USER DETAILS, ACCESS TOKEN AND REFRESH TOKEN
*/

const signUpService = async (signUpDTO: SignUpDTO) => {
    const existingUser = await findByEmail(signUpDTO.getEmail());
    if (existingUser) {
        throw new DuplicateUserError("User already exists", 409);
    }
    const passwordHash = await hash(signUpDTO.getPassword());
    const newUser = {
        userName: signUpDTO.getUserName(),
        userEmail: signUpDTO.getEmail(),
        passwordHash: passwordHash,
        city: signUpDTO.getUserAddress().city,
        state: signUpDTO.getUserAddress().state,
        pinCode: signUpDTO.getUserAddress().pinCode,
        houseNumber: signUpDTO.getUserAddress().houseNumber,
        phone: signUpDTO.getPhoneNumber(),
    }

    const accessToken = generateToken({
        userName: signUpDTO.getUserName(),
        userEmail: signUpDTO.getEmail(),
    }, env.JWT_SECRET_ACCESS_TOKEN, "15m");

    const refreshToken = generateToken({
        userName: signUpDTO.getUserName(),
        userEmail: signUpDTO.getEmail(),
    }, env.JWT_SECRET_REFRESH_TOKEN, "7d");

    const hashedRefreshToken = await hash(refreshToken);

    const userMetaData = {
        refreshToken: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    const userDetails = await createUser(newUser, userMetaData);
    return {
        user: {
            ...userDetails
        },
        refreshToken: refreshToken,
        accessToken: accessToken
    };
};


/*
    LOGIN SERVICE
    @params : LoginDTO
    @return {
        user: {
            userId: user.userId,
            userName: user.userName,
            userEmail: user.userEmail,
        },
        accessToken: accessToken,
        refreshToken: refreshToken
    };


    STEP 1: FIND THE USER BY USER-EMAIL. IF NOT FOUND -> REJECT THE REQUEST <InvalidCredentialsError>
    STEP 2: COMPARE THE PASSWORDS. IF NOT MATCHING -> REJECT THE REQUEST <InvalidCredentialsError>
    STEP 3: GENERATE NEW ACCESS AND REFRESH TOKENS
    STEP 4: HASH THE REFRESH TOKEN
    STEP 5: DELETE THE EXISTING REFRESH TOKEN FORM THE DB.
    STEP 6: INSERT THE NEW REFRESH TOKEN IN THE DB.
    STEP 7: RETURN THE USER DETAILS, ACCESS TOKEN AND REFRESH TOKEN
*/

const logInService = async (loginDTO: any) => {
    const user = await findByEmail(loginDTO.getIdentifier());
    if (!user) {
        throw new InvalidCredentialsError("Invalid credentials", 401);
    }
    const isPasswordValid = await compare(loginDTO.getPassword(), user.passwordHash);
    if (!isPasswordValid) {
        throw new InvalidCredentialsError("Invalid credentials", 401);
    }
    const accessToken = generateToken({
        userName: user.userName,
        userEmail: user.userEmail,
    }, env.JWT_SECRET_ACCESS_TOKEN, "15m");
    const refreshToken = generateToken({
        userName: user.userName,
        userEmail: user.userEmail,
    }, env.JWT_SECRET_REFRESH_TOKEN, "7d");
    const hashedRefreshToken = await hash(refreshToken);

    const delRes = await deleteRefreshToken(user.userId);
    if(!delRes){
        throw new AuthenticationError("Failed to delete existing refresh token");
    }
    const insertRes = await addRefreshToken(user.userId, hashedRefreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    if(!insertRes){
        throw new AuthenticationError("Failed to add new refresh token");
    }
    return {
        user: {
            userId: user.userId,
            userName: user.userName,
            userEmail: user.userEmail,
        },
        accessToken: accessToken,
        refreshToken: refreshToken
    };
};

/*
    LOGOUT SERVICE
    @params : userEmail, refreshToken
    @return : boolean

    STEP 1: CHECK IF USER-EMAIL AND REFRESH TOKENS ARE PROVIDED. IF NOT -> REJECT THE REQUEST <AuthenticationError>
    STEP 2: VERIFY THE REFRESH TOKEN. IF INVALID -> REJECT THE REQUEST <AuthenticationError>
    STEP 3: MATCH THE USER-EMAIL WITH THE DECRYPTED TOKEN. IF NOT MATCHING -> REJECT THE REQUEST <AuthenticationError>
    STEP 4: GET THE USER-ID USING THE MAIL.
    STEP 5: GET THE REFRESH TOKEN STORED IN THE DATABASE.
    STEP 6: COMPARE THE REFRESH TOKEN PASSED WITH THE REFRESH TOKEN IN THE DB. IF NOT MATCHING -> REJECT THE REQUEST <AuthenticationError>
    STEP 7: DELETE THE REFRESH TOKEN FROM THE DATABASE.
    STEP 8: RETURN TRUE IF SUCCESSFULLY LOGGED OUT.
*/

const logOutService = async (userEmail: string | undefined, refreshToken: string | undefined) => {
    if (!userEmail || !refreshToken) {
        throw new AuthenticationError("Missing required parameters for logout");
    }
    const data = verifyToken(refreshToken, env.JWT_SECRET_REFRESH_TOKEN);
    if (!data || data.userEmail !== userEmail) {
        throw new AuthenticationError("Token Mismatch");
    }
    const userId = await getUserId(userEmail);
    if (!userId) {
        throw new AuthenticationError("User not found");
    }
    const record = await getRefreshToken(userId);
    if (!record || record.expiresAt < new Date()) {
        throw new TokenExpiredError("Refresh token not found or expired");
    }
    const isTokenValid = await compare(refreshToken, record.refreshToken);
    if (!isTokenValid) {
        throw new AuthenticationError("Invalid refresh token");
    }
    const result = await deleteRefreshToken(userId);
    return result ? true : false;
};

/*

    REFRESH TOKEN ROTATION SERVICE
    @params : refreshTokenRecieved
    @return : object

    STEP 1: CHECK IF THE REFRESH TOKEN IS PROVIDED. IF NOT -> REJECT THE REQUEST <AuthenticationError>
    STEP 2: VERIFY THE REFRESH TOKEN. IF INVALID -> REJECT THE REQUEST <AuthenticationError>
    STEP 3: GET THE USER-ID USING THE MAIL.
    STEP 4: GET THE REFRESH TOKEN STORED IN THE DATABASE.
    STEP 5: COMPARE THE REFRESH TOKEN PASSED WITH THE REFRESH TOKEN IN THE DB. IF NOT MATCHING -> REJECT THE REQUEST <AuthenticationError>
    STEP 6: DELETE THE EXISTING REFRESH TOKEN FORM THE DB.
    STEP 7: INSERT THE NEW REFRESH TOKEN IN THE DB.
    STEP 8: RETURN THE USER DETAILS, ACCESS TOKEN AND REFRESH TOKEN
*/

const refreshTokenRotationService = async (refreshTokenRecieved: string | undefined) => {
    if (!refreshTokenRecieved) {
        throw new AuthenticationError("Refresh token is required");
    }
    const user = verifyToken(refreshTokenRecieved, env.JWT_SECRET_REFRESH_TOKEN);
    if (!user) {
        throw new AuthenticationError("Invalid refresh token");
    }
    //const record = await getRefreshToken(user.userId, user.sessionId);
    const result = await rotateRefreshToken(user.userEmail, async (record: UserRefreshToken) => {
        if (!record || record.expiresAt < new Date()) {
            throw new AuthenticationError("Refresh token not found or expired");
        }
        const isTokenValid = await compare(refreshTokenRecieved, record.refreshToken);
        if (!isTokenValid) {
            throw new AuthenticationError("Invalid refresh token");
        }
        const accessToken = generateToken({
            userName: user.userName,
            userEmail: user.userEmail,
        }, env.JWT_SECRET_ACCESS_TOKEN, "15m");
        const refreshToken = generateToken({
            userName: user.userName,
            userEmail: user.userEmail,
        }, env.JWT_SECRET_REFRESH_TOKEN, "7d");

        const hashedRefreshToken = await hash(refreshToken);
        return {
            updatedData: {
                refreshToken: hashedRefreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            response: {
                user: {
                    userName: user.userName,
                    userEmail: user.userEmail
                },
                refreshToken: refreshToken,
                accessToken: accessToken
            }
        };
    });
    if (!result) {
        throw new AuthenticationError("Refresh token is invalid or has been revoked.");
    }
    return result;
}

export { signUpService, logInService, logOutService, refreshTokenRotationService };