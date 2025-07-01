
'use server';

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
    console.warn("Twilio environment variables are not fully configured. SMS functionality will be disabled.");
}

const client = twilio(accountSid, authToken);

export async function sendSms(to: string, body: string) {
    if (!accountSid) {
        console.error("Twilio is not configured. Cannot send SMS.");
        // In a real app, you might want to throw an error or return a status
        return { success: false, error: "Twilio not configured." };
    }
    try {
        const message = await client.messages.create({
            body,
            from: fromNumber,
            to,
        });
        console.log(`SMS sent to ${to}. SID: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error(`Failed to send SMS to ${to}:`, error);
        return { success: false, error };
    }
}
