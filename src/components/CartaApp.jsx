import { useState, useEffect } from 'react';
import { useMenu } from '../context/MenuContext';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { AllergenIcon, EskapeWaveDivider } from './Icons';

export default function CartaApp({ initialCategory, onNavigateHome }) {
  const {
    publicCategories,
    publicProducts,
    allergensMap,
    settings,
    loading,
    error,
    fetchMenuData,
  } = useMenu();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Si se accede desde un enlace con categoría específica, desplazar suavemente a esa sección
  useEffect(() => {
    if (
      !loading &&
      initialCategory &&
      initialCategory !== 'todos' &&
      initialCategory !== 'destacados'
    ) {
      const sectionEl = document.getElementById(`seccion-${initialCategory}`);
      if (sectionEl) {
        setTimeout(() => {
          sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    }
  }, [loading, initialCategory]);

  // Mostrar botón discreto para volver arriba al desplazarse por la carta
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 480);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleJumpToSection = (e, categoryId) => {
    e.preventDefault();
    const el = document.getElementById(`seccion-${categoryId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="carta-page" id="carta-top">
      {/* CABECERA EDITORIAL DE LA CARTA DIGITAL */}
      <header className="carta-header">
        <div className="container carta-header__inner">
          <div className="carta-header__logo-wrap">
            <img
              src={settings.logoUrl || '/logo-eskape.jpg'}
              alt={`Logotipo de ${settings.name}`}
              className="carta-header__logo"
              width="240"
              height="80"
              loading="eager"
            />
          </div>

          <p className="carta-header__establishment">
            {settings.name} · {settings.tagline}
          </p>

          {/* Pequeña portada gastronómica con mensaje de bienvenida */}
          <div className="carta-cover">
            <img
              src={settings.heroImageUrl || '/images/hero-breakfast.jpg'}
              alt={`Desayunos y cafetería en ${settings.name}`}
              className="carta-cover__img"
              width="960"
              height="380"
              loading="eager"
            />
            <div className="carta-cover__overlay">
              <span className="carta-cover__kicker">Nuestra Carta</span>
              <h1 className="carta-cover__title">
                {settings.welcomeTitle || 'Empieza el día con buen sabor'}
              </h1>
              {settings.welcomeSubtitle && (
                <p className="carta-cover__subtitle">
                  {settings.welcomeSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Índice discreto de categorías (sin desplazamiento lateral ni contadores) */}
          {publicCategories.length > 0 && (
            <nav
              className="carta-index"
              aria-label="Índice de secciones de la carta"
            >
              <ul className="carta-index__list">
                {publicCategories.map((category) => (
                  <li key={category.id} className="carta-index__item">
                    <a
                      href={`#seccion-${category.id}`}
                      onClick={(e) => handleJumpToSection(e, category.id)}
                      className="carta-index__link"
                    >
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </header>

      {/* CUERPO VERTICAL DE SECCIONES DE LA CARTA */}
      <main className="carta-main">
        <div className="container">
          {loading ? (
            <div className="empty-state" role="status">
              <h2 className="empty-state__title">
                Cargando la carta de {settings.name}...
              </h2>
              <p className="empty-state__desc">
                Preparando nuestras elaboraciones del día.
              </p>
            </div>
          ) : error ? (
            <div className="empty-state" role="alert">
              <h2 className="empty-state__title">
                No se ha podido cargar la carta en este momento
              </h2>
              <p className="empty-state__desc">{error}</p>
              <button
                type="button"
                className="btn btn--primary"
                onClick={fetchMenuData}
              >
                Reintentar conexión
              </button>
            </div>
          ) : (
            <div className="carta-sections">
              {publicCategories.map((category) => {
                const items = publicProducts.filter(
                  (p) => p.categoryId === category.id
                );
                if (items.length === 0) return null;

                return (
                  <section
                    key={category.id}
                    id={`seccion-${category.id}`}
                    className="carta-section"
                    aria-labelledby={`heading-cat-${category.id}`}
                  >
                    <div className="carta-section__header">
                      <h2
                        id={`heading-cat-${category.id}`}
                        className="carta-section__title"
                      >
                        {category.name}
                      </h2>
                      {(category.description || category.shortDescription) && (
                        <p className="carta-section__desc">
                          {category.description || category.shortDescription}
                        </p>
                      )}
                      <div
                        className="carta-section__divider"
                        aria-hidden="true"
                      >
                        <span className="carta-section__divider-line" />
                        <span className="carta-section__divider-diamond" />
                        <span className="carta-section__divider-line" />
                      </div>
                    </div>

                    <div className="carta-products-grid">
                      {items.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onSelect={setSelectedProduct}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* Leyenda de alérgenos al final de la carta */}
          <section
            id="alergenos"
            className="allergen-guide-box carta-allergen-footer"
            aria-labelledby="carta-allergen-heading"
          >
            <div className="allergen-guide-box__header">
              <h2
                id="carta-allergen-heading"
                className="allergen-guide-box__title"
              >
                Información sobre Alérgenos e Intolerancias
              </h2>
              <p className="allergen-guide-box__subtitle">
                En {settings.name} cuidamos cada ingrediente. Disponemos de pan
                sin gluten, leche sin lactosa y bebidas vegetales (avena, soja y
                almendra). Consulta con nuestro equipo en barra o mesa.
              </p>
            </div>

            <div className="allergen-legend-grid">
              {Object.values(allergensMap).map((alg) => (
                <div key={alg.id} className="allergen-legend-item">
                  <span className="allergen-legend-item__icon">
                    <AllergenIcon type={alg.id} size={18} />
                  </span>
                  <div>
                    <strong className="allergen-legend-item__name">
                      {alg.name}
                    </strong>
                    <p className="allergen-legend-item__desc">
                      {alg.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <EskapeWaveDivider />

          {/* Pie editorial de la carta */}
          <footer className="carta-footer">
            <div className="carta-footer__brand">
              <strong>
                {settings.name} · {settings.tagline}
              </strong>
              <span>Precios con IVA incluido</span>
            </div>
            <a
              href="/"
              onClick={(e) => {
                if (onNavigateHome) {
                  e.preventDefault();
                  onNavigateHome();
                }
              }}
              className="carta-footer__link"
            >
              Información del establecimiento, ubicación y horarios →
            </a>
          </footer>
        </div>
      </main>

      {/* Botón discreto para volver arriba cuando el cliente se desplaza */}
      {showBackToTop && (
        <button
          type="button"
          className="carta-fab-top"
          onClick={scrollToTop}
          aria-label="Volver al principio de la carta"
        >
          <span aria-hidden="true">↑</span>
          <span>Subir</span>
        </button>
      )}

      {/* Modal de detalle al pulsar sobre un plato */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
