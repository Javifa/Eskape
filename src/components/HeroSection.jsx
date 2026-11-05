import { useMenu } from '../context/MenuContext';
import { EskapeWaveDivider } from './Icons';

export default function HeroSection({ onExploreMenu }) {
  const { settings } = useMenu();

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="container hero__grid">
        <div className="hero__content">
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-line" aria-hidden="true" />
            <span>
              {settings.name} · {settings.tagline}
            </span>
          </div>

          <h1 id="hero-heading" className="hero__title">
            {settings.welcomeTitle}
          </h1>

          <p className="hero__subtitle">{settings.welcomeSubtitle}</p>

          <div className="hero__actions">
            <a
              href="/carta"
              className="btn btn--primary btn--lg"
              onClick={(e) => {
                if (onExploreMenu) {
                  e.preventDefault();
                  onExploreMenu('todos');
                }
              }}
            >
              Abrir Carta Digital
            </a>
            <a href="#contacto" className="btn btn--secondary btn--lg">
              Ubicación y Horarios
            </a>
          </div>

          <dl
            className="hero__highlights"
            aria-label="Características del establecimiento"
          >
            <div className="hero__highlight-item">
              <dt>Pan de obrador</dt>
              <dd>Hogaza de masa madre, mollete artesano y opción sin gluten</dd>
            </div>
            <div className="hero__highlight-item">
              <dt>Café de especialidad</dt>
              <dd>100% Arábica de tueste natural y bebidas vegetales</dd>
            </div>
          </dl>
        </div>

        <div className="hero__visual">
          <div className="hero__image-frame">
            <img
              src={settings.heroImageUrl || '/images/hero-breakfast.jpg'}
              alt={`Mesa de desayuno en ${settings.name} con café artesanal y tostadas`}
              className="hero__image"
              width="900"
              height="900"
              loading="eager"
            />
            {settings.heroSuggestionTitle && (
              <div className="hero__floating-card">
                <span className="hero__floating-label">
                  {settings.heroSuggestionLabel || 'Sugerencia Matinal'}
                </span>
                <strong className="hero__floating-title">
                  {settings.heroSuggestionTitle}
                </strong>
                <span className="hero__floating-meta">
                  {settings.heroSuggestionMeta}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <EskapeWaveDivider />
      </div>
    </section>
  );
}
