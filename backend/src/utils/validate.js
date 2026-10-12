const validator=require("validator");

const validate=(data)=>{
    const mandatoryFields=['firstName','emailId','password'];

    const isAllowed=mandatoryFields.every((k)=>Object.keys(data).includes(k));

    if(!isAllowed) {
        throw new Error("Field missing");
    }

    if(!validator.isEmail(data.emailId)) {
        throw new Error("Invalid Email");
    }

    if(!validator.isStrongPassword(data.password)) {
        throw new Error("Password not strong");
    }

}

module.exports=validate;