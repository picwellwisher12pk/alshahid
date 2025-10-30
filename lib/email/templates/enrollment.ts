import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type EnrollmentEmailProps = {
  studentName: string;
  enrollmentUrl: string;
};

export async function sendEnrollmentEmail(
  to: string,
  { studentName, enrollmentUrl }: EnrollmentEmailProps
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Al Shahid Academy <noreply@alshahidacademy.pk>', // Update with your domain
      to,
      subject: 'Complete Your Enrollment - Al Shahid Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Al Shahid Academy, ${studentName}!</h2>
          
          <p>Thank you for choosing Al Shahid Academy for your learning journey. To complete your enrollment, 
          please click the button below to submit your enrollment fee payment proof.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${enrollmentUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Submit Payment Proof
            </a>
          </div>
          
          <p>This link will expire in 36 hours. If you didn't request this, please ignore this email.</p>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${enrollmentUrl}</p>
          
          <p>Best regards,<br/>The Al Shahid Academy Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending enrollment email:', error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error('Failed to send enrollment email:', error);
    return { error };
  }
}
