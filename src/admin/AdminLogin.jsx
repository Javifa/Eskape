import { useState } from 'react';
import { useMenu } from '../context/MenuContext';

export default function AdminLogin({ onBackToPublicMenu, onBackToHome }) {
  const {
    settings,
    isSupabaseConfigured,
    supabaseConfigReason,
    signInAdmin,
    sendPasswordReset,
    setIsLocalPreviewAdmin,
  } = useMenu();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'recovery'
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'error'|'success', text: string }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      if (mode === 'recovery') {
        await sendPasswordReset(email);
        setFeedback({
          type: 'success',
          text: 'Si el correo está registrado en el proyecto Supabase de ESKAPE, recibirás un enlace para restablecer tu contraseña.',
        });
      } else {
        await signInAdmin(email, password);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'No se pudo iniciar sesión.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <div className="admin-auth-card__header">
          <div className="admin-auth-card__logo-wrap">
            <img
              src={settings.logoUrl || '/logo-eskape.jpg'}
              alt={`Logotipo ${settings.name}`}
              className="admin-auth-card__logo"
              width="180"
              height="60"
            />
          </div>
          <span className="admin-auth-card__badge">Acceso Privado · Administración</span>
          <h1 className="admin-auth-card__title">
            {mode === 'login'
              ? 'Panel de Gestión de Carta'
              : 'Recuperar Contraseña'}
          </h1>
          <p className="admin-auth-card__subtitle">
            {mode === 'login'
              ? `Exclusivo para personal autorizado de ${settings.name}.`
              : 'Introduce tu correo de administrador para recibir el enlace de restablecimiento.'}
          </p>
        </div>

        {/* Estado real de configuración de Supabase */}
        <div
          className={`admin-connection-banner ${
            isSupabaseConfigured
              ? 'admin-connection-banner--ok'
              : 'admin-connection-banner--pending'
          }`}
          role="status"
        >
          <div className="admin-connection-banner__title">
            <span className="admin-connection-banner__dot" aria-hidden="true" />
            <strong>
              {isSupabaseConfigured
                ? 'Conectado al proyecto Supabase exclusivo de ESKAPE'
                : 'Proyecto Supabase de ESKAPE pendiente de configurar en .env'}
            </strong>
          </div>
          {!isSupabaseConfigured && (
            <p className="admin-connection-banner__desc">
              {supabaseConfigReason} Una vez creado el proyecto independiente en
              Supabase y ejecutadas las migraciones SQL de{' '}
              <code>supabase/migrations/</code>, añade{' '}
              <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>{' '}
              en tu archivo <code>.env</code>.
            </p>
          )}
        </div>

        {feedback && (
          <div
            className={`admin-alert ${
              feedback.type === 'error'
                ? 'admin-alert--error'
                : 'admin-alert--success'
            }`}
            role="alert"
          >
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-auth-form">
          <div className="admin-field">
            <label htmlFor="admin-email" className="admin-field__label">
              {mode === 'login'
                ? 'Usuario o correo electrónico autorizado'
                : 'Correo electrónico autorizado'}
            </label>
            <input
              id="admin-email"
              name="admin-email"
              type={mode === 'login' ? 'text' : 'email'}
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                mode === 'login'
                  ? 'Eskape o correo@eskape.es'
                  : 'correo@eskape.es'
              }
              className="admin-field__input"
              disabled={!isSupabaseConfigured || submitting}
            />
          </div>

          {mode === 'login' && (
            <div className="admin-field">
              <label htmlFor="admin-password" className="admin-field__label">
                Contraseña
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="admin-field__input"
                disabled={!isSupabaseConfigured || submitting}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--full btn--lg"
            disabled={!isSupabaseConfigured || submitting}
          >
            {submitting
              ? 'Verificando acceso...'
              : mode === 'login'
              ? 'Iniciar sesión con Supabase Auth'
              : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <div className="admin-auth-card__links">
          {mode === 'login' ? (
            <button
              type="button"
              className="admin-text-link"
              onClick={() => {
                setFeedback(null);
                setMode('recovery');
              }}
            >
              ¿Has olvidado tu contraseña?
            </button>
          ) : (
            <button
              type="button"
              className="admin-text-link"
              onClick={() => {
                setFeedback(null);
                setMode('login');
              }}
            >
              Volver al inicio de sesión
            </button>
          )}
        </div>

        {!isSupabaseConfigured && (
          <div className="admin-local-preview-box">
            <h2 className="admin-local-preview-box__title">
              ¿Quieres probar el Panel de Administración antes de conectar Supabase?
            </h2>
            <p className="admin-local-preview-box__desc">
              Puedes abrir el panel en Modo Vista Previa Local para probar la edición rápida de precios, productos agotados, categorías y datos del local en este navegador.
            </p>
            <button
              type="button"
              className="btn btn--secondary btn--full"
              onClick={() => setIsLocalPreviewAdmin(true)}
            >
              Explorar Panel en Modo Vista Previa Local
            </button>
          </div>
        )}

        <div className="admin-auth-card__footer">
          <button
            type="button"
            className="admin-text-link"
            onClick={onBackToPublicMenu}
          >
            ← Ir a la carta digital (/carta)
          </button>
          {onBackToHome && (
            <>
              {' · '}
              <button
                type="button"
                className="admin-text-link"
                onClick={onBackToHome}
              >
                Web principal (/)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
