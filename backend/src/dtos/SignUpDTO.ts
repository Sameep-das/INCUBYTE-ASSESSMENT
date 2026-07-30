import type { UserSignUpSchema, Address } from "@/types/auth.types.js";

export default class SignUpDTO {
    user : UserSignUpSchema;
    constructor(user : UserSignUpSchema){
        this.user = user;
    }
    getUserName() : string {
        return this.user.username;
    }
    getEmail() : string {
        return this.user.email;
    }
    getPassword() : string {
        return this.user.password;
    }
    getPhoneNumber(){
        return this.user.phone;
    }
    getUserAddress() : Address {
        return {
            city: this.user.city,
            state: this.user.state,
            pinCode: this.user.pinCode,
            houseNumber: this.user.houseNumber
        }
    }
}