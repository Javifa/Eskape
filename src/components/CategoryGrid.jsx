import { useMenu } from '../context/MenuContext';

export default function CategoryGrid({ activeCategory, onSelectCategory }) {
  const { publicCategories, publicProducts } = useMenu();

  const getCategoryCount = (catId) =>
    publicProducts.filter((item) => item.categoryId === catId).length;

  return (
    <section
      id="categorias"
      className="section categories-section"
      aria-labelledby="categories-heading"
    >
      <div className="container">
        <div className="section-header">
          <span className="section-header__kicker">Qué ofrecemos cada mañana</span>
          <h2 id="categories-heading" className="section-header__title">
            Nuestras Especialidades y Secciones
          </h2>
          <p className="section-header__description">
            Selecciona cualquier sección para abrir directamente la carta digital interactiva en esa categoría.
          </p>
        </div>

        <div className="category-grid" role="list">
          {publicCategories.map((category) => {
            const count = getCategoryCount(category.id);
            const isSelected = activeCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                role="listitem"
                className={`category-card ${isSelected ? 'category-card--active' : ''}`}
                onClick={() => onSelectCategory(category.id)}
                aria-label={`Ver categoría ${category.name} (${count} productos)`}
              >
                <div className="category-card__media">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="category-card__img"
                    loading="lazy"
                    width="320"
                    height="240"
                  />
                  <span className="category-card__count">{count} opciones</span>
                </div>
                <div className="category-card__body">
                  <div className="category-card__title-row">
                    <h3 className="category-card__title">{category.name}</h3>
                    {category.highlightTag && (
                      <span className="category-card__tag">{category.highlightTag}</span>
                    )}
                  </div>
                  <p className="category-card__desc">{category.shortDescription}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
