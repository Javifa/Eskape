import { formatPrice } from '../data/menuData';
import { useMenu } from '../context/MenuContext';
import { AllergenIcon } from './Icons';

export default function ProductCard({ product, onSelect }) {
  const { allergensMap } = useMenu();
  const isSoldOut = product.isAvailable === false;

  return (
    <article
      className={`menu-card ${isSoldOut ? 'menu-card--soldout' : ''}`}
      onClick={() => onSelect(product)}
    >
      <div className="menu-card__media">
        <img
          src={product.image}
          alt={product.name}
          className="menu-card__img"
          loading="lazy"
          width="240"
          height="240"
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
          <h4 className="menu-card__title">{product.name}</h4>
          <span
            className="menu-card__price"
            aria-label={`Precio ${formatPrice(product.price)}`}
          >
            {formatPrice(product.price)}
          </span>
        </div>

        <p className="menu-card__desc">{product.description}</p>

        <div className="menu-card__footer">
          <div className="menu-card__tags">
            {isSoldOut && (
              <span className="soldout-chip">Agotado temporalmente</span>
            )}

            {product.dietary?.map((tag) => (
              <span key={tag} className="dietary-chip">
                {tag}
              </span>
            ))}

            {product.allergens.length > 0 ? (
              product.allergens.map((algKey) => {
                const alg = allergensMap[algKey];
                if (!alg) return null;
                return (
                  <span
                    key={algKey}
                    className="allergen-pill"
                    title={`Contiene ${alg.name}: ${alg.description}`}
                  >
                    <AllergenIcon type={algKey} size={13} />
                    <span>{alg.name}</span>
                  </span>
                );
              })
            ) : (
              <span className="allergen-pill allergen-pill--free">
                Sin alérgenos
              </span>
            )}
          </div>

          <button
            type="button"
            className="menu-card__info-btn"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            aria-label={`Ver detalles y alérgenos de ${product.name}`}
          >
            Detalles
          </button>
        </div>
      </div>
    </article>
  );
}
