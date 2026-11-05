import { useState } from 'react';
import { useMenu } from '../context/MenuContext';
import { formatPrice } from '../data/menuData';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminEstablishment from './AdminEstablishment';
import AdminSettings from './AdminSettings';
import { CloseIcon } from '../components/Icons';

export default function AdminDashboard({ onNavigatePublic, onNavigateHome }) {
  const {
    settings,
    products,
    categories,
    publicCategories,
    publicProducts,
    isSupabaseConfigured,
    adminProfile,
    authUser,
    signOutAdmin,
    saveProduct,
    recentActivity,
  } = useMenu();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'categories' | 'establishment' | 'settings'
  const [selectedCategoryForProducts, setSelectedCategoryForProducts] =
    useState('todos');
  const [toast, setToast] = useState(null);
  const [showLivePreview, setShowLivePreview] = useState(false);

  const notify = (type, text) => {
    setToast({ type, text, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev && prev.text === text ? null : prev));
    }, 4500);
  };

  const activeProductsCount = products.filter((p) => p.isActive).length;
  const activeCategoriesCount = categories.filter((c) => c.isActive).length;
  const soldOutProducts = products.filter((p) => p.isAvailable === false);
  const hiddenProducts = products.filter((p) => !p.isActive);

  const handleJumpToCategoryProducts = (catId) => {
    setSelectedCategoryForProducts(catId);
    setActiveTab('products');
  };

  const handleRestoreAvailability = async (product) => {
    try {
      await saveProduct({ ...product, isAvailable: true });
      notify(
        'success',
        `"${product.name}" vuelve a estar disponible en la carta pública.`
      );
    } catch (err) {
      notify('error', err.message);
    }
  };

  return (
    <div className="admin-shell">
      {/* Cabecera del Panel de Administración */}
      <header className="admin-topbar">
        <div className="container admin-topbar__inner">
          <div className="admin-topbar__brand">
            <div className="admin-topbar__logo-wrap">
              <img
                src={settings.logoUrl || '/logo-eskape.jpg'}
                alt={settings.name}
                className="admin-topbar__logo"
                width="136"
                height="44"
              />
            </div>
            <div>
              <span className="admin-topbar__kicker">Panel de Administración</span>
              <strong className="admin-topbar__name">{settings.name}</strong>
            </div>
          </div>

          <div className="admin-topbar__actions">
            <span
              className={`admin-conn-pill ${
                isSupabaseConfigured
                  ? 'admin-conn-pill--live'
                  : 'admin-conn-pill--local'
              }`}
              title={
                isSupabaseConfigured
                  ? `Sesión autenticada: ${adminProfile?.email || authUser?.email}`
                  : 'Modo Vista Previa Local (Pendiente configurar .env de Supabase ESKAPE)'
              }
            >
              <span className="admin-conn-pill__dot" />
              <span>
                {isSupabaseConfigured
                  ? 'Supabase ESKAPE Conectado'
                  : 'Vista Previa Local (.env pendiente)'}
              </span>
            </span>

            <button
              type="button"
              className="btn btn--secondary admin-btn-sm"
              onClick={() => setShowLivePreview(true)}
            >
              Vista previa de la carta
            </button>

            <button
              type="button"
              className="btn btn--outline admin-btn-sm"
              onClick={onNavigatePublic}
            >
              Ver carta (/carta) ↗
            </button>

            {onNavigateHome && (
              <button
                type="button"
                className="btn btn--secondary admin-btn-sm"
                onClick={onNavigateHome}
              >
                Web principal (/)
              </button>
            )}

            <button
              type="button"
              className="btn btn--danger-outline admin-btn-sm"
              onClick={signOutAdmin}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Pestañas de navegación del Dashboard */}
        <div className="admin-nav-wrapper">
          <div className="container">
            <nav className="admin-nav" aria-label="Secciones de administración">
              <button
                type="button"
                className={`admin-nav__tab ${
                  activeTab === 'overview' ? 'admin-nav__tab--active' : ''
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Resumen
              </button>
              <button
                type="button"
                className={`admin-nav__tab ${
                  activeTab === 'products' ? 'admin-nav__tab--active' : ''
                }`}
                onClick={() => {
                  setSelectedCategoryForProducts('todos');
                  setActiveTab('products');
                }}
              >
                Productos ({products.length})
              </button>
              <button
                type="button"
                className={`admin-nav__tab ${
                  activeTab === 'categories' ? 'admin-nav__tab--active' : ''
                }`}
                onClick={() => setActiveTab('categories')}
              >
                Categorías ({categories.length})
              </button>
              <button
                type="button"
                className={`admin-nav__tab ${
                  activeTab === 'establishment' ? 'admin-nav__tab--active' : ''
                }`}
                onClick={() => setActiveTab('establishment')}
              >
                Establecimiento
              </button>
              <button
                type="button"
                className={`admin-nav__tab ${
                  activeTab === 'settings' ? 'admin-nav__tab--active' : ''
                }`}
                onClick={() => setActiveTab('settings')}
              >
                Configuración
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Notificación flotante de confirmación / error */}
      {toast && (
        <div className="container">
          <div
            className={`admin-toast ${
              toast.type === 'error'
                ? 'admin-toast--error'
                : 'admin-toast--success'
            }`}
            role="status"
          >
            <span>{toast.text}</span>
            <button
              type="button"
              className="admin-toast__close"
              onClick={() => setToast(null)}
              aria-label="Cerrar aviso"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Contenido de la pestaña activa */}
      <main className="container admin-main">
        {activeTab === 'overview' && (
          <div className="admin-section">
            <div className="admin-section__header">
              <div>
                <h1 className="admin-section__title">
                  Resumen de la Carta Digital · {settings.name}
                </h1>
                <p className="admin-section__desc">
                  Estado actual del menú en tiempo real y accesos directos para la gestión diaria en barra o desde el móvil.
                </p>
              </div>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setActiveTab('products')}
              >
                Ir a editar precios y productos →
              </button>
            </div>

            {/* 4 Tarjetas KPI solicitadas */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <span className="admin-kpi-card__label">Productos activos</span>
                <strong className="admin-kpi-card__value">
                  {activeProductsCount}
                </strong>
                <span className="admin-kpi-card__meta">
                  De {products.length} registrados ({hiddenProducts.length}{' '}
                  ocultos)
                </span>
              </div>

              <div className="admin-kpi-card">
                <span className="admin-kpi-card__label">Categorías</span>
                <strong className="admin-kpi-card__value">
                  {activeCategoriesCount}
                </strong>
                <span className="admin-kpi-card__meta">
                  De {categories.length} categorías configuradas
                </span>
              </div>

              <div className="admin-kpi-card">
                <span className="admin-kpi-card__label">Productos agotados</span>
                <strong className="admin-kpi-card__value">
                  {soldOutProducts.length}
                </strong>
                <span className="admin-kpi-card__meta">
                  {soldOutProducts.length === 0
                    ? 'Todo disponible hoy en barra'
                    : 'Marcados como agotados hoy'}
                </span>
              </div>

              <div className="admin-kpi-card">
                <span className="admin-kpi-card__label">
                  Últimas modificaciones
                </span>
                <strong className="admin-kpi-card__value">
                  {recentActivity.length}
                </strong>
                <span className="admin-kpi-card__meta">
                  Cambios realizados en esta sesión
                </span>
              </div>
            </div>

            <div className="admin-overview-columns">
              {/* Columna 1: Productos agotados hoy y accesos rápidos */}
              <div className="admin-card-panel">
                <h2 className="admin-card-panel__title">
                  Disponibilidad de Hoy (Agotados Temporalmente)
                </h2>
                {soldOutProducts.length === 0 ? (
                  <p className="admin-section__desc">
                    Actualmente todos tus productos activos están marcados como{' '}
                    <strong>Disponibles</strong>. Si se termina algún ingrediente (ej. salmón o aguacate), puedes marcar el plato como agotado desde la sección <strong>Productos</strong> con un solo toque.
                  </p>
                ) : (
                  <ul className="admin-soldout-list">
                    {soldOutProducts.map((item) => (
                      <li key={item.id} className="admin-soldout-list__item">
                        <div>
                          <strong>{item.name}</strong>
                          <span>{formatPrice(item.price)}</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn--secondary admin-btn-sm"
                          onClick={() => handleRestoreAvailability(item)}
                        >
                          Volver a activar hoy
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="admin-quick-links">
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setActiveTab('products')}
                  >
                    Modificar precios o platos
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setActiveTab('categories')}
                  >
                    Ordenar categorías
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setActiveTab('establishment')}
                  >
                    Cambiar horarios o teléfono
                  </button>
                </div>
              </div>

              {/* Columna 2: Registro de últimas modificaciones */}
              <div className="admin-card-panel">
                <h2 className="admin-card-panel__title">
                  Últimas Modificaciones
                </h2>
                {recentActivity.length === 0 ? (
                  <p className="admin-section__desc">
                    Todavía no se han registrado cambios en esta sesión. Cualquier ajuste de precio, producto o horario aparecerá reflejado aquí al instante.
                  </p>
                ) : (
                  <ul className="admin-activity-list">
                    {recentActivity.map((act) => (
                      <li key={act.id} className="admin-activity-list__item">
                        <div>
                          <strong>{act.action}</strong>
                          <span>{act.detail}</span>
                        </div>
                        <time>
                          {new Date(act.timestamp).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </time>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <AdminProducts
            key={selectedCategoryForProducts}
            initialCategoryFilter={selectedCategoryForProducts}
            onNotify={notify}
          />
        )}

        {activeTab === 'categories' && (
          <AdminCategories
            onNavigateToCategoryProducts={handleJumpToCategoryProducts}
            onNotify={notify}
          />
        )}

        {activeTab === 'establishment' && (
          <AdminEstablishment onNotify={notify} />
        )}

        {activeTab === 'settings' && <AdminSettings onNotify={notify} />}
      </main>

      {/* Modal de Vista Previa Móvil de la Carta Pública */}
      {showLivePreview && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="live-preview-title"
          onClick={() => setShowLivePreview(false)}
        >
          <div
            className="modal-sheet modal-sheet--preview"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-preview-header">
              <div>
                <strong id="live-preview-title">
                  Vista Previa Móvil QR · {settings.name}
                </strong>
                <span>
                  {publicCategories.length} categorías activas ·{' '}
                  {publicProducts.length} productos visibles
                </span>
              </div>
              <button
                type="button"
                className="btn btn--secondary admin-btn-sm"
                onClick={() => setShowLivePreview(false)}
              >
                Cerrar vista previa
              </button>
            </div>

            <div className="admin-preview-phone">
              <div className="admin-preview-phone__header">
                <strong>{settings.name}</strong>
                <span>{settings.tagline}</span>
                <h4>{settings.welcomeTitle}</h4>
              </div>

              {publicCategories.map((cat) => {
                const catProds = publicProducts.filter(
                  (p) => p.categoryId === cat.id
                );
                if (catProds.length === 0) return null;

                return (
                  <div key={cat.id} className="admin-preview-phone__cat">
                    <h5>{cat.name}</h5>
                    {catProds.map((prod) => (
                      <div
                        key={prod.id}
                        className={`admin-preview-phone__item ${
                          prod.isAvailable === false
                            ? 'admin-preview-phone__item--soldout'
                            : ''
                        }`}
                      >
                        <div>
                          <strong>{prod.name}</strong>
                          {prod.isAvailable === false && (
                            <span className="soldout-chip">Agotado hoy</span>
                          )}
                          <p>{prod.description}</p>
                        </div>
                        <span className="admin-preview-phone__price">
                          {formatPrice(prod.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
