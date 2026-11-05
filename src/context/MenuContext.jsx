import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  supabase,
  isSupabaseConfigured,
  supabaseConfigReason,
} from '../lib/supabaseClient';
import { deleteEstablishmentMediaByUrl } from '../lib/imageOptimizer';
import {
  BRAND_IDENTITY,
  ESTABLISHMENT_INFO,
  CATEGORIES as INITIAL_CATEGORIES,
  PRODUCTS as INITIAL_PRODUCTS,
  ALLERGENS,
} from '../data/menuData';

const MenuContext = createContext(null);

const LOCAL_PREVIEW_STORAGE_KEY = 'eskape_local_preview_state_v1';

function buildDefaultSettings() {
  return {
    id: 'eskape',
    name: BRAND_IDENTITY.name,
    tagline: BRAND_IDENTITY.tagline,
    welcomeTitle: BRAND_IDENTITY.welcomeTitle,
    welcomeSubtitle: BRAND_IDENTITY.welcomeSubtitle,
    description:
      'En ESKAPE cuidamos cada detalle de la mañana: desde el molido del grano hasta el horneado del pan. Gracias por visitarnos y consultar nuestra carta digital desde tu mesa.',
    provisionalNotice: BRAND_IDENTITY.provisionalNotice,
    isProvisional: ESTABLISHMENT_INFO.isProvisional,
    logoUrl: '/logo-eskape.jpg',
    heroImageUrl: '/images/hero-breakfast.jpg',
    ambianceImageUrl: '/images/ambiente-eskape.jpg',
    heroSuggestionLabel: 'Sugerencia Matinal',
    heroSuggestionTitle: 'Desayuno Eskape Especial',
    heroSuggestionMeta:
      'Café + Zumo natural + Tostada de aguacate y huevo poché · 7,90 €',
    address: {
      street: ESTABLISHMENT_INFO.address.street,
      city: ESTABLISHMENT_INFO.address.city,
      reference: ESTABLISHMENT_INFO.address.reference,
      mapsUrl: ESTABLISHMENT_INFO.address.mapsUrl,
    },
    contact: {
      phoneDisplay: ESTABLISHMENT_INFO.contact.phoneDisplay,
      phoneHref: ESTABLISHMENT_INFO.contact.phoneHref,
      whatsappNumber: ESTABLISHMENT_INFO.contact.whatsappNumber,
      whatsappMessage: ESTABLISHMENT_INFO.contact.whatsappMessage,
    },
    schedule: ESTABLISHMENT_INFO.schedule,
    socials: ESTABLISHMENT_INFO.socials,
    serviceNotes: ESTABLISHMENT_INFO.serviceNotes,
    themeColors: {
      bgCream: '#F2EBD8',
      forestPrimary: '#1D2F21',
      goldAccent: '#B58B42',
    },
    visibilityConfig: {
      showProvisionalBanner: true,
      showFeaturedSection: true,
      showAllergenFilter: true,
      showAmbianceSection: true,
      showWhatsAppButton: true,
      showSocials: true,
    },
    updatedAt: new Date().toISOString(),
  };
}

function buildDefaultCategories() {
  return INITIAL_CATEGORIES.map((cat, idx) => ({
    ...cat,
    sortOrder: idx + 1,
    isActive: true,
    updatedAt: new Date().toISOString(),
  }));
}

function buildDefaultProducts() {
  return INITIAL_PRODUCTS.map((prod, idx) => ({
    ...prod,
    price: Number(prod.price),
    isActive: true,
    isAvailable: true,
    featured: Boolean(prod.featured),
    badge: prod.badge || '',
    allergens: prod.allergens || [],
    dietary: prod.dietary || [],
    sortOrder: idx + 1,
    updatedAt: new Date().toISOString(),
  }));
}

