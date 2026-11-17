/**
 * Master Foundation — Multilingual Transactional Email Templates & SMTP Guard
 * Generates localized password-reset and email-verification payloads across all 6 languages.
 * Never simulates email delivery when SMTP is unconfigured.
 */

import { escapeHtml, sanitizeSafeUrl, stripControlChars } from '../security/input-sanitizer.mjs';

const COPY = {
  ar: {
    dir: 'rtl',
    resetSubject: 'إعادة تعيين كلمة المرور',
    resetHeading: 'طلب إعادة تعيين كلمة المرور',
    resetBody: 'تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك. هذا الرابط صالح لمرة واحدة فقط.',
    resetCta: 'إعادة تعيين كلمة المرور',
    verifySubject: 'تأكيد البريد الإلكتروني',
    verifyHeading: 'تأكيد عنوان بريدك الإلكتروني',
    verifyBody: 'يرجى تأكيد عنوان بريدك الإلكتروني لإتمام تفعيل حسابك.',
    verifyCta: 'تأكيد البريد الإلكتروني',
    expiresNote: 'تنتهي صلاحية هذا الرابط تلقائياً. إذا لم تطلب ذلك يمكنك تجاهل هذه الرسالة.'
  },
  en: {
    dir: 'ltr',
    resetSubject: 'Password Reset Request',
    resetHeading: 'Reset Your Password',
    resetBody: 'We received a request to reset your account password. This link can only be used once.',
    resetCta: 'Reset Password',
    verifySubject: 'Verify Your Email Address',
    verifyHeading: 'Email Address Verification',
    verifyBody: 'Please verify your email address to activate your account.',
    verifyCta: 'Verify Email',
    expiresNote: 'This link expires automatically. If you did not request this, you can safely ignore this message.'
  },
  fr: {
    dir: 'ltr',
    resetSubject: 'Demande de réinitialisation du mot de passe',
    resetHeading: 'Réinitialiser votre mot de passe',
    resetBody: 'Nous avons reçu une demande de réinitialisation de mot de passe. Ce lien est à usage unique.',
    resetCta: 'Réinitialiser le mot de passe',
    verifySubject: 'Vérifiez votre adresse e-mail',
    verifyHeading: 'Vérification de l’adresse e-mail',
    verifyBody: 'Veuillez vérifier votre adresse e-mail pour activer votre compte.',
    verifyCta: 'Vérifier l’e-mail',
    expiresNote: 'Ce lien expire automatiquement. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.'
  },
  ru: {
    dir: 'ltr',
    resetSubject: 'Запрос на сброс пароля',
    resetHeading: 'Сброс пароля',
    resetBody: 'Мы получили запрос на сброс пароля для вашей учетной записи. Эта ссылка одноразовая.',
    resetCta: 'Сбросить пароль',
    verifySubject: 'Подтверждение электронной почты',
    verifyHeading: 'Подтвердите адрес эл. почты',
    verifyBody: 'Пожалуйста, подтвердите ваш адрес электронной почты для активации аккаунта.',
    verifyCta: 'Подтвердить эл. почту',
    expiresNote: 'Срок действия ссылки ограничен. Если вы не отправляли этот запрос, просто проигнорируйте письмо.'
  },
  de: {
    dir: 'ltr',
    resetSubject: 'Anfrage zum Zurücksetzen des Passworts',
    resetHeading: 'Passwort zurücksetzen',
    resetBody: 'Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Dieser Link ist nur einmal gültig.',
    resetCta: 'Passwort zurücksetzen',
    verifySubject: 'E-Mail-Adresse bestätigen',
    verifyHeading: 'Bestätigung der E-Mail-Adresse',
    verifyBody: 'Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.',
    verifyCta: 'E-Mail bestätigen',
    expiresNote: 'Dieser Link läuft automatisch ab. Falls Sie diese Anfrage nicht gestellt haben, können Sie diese Nachricht ignorieren.'
  },
  es: {
    dir: 'ltr',
    resetSubject: 'Solicitud de restablecimiento de contraseña',
    resetHeading: 'Restablecer su contraseña',
    resetBody: 'Recibimos una solicitud para restablecer su contraseña. Este enlace es de un solo uso.',
    resetCta: 'Restablecer contraseña',
    verifySubject: 'Verifique su correo electrónico',
    verifyHeading: 'Verificación de correo electrónico',
    verifyBody: 'Por favor, verifique su dirección de correo electrónico para activar su cuenta.',
    verifyCta: 'Verificar correo',
    expiresNote: 'Este enlace caduca automáticamente. Si no solicitó esto, puede ignorar este mensaje.'
  }
};

