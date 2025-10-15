// /api/verify-recaptcha.js

export default async function handler(request, response) {
  // We only want to handle POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { token } = request.body;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // Make sure the token and secret key exist
    if (!token || !secretKey) {
      console.error("Verification failed: Token or Secret Key is missing.");
      return response.status(400).json({ success: false, error: "Missing token or server configuration error." });
    }

    // Send the verification request to Google
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    const verificationResponse = await fetch(verificationUrl, { method: 'POST' });
    const verificationData = await verificationResponse.json();

    // Check Google's response
    if (verificationData.success) {
      // The token is valid
      return response.status(200).json({ success: true });
    } else {
      // The token is invalid
      console.warn("reCAPTCHA verification failed:", verificationData['error-codes']);
      return response.status(400).json({ success: false, error: "reCAPTCHA verification failed." });
    }
  } catch (error) {
    console.error("Internal server error during reCAPTCHA verification:", error);
    return response.status(500).json({ success: false, error: "Internal server error." });
  }
}
