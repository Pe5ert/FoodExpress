// @ts-nocheck
// backend/src/lib/email.ts
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes('xxxxx')) return null;
  return new Resend(key);
}

function emProducao() {
  return process.env.NODE_ENV === 'production';
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'FoodExpress <no-reply@resend.dev>';

export async function enviarCodigoAcesso(
  email: string,
  codigo: string,
  nome?: string,
  contexto: 'cadastro' | 'login' = 'cadastro'
) {
  const titulo = contexto === 'login' ? 'Código de acesso FoodExpress' : 'Confirme sua conta FoodExpress';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${titulo}</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #FFF8F5; color: #2D3436; }
        .container { max-width: 500px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .header { background: #FF6B35; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 25px; line-height: 1.6; text-align: center; }
        .code { display: inline-block; letter-spacing: 8px; font-size: 34px; font-weight: 800; background: #FFF0EB; color: #FF6B35; padding: 16px 20px; border-radius: 14px; margin: 18px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #8A7B74; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>FoodExpress</h1></div>
        <div class="content">
          <h2>Olá${nome ? ', ' + nome : ''}!</h2>
          <p>${contexto === 'login' ? 'Use o código abaixo para entrar na sua conta.' : 'Use o código abaixo para confirmar seu e-mail e criar sua conta.'}</p>
          <div class="code">${codigo}</div>
          <p><strong>Este código expira em 10 minutos.</strong></p>
          <p>Se você não solicitou, pode ignorar este e-mail.</p>
        </div>
        <div class="footer">© 2026 FoodExpress</div>
      </div>
    </body>
    </html>
  `;

  try {
    const resend = getResend();
    if (!resend) {
      if (emProducao()) {
        throw new Error('RESEND_API_KEY não configurada para envio de e-mail em produção.');
      }
      console.log('\n📧 === CODIGO DE EMAIL (Modo Dev) ===');
      console.log(`Para: ${email}`);
      console.log(`Código: ${codigo}`);
      console.log('====================================\n');
      return { success: true, dev: true };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: titulo,
      html,
    });

    if (error) throw error;
    console.log(`✅ Código enviado com sucesso para ${email}`);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Erro ao enviar código por email:', err);
    throw err;
  }
}
