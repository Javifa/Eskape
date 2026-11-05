import { formatPrice } from '../data/menuData';
import { useMenu } from '../context/MenuContext';
import { AllergenIcon } from './Icons';

export default function ProductCard({ product, onSelect }) {
  const { allergensMap } = useMenu();
  const isSoldOut = product.isAvailable === false;

  return (
    <article
      className={`menu-card ${isSoldOut ? 'menu-card--soldout' : ''}`}
      onClick={() => onSelect && onSelect(product)}
    >
      <div className="menu-card__media">
        <img
          src={product.image}
          alt={product.name}
          className="menu-card__img"
          loading="lazy"
          width="320"
          height="320"
        />
        {isSoldOut ? (
          <span className="menu-card__badge menu-card__badge--soldout">
            Agotado hoy
          </span>
        ) : (
          product.badge && (
            <span className="menu-card__badge">{product.badge}</span>
          )
        )}
      </div>

      <div className="menu-card__body">
        <div className="menu-card__header">
          <h3 className="menu-card__title">{product.name}</h3>
          <span
            className="menu-card__price"
            aria-label={`Precio ${formatPrice(product.price)}`}
          >
            {formatPrice(product.price)}
          </span>
        </div>

        {product.description && (
          <p className="menu-card__desc">{product.description}</p>
        )}

        {(isSoldOut ||
          (product.dietary && product.dietary.length > 0) ||
          (product.allergens && product.allergens.length > 0)) && (
          <div className="menu-card__footer">
            <div className="menu-card__tags" aria-label="Alérgenos y características">
              {isSoldOut && (
                <span className="soldout-chip">Agotado temporalmente</span>
              )}

              {product.dietary?.map((tag) => (
                <span key={tag} className="dietary-chip">
                  {tag}
                </span>
              ))}

              {product.allergens?.map((algKey) => {
                const alg = allergensMap[algKey];
                if (!alg) return null;
                return (
                  <span
                    key={algKey}
                    className="allergen-pill"
                    title={`Contiene ${alg.name}: ${alg.description}`}
                  >
                    <AllergenIcon type={algKey} size={12} />
                    <span>{alg.name}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
