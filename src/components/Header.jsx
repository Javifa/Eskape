import { useMenu } from '../context/MenuContext';

export default function Header({ onOpenCarta }) {
  const { settings } = useMenu();
  const vis = settings.visibilityConfig || {};

  const handleOpenCarta = (e) => {
    if (onOpenCarta) {
      e.preventDefault();
      onOpenCarta('todos');
    }
  };

  return (
    <header className="site-header" id="inicio">
      <div className="container site-header__inner">
        <a
          href="#inicio"
          className="brand-lockup"
          aria-label={`${settings.name} — ${settings.tagline}, ir al inicio`}
        >
          <div className="brand-lockup__logo-frame">
            <img
              src={settings.logoUrl || '/logo-eskape.jpg'}
              alt={`Logotipo oficial de ${settings.name}`}
              className="brand-lockup__logo"
              width="220"
              height="74"
              loading="eager"
            />
          </div>
          <span className="brand-lockup__subtitle">{settings.tagline}</span>
        </a>

        <nav className="main-nav" aria-label="Navegación del establecimiento">
          <ul className="main-nav__list">
            <li>
              <a href="#establecimiento" className="main-nav__link">
                Nuestro Espacio
              </a>
            </li>
            <li>
              <a href="#categorias" className="main-nav__link">
                Especialidades
              </a>
            </li>
            {vis.showFeaturedSection !== false && (
              <li>
                <a href="#destacados" className="main-nav__link">
                  Imprescindibles
                </a>
              </li>
            )}
            <li>
              <a href="#contacto" className="main-nav__link">
                Ubicación y Horario
              </a>
            </li>
            <li>
              <a
                href="/carta"
                onClick={handleOpenCarta}
                className="main-nav__link main-nav__link--active"
              >
                Carta Digital
              </a>
            </li>
          </ul>
        </nav>

        <a
          href="/carta"
          onClick={handleOpenCarta}
          className="btn btn--primary btn--header"
        >
          Abrir Carta
        </a>
      </div>
    </header>
  );
}
