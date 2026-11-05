import { useState, useMemo, useRef, useEffect } from 'react';
import { useMenu } from '../context/MenuContext';
import { formatPrice } from '../data/menuData';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import {
  SearchIcon,
  CloseIcon,
  AllergenIcon,
  EskapeWaveDivider,
} from './Icons';

export default function CartaApp({
  initialCategory = 'todos',
  onNavigateHome,
}) {
  const {
    publicCategories,
    publicProducts,
    allergensMap,
    settings,
    loading,
    error,
    fetchMenuData,
  } = useMenu();

  const [activeCategory, setActiveCategory] = useState(initialCategory || 'todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [excludedAllergens, setExcludedAllergens] = useState([]);
  const [showAllergenPanel, setShowAllergenPanel] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const tabsContainerRef = useRef(null);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  // Mostrar botón flotante de "Volver arriba" al hacer scroll en el móvil
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 360);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mantener la pestaña activa centrada en la barra horizontal sin mover el scroll vertical
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(
      `[data-cat-tab="${activeCategory}"]`
    );
    if (activeBtn) {
      const targetLeft =
        activeBtn.offsetLeft -
        container.clientWidth / 2 +
        activeBtn.clientWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth',
      });
    }
  }, [activeCategory]);

  const showAllergenFilter =
    settings.visibilityConfig?.showAllergenFilter !== false;
  const showFeaturedSection =
    settings.visibilityConfig?.showFeaturedSection !== false;

  const featuredProducts = useMemo(
    () => publicProducts.filter((p) => p.featured),
    [publicProducts]
  );

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    // Actualizar query param sin recargar para mantener enlaces limpios en /carta
    const url =
      catId === 'todos'
        ? '/carta'
        : `/carta?categoria=${encodeURIComponent(catId)}`;
    window.history.replaceState({}, '', url);
  };

  const toggleExcludedAllergen = (allergenId) => {
    setExcludedAllergens((prev) =>
      prev.includes(allergenId)
        ? prev.filter((id) => id !== allergenId)
        : [...prev, allergenId]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setExcludedAllergens([]);
    handleSelectCategory('todos');
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return publicProducts.filter((product) => {
      const matchesCategory =
        activeCategory === 'todos'
          ? true
          : activeCategory === 'destacados'
          ? Boolean(product.featured)
          : product.categoryId === activeCategory;

      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        (product.badge && product.badge.toLowerCase().includes(q));

      const matchesAllergens =
        excludedAllergens.length === 0 ||
        !product.allergens.some((alg) => excludedAllergens.includes(alg));

      return matchesCategory && matchesSearch && matchesAllergens;
    });
  }, [publicProducts, activeCategory, searchQuery, excludedAllergens]);

  const categoriesToDisplay = useMemo(() => {
    if (activeCategory === 'todos' || activeCategory === 'destacados') {
      return publicCategories;
    }
    return publicCategories.filter((cat) => cat.id === activeCategory);
  }, [publicCategories, activeCategory]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    excludedAllergens.length > 0 ||
    activeCategory !== 'todos';

  const getCategoryName = (catId) =>
    publicCategories.find((c) => c.id === catId)?.name || '';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="carta-app-shell">
      <a href="#carta-productos" className="skip-link">
        Saltar directamente a los productos de la carta
      </a>

      {/* CABECERA COMPACTA FIJA TIPO APLICACIÓN MÓVIL */}
      <header className="carta-app-header">
        <div className="container carta-app-header__inner">
          <div className="carta-app-header__brand">
            <div className="carta-app-header__logo-frame">
              <img
                src={settings.logoUrl || '/logo-eskape.jpg'}
                alt={`Logotipo de ${settings.name}`}
                className="carta-app-header__logo"
                width="132"
                height="44"
                loading="eager"
              />
            </div>
            <div className="carta-app-header__titles">
              <h1 className="carta-app-header__name">{settings.name}</h1>
              <span className="carta-app-header__kicker">
                Carta Digital · {settings.tagline}
              </span>
            </div>
          </div>

          <div className="carta-app-header__actions">
            {showAllergenFilter && (
              <button
                type="button"
                aria-expanded={showAllergenPanel}
                className={`carta-app-header__pill-btn ${
                  excludedAllergens.length > 0 || showAllergenPanel
                    ? 'carta-app-header__pill-btn--active'
                    : ''
                }`}
                onClick={() => setShowAllergenPanel((prev) => !prev)}
              >
                <span>Alérgenos</span>
                {excludedAllergens.length > 0 && (
                  <span className="carta-app-header__badge">
                    {excludedAllergens.length}
                  </span>
                )}
              </button>
            )}

            <a
              href="/"
              onClick={(e) => {
                if (onNavigateHome) {
                  e.preventDefault();
                  onNavigateHome();
                }
              }}
              className="carta-app-header__home-link"
              aria-label={`Ver información y horarios de ${settings.name}`}
            >
              Local y horario
            </a>
          </div>
        </div>

        {/* BARRA HORIZONTAL DE CATEGORÍAS INTEGRADA EN LA CABECERA COMPACTA */}
        <div className="carta-app-tabs-bar">
          <div className="container">
            <div
              ref={tabsContainerRef}
              className="category-tabs carta-app-tabs"
              role="tablist"
              aria-label="Categorías de la carta digital"
            >
              <button
                type="button"
                role="tab"
                data-cat-tab="todos"
                aria-selected={activeCategory === 'todos'}
                className={`category-tab ${
                  activeCategory === 'todos' ? 'category-tab--active' : ''
                }`}
                onClick={() => handleSelectCategory('todos')}
              >
                <span>Toda la carta</span>
                <span className="category-tab__count">
                  {publicProducts.length}
                </span>
              </button>

              {showFeaturedSection && featuredProducts.length > 0 && (
                <button
                  type="button"
                  role="tab"
                  data-cat-tab="destacados"
                  aria-selected={activeCategory === 'destacados'}
                  className={`category-tab ${
                    activeCategory === 'destacados'
                      ? 'category-tab--active'
                      : ''
                  }`}
                  onClick={() => handleSelectCategory('destacados')}
                >
                  <span>★ Destacados</span>
                  <span className="category-tab__count">
                    {featuredProducts.length}
                  </span>
                </button>
              )}

              {publicCategories.map((category) => {
                const count = publicProducts.filter(
                  (p) => p.categoryId === category.id
                ).length;
                const isSelected = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    data-cat-tab={category.id}
                    aria-selected={isSelected}
                    className={`category-tab ${
                      isSelected ? 'category-tab--active' : ''
                    }`}
                    onClick={() => handleSelectCategory(category.id)}
                  >
                    <span>{category.name}</span>
                    <span className="category-tab__count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* CUERPO PRINCIPAL DE LA CARTA DIGITAL */}
      <main id="carta-productos" className="carta-app-main">
        <div className="container">
          {/* Buscador instantáneo y panel desplegable de alérgenos */}
          <div className="carta-app-toolbar">
            <div className="search-field carta-app-search">
              <label htmlFor="carta-search-input" className="sr-only">
                Buscar plato, bebida o ingrediente en la carta
              </label>
              <span className="search-field__icon">
                <SearchIcon size={18} />
              </span>
              <input
                id="carta-search-input"
                name="carta-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tostada, café, aguacate, ibérico..."
                className="search-field__input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-field__clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpiar búsqueda"
                >
                  <CloseIcon size={16} />
                </button>
              )}
            </div>

            {showAllergenFilter &&
              (showAllergenPanel || excludedAllergens.length > 0) && (
                <div
                  className="allergen-filter-bar carta-app-allergen-bar"
                  role="group"
                  aria-label="Ocultar productos con alérgenos específicos"
                >
                  <div className="carta-app-allergen-bar__top">
                    <span className="allergen-filter-bar__label">
                      Pulsa para ocultar platos con estos alérgenos:
                    </span>
                    {excludedAllergens.length > 0 && (
                      <button
                        type="button"
                        className="carta-app-allergen-bar__reset"
                        onClick={() => setExcludedAllergens([])}
                      >
                        Restablecer ({excludedAllergens.length})
                      </button>
                    )}
                  </div>
                  <div className="allergen-filter-bar__chips">
                    {Object.values(allergensMap).map((alg) => {
                      const isExcluded = excludedAllergens.includes(alg.id);
                      return (
                        <button
                          key={alg.id}
                          type="button"
                          aria-pressed={isExcluded}
                          onClick={() => toggleExcludedAllergen(alg.id)}
                          className={`allergen-filter-chip ${
                            isExcluded ? 'allergen-filter-chip--active' : ''
                          }`}
                        >
                          <AllergenIcon type={alg.id} size={14} />
                          <span>Sin {alg.name.toLowerCase()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>

          {/* BANDA DE IMPRESCINDIBLES CON FOTOGRAFÍAS GRANDES (vista inicial "Toda la carta") */}
          {showFeaturedSection &&
            activeCategory === 'todos' &&
            !searchQuery.trim() &&
            excludedAllergens.length === 0 &&
            featuredProducts.length > 0 && (
              <section
                className="carta-featured-strip"
                aria-labelledby="carta-featured-heading"
              >
                <div className="carta-featured-strip__header">
                  <div>
                    <span className="carta-featured-strip__kicker">
                      ★ Selección de la Casa
                    </span>
                    <h2
                      id="carta-featured-heading"
                      className="carta-featured-strip__title"
                    >
                      Nuestros Imprescindibles
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="carta-featured-strip__more"
                    onClick={() => handleSelectCategory('destacados')}
                  >
                    Ver todos ({featuredProducts.length})
                  </button>
                </div>

                <div className="carta-featured-rail" role="list">
                  {featuredProducts.map((product) => {
                    const isSoldOut = product.isAvailable === false;
                    return (
                      <article
                        key={product.id}
                        role="listitem"
                        className={`carta-featured-item ${
                          isSoldOut ? 'carta-featured-item--soldout' : ''
                        }`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div className="carta-featured-item__media">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="carta-featured-item__img"
                            loading="eager"
                            width="380"
                            height="250"
                          />
                          {isSoldOut ? (
                            <span className="carta-featured-item__badge carta-featured-item__badge--soldout">
                              Agotado hoy
                            </span>
                          ) : (
                            product.badge && (
                              <span className="carta-featured-item__badge">
                                {product.badge}
                              </span>
                            )
                          )}
                          <span className="carta-featured-item__price">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <div className="carta-featured-item__body">
                          <span className="carta-featured-item__cat">
                            {getCategoryName(product.categoryId)}
                          </span>
                          <h3 className="carta-featured-item__title">
                            {product.name}
                          </h3>
                          <p className="carta-featured-item__desc">
                            {product.description}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

          {/* ESTADOS DE CARGA, ERROR O RESULTADO DE PRODUCTOS */}
          {loading ? (
            <div className="empty-state" role="status">
              <h2 className="empty-state__title">
                Cargando carta de {settings.name}...
              </h2>
              <p className="empty-state__desc">
                Sincronizando productos, categorías y disponibilidad del día.
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
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state" role="status">
              <h2 className="empty-state__title">
                No hemos encontrado platos con esos filtros
              </h2>
              <p className="empty-state__desc">
                Prueba con otro término de búsqueda o restablece los filtros de
                categoría y alérgenos. Disponemos de pan sin gluten y bebidas
                vegetales bajo petición.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={clearFilters}
                >
                  Mostrar toda la carta
                </button>
              )}
            </div>
          ) : (
            <div
              key={activeCategory}
              className="menu-categories-stack carta-categories-animated"
            >
              {categoriesToDisplay.map((category) => {
                const items = filteredProducts.filter(
                  (p) => p.categoryId === category.id
                );
                if (items.length === 0) return null;

                return (
                  <section
                    key={category.id}
                    id={`seccion-${category.id}`}
                    className="menu-category-block carta-category-section"
                    aria-labelledby={`heading-cat-${category.id}`}
                  >
                    <div className="menu-category-block__header">
                      <div>
                        {category.highlightTag && (
                          <span className="menu-category-block__tag">
                            {category.highlightTag}
                          </span>
                        )}
                        <h2
                          id={`heading-cat-${category.id}`}
                          className="menu-category-block__title"
                        >
                          {category.name}
                        </h2>
                        <p className="menu-category-block__desc">
                          {category.description}
                        </p>
                      </div>
                      <span className="menu-category-block__count">
                        {items.length}{' '}
                        {items.length === 1 ? 'opción' : 'opciones'}
                      </span>
                    </div>

                    <div className="menu-items-grid carta-items-grid">
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

          {/* Leyenda rápida de alérgenos e información de servicio al pie de /carta */}
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
                Información sobre Alérgenos y Adaptaciones
              </h2>
              <p className="allergen-guide-box__subtitle">
                En {settings.name} elaboramos nuestros desayunos al momento.
                Disponemos de pan sin gluten, leche sin lactosa y bebidas
                vegetales (avena, soja y almendra). Consulta con nuestro personal
                en barra o mesa.
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

          {/* Pie compacto de la aplicación de Carta Digital */}
          <footer className="carta-app-footer">
            <div className="carta-app-footer__info">
              <strong>
                {settings.name} · {settings.tagline}
              </strong>
              <span>Precios con IVA incluido · Carta digital de mesa</span>
            </div>
            <a
              href="/"
              onClick={(e) => {
                if (onNavigateHome) {
                  e.preventDefault();
                  onNavigateHome();
                }
              }}
              className="btn btn--outline carta-app-footer__btn"
            >
              Ver web del establecimiento, ubicación y horarios
            </a>
          </footer>
        </div>
      </main>

      {/* Botón flotante para volver arriba cuando el cliente navega por la carta */}
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

      {/* Modal de ficha detallada del producto */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
