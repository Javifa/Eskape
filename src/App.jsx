import { useState, useEffect, lazy, Suspense } from 'react';
import { MenuProvider, useMenu } from './context/MenuContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import CategoryGrid from './components/CategoryGrid';
import FeaturedSection from './components/FeaturedSection';
import CartaApp from './components/CartaApp';
import ProductModal from './components/ProductModal';
import EstablishmentInfo from './components/EstablishmentInfo';

const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));

function CorporateHomePage({ onOpenCarta }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { settings, publicProducts, publicCategories } = useMenu();

  return (
    <div className="app-shell">
      <a
        href="/carta"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          onOpenCarta('todos');
        }}
      >
        Ir directamente a la carta digital (/carta)
      </a>

      <Header onOpenCarta={onOpenCarta} />

      <main>
        <HeroSection onExploreMenu={onOpenCarta} />

        <CategoryGrid
          activeCategory=""
          onSelectCategory={(categoryId) => onOpenCarta(categoryId)}
        />

        <FeaturedSection
          onSelectProduct={setSelectedProduct}
          onSelectCategory={onOpenCarta}
        />

        {/* Bloque de acceso directo a la Carta Digital Independiente (/carta) */}
        <section
          className="section home-carta-cta-section"
          aria-labelledby="home-carta-cta-heading"
        >
          <div className="container">
            <div className="home-carta-cta-card">
              <div className="home-carta-cta-card__content">
                <span className="section-header__kicker">
                  Experiencia Móvil Interactiva
                </span>
                <h2
                  id="home-carta-cta-heading"
                  className="home-carta-cta-card__title"
                >
                  Consulta nuestra Carta Digital completa
                </h2>
                <p className="home-carta-cta-card__desc">
                  Accede a nuestras {publicCategories.length} categorías y{' '}
                  {publicProducts.length} elaboraciones con precios actualizados,
                  fotografías, buscador rápido y filtro interactivo de alérgenos.
                </p>
              </div>
              <div className="home-carta-cta-card__actions">
                <a
                  href="/carta"
                  className="btn btn--primary btn--lg"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenCarta('todos');
                  }}
                >
                  Abrir Carta Digital de {settings.name} →
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <EstablishmentInfo />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

function AdminLoadingFallback() {
  return (
    <div className="admin-auth-page" role="status">
      <div className="admin-auth-card">
        <p className="admin-auth-card__subtitle">
          Cargando panel de administración de ESKAPE...
        </p>
      </div>
    </div>
  );
}

function getCategoryFromSearch(searchStr) {
  try {
    const params = new URLSearchParams(searchStr);
    return params.get('categoria') || 'todos';
  } catch {
    return 'todos';
  }
}

function AppRouter() {
  const { authLoading, isAuthorizedAdmin } = useMenu();
  const [routeState, setRouteState] = useState(() => ({
    pathname: window.location.pathname,
    categoryParam: getCategoryFromSearch(window.location.search),
  }));

  useEffect(() => {
    const onPopState = () =>
      setRouteState({
        pathname: window.location.pathname,
        categoryParam: getCategoryFromSearch(window.location.search),
      });
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (targetPath, categoryId = 'todos') => {
    const fullUrl =
      targetPath === '/carta' && categoryId && categoryId !== 'todos'
        ? `/carta?categoria=${encodeURIComponent(categoryId)}`
        : targetPath;
    window.history.pushState({}, '', fullUrl);
    setRouteState({
      pathname: targetPath,
      categoryParam: categoryId || 'todos',
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const { pathname, categoryParam } = routeState;

  const isAdminRoute =
    pathname === '/admin' || pathname.startsWith('/admin/');
  const isCartaRoute =
    pathname === '/carta' || pathname.startsWith('/carta/');

  if (isAdminRoute) {
    if (authLoading) {
      return <AdminLoadingFallback />;
    }

    return (
      <Suspense fallback={<AdminLoadingFallback />}>
        {!isAuthorizedAdmin ? (
          <AdminLogin
            onBackToPublicMenu={() => navigateTo('/carta')}
            onBackToHome={() => navigateTo('/')}
          />
        ) : (
          <AdminDashboard
            onNavigatePublic={() => navigateTo('/carta')}
            onNavigateHome={() => navigateTo('/')}
          />
        )}
      </Suspense>
    );
  }

  if (isCartaRoute) {
    return (
      <CartaApp
        initialCategory={categoryParam}
        onNavigateHome={() => navigateTo('/')}
      />
    );
  }

  return (
    <CorporateHomePage
      onOpenCarta={(categoryId = 'todos') => navigateTo('/carta', categoryId)}
    />
  );
}

export default function App() {
  return (
    <MenuProvider>
      <AppRouter />
    </MenuProvider>
  );
}
