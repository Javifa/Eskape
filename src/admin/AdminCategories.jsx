import { useState } from 'react';
import { useMenu } from '../context/MenuContext';
import { uploadEstablishmentMedia } from '../lib/imageOptimizer';
import { CloseIcon } from '../components/Icons';

function createEmptyCategory(nextOrder) {
  return {
    id: '',
    name: '',
    shortDescription: '',
    description: '',
    image: '/images/hero-breakfast.jpg',
    highlightTag: '',
    sortOrder: nextOrder,
    isActive: true,
    isNew: true,
  };
}

export default function AdminCategories({ onNavigateToCategoryProducts, onNotify }) {
  const {
    categories,
    products,
    saveCategory,
    deleteCategory,
    reorderCategory,
  } = useMenu();

  const [editingCat, setEditingCat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(null);

  const sortedCategories = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  const getProductCount = (catId) =>
    products.filter((p) => p.categoryId === catId).length;

  const handleToggleActive = async (category) => {
    try {
      await saveCategory({ ...category, isActive: !category.isActive });
      onNotify(
        'success',
        `Categoría "${category.name}" ${
          category.isActive ? 'ocultada' : 'activada'
        } en la carta pública.`
      );
    } catch (err) {
      onNotify('error', err.message);
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingCat) return;
    setUploading(true);
    try {
      const res = await uploadEstablishmentMedia(file, 'categories', {
        maxDimension: 800,
        quality: 0.84,
      });
      setEditingCat((prev) => ({ ...prev, image: res.url }));
      onNotify(
        'success',
        `Imagen de categoría optimizada (${res.originalSizeKB} KB → ${res.optimizedSizeKB} KB).`
      );
    } catch (err) {
      onNotify('error', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingCat) return;
    setSaving(true);
    try {
      const saved = await saveCategory(editingCat);
      onNotify(
        'success',
        `Categoría "${saved.name}" guardada correctamente.`
      );
      setEditingCat(null);
    } catch (err) {
      onNotify('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteCat) return;
    try {
      await deleteCategory(confirmDeleteCat.id);
      onNotify(
        'success',
        `Categoría "${confirmDeleteCat.name}" eliminada correctamente.`
      );
      setConfirmDeleteCat(null);
    } catch (err) {
      onNotify('error', err.message);
      setConfirmDeleteCat(null);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <div>
          <h2 className="admin-section__title">Gestión de Categorías</h2>
          <p className="admin-section__desc">
            Organiza las secciones de la carta digital, cambia su orden de aparición o crea nuevas categorías de temporada.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() =>
            setEditingCat(createEmptyCategory(categories.length + 1))
          }
        >
          + Nueva Categoría
        </button>
      </div>

      <div className="admin-category-list">
        {sortedCategories.map((cat, idx) => {
          const prodCount = getProductCount(cat.id);

          return (
            <article
              key={cat.id}
              className={`admin-category-item ${
                !cat.isActive ? 'admin-category-item--inactive' : ''
              }`}
            >
              <div className="admin-category-item__order">
                <button
                  type="button"
                  className="admin-order-btn"
                  disabled={idx === 0}
                  onClick={() => reorderCategory(cat.id, 'up')}
                  aria-label={`Subir categoría ${cat.name}`}
                >
                  ↑
                </button>
                <span className="admin-category-item__pos">
                  #{idx + 1}
                </span>
                <button
                  type="button"
                  className="admin-order-btn"
                  disabled={idx === sortedCategories.length - 1}
                  onClick={() => reorderCategory(cat.id, 'down')}
                  aria-label={`Bajar categoría ${cat.name}`}
                >
                  ↓
                </button>
              </div>

              <img
                src={cat.image}
                alt={cat.name}
                className="admin-category-item__img"
                width="84"
                height="64"
                loading="lazy"
              />

              <div className="admin-category-item__body">
                <div className="admin-category-item__header">
                  <h3 className="admin-category-item__title">{cat.name}</h3>
                  {cat.highlightTag && (
                    <span className="admin-product-item__badge">
                      {cat.highlightTag}
                    </span>
                  )}
                  <span
                    className={`admin-status-pill ${
                      cat.isActive
                        ? 'admin-status-pill--ok'
                        : 'admin-status-pill--hidden'
                    }`}
                  >
                    {cat.isActive ? 'Activa en carta' : 'Oculta'}
                  </span>
                </div>
                <p className="admin-category-item__desc">
                  {cat.shortDescription || cat.description}
                </p>
              </div>

              <div className="admin-category-item__actions">
                <button
                  type="button"
                  className="admin-chip-toggle"
                  onClick={() => onNavigateToCategoryProducts(cat.id)}
                >
                  {prodCount} {prodCount === 1 ? 'producto' : 'productos'} →
                </button>

                <button
                  type="button"
                  className="btn btn--secondary admin-btn-sm"
                  onClick={() => handleToggleActive(cat)}
                >
                  {cat.isActive ? 'Ocultar' : 'Activar'}
                </button>

                <button
                  type="button"
                  className="btn btn--secondary admin-btn-sm"
                  onClick={() => setEditingCat({ ...cat, isNew: false })}
                >
                  Editar
                </button>

                <button
                  type="button"
                  className="btn btn--danger-outline admin-btn-sm"
                  onClick={() => setConfirmDeleteCat(cat)}
                >
                  Eliminar
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Modal de creación / edición de categoría */}
      {editingCat && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cat-modal-title"
        >
          <div className="modal-sheet">
            <button
              type="button"
              className="modal-sheet__close"
              onClick={() => setEditingCat(null)}
              aria-label="Cerrar editor de categoría"
            >
              <CloseIcon size={20} />
            </button>

            <form onSubmit={handleSave} className="admin-modal-form">
              <h3 id="cat-modal-title" className="admin-modal-form__title">
                {editingCat.isNew
                  ? 'Crear Nueva Categoría'
                  : `Editar Categoría: ${editingCat.name}`}
              </h3>

              <div className="admin-form-grid">
                <div className="admin-field admin-field--span2">
                  <label htmlFor="cat-name" className="admin-field__label">
                    Nombre de la categoría *
                  </label>
                  <input
                    id="cat-name"
                    type="text"
                    required
                    value={editingCat.name}
                    onChange={(e) =>
                      setEditingCat((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Ej. Bollería Artesana, Brunch..."
                    className="admin-field__input"
                  />
                </div>

                <div className="admin-field admin-field--span2">
                  <label htmlFor="cat-tag" className="admin-field__label">
                    Etiqueta breve (Opcional)
                  </label>
                  <input
                    id="cat-tag"
                    type="text"
                    value={editingCat.highlightTag}
                    onChange={(e) =>
                      setEditingCat((prev) => ({
                        ...prev,
                        highlightTag: e.target.value,
                      }))
                    }
                    placeholder="Ej. Pan artesano, 100% Fruta fresca..."
                    className="admin-field__input"
                  />
                </div>

                <div className="admin-field admin-field--span2">
                  <label htmlFor="cat-short" className="admin-field__label">
                    Subtítulo para tarjeta de acceso rápido
                  </label>
                  <input
                    id="cat-short"
                    type="text"
                    value={editingCat.shortDescription}
                    onChange={(e) =>
                      setEditingCat((prev) => ({
                        ...prev,
                        shortDescription: e.target.value,
                      }))
                    }
                    placeholder="Ej. Hogaza de masa madre, mollete artesano o cereales"
                    className="admin-field__input"
                  />
                </div>

                <div className="admin-field admin-field--span2">
                  <label htmlFor="cat-desc" className="admin-field__label">
                    Descripción completa de la sección
                  </label>
                  <textarea
                    id="cat-desc"
                    rows="3"
                    value={editingCat.description}
                    onChange={(e) =>
                      setEditingCat((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="admin-field__textarea"
                  />
                </div>

                <div className="admin-field admin-field--span2">
                  <span className="admin-field__label">Imagen de portada de la categoría</span>
                  <div className="admin-photo-uploader">
                    <img
                      src={editingCat.image}
                      alt="Vista previa"
                      className="admin-photo-uploader__preview"
                      width="100"
                      height="75"
                    />
                    <label className="btn btn--secondary admin-btn-sm">
                      {uploading
                        ? 'Optimizando...'
                        : 'Subir imagen de categoría'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleUploadImage}
                        disabled={uploading}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                <div className="admin-field admin-field--span2">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={editingCat.isActive}
                      onChange={(e) =>
                        setEditingCat((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                    />
                    <span>Categoría activa y visible en la carta pública</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-form__actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setEditingCat(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={saving || uploading}
                >
                  {saving ? 'Guardando...' : 'Guardar categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de borrado de categoría */}
      {confirmDeleteCat && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="del-cat-title"
        >
          <div className="modal-sheet modal-sheet--confirm">
            <h3 id="del-cat-title" className="admin-modal-form__title">
              ¿Eliminar la categoría «{confirmDeleteCat.name}»?
            </h3>
            <p className="admin-section__desc">
              {getProductCount(confirmDeleteCat.id) > 0
                ? `Atención: Esta categoría tiene ${getProductCount(
                    confirmDeleteCat.id
                  )} producto(s) asignados. Debes reasignarlos a otra categoría antes de poder eliminarla.`
                : 'Se eliminará esta categoría de la carta digital.'}
            </p>
            <div className="admin-modal-form__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setConfirmDeleteCat(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--danger"
                disabled={getProductCount(confirmDeleteCat.id) > 0}
                onClick={handleDelete}
              >
                Eliminar categoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
