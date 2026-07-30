import { type UserLogInSchema } from "@/types/auth.types.js";
export default class LoginDTO {
    userDetails : UserLogInSchema;
    constructor(userDetails : UserLogInSchema){
        this.userDetails = userDetails;
    }
    getIdentifier() : string {
        return this.userDetails.email;
    }
    getPassword() : string {
        return this.userDetails.password;
    }
}