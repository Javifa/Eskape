import { useEffect } from 'react';
import { formatPrice } from '../data/menuData';
import { useMenu } from '../context/MenuContext';
import { AllergenIcon, CloseIcon } from './Icons';

export default function ProductModal({ product, onClose }) {
  const { categories, allergensMap } = useMenu();

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const category = categories.find((c) => c.id === product.categoryId);
  const isSoldOut = product.isAvailable === false;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      onClick={onClose}
    >
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-sheet__close"
          onClick={onClose}
          aria-label="Cerrar ficha del producto"
        >
          <CloseIcon size={20} />
        </button>

        <div className="modal-sheet__media">
          <img
            src={product.image}
            alt={product.name}
            className="modal-sheet__img"
            width="600"
            height="420"
          />
          {isSoldOut ? (
            <span className="modal-sheet__badge modal-sheet__badge--soldout">
              Agotado temporalmente
            </span>
          ) : (
            product.badge && (
              <span className="modal-sheet__badge">{product.badge}</span>
            )
          )}
        </div>

        <div className="modal-sheet__content">
          <div className="modal-sheet__meta">
            <span className="modal-sheet__category">{category?.name}</span>
            <span className="modal-sheet__price">
              {formatPrice(product.price)}
            </span>
          </div>

          <h3 id="modal-product-title" className="modal-sheet__title">
            {product.name}
          </h3>

          {isSoldOut && (
            <div className="modal-soldout-notice" role="status">
              Este producto se encuentra agotado temporalmente hoy. Consulta con nuestro personal por alternativas recién hechas.
            </div>
          )}

          <p className="modal-sheet__desc">{product.description}</p>

          {product.dietary && product.dietary.length > 0 && (
            <div className="modal-sheet__section">
              <h4 className="modal-sheet__section-title">
                Opciones y adaptaciones
              </h4>
              <div className="modal-sheet__dietary-list">
                {product.dietary.map((item) => (
                  <span key={item} className="dietary-chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="modal-sheet__section">
            <h4 className="modal-sheet__section-title">
              Alérgenos declarados en este plato
            </h4>
            {product.allergens.length > 0 ? (
              <div className="modal-sheet__allergen-grid">
                {product.allergens.map((algKey) => {
                  const alg = allergensMap[algKey];
                  if (!alg) return null;
                  return (
                    <div key={algKey} className="modal-allergen-card">
                      <span className="modal-allergen-card__icon">
                        <AllergenIcon type={algKey} size={18} />
                      </span>
                      <div>
                        <strong>{alg.name}</strong>
                        <p>{alg.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="modal-sheet__no-allergens">
                Este producto no contiene alérgenos de declaración obligatoria. Consulta con nuestro personal si necesitas información sobre trazas.
              </p>
            )}
          </div>

          <div className="modal-sheet__actions">
            <button
              type="button"
              className="btn btn--primary btn--full"
              onClick={onClose}
            >
              Volver a la carta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
