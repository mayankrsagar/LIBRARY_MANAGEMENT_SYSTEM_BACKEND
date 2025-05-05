import { generateVerificationOtpEmailTemplate } from './emailTemplates.js';
import { sendEmail } from './sendEmail.js';

export const sendVerificationCode=async(verificationCode,email,res)=>{
    try {
        const message=generateVerificationOtpEmailTemplate(verificationCode);
    await sendEmail({
            email,
            subject:"Verification code (Bookworm Library Management system)",
            message
        });
    // return res.status(200).json({
    //         success:true,
    //         message: "verification code sent successfully"
    //     })
    } catch (error) {
    return res.status(500).json({
        success: false,
        message:"Verification code failed to send."
    })
    }
    
}