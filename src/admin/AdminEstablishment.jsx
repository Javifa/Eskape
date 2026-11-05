import { useState, useEffect } from 'react';
import { useMenu } from '../context/MenuContext';
import { uploadEstablishmentMedia } from '../lib/imageOptimizer';

export default function AdminEstablishment({ onNotify }) {
  const { settings, saveEstablishmentSettings } = useMenu();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleUploadAsset = async (e, fieldName, folder, maxDim = 1200) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(fieldName);
    try {
      const res = await uploadEstablishmentMedia(file, folder, {
        maxDimension: maxDim,
        quality: 0.85,
      });
      setForm((prev) => ({ ...prev, [fieldName]: res.url }));
      onNotify(
        'success',
        `Imagen optimizada y lista (${res.originalSizeKB} KB → ${res.optimizedSizeKB} KB). Pulsa "Guardar cambios" para publicar.`
      );
    } catch (err) {
      onNotify('error', err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const updateScheduleSlot = (index, key, value) => {
    setForm((prev) => {
      const next = [...(prev.schedule || [])];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, schedule: next };
    });
  };

  const addScheduleSlot = () => {
    setForm((prev) => ({
      ...prev,
      schedule: [
        ...(prev.schedule || []),
        { days: 'Festivos', hours: '08:30 – 14:00', note: '' },
      ],
    }));
  };

  const removeScheduleSlot = (index) => {
    setForm((prev) => ({
      ...prev,
      schedule: (prev.schedule || []).filter((_, idx) => idx !== index),
    }));
  };

  const updateSocial = (index, key, value) => {
    setForm((prev) => {
      const next = [...(prev.socials || [])];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, socials: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveEstablishmentSettings(form);
      onNotify(
        'success',
        'Datos del establecimiento guardados y actualizados en la carta pública.'
      );
    } catch (err) {
      onNotify('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-section">
      <div className="admin-section__header">
        <div>
          <h2 className="admin-section__title">Datos del Establecimiento</h2>
          <p className="admin-section__desc">
            Actualiza nombre, logotipo, imagen de portada, dirección, horarios, teléfono, WhatsApp y redes sociales sin tocar el código.
          </p>
        </div>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios del local'}
        </button>
      </div>

      {/* 1. Identidad, Logotipo y Portada */}
      <div className="admin-card-panel">
        <h3 className="admin-card-panel__title">
          1. Identidad, Logotipo e Imágenes Principales
        </h3>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="est-name" className="admin-field__label">
              Nombre del establecimiento
            </label>
            <input
              id="est-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="admin-field__input"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="est-tagline" className="admin-field__label">
              Subtítulo / Especialidad
            </label>
            <input
              id="est-tagline"
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="admin-field__input"
            />
          </div>

          <div className="admin-field admin-field--span2">
            <label htmlFor="est-welcome" className="admin-field__label">
              Mensaje principal de bienvenida (Portada)
            </label>
            <input
              id="est-welcome"
              type="text"
              value={form.welcomeTitle}
              onChange={(e) =>
                setForm({ ...form, welcomeTitle: e.target.value })
              }
              className="admin-field__input"
            />
          </div>

          <div className="admin-field admin-field--span2">
            <label htmlFor="est-sub" className="admin-field__label">
              Descripción de bienvenida bajo el titular
            </label>
            <textarea
              id="est-sub"
              rows="2"
              value={form.welcomeSubtitle}
              onChange={(e) =>
                setForm({ ...form, welcomeSubtitle: e.target.value })
              }
              className="admin-field__textarea"
            />
          </div>

          <div className="admin-field admin-field--span2">
            <label htmlFor="est-desc" className="admin-field__label">
              Texto sobre el espacio (Sección inferior Nuestro Espacio)
            </label>
            <textarea
              id="est-desc"
              rows="2"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="admin-field__textarea"
            />
          </div>

          {/* Subida de Logotipo */}
          <div className="admin-field">
            <span className="admin-field__label">Logotipo del establecimiento</span>
            <div className="admin-photo-uploader">
              <img
                src={form.logoUrl || '/logo-eskape.jpg'}
                alt="Logotipo actual"
                className="admin-photo-uploader__preview"
                width="120"
                height="64"
              />
              <div className="admin-photo-uploader__controls">
                <label className="btn btn--secondary admin-btn-sm">
                  {uploadingField === 'logoUrl'
                    ? 'Subiendo...'
                    : 'Cambiar logotipo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={(e) =>
                      handleUploadAsset(e, 'logoUrl', 'brand', 800)
                    }
                    className="sr-only"
                  />
                </label>
                {form.logoUrl !== '/logo-eskape.jpg' && (
                  <button
                    type="button"
                    className="admin-text-link"
                    onClick={() =>
                      setForm({ ...form, logoUrl: '/logo-eskape.jpg' })
                    }
                  >
                    Restaurar logotipo original ESKAPE
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Subida de Imagen Principal (Hero) */}
          <div className="admin-field">
            <span className="admin-field__label">Imagen principal de portada</span>
            <div className="admin-photo-uploader">
              <img
                src={form.heroImageUrl || '/images/hero-breakfast.jpg'}
                alt="Portada actual"
                className="admin-photo-uploader__preview"
                width="100"
                height="75"
              />
              <div className="admin-photo-uploader__controls">
                <label className="btn btn--secondary admin-btn-sm">
                  {uploadingField === 'heroImageUrl'
                    ? 'Optimizando...'
                    : 'Cambiar foto de portada'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                      handleUploadAsset(e, 'heroImageUrl', 'brand', 1200)
                    }
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dirección, Teléfono, WhatsApp y Google Maps */}
      <div className="admin-card-panel">
        <h3 className="admin-card-panel__title">
          2. Dirección, Teléfono, WhatsApp y Google Maps
        </h3>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="est-street" className="admin-field__label">
              Dirección (Calle y número)
            </label>
            <input
              id="est-street"
              type="text"
              value={form.address?.street || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: { ...form.address, street: e.target.value },
                })
              }
              className="admin-field__input"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="est-city" className="admin-field__label">
              Código Postal, Ciudad y Provincia
            </label>
            <input
              id="est-city"
              type="text"
              value={form.address?.city || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: { ...form.address, city: e.target.value },
                })
              }
              className="admin-field__input"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="est-ref" className="admin-field__label">
              Referencia de ubicación (Opcional)
            </label>
            <input
              id="est-ref"
              type="text"
              value={form.address?.reference || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: { ...form.address, reference: e.target.value },
                })
              }
              className="admin-field__input"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="est-maps" className="admin-field__label">
              Enlace de Google Maps
            </label>
            <input
              id="est-maps"
              type="url"
              value={form.address?.mapsUrl || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: { ...form.address, mapsUrl: e.target.value },
                })
              }
              placeholder="https://maps.google.com/?q=..."
              className="admin-field__input"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="est-phone" className="admin-field__label">
              Teléfono visible en la carta
            </label>
            <input
              id="est-phone"
              type="text"
              value={form.contact?.phoneDisplay || ''}
              onChange={(e) => {
                const val = e.target.value;
                const cleanTel = val.replace(/[^+\d]/g, '');
                setForm({
                  ...form,
                  contact: {
                    ...form.contact,
                    phoneDisplay: val,
                    phoneHref: `tel:${cleanTel}`,
                  },
                });
              }}
              placeholder="+34 900 000 000"
              className="admin-field__input"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="est-wa" className="admin-field__label">
              Número de WhatsApp (con prefijo país sin +)
            </label>
            <input
              id="est-wa"
              type="text"
              value={form.contact?.whatsappNumber || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  contact: { ...form.contact, whatsappNumber: e.target.value },
                })
              }
              placeholder="34600000000"
              className="admin-field__input"
            />
          </div>

          <div className="admin-field admin-field--span2">
            <label htmlFor="est-wamsg" className="admin-field__label">
              Mensaje automático al pulsar el botón de WhatsApp
            </label>
            <input
              id="est-wamsg"
              type="text"
              value={form.contact?.whatsappMessage || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  contact: { ...form.contact, whatsappMessage: e.target.value },
                })
              }
              className="admin-field__input"
            />
          </div>

          <div className="admin-field admin-field--span2">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={!form.isProvisional}
                onChange={(e) =>
                  setForm({ ...form, isProvisional: !e.target.checked })
                }
              />
              <span>
                Confirmar que estos datos ya son los definitivos del establecimiento (oculta las etiquetas «Provisional»)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Gestión de Horarios */}
      <div className="admin-card-panel">
        <div className="admin-card-panel__header-row">
          <h3 className="admin-card-panel__title">3. Horarios de Apertura</h3>
          <button
            type="button"
            className="btn btn--secondary admin-btn-sm"
            onClick={addScheduleSlot}
          >
            + Añadir tramo horario
          </button>
        </div>

        <div className="admin-schedule-editor">
          {(form.schedule || []).map((slot, idx) => (
            <div key={idx} className="admin-schedule-row">
              <input
                type="text"
                value={slot.days}
                onChange={(e) =>
                  updateScheduleSlot(idx, 'days', e.target.value)
                }
                placeholder="Días (ej. Lunes a Viernes)"
                className="admin-field__input"
                aria-label="Días de la semana"
              />
              <input
                type="text"
                value={slot.hours}
                onChange={(e) =>
                  updateScheduleSlot(idx, 'hours', e.target.value)
                }
                placeholder="Horario (ej. 07:30 – 13:30)"
                className="admin-field__input"
                aria-label="Horas de apertura"
              />
              <input
                type="text"
                value={slot.note || ''}
                onChange={(e) =>
                  updateScheduleSlot(idx, 'note', e.target.value)
                }
                placeholder="Nota opcional"
                className="admin-field__input"
                aria-label="Nota adicional del horario"
              />
              <button
                type="button"
                className="btn btn--danger-outline admin-btn-sm"
                onClick={() => removeScheduleSlot(idx)}
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Redes Sociales */}
      <div className="admin-card-panel">
        <h3 className="admin-card-panel__title">4. Redes Sociales</h3>
        <div className="admin-schedule-editor">
          {(form.socials || []).map((soc, idx) => (
            <div key={soc.id || idx} className="admin-schedule-row">
              <input
                type="text"
                value={soc.label}
                onChange={(e) => updateSocial(idx, 'label', e.target.value)}
                placeholder="Red social"
                className="admin-field__input"
                aria-label="Nombre de la red social"
              />
              <input
                type="text"
                value={soc.handle}
                onChange={(e) => updateSocial(idx, 'handle', e.target.value)}
                placeholder="@usuario"
                className="admin-field__input"
                aria-label="Usuario de la red social"
              />
              <input
                type="text"
                value={soc.url}
                onChange={(e) => updateSocial(idx, 'url', e.target.value)}
                placeholder="https://instagram.com/..."
                className="admin-field__input"
                aria-label="Enlace de la red social"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section__bottom-bar">
        <button
          type="submit"
          className="btn btn--primary btn--lg"
          disabled={saving}
        >
          {saving ? 'Guardando cambios...' : 'Guardar toda la información del establecimiento'}
        </button>
      </div>
    </form>
  );
}