/**
 * Verify that SMTP delivery is genuinely configured in environment variables.
 * Prevents code from falsely reporting email delivery success when disabled.
 */
export function checkSmtpConfiguration(env = {}) {
  if (String(env.SMTP_ENABLED).toLowerCase() !== 'true') {
    return { configured: false, reason: 'SMTP_ENABLED is not set to true.' };
  }
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'MAIL_FROM_ADDRESS'];
  const missing = required.filter((k) => !env[k] || String(env[k]).startsWith('CHANGE_ME'));
  if (missing.length > 0) {
    return { configured: false, reason: `Missing or placeholder SMTP environment variables: ${missing.join(', ')}` };
  }
  return { configured: true };
}

function renderTemplate({ lang, siteName, subject, heading, body, ctaLabel, actionUrl }) {
  const cleanSiteName = stripControlChars(siteName || 'Website');
  const cleanSubject = stripControlChars(subject);
  const safeSite = escapeHtml(cleanSiteName);
  const safeUrl = sanitizeSafeUrl(actionUrl, '');
  if (!safeUrl) {
    throw new Error('Refusing to build transactional email with unsafe or empty action URL.');
  }

  const copy = COPY[lang] || COPY.en;
  const html = `<!DOCTYPE html>
<html lang="${escapeHtml(lang in COPY ? lang : 'en')}" dir="${copy.dir}">
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #0f172a; margin: 0; padding: 24px; background: #f8fafc;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px;">
    <p style="font-weight: 700; margin-top: 0;">${safeSite}</p>
    <h1 style="font-size: 20px;">${escapeHtml(heading)}</h1>
    <p>${escapeHtml(body)}</p>
    <p style="margin: 24px 0;">
      <a href="${escapeHtml(safeUrl)}" style="display: inline-block; background: #1d4ed8; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: 600;">
        ${escapeHtml(ctaLabel)}
      </a>
    </p>
    <p style="font-size: 13px; color: #475569;">${escapeHtml(copy.expiresNote)}</p>
  </div>
</body>
</html>`;

  const text = `${cleanSiteName}\n\n${stripControlChars(heading)}\n${stripControlChars(body)}\n\n${stripControlChars(ctaLabel)}: ${safeUrl}\n\n${stripControlChars(copy.expiresNote)}\n`;

  return { subject: `[${cleanSiteName}] ${cleanSubject}`, html, text };
}

export function buildPasswordResetEmail({ lang = 'en', siteName, resetUrl }) {
  const copy = COPY[lang] || COPY.en;
  return renderTemplate({
    lang,
    siteName,
    subject: copy.resetSubject,
    heading: copy.resetHeading,
    body: copy.resetBody,
    ctaLabel: copy.resetCta,
    actionUrl: resetUrl
  });
}

export function buildEmailVerificationEmail({ lang = 'en', siteName, verifyUrl }) {
  const copy = COPY[lang] || COPY.en;
  return renderTemplate({
    lang,
    siteName,
    subject: copy.verifySubject,
    heading: copy.verifyHeading,
    body: copy.verifyBody,
    ctaLabel: copy.verifyCta,
    actionUrl: verifyUrl
  });
}

