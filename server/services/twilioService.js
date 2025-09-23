import twilio from 'twilio';

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Sends an MMS if mediaUrl is provided, otherwise sends an SMS.
 * @param {string} phone - The recipient phone number in E.164 format.
 * @param {string} message - The message body.
 * @param {string|null} mediaUrl - The media URL to send with the message (optional).
 */
export async function sendMms(phone, message, mediaUrl) {
  try {
    if (mediaUrl) {
      // Send as MMS with media
      const result = await client.messages.create({
        to: phone,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: message,
        mediaUrl: [mediaUrl]
      });
      console.log(`MMS sent to ${phone} with media: ${mediaUrl}`);
      return result;
    } else {
      // If no mediaUrl, send as SMS
      const result = await client.messages.create({
        to: phone,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: message
      });
      console.log(`SMS sent to ${phone} because media URL was missing`);
      return result;
    }
  } catch (error) {
    console.error(`Error sending message to ${phone}:`, error);
    throw error;
  }
}

/**
 * Sends an SMS message.
 * @param {string} phone - The recipient phone number in E.164 format.
 * @param {string} message - The message body.
 */
export async function sendSms(phone, message) {
  try {
    const result = await client.messages.create({
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: message
    });
    console.log(`SMS sent to ${phone}`);
    return result;
  } catch (error) {
    console.error(`Error sending SMS to ${phone}:`, error);
    throw error;
  }
}