function mapDbSettingsToState(row) {
  if (!row) return buildDefaultSettings();
  const defaults = buildDefaultSettings();
  return {
    id: row.id || 'eskape',
    name: row.name ?? defaults.name,
    tagline: row.tagline ?? defaults.tagline,
    welcomeTitle: row.welcome_title ?? defaults.welcomeTitle,
    welcomeSubtitle: row.welcome_subtitle ?? defaults.welcomeSubtitle,
    description: row.description ?? defaults.description,
    provisionalNotice: row.provisional_notice ?? defaults.provisionalNotice,
    isProvisional: row.is_provisional ?? defaults.isProvisional,
    logoUrl: row.logo_url || defaults.logoUrl,
    heroImageUrl: row.hero_image_url || defaults.heroImageUrl,
    ambianceImageUrl: row.ambiance_image_url || defaults.ambianceImageUrl,
    heroSuggestionLabel:
      row.hero_suggestion_label ?? defaults.heroSuggestionLabel,
    heroSuggestionTitle:
      row.hero_suggestion_title ?? defaults.heroSuggestionTitle,
    heroSuggestionMeta: row.hero_suggestion_meta ?? defaults.heroSuggestionMeta,
    address: {
      street: row.address_street ?? defaults.address.street,
      city: row.address_city ?? defaults.address.city,
      reference: row.address_reference ?? defaults.address.reference,
      mapsUrl: row.maps_url ?? defaults.address.mapsUrl,
    },
    contact: {
      phoneDisplay: row.phone_display ?? defaults.contact.phoneDisplay,
      phoneHref: row.phone_href ?? defaults.contact.phoneHref,
      whatsappNumber: row.whatsapp_number ?? defaults.contact.whatsappNumber,
      whatsappMessage: row.whatsapp_message ?? defaults.contact.whatsappMessage,
    },
    schedule: Array.isArray(row.schedule) ? row.schedule : defaults.schedule,
    socials: Array.isArray(row.socials) ? row.socials : defaults.socials,
    serviceNotes: Array.isArray(row.service_notes)
      ? row.service_notes
      : defaults.serviceNotes,
    themeColors: {
      ...defaults.themeColors,
      ...(row.theme_colors || {}),
    },
    visibilityConfig: {
      ...defaults.visibilityConfig,
      ...(row.visibility_config || {}),
    },
    updatedAt: row.updated_at || defaults.updatedAt,
  };
}

function mapStateSettingsToDb(settings) {
  return {
    id: 'eskape',
    name: settings.name.trim(),
    tagline: settings.tagline.trim(),
    welcome_title: settings.welcomeTitle.trim(),
    welcome_subtitle: settings.welcomeSubtitle.trim(),
    description: (settings.description || '').trim(),
    provisional_notice: (settings.provisionalNotice || '').trim(),
    is_provisional: Boolean(settings.isProvisional),
    logo_url: settings.logoUrl,
    hero_image_url: settings.heroImageUrl,
    ambiance_image_url: settings.ambianceImageUrl,
    hero_suggestion_label: (settings.heroSuggestionLabel || '').trim(),
    hero_suggestion_title: (settings.heroSuggestionTitle || '').trim(),
    hero_suggestion_meta: (settings.heroSuggestionMeta || '').trim(),
    address_street: (settings.address?.street || '').trim(),
    address_city: (settings.address?.city || '').trim(),
    address_reference: (settings.address?.reference || '').trim(),
    maps_url: (settings.address?.mapsUrl || '').trim(),
    phone_display: (settings.contact?.phoneDisplay || '').trim(),
    phone_href: (settings.contact?.phoneHref || '').trim(),
    whatsapp_number: (settings.contact?.whatsappNumber || '').trim(),
    whatsapp_message: (settings.contact?.whatsappMessage || '').trim(),
    schedule: settings.schedule || [],
    socials: settings.socials || [],
    service_notes: settings.serviceNotes || [],
    theme_colors: settings.themeColors,
    visibility_config: settings.visibilityConfig,
  };
}

function mapDbCategoryToState(row) {
  return {
    id: row.id,
    name: row.name,
    shortDescription: row.short_description || '',
    description: row.description || '',
    image: row.image_url || '/images/hero-breakfast.jpg',
    highlightTag: row.highlight_tag || '',
    sortOrder: Number(row.sort_order ?? 0),
    isActive: Boolean(row.is_active ?? true),
    updatedAt: row.updated_at || row.created_at,
  };
}

function mapDbProductToState(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price ?? 0),
    image: row.image_url || '/images/hero-breakfast.jpg',
    isActive: Boolean(row.is_active ?? true),
    isAvailable: Boolean(row.is_available ?? true),
    featured: Boolean(row.is_featured ?? false),
    badge: row.badge || '',
    allergens: Array.isArray(row.allergens) ? row.allergens : [],
    dietary: Array.isArray(row.dietary) ? row.dietary : [],
    sortOrder: Number(row.sort_order ?? 0),
    updatedAt: row.updated_at || row.created_at,
  };
}

export function MenuProvider({ children }) {
  const [settings, setSettings] = useState(buildDefaultSettings);
  const [categories, setCategories] = useState(() =>
    isSupabaseConfigured ? [] : buildDefaultCategories()
  );
  const [products, setProducts] = useState(() =>
    isSupabaseConfigured ? [] : buildDefaultProducts()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(
    isSupabaseConfigured ? 'connecting' : 'local_seed'
  );
  const [recentActivity, setRecentActivity] = useState([]);

  // Estado de autenticación administrativa
  const [authUser, setAuthUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [isLocalPreviewAdmin, setIsLocalPreviewAdmin] = useState(false);

  const pushActivity = useCallback((action, detail) => {
    setRecentActivity((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        action,
        detail,
        timestamp: new Date().toISOString(),
      },
      ...prev.slice(0, 14),
    ]);
  }, []);

  // Aplicar colores personalizados como variables CSS globales
  useEffect(() => {
    const colors = settings?.themeColors;
    if (!colors) return;
    const root = document.documentElement;
    if (colors.bgCream) root.style.setProperty('--bg-cream', colors.bgCream);
    if (colors.forestPrimary)
      root.style.setProperty('--forest-primary', colors.forestPrimary);
    if (colors.goldAccent)
      root.style.setProperty('--gold-accent', colors.goldAccent);
  }, [settings?.themeColors]);

  // Guardar estado en localStorage cuando se usa el modo de vista previa local sin Supabase
  const persistLocalPreview = useCallback(
    (nextSettings, nextCategories, nextProducts) => {
      if (isSupabaseConfigured) return;
      try {
        localStorage.setItem(
          LOCAL_PREVIEW_STORAGE_KEY,
          JSON.stringify({
            settings: nextSettings,
            categories: nextCategories,
            products: nextProducts,
          })
        );
      } catch {
        // Ignorar límites de cuota de localStorage
      }
    },
    []
  );

  // Cargar datos desde Supabase (o catálogo semilla si Supabase no está configurado aún)
  const fetchMenuData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      try {
        const cached = localStorage.getItem(LOCAL_PREVIEW_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.settings) setSettings(parsed.settings);
          if (Array.isArray(parsed.categories)) setCategories(parsed.categories);
          if (Array.isArray(parsed.products)) setProducts(parsed.products);
        }
      } catch {
        // Ignorar errores de parseo local
      }
      setDataSource('local_seed');
      setLoading(false);
      return;
    }

    try {
      const [settingsRes, categoriesRes, productsRes] = await Promise.all([
        supabase
          .from('establishment_settings')
          .select('*')
          .eq('id', 'eskape')
          .maybeSingle(),
        supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('products')
          .select('*')
          .order('sort_order', { ascending: true }),
      ]);

      if (settingsRes.error) throw settingsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (productsRes.error) throw productsRes.error;

      if (settingsRes.data) {
        setSettings(mapDbSettingsToState(settingsRes.data));
      }

      if (categoriesRes.data && categoriesRes.data.length > 0) {
        setCategories(categoriesRes.data.map(mapDbCategoryToState));
      } else {
        setCategories([]);
      }

      if (productsRes.data && productsRes.data.length > 0) {
        setProducts(productsRes.data.map(mapDbProductToState));
      } else {
        setProducts([]);
      }

      setDataSource('supabase');
    } catch (err) {
      setError(
        err.message ||
          'No se pudieron cargar los datos desde el proyecto Supabase de ESKAPE.'
      );
      setDataSource('supabase_error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  // Verificar sesión y perfil de administrador autorizado en Supabase
  const verifyAdminProfile = useCallback(async (user) => {
    if (!user || !supabase) {
      setAdminProfile(null);
      return null;
    }
    const { data, error: profileErr } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (profileErr || !data) {
      setAdminProfile(null);
      return null;
    }
    setAdminProfile(data);
    return data;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user) {
        await verifyAdminProfile(user);
      }
      if (mounted) setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user) {
        await verifyAdminProfile(user);
      } else {
        setAdminProfile(null);
      }
      // Recargar carta para que las políticas RLS de admin muestren elementos ocultos
      fetchMenuData();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [verifyAdminProfile, fetchMenuData]);

  // Escuchar cambios entre pestañas cuando se edita en local preview
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LOCAL_PREVIEW_STORAGE_KEY && !isSupabaseConfigured) {
        fetchMenuData();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [fetchMenuData]);

  // ==========================================================================
  // ACCIONES DE AUTENTICACIÓN
  // ==========================================================================
  const signInAdmin = async (identifier, password) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Supabase todavía no está configurado en .env. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY o utiliza el Modo Vista Previa Local.'
      );
    }

    const cleanId = (identifier || '').trim();
    const resolvedEmail = cleanId.includes('@')
      ? cleanId.toLowerCase()
      : `${cleanId.toLowerCase()}@admin.eskape.es`;

    const { data, error: signInErr } = await supabase.auth.signInWithPassword({
      email: resolvedEmail,
      password,
    });

    if (signInErr) {
      throw new Error(
        signInErr.message === 'Invalid login credentials'
          ? 'Credenciales incorrectas. Verifica tu correo electrónico y contraseña.'
          : signInErr.message
      );
    }

    const profile = await verifyAdminProfile(data.user);
    if (!profile) {
      await supabase.auth.signOut();
      throw new Error(
        'Acceso denegado: Este usuario no está registrado como administrador activo en la tabla public.admin_profiles de ESKAPE.'
      );
    }

    await fetchMenuData();
    return profile;
  };

  const sendPasswordReset = async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'La recuperación por correo requiere que el proyecto Supabase de ESKAPE esté configurado en .env.'
      );
    }
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/admin`,
      }
    );
    if (resetErr) throw new Error(resetErr.message);
  };

  const signOutAdmin = async () => {
    setIsLocalPreviewAdmin(false);
    if (isSupabaseConfigured && supabase && authUser && adminProfile?.is_active) {
      await supabase.auth.signOut();
    }
    setAuthUser(null);
    setAdminProfile(null);
  };

  // ==========================================================================
  // CRUD DE PRODUCTOS
  // ==========================================================================
  const saveProduct = async (productInput) => {
    const cleanName = (productInput.name || '').trim();
    if (!cleanName) throw new Error('El nombre del producto es obligatorio.');
    const numPrice = Number(productInput.price);
    if (Number.isNaN(numPrice) || numPrice < 0) {
      throw new Error('El precio debe ser un número válido mayor o igual a 0.');
    }
    if (!productInput.categoryId) {
      throw new Error('Debes asignar una categoría al producto.');
    }

    const nowIso = new Date().toISOString();
    const isExisting = products.some((p) => p.id === productInput.id);

    const normalizedProduct = {
      id:
        productInput.id ||
        `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      categoryId: productInput.categoryId,
      name: cleanName,
      description: (productInput.description || '').trim(),
      price: numPrice,
      image: productInput.image || '/images/hero-breakfast.jpg',
      isActive: Boolean(productInput.isActive ?? true),
      isAvailable: Boolean(productInput.isAvailable ?? true),
      featured: Boolean(productInput.featured ?? false),
      badge: (productInput.badge || '').trim(),
      allergens: Array.isArray(productInput.allergens)
        ? productInput.allergens
        : [],
      dietary: Array.isArray(productInput.dietary) ? productInput.dietary : [],
      sortOrder: Number(
        productInput.sortOrder ??
          products.filter((p) => p.categoryId === productInput.categoryId)
            .length + 1
      ),
      updatedAt: nowIso,
    };

    if (isSupabaseConfigured && supabase && authUser && adminProfile?.is_active) {
      const dbPayload = {
        id: normalizedProduct.id,
        category_id: normalizedProduct.categoryId,
        name: normalizedProduct.name,
        description: normalizedProduct.description,
        price: normalizedProduct.price,
        image_url: normalizedProduct.image,
        is_active: normalizedProduct.isActive,
        is_available: normalizedProduct.isAvailable,
        is_featured: normalizedProduct.featured,
        badge: normalizedProduct.badge,
        allergens: normalizedProduct.allergens,
        dietary: normalizedProduct.dietary,
        sort_order: normalizedProduct.sortOrder,
      };

      const { data, error: saveErr } = await supabase
        .from('products')
        .upsert(dbPayload)
        .select()
        .single();

      if (saveErr) throw new Error(`Error en Supabase: ${saveErr.message}`);
      const saved = mapDbProductToState(data);

      setProducts((prev) =>
        isExisting
          ? prev.map((p) => (p.id === saved.id ? saved : p))
          : [...prev, saved]
      );
      pushActivity(
        isExisting ? 'Producto actualizado' : 'Producto creado',
        `${saved.name} (${saved.price.toFixed(2).replace('.', ',')} €)`
      );
      return saved;
    }

    // Modo Vista Previa Local
    const nextProducts = isExisting
      ? products.map((p) =>
          p.id === normalizedProduct.id ? normalizedProduct : p
        )
      : [...products, normalizedProduct];

    setProducts(nextProducts);
    persistLocalPreview(settings, categories, nextProducts);
    pushActivity(
      isExisting ? 'Producto actualizado (Vista previa)' : 'Producto creado (Vista previa)',
      `${normalizedProduct.name} (${normalizedProduct.price.toFixed(2).replace('.', ',')} €)`
    );
    return normalizedProduct;
  };

  const deleteProduct = async (productId) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    if (isSupabaseConfigured && supabase && authUser && adminProfile?.is_active) {
      const { error: delErr } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (delErr) throw new Error(`No se pudo eliminar: ${delErr.message}`);

      // Si la imagen pertenecía exclusivamente a este producto en Supabase Storage, limpiarla
      const stillUsed = products.some(
        (p) => p.id !== productId && p.image === target.image
      );
      if (!stillUsed && target.image) {
        try {
          await deleteEstablishmentMediaByUrl(target.image);
        } catch {
          // Continuar si el objeto ya no existía en Storage
        }
      }
    }

    const nextProducts = products.filter((p) => p.id !== productId);
    setProducts(nextProducts);
    persistLocalPreview(settings, categories, nextProducts);
    pushActivity('Producto eliminado', target.name);
  };

  const reorderProduct = async (productId, direction) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const categoryItems = products
      .filter((p) => p.categoryId === target.categoryId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const index = categoryItems.findIndex((p) => p.id === productId);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= categoryItems.length) return;

    const currentItem = categoryItems[index];
    const neighborItem = categoryItems[swapIndex];

    const updatedCurrent = {
      ...currentItem,
      sortOrder: swapIndex + 1,
      updatedAt: new Date().toISOString(),
    };
    const updatedNeighbor = {
      ...neighborItem,
      sortOrder: index + 1,
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase && authUser && adminProfile?.is_active) {
      const { error: err1 } = await supabase
        .from('products')
        .update({ sort_order: updatedCurrent.sortOrder })
        .eq('id', updatedCurrent.id);
      if (err1) throw new Error(err1.message);

      const { error: err2 } = await supabase
        .from('products')
        .update({ sort_order: updatedNeighbor.sortOrder })
        .eq('id', updatedNeighbor.id);
      if (err2) throw new Error(err2.message);
    }

    const nextProducts = products
      .map((p) => {
        if (p.id === updatedCurrent.id) return updatedCurrent;
        if (p.id === updatedNeighbor.id) return updatedNeighbor;
        return p;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);

    setProducts(nextProducts);
    persistLocalPreview(settings, categories, nextProducts);
    pushActivity('Orden de producto actualizado', updatedCurrent.name);
  };

  // ==========================================================================
  // CRUD DE CATEGORÍAS
  // ==========================================================================
  const saveCategory = async (categoryInput) => {
    const cleanName = (categoryInput.name || '').trim();
    if (!cleanName) throw new Error('El nombre de la categoría es obligatorio.');

    const slugId =
      (categoryInput.id || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-') ||
      cleanName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const isExisting = categories.some((c) => c.id === slugId);
    const nowIso = new Date().toISOString();

    const normalizedCategory = {
      id: slugId,
      name: cleanName,
      shortDescription: (categoryInput.shortDescription || '').trim(),
      description: (categoryInput.description || '').trim(),
      image: categoryInput.image || '/images/hero-breakfast.jpg',
      highlightTag: (categoryInput.highlightTag || '').trim(),
      sortOrder: Number(categoryInput.sortOrder ?? categories.length + 1),
      isActive: Boolean(categoryInput.isActive ?? true),
      updatedAt: nowIso,
    };

    if (isSupabaseConfigured && supabase && authUser && adminProfile?.is_active) {
      const dbPayload = {
        id: normalizedCategory.id,
        name: normalizedCategory.name,
        short_description: normalizedCategory.shortDescription,
        description: normalizedCategory.description,
        image_url: normalizedCategory.image,
        highlight_tag: normalizedCategory.highlightTag,
        sort_order: normalizedCategory.sortOrder,
        is_active: normalizedCategory.isActive,
      };

      const { data, error: saveErr } = await supabase
        .from('categories')
        .upsert(dbPayload)
        .select()
        .single();

      if (saveErr) throw new Error(`Error en Supabase: ${saveErr.message}`);
      const saved = mapDbCategoryToState(data);

      setCategories((prev) =>
        isExisting
          ? prev.map((c) => (c.id === saved.id ? saved : c))
          : [...prev, saved].sort((a, b) => a.sortOrder - b.sortOrder)
      );
      pushActivity(
        isExisting ? 'Categoría actualizada' : 'Categoría creada',
        saved.name
      );
      return saved;
    }

    const nextCategories = isExisting
      ? categories.map((c) =>
          c.id === normalizedCategory.id ? normalizedCategory : c
        )
      : [...categories, normalizedCategory].sort(
          (a, b) => a.sortOrder - b.sortOrder
        );

    setCategories(nextCategories);
    persistLocalPreview(settings, nextCategories, products);
    pushActivity(
      isExisting ? 'Categoría actualizada (Vista previa)' : 'Categoría creada (Vista previa)',
      normalizedCategory.name
    );
    return normalizedCategory;
  };

  const deleteCategory = async (categoryId) => {
    const assignedCount = products.filter(
      (p) => p.categoryId === categoryId
    ).length;
    if (assignedCount > 0) {
      throw new Error(
        `No puedes eliminar esta categoría porque tiene ${assignedCount} producto(s) asignados. Reasigna o elimina primero sus productos.`
      );
    }

    const target = categories.find((c) => c.id === categoryId);
    if (!target) return;

    if (isSupabaseConfigured && supabase && authUser && adminProfile?.is_active) {
      const { error: delErr } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      if (delErr) throw new Error(`No se pudo eliminar: ${delErr.message}`);
    }

    const nextCategories = categories.filter((c) => c.id !== categoryId);
    setCategories(nextCategories);
    persistLocalPreview(settings, nextCategories, products);
    pushActivity('Categoría eliminada', target.name);
  };

  const reorderCategory = async (categoryId, direction) => {
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((c) => c.id === categoryId);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const currentCat = { ...sorted[index], sortOrder: swapIndex + 1 };
    const neighborCat = { ...sorted[swapIndex], sortOrder: index + 1 };

    if (isSupabaseConfigured && supabase && authUser && adminProfile?.is_active) {
      await supabase
        .from('categories')
        .update({ sort_order: currentCat.sortOrder })
        .eq('id', currentCat.id);
      await supabase
        .from('categories')
        .update({ sort_order: neighborCat.sortOrder })
        .eq('id', neighborCat.id);
    }

    const nextCategories = categories
      .map((c) => {
        if (c.id === currentCat.id) return currentCat;
        if (c.id === neighborCat.id) return neighborCat;
        return c;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);

    setCategories(nextCategories);
    persistLocalPreview(settings, nextCategories, products);
    pushActivity('Orden de categoría actualizado', currentCat.name);
  };

  // ==========================================================================
  // ACTUALIZACIÓN DE CONFIGURACIÓN DEL ESTABLECIMIENTO
  // ==========================================================================
  const saveEstablishmentSettings = async (nextSettings) => {
    const updated = {
      ...nextSettings,
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase && authUser && adminProfile?.is_active) {
      const dbPayload = mapStateSettingsToDb(updated);
      const { data, error: saveErr } = await supabase
        .from('establishment_settings')
        .upsert(dbPayload)
        .select()
        .single();

      if (saveErr) throw new Error(`Error al guardar en Supabase: ${saveErr.message}`);
      const mapped = mapDbSettingsToState(data);
      setSettings(mapped);
      pushActivity('Datos del establecimiento actualizados', mapped.name);
      return mapped;
    }

    setSettings(updated);
    persistLocalPreview(updated, categories, products);
    pushActivity(
      'Datos del establecimiento actualizados (Vista previa)',
      updated.name
    );
    return updated;
  };

  const resetLocalPreviewToDefaults = () => {
    localStorage.removeItem(LOCAL_PREVIEW_STORAGE_KEY);
    const defSettings = buildDefaultSettings();
    const defCats = buildDefaultCategories();
    const defProds = buildDefaultProducts();
    setSettings(defSettings);
    setCategories(defCats);
    setProducts(defProds);
    pushActivity('Datos restaurados', 'Catálogo inicial de ESKAPE');
  };

  // Vistas filtradas para la Carta Pública (solo categorías activas y productos activos)
  const publicCategories = useMemo(
    () =>
      categories
        .filter((c) => c.isActive !== false)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const publicProducts = useMemo(() => {
    const activeCatIds = new Set(publicCategories.map((c) => c.id));
    return products
      .filter((p) => p.isActive !== false && activeCatIds.has(p.categoryId))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [products, publicCategories]);

  const isAuthorizedAdmin = Boolean(
    isSupabaseConfigured
      ? authUser && adminProfile?.is_active
      : isLocalPreviewAdmin
  );

  const value = {
    // Estado de datos
    settings,
    categories,
    products,
    publicCategories,
    publicProducts,
    allergensMap: ALLERGENS,
    loading,
    error,
    dataSource,
    isSupabaseConfigured,
    supabaseConfigReason,
    recentActivity,

    // Estado de autenticación
    authUser,
    adminProfile,
    authLoading,
    isAuthorizedAdmin,
    isLocalPreviewAdmin,
    setIsLocalPreviewAdmin,

    // Acciones
    fetchMenuData,
    signInAdmin,
    sendPasswordReset,
    signOutAdmin,
    saveProduct,
    deleteProduct,
    reorderProduct,
    saveCategory,
    deleteCategory,
    reorderCategory,
    saveEstablishmentSettings,
    resetLocalPreviewToDefaults,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error('useMenu debe utilizarse dentro de un <MenuProvider>');
  }
  return ctx;
}
