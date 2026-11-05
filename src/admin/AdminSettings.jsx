import { useState, useEffect } from 'react';
import { useMenu } from '../context/MenuContext';

const DEFAULT_BRAND_COLORS = {
  bgCream: '#F2EBD8',
  forestPrimary: '#1D2F21',
  goldAccent: '#B58B42',
};

export default function AdminSettings({ onNotify }) {
  const {
    settings,
    saveEstablishmentSettings,
    isSupabaseConfigured,
    supabaseConfigReason,
    resetLocalPreviewToDefaults,
  } = useMenu();

  const [colors, setColors] = useState(
    settings.themeColors || DEFAULT_BRAND_COLORS
  );
  const [visibility, setVisibility] = useState(
    settings.visibilityConfig || {
      showProvisionalBanner: true,
      showFeaturedSection: true,
      showAllergenFilter: true,
      showAmbianceSection: true,
      showWhatsAppButton: true,
      showSocials: true,
    }
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings.themeColors) setColors(settings.themeColors);
    if (settings.visibilityConfig) setVisibility(settings.visibilityConfig);
  }, [settings]);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveEstablishmentSettings({
        ...settings,
        themeColors: colors,
        visibilityConfig: visibility,
      });
      onNotify(
        'success',
        'Configuración visual y de visibilidad aplicada en la carta pública.'
      );
    } catch (err) {
      onNotify('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const restoreBrandColors = () => {
    setColors(DEFAULT_BRAND_COLORS);
  };

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <div>
          <h2 className="admin-section__title">
            Configuración Visual y Arquitectura
          </h2>
          <p className="admin-section__desc">
            Personaliza los colores de la carta, elige qué bloques mostrar u ocultar y consulta el estado de tu base de datos independiente.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveConfig}>
        {/* 1. Colores principales de la carta */}
        <div className="admin-card-panel">
          <div className="admin-card-panel__header-row">
            <h3 className="admin-card-panel__title">
              1. Colores Principales de la Carta Digital
            </h3>
            <button
              type="button"
              className="btn btn--secondary admin-btn-sm"
              onClick={restoreBrandColors}
            >
              Restaurar paleta oficial del logotipo ESKAPE
            </button>
          </div>

          <div className="admin-color-grid">
            <div className="admin-color-item">
              <label htmlFor="color-bg" className="admin-field__label">
                Fondo Principal (Crema Alabastro)
              </label>
              <div className="admin-color-item__row">
                <input
                  id="color-bg"
                  type="color"
                  value={colors.bgCream}
                  onChange={(e) =>
                    setColors({ ...colors, bgCream: e.target.value })
                  }
                  className="admin-color-picker"
                />
                <input
                  type="text"
                  value={colors.bgCream}
                  onChange={(e) =>
                    setColors({ ...colors, bgCream: e.target.value })
                  }
                  className="admin-field__input"
                />
              </div>
            </div>

            <div className="admin-color-item">
              <label htmlFor="color-forest" className="admin-field__label">
                Color Primario (Verde Bosque ESKAPE)
              </label>
              <div className="admin-color-item__row">
                <input
                  id="color-forest"
                  type="color"
                  value={colors.forestPrimary}
                  onChange={(e) =>
                    setColors({ ...colors, forestPrimary: e.target.value })
                  }
                  className="admin-color-picker"
                />
                <input
                  type="text"
                  value={colors.forestPrimary}
                  onChange={(e) =>
                    setColors({ ...colors, forestPrimary: e.target.value })
                  }
                  className="admin-field__input"
                />
              </div>
            </div>

            <div className="admin-color-item">
              <label htmlFor="color-gold" className="admin-field__label">
                Color de Acento (Dorado Onda «A»)
              </label>
              <div className="admin-color-item__row">
                <input
                  id="color-gold"
                  type="color"
                  value={colors.goldAccent}
                  onChange={(e) =>
                    setColors({ ...colors, goldAccent: e.target.value })
                  }
                  className="admin-color-picker"
                />
                <input
                  type="text"
                  value={colors.goldAccent}
                  onChange={(e) =>
                    setColors({ ...colors, goldAccent: e.target.value })
                  }
                  className="admin-field__input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Visibilidad de Secciones */}
        <div className="admin-card-panel">
          <h3 className="admin-card-panel__title">
            2. Elementos Visibles en la Carta Pública
          </h3>
          <div className="admin-checkbox-grid">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={visibility.showFeaturedSection !== false}
                onChange={(e) =>
                  setVisibility({
                    ...visibility,
                    showFeaturedSection: e.target.checked,
                  })
                }
              />
              <span>
                Mostrar sección «Nuestros Imprescindibles» (Productos destacados)
              </span>
            </label>

            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={visibility.showAllergenFilter !== false}
                onChange={(e) =>
                  setVisibility({
                    ...visibility,
                    showAllergenFilter: e.target.checked,
                  })
                }
              />
              <span>
                Mostrar barra interactiva de filtrado de alérgenos en la carta
              </span>
            </label>

            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={visibility.showAmbianceSection !== false}
                onChange={(e) =>
                  setVisibility({
                    ...visibility,
                    showAmbianceSection: e.target.checked,
                  })
                }
              />
              <span>
                Mostrar bloque fotográfico de ambiente «Nuestro Espacio»
              </span>
            </label>

            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={visibility.showWhatsAppButton !== false}
                onChange={(e) =>
                  setVisibility({
                    ...visibility,
                    showWhatsAppButton: e.target.checked,
                  })
                }
              />
              <span>Mostrar botón directo de contacto por WhatsApp</span>
            </label>

            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={visibility.showSocials !== false}
                onChange={(e) =>
                  setVisibility({
                    ...visibility,
                    showSocials: e.target.checked,
                  })
                }
              />
              <span>Mostrar enlaces a Redes Sociales en el pie de página</span>
            </label>

            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={visibility.showProvisionalBanner !== false}
                onChange={(e) =>
                  setVisibility({
                    ...visibility,
                    showProvisionalBanner: e.target.checked,
                  })
                }
              />
              <span>
                Mostrar cinta superior de aviso de carta provisional
              </span>
            </label>
          </div>

          <div className="admin-modal-form__actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar configuración visual'}
            </button>
          </div>
        </div>
      </form>

      {/* 3. Independencia de Infraestructura y Estado Supabase */}
      <div className="admin-card-panel">
        <h3 className="admin-card-panel__title">
          3. Infraestructura Independiente de ESKAPE (Supabase & Propiedad)
        </h3>
        <ul className="service-notes-list">
          <li>
            <strong>Aislamiento garantizado:</strong> Este proyecto incluye una salvaguarda activa en <code>src/lib/supabaseClient.js</code> que bloquea cualquier intento de conexión al proyecto Supabase de FACENIA.
          </li>
          <li>
            <strong>Estado actual de Supabase:</strong>{' '}
            {isSupabaseConfigured
              ? 'Conectado al proyecto exclusivo de ESKAPE.'
              : `No configurado todavía (${supabaseConfigReason})`}
          </li>
          <li>
            <strong>Migraciones SQL listas:</strong> Los archivos{' '}
            <code>supabase/migrations/001_eskape_schema_and_rls.sql</code> y{' '}
            <code>supabase/migrations/002_eskape_initial_seed.sql</code> crean las tablas (<code>products</code>, <code>categories</code>, <code>establishment_settings</code>, <code>admin_profiles</code>), el bucket <code>eskape-media</code> y todas las políticas RLS granulares.
          </li>
        </ul>

        {!isSupabaseConfigured && (
          <div className="admin-modal-form__actions">
            <button
              type="button"
              className="btn btn--secondary admin-btn-sm"
              onClick={() => {
                resetLocalPreviewToDefaults();
                onNotify(
                  'success',
                  'Catálogo local restaurado a los valores originales de ESKAPE.'
                );
              }}
            >
              Restaurar catálogo de prueba a valores iniciales
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
