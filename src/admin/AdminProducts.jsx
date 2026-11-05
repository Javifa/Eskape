import { useState, useMemo } from 'react';
import { useMenu } from '../context/MenuContext';
import { formatPrice } from '../data/menuData';
import { uploadEstablishmentMedia } from '../lib/imageOptimizer';
import { AllergenIcon, SearchIcon, CloseIcon } from '../components/Icons';

const PRESET_DIETARY_TAGS = [
  'Opción sin gluten',
  'Vegetariano',
  'Vegano',
  'Sin gluten',
  'Sin lácteos',
  'Bebida vegetal disponible',
];

const GALLERY_PRESETS = [
  { label: 'Desayuno Eskape', url: '/images/hero-breakfast.jpg' },
  { label: 'Desayuno Ibérico', url: '/images/desayuno-iberico.jpg' },
  { label: 'Tostada Aguacate', url: '/images/tostada-aguacate.jpg' },
  { label: 'Tostada Salmón', url: '/images/tostada-salmon.jpg' },
  { label: 'Tostada Ricotta', url: '/images/tostada-ricotta.jpg' },
  { label: 'Huevos Benedict', url: '/images/huevos-benedict.jpg' },
  { label: 'Tortitas Avena', url: '/images/tortitas-avena.jpg' },
  { label: 'Bikini Trufado', url: '/images/bikini-trufado.jpg' },
  { label: 'Croissant Plancha', url: '/images/croissant-plancha.jpg' },
  { label: 'Bowl Yogur', url: '/images/bowl-yogur.jpg' },
  { label: 'Café Especialidad', url: '/images/cafe-especialidad.jpg' },
  { label: 'Zumos Naturales', url: '/images/zumos-naturales.jpg' },
];

function createEmptyProduct(defaultCategoryId) {
  return {
    id: '',
    categoryId: defaultCategoryId || 'desayunos',
    name: '',
    description: '',
    price: '4.50',
    image: '/images/tostada-aguacate.jpg',
    isActive: true,
    isAvailable: true,
    featured: false,
    badge: '',
    allergens: [],
    dietary: [],
  };
}

