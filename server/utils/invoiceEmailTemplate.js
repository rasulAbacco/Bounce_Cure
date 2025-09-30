// utils/invoiceEmailTemplate.js
export const invoiceEmailTemplate = ({ transactionId, planName, total }) => `
  <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; 
              background: #000000; color: #FFFFFF; border-radius: 12px; 
              overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">

    <!-- Header -->
    <div style="background: #111; padding: 25px; text-align: center; border-bottom: 2px solid #FFD700;">
      <img src="https://yourdomain.com/templates/logo.png" alt="BounceCure" 
           style="height: 50px; margin-bottom: 10px;" />
      <h2 style="margin: 0; color: #FFD700;">BounceCure</h2>
      <p style="margin: 5px 0 0; font-size: 14px; color: #ccc;">Invoice Notification</p>
    </div>

    <!-- Body -->
    <div style="padding: 25px;">
      <h3 style="margin-top: 0; color: #FFD700;">Invoice Generated</h3>
      <p style="font-size: 15px; line-height: 1.6;">
        Thank you for your purchase! Your invoice for <b style="color: #FFD700;">${planName}</b> 
        has been generated and is attached to this email.
      </p>

      <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
        <tr style="background: #1a1a1a;">
          <td style="padding: 12px; border: 1px solid #333;">Invoice ID</td>
          <td style="padding: 12px; border: 1px solid #333; color: #FFD700;">${transactionId}</td>
        </tr>
        <tr style="background: #0d0d0d;">
          <td style="padding: 12px; border: 1px solid #333;">Plan</td>
          <td style="padding: 12px; border: 1px solid #333;">${planName}</td>
        </tr>
        <tr style="background: #1a1a1a;">
          <td style="padding: 12px; border: 1px solid #333;">Total</td>
          <td style="padding: 12px; border: 1px solid #333; font-weight: bold; color: #FFD700;">
            $${total.toFixed(2)}
          </td>
        </tr>
      </table>

      <p style="margin-top: 30px; font-size: 13px; color: #aaa; line-height: 1.6;">
        Tax was applied to this purchase.<br>
        Please find the detailed invoice attached as PDF.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #111; padding: 20px; text-align: center; border-top: 2px solid #FFD700;">
      <p style="margin: 0; font-size: 12px; color: #777;">
        &copy; 2025 BounceCure. All Rights Reserved.<br>
        405 N. Angler Ave NE, Atlanta, GA 30312 USA
      </p>
      <p style="margin-top: 10px; font-size: 12px;">
        <a href="https://yourcompany.com/terms" style="color: #FFD700; text-decoration: none;">Terms of Use</a> | 
        <a href="https://yourcompany.com/privacy" style="color: #FFD700; text-decoration: none;">Privacy Policy</a>
      </p>
    </div>
  </div>
`;
