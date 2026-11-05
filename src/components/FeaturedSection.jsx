import { formatPrice } from '../data/menuData';
import { useMenu } from '../context/MenuContext';
import { AllergenIcon } from './Icons';

export default function FeaturedSection({ onSelectProduct, onSelectCategory }) {
  const { publicProducts, publicCategories, allergensMap, settings } = useMenu();

  if (settings.visibilityConfig?.showFeaturedSection === false) {
    return null;
  }

  const featuredProducts = publicProducts.filter((p) => p.featured);
  if (featuredProducts.length === 0) return null;

  const getCategoryName = (catId) =>
    publicCategories.find((c) => c.id === catId)?.name || '';

  return (
    <section
      id="destacados"
      className="section featured-section"
      aria-labelledby="featured-heading"
    >
      <div className="container">
        <div className="section-header section-header--split">
          <div>
            <span className="section-header__kicker">Selección de la Casa</span>
            <h2 id="featured-heading" className="section-header__title">
              Nuestros Imprescindibles
            </h2>
            <p className="section-header__description">
              Las elaboraciones más pedidas cada mañana por nuestros clientes.
            </p>
          </div>
          <a
            href="/carta"
            className="btn btn--outline"
            onClick={(e) => {
              if (onSelectCategory) {
                e.preventDefault();
                onSelectCategory('todos');
              }
            }}
          >
            Abrir carta digital completa →
          </a>
        </div>

        <div className="featured-grid">
          {featuredProducts.map((product) => {
            const isSoldOut = product.isAvailable === false;

            return (
              <article
                key={product.id}
                className={`featured-card ${isSoldOut ? 'featured-card--soldout' : ''}`}
                onClick={() => onSelectProduct(product)}
              >
                <div className="featured-card__media">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="featured-card__img"
                    loading="lazy"
                    width="480"
                    height="360"
                  />
                  {isSoldOut ? (
                    <span className="featured-card__badge featured-card__badge--soldout">
                      Agotado temporalmente
                    </span>
                  ) : (
                    product.badge && (
                      <span className="featured-card__badge">{product.badge}</span>
                    )
                  )}
                </div>

                <div className="featured-card__content">
                  <div className="featured-card__meta">
                    <span className="featured-card__category">
                      {getCategoryName(product.categoryId)}
                    </span>
                    <span className="featured-card__price">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <h3 className="featured-card__title">{product.name}</h3>
                  <p className="featured-card__desc">{product.description}</p>

                  <div className="featured-card__footer">
                    <div
                      className="allergen-inline-list"
                      aria-label="Alérgenos presentes"
                    >
                      {product.allergens.length > 0 ? (
                        product.allergens.map((algKey) => {
                          const alg = allergensMap[algKey];
                          if (!alg) return null;
                          return (
                            <span
                              key={algKey}
                              className="allergen-pill"
                              title={`${alg.name}: ${alg.description}`}
                            >
                              <AllergenIcon type={algKey} size={13} />
                              <span>{alg.name}</span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="allergen-pill allergen-pill--free">
                          Sin alérgenos declarados
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="featured-card__detail-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                      aria-label={`Ver ficha completa y alérgenos de ${product.name}`}
                    >
                      Ficha y alérgenos
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