export default function AdminProducts({ initialCategoryFilter = 'todos', onNotify }) {
  const {
    products,
    categories,
    allergensMap,
    saveProduct,
    deleteProduct,
    reorderProduct,
  } = useMenu();

  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'soldout' | 'hidden' | 'featured'
  const [search, setSearch] = useState('');

  // Estado de edición rápida de precio en línea
  const [quickPrices, setQuickPrices] = useState({});
  const [savingQuickId, setSavingQuickId] = useState(null);

  // Estado del modal de creación/edición completa
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingModal, setSavingModal] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadMeta, setUploadMeta] = useState(null);

  // Estado de confirmación de borrado
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => {
        if (categoryFilter !== 'todos' && p.categoryId !== categoryFilter) {
          return false;
        }
        if (statusFilter === 'active' && !p.isActive) return false;
        if (statusFilter === 'soldout' && p.isAvailable !== false) return false;
        if (statusFilter === 'hidden' && p.isActive !== false) return false;
        if (statusFilter === 'featured' && !p.featured) return false;
        if (
          q &&
          !p.name.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.categoryId !== b.categoryId) {
          const catOrderA =
            categories.find((c) => c.id === a.categoryId)?.sortOrder ?? 99;
          const catOrderB =
            categories.find((c) => c.id === b.categoryId)?.sortOrder ?? 99;
          return catOrderA - catOrderB;
        }
        return a.sortOrder - b.sortOrder;
      });
  }, [products, categories, categoryFilter, statusFilter, search]);

  const getCategoryName = (catId) =>
    categories.find((c) => c.id === catId)?.name || catId;

  // Guardado rápido de precio desde móvil en 1 toque
  const handleQuickPriceSave = async (product) => {
    const rawVal = quickPrices[product.id];
    if (rawVal === undefined) return;
    const parsed = Number(String(rawVal).replace(',', '.'));
    if (Number.isNaN(parsed) || parsed < 0) {
      onNotify('error', 'Introduce un precio válido (ej. 5.20).');
      return;
    }

    setSavingQuickId(product.id);
    try {
      await saveProduct({ ...product, price: parsed });
      setQuickPrices((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      onNotify(
        'success',
        `Precio de "${product.name}" actualizado a ${formatPrice(parsed)}.`
      );
    } catch (err) {
      onNotify('error', err.message);
    } finally {
      setSavingQuickId(null);
    }
  };

  // Cambio rápido de estado (Agotado / Activo / Destacado)
  const handleQuickToggle = async (product, field, label) => {
    try {
      const nextVal = !product[field];
      await saveProduct({ ...product, [field]: nextVal });
      onNotify('success', `${product.name}: ${label}.`);
    } catch (err) {
      onNotify('error', err.message);
    }
  };

  const openNewModal = () => {
    const defaultCat =
      categoryFilter !== 'todos'
        ? categoryFilter
        : categories[0]?.id || 'desayunos';
    setUploadMeta(null);
    setEditingProduct(createEmptyProduct(defaultCat));
  };

  const openEditModal = (product) => {
    setUploadMeta(null);
    setEditingProduct({
      ...product,
      price: Number(product.price).toFixed(2),
      allergens: [...(product.allergens || [])],
      dietary: [...(product.dietary || [])],
    });
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    setUploadingImg(true);
    try {
      const result = await uploadEstablishmentMedia(file, 'products', {
        maxDimension: 900,
        quality: 0.84,
      });
      setEditingProduct((prev) => ({ ...prev, image: result.url }));
      setUploadMeta(result);
      onNotify(
        'success',
        `Fotografía optimizada automáticamente (${result.originalSizeKB} KB → ${result.optimizedSizeKB} KB).`
      );
    } catch (err) {
      onNotify('error', err.message);
    } finally {
      setUploadingImg(false);
    }
  };

  const toggleAllergenInModal = (algId) => {
    setEditingProduct((prev) => {
      const exists = prev.allergens.includes(algId);
      return {
        ...prev,
        allergens: exists
          ? prev.allergens.filter((id) => id !== algId)
          : [...prev.allergens, algId],
      };
    });
  };

  const toggleDietaryInModal = (tag) => {
    setEditingProduct((prev) => {
      const exists = prev.dietary.includes(tag);
      return {
        ...prev,
        dietary: exists
          ? prev.dietary.filter((t) => t !== tag)
          : [...prev.dietary, tag],
      };
    });
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingModal(true);
    try {
      const parsedPrice = Number(
        String(editingProduct.price).replace(',', '.')
      );
      const saved = await saveProduct({
        ...editingProduct,
        price: parsedPrice,
      });
      onNotify(
        'success',
        `Producto "${saved.name}" guardado correctamente en la carta.`
      );
      setEditingProduct(null);
    } catch (err) {
      onNotify('error', err.message);
    } finally {
      setSavingModal(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteProduct) return;
    try {
      await deleteProduct(confirmDeleteProduct.id);
      onNotify(
        'success',
        `Producto "${confirmDeleteProduct.name}" eliminado de la carta.`
      );
      setConfirmDeleteProduct(null);
    } catch (err) {
      onNotify('error', err.message);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <div>
          <h2 className="admin-section__title">Gestión de Productos</h2>
          <p className="admin-section__desc">
            Modifica precios en un toque, marca platos agotados hoy o añade nuevas creaciones a la carta.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={openNewModal}
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Barra de filtros y búsqueda */}
      <div className="admin-toolbar">
        <div className="search-field admin-toolbar__search">
          <span className="search-field__icon">
            <SearchIcon size={18} />
          </span>
          <input
            id="admin-prod-search"
            name="admin-prod-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar plato por nombre o ingrediente..."
            className="search-field__input"
            aria-label="Buscar producto"
          />
          {search && (
            <button
              type="button"
              className="search-field__clear"
              onClick={() => setSearch('')}
              aria-label="Limpiar búsqueda"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        <div className="admin-toolbar__selects">
          <select
            id="admin-prod-cat-filter"
            name="admin-prod-cat-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-select"
            aria-label="Filtrar por categoría"
          >
            <option value="todos">Todas las categorías ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} (
                {products.filter((p) => p.categoryId === cat.id).length})
              </option>
            ))}
          </select>

          <select
            id="admin-prod-status-filter"
            name="admin-prod-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select"
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Visibles en carta</option>
            <option value="soldout">Agotados temporalmente</option>
            <option value="hidden">Ocultos / Inactivos</option>
            <option value="featured">Destacados en portada</option>
          </select>
        </div>
      </div>

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-state__title">No hay productos con este filtro</h3>
          <p className="empty-state__desc">
            Prueba a cambiar la categoría seleccionada o crea un nuevo producto.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={openNewModal}
          >
            + Crear Producto
          </button>
        </div>
      ) : (
        <div className="admin-product-list">
          {filteredProducts.map((product) => {
            const currentPriceVal =
              quickPrices[product.id] !== undefined
                ? quickPrices[product.id]
                : Number(product.price).toFixed(2);
            const hasPriceChanged =
              quickPrices[product.id] !== undefined &&
              Number(String(quickPrices[product.id]).replace(',', '.')) !==
                Number(product.price);

            return (
              <article
                key={product.id}
                className={`admin-product-item ${
                  !product.isActive ? 'admin-product-item--inactive' : ''
                } ${
                  product.isAvailable === false
                    ? 'admin-product-item--soldout'
                    : ''
                }`}
              >
                <div className="admin-product-item__media">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="admin-product-item__img"
                    width="96"
                    height="96"
                    loading="lazy"
                  />
                  <div className="admin-product-item__order-btns">
                    <button
                      type="button"
                      className="admin-order-btn"
                      onClick={() => reorderProduct(product.id, 'up')}
                      title="Subir posición en su categoría"
                      aria-label={`Subir posición de ${product.name}`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="admin-order-btn"
                      onClick={() => reorderProduct(product.id, 'down')}
                      title="Bajar posición en su categoría"
                      aria-label={`Bajar posición de ${product.name}`}
                    >
                      ↓
                    </button>
                  </div>
                </div>

                <div className="admin-product-item__info">
                  <div className="admin-product-item__top">
                    <span className="admin-product-item__cat">
                      {getCategoryName(product.categoryId)}
                    </span>
                    {product.badge && (
                      <span className="admin-product-item__badge">
                        {product.badge}
                      </span>
                    )}
                    {!product.isActive && (
                      <span className="admin-status-pill admin-status-pill--hidden">
                        Oculto en carta
                      </span>
                    )}
                    {product.isAvailable === false && (
                      <span className="admin-status-pill admin-status-pill--soldout">
                        Agotado hoy
                      </span>
                    )}
                    {product.featured && (
                      <span className="admin-status-pill admin-status-pill--featured">
                        ★ Destacado
                      </span>
                    )}
                  </div>

                  <h3 className="admin-product-item__title">{product.name}</h3>
                  <p className="admin-product-item__desc">
                    {product.description}
                  </p>

                  {/* Toggles rápidos de estado para móvil y escritorio */}
                  <div className="admin-product-item__toggles">
                    <button
                      type="button"
                      className={`admin-chip-toggle ${
                        product.isAvailable === false
                          ? 'admin-chip-toggle--warn'
                          : 'admin-chip-toggle--ok'
                      }`}
                      onClick={() =>
                        handleQuickToggle(
                          product,
                          'isAvailable',
                          product.isAvailable === false
                            ? 'Marcado como disponible'
                            : 'Marcado como agotado temporalmente'
                        )
                      }
                    >
                      {product.isAvailable === false
                        ? 'Agotado (Pulsar para activar)'
                        : 'Disponible hoy'}
                    </button>

                    <button
                      type="button"
                      className={`admin-chip-toggle ${
                        product.isActive ? '' : 'admin-chip-toggle--muted'
                      }`}
                      onClick={() =>
                        handleQuickToggle(
                          product,
                          'isActive',
                          product.isActive
                            ? 'Ocultado de la carta pública'
                            : 'Activado en la carta pública'
                        )
                      }
                    >
                      {product.isActive ? 'Visible en carta' : 'Oculto'}
                    </button>

                    <button
                      type="button"
                      className={`admin-chip-toggle ${
                        product.featured ? 'admin-chip-toggle--gold' : ''
                      }`}
                      onClick={() =>
                        handleQuickToggle(
                          product,
                          'featured',
                          product.featured
                            ? 'Quitado de Imprescindibles'
                            : 'Añadido a Imprescindibles'
                        )
                      }
                    >
                      {product.featured ? '★ En Destacados' : '☆ Destacar'}
                    </button>
                  </div>
                </div>

                {/* Bloque lateral de precio rápido y botones de edición */}
                <div className="admin-product-item__actions">
                  <div className="quick-price-box">
                    <label
                      htmlFor={`price-${product.id}`}
                      className="quick-price-box__label"
                    >
                      Precio (€)
                    </label>
                    <div className="quick-price-box__row">
                      <input
                        id={`price-${product.id}`}
                        type="number"
                        step="0.05"
                        min="0"
                        value={currentPriceVal}
                        onChange={(e) =>
                          setQuickPrices((prev) => ({
                            ...prev,
                            [product.id]: e.target.value,
                          }))
                        }
                        className="quick-price-box__input"
                      />
                      {hasPriceChanged && (
                        <button
                          type="button"
                          className="btn btn--primary quick-price-box__save"
                          disabled={savingQuickId === product.id}
                          onClick={() => handleQuickPriceSave(product)}
                        >
                          {savingQuickId === product.id ? '...' : 'Guardar'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="admin-product-item__btns">
                    <button
                      type="button"
                      className="btn btn--secondary admin-btn-sm"
                      onClick={() => openEditModal(product)}
                    >
                      Editar ficha
                    </button>
                    <button
                      type="button"
                      className="btn btn--danger-outline admin-btn-sm"
                      onClick={() => setConfirmDeleteProduct(product)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal de creación / edición completa de producto */}
      {editingProduct && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-product-modal-title"
        >
          <div className="modal-sheet modal-sheet--wide">
            <button
              type="button"
              className="modal-sheet__close"
              onClick={() => setEditingProduct(null)}
              aria-label="Cerrar editor de producto"
            >
              <CloseIcon size={20} />
            </button>

            <form onSubmit={handleSaveModal} className="admin-modal-form">
              <h3 id="edit-product-modal-title" className="admin-modal-form__title">
                {editingProduct.id
                  ? `Editar: ${editingProduct.name}`
                  : 'Crear Nuevo Producto'}
              </h3>

              <div className="admin-form-grid">
                <div className="admin-field admin-field--span2">
                  <label htmlFor="prod-name" className="admin-field__label">
                    Nombre del producto *
                  </label>
                  <input
                    id="prod-name"
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Ej. Tostada de Aguacate & Huevo Poché"
                    className="admin-field__input"
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="prod-cat" className="admin-field__label">
                    Categoría *
                  </label>
                  <select
                    id="prod-cat"
                    value={editingProduct.categoryId}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                    className="admin-field__input"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-field">
                  <label htmlFor="prod-price" className="admin-field__label">
                    Precio en Euros (€) *
                  </label>
                  <input
                    id="prod-price"
                    type="number"
                    step="0.05"
                    min="0"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    className="admin-field__input"
                  />
                </div>

                <div className="admin-field admin-field--span2">
                  <label htmlFor="prod-desc" className="admin-field__label">
                    Descripción breve (ingredientes y elaboración)
                  </label>
                  <textarea
                    id="prod-desc"
                    rows="3"
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe los ingredientes principales..."
                    className="admin-field__textarea"
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="prod-badge" className="admin-field__label">
                    Etiqueta destacada (Opcional)
                  </label>
                  <input
                    id="prod-badge"
                    type="text"
                    value={editingProduct.badge}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        badge: e.target.value,
                      }))
                    }
                    placeholder="Ej. Más pedido, Top Ventas, Nuevo..."
                    className="admin-field__input"
                  />
                </div>

                {/* Estados del producto */}
                <div className="admin-field">
                  <span className="admin-field__label">Visibilidad y estado</span>
                  <div className="admin-checkbox-group">
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={editingProduct.isActive}
                        onChange={(e) =>
                          setEditingProduct((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                      />
                      <span>Producto activo (visible en la carta)</span>
                    </label>
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={editingProduct.isAvailable !== false}
                        onChange={(e) =>
                          setEditingProduct((prev) => ({
                            ...prev,
                            isAvailable: e.target.checked,
                          }))
                        }
                      />
                      <span>Disponible hoy (desmarcar si está agotado)</span>
                    </label>
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={editingProduct.featured}
                        onChange={(e) =>
                          setEditingProduct((prev) => ({
                            ...prev,
                            featured: e.target.checked,
                          }))
                        }
                      />
                      <span>Mostrar en «Nuestros Imprescindibles»</span>
                    </label>
                  </div>
                </div>

                {/* Fotografía con subida optimizada o selector de galería */}
                <div className="admin-field admin-field--span2">
                  <label className="admin-field__label">
                    Fotografía del producto
                  </label>
                  <div className="admin-photo-uploader">
                    <img
                      src={editingProduct.image}
                      alt="Vista previa"
                      className="admin-photo-uploader__preview"
                      width="110"
                      height="110"
                    />
                    <div className="admin-photo-uploader__controls">
                      <label className="btn btn--secondary admin-btn-sm">
                        {uploadingImg
                          ? 'Optimizando y subiendo...'
                          : 'Subir nueva fotografía (JPG/PNG/WebP)'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageFileChange}
                          disabled={uploadingImg}
                          className="sr-only"
                        />
                      </label>
                      {uploadMeta && (
                        <span className="admin-photo-uploader__meta">
                          Optimizada: {uploadMeta.originalSizeKB} KB →{' '}
                          {uploadMeta.optimizedSizeKB} KB
                        </span>
                      )}
                      <select
                        value={
                          GALLERY_PRESETS.some(
                            (g) => g.url === editingProduct.image
                          )
                            ? editingProduct.image
                            : ''
                        }
                        onChange={(e) => {
                          if (e.target.value) {
                            setEditingProduct((prev) => ({
                              ...prev,
                              image: e.target.value,
                            }));
                          }
                        }}
                        className="admin-select"
                        aria-label="Seleccionar fotografía de la galería de ESKAPE"
                      >
                        <option value="">
                          — O elegir foto de la galería de ESKAPE —
                        </option>
                        {GALLERY_PRESETS.map((preset) => (
                          <option key={preset.url} value={preset.url}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Selección de Alérgenos */}
                <div className="admin-field admin-field--span2">
                  <span className="admin-field__label">
                    Alérgenos presentes en este producto
                  </span>
                  <div className="admin-allergens-selector">
                    {Object.values(allergensMap).map((alg) => {
                      const selected = editingProduct.allergens.includes(alg.id);
                      return (
                        <button
                          key={alg.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleAllergenInModal(alg.id)}
                          className={`allergen-filter-chip ${
                            selected ? 'allergen-filter-chip--active' : ''
                          }`}
                        >
                          <AllergenIcon type={alg.id} size={14} />
                          <span>{alg.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Etiquetas dietéticas */}
                <div className="admin-field admin-field--span2">
                  <span className="admin-field__label">
                    Opciones dietéticas y adaptaciones
                  </span>
                  <div className="admin-allergens-selector">
                    {PRESET_DIETARY_TAGS.map((tag) => {
                      const selected = editingProduct.dietary.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleDietaryInModal(tag)}
                          className={`allergen-filter-chip ${
                            selected ? 'allergen-filter-chip--active' : ''
                          }`}
                        >
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="admin-modal-form__actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={savingModal || uploadingImg}
                >
                  {savingModal ? 'Guardando...' : 'Guardar cambios del producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {confirmDeleteProduct && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div className="modal-sheet modal-sheet--confirm">
            <h3 id="delete-confirm-title" className="admin-modal-form__title">
              ¿Eliminar «{confirmDeleteProduct.name}»?
            </h3>
            <p className="admin-section__desc">
              Esta acción eliminará el producto de la carta. Si solo quieres ocultarlo temporalmente o marcarlo como agotado hoy, usa los botones «Oculto» o «Agotado» sin necesidad de borrarlo.
            </p>
            <div className="admin-modal-form__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setConfirmDeleteProduct(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleConfirmDelete}
              >
                Sí, eliminar definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
