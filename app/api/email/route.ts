
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { to, subject, html, user, pass } = body;

        if (!user || !pass) {
            return NextResponse.json({ error: 'Faltam as credenciais de email (configurar nas Definições).' }, { status: 400 });
        }

        const cleanPass = pass.replace(/\s/g, '');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: cleanPass,
            },
        });

        const mailOptions = {
            from: `"Prospecção CATBACK" <${user}>`,
            to: to,
            subject: subject,
            html: html,
            attachments: [
                {
                    filename: 'catback-logo.png',
                    path: './public/images/catback-logo-v2.png',
                    cid: 'catback-logo' // same cid value as in the html img src
                },
                {
                    filename: 'nfc-display.jpg',
                    path: './public/images/nfc-display.jpg',
                    cid: 'nfc-display' // same cid value as in the html img src
                }
            ]
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error sending email:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
