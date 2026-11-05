import { useMenu } from '../context/MenuContext';
import {
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
} from './Icons';

export default function EstablishmentInfo() {
  const { settings } = useMenu();
  const vis = settings.visibilityConfig || {};

  const whatsappUrl = `https://wa.me/${
    settings.contact?.whatsappNumber || ''
  }?text=${encodeURIComponent(settings.contact?.whatsappMessage || '')}`;

  return (
    <footer
      id="establecimiento"
      className="establishment-section"
      aria-labelledby="establishment-heading"
    >
      <div className="container">
        {/* Bloque editorial de ambiente */}
        {vis.showAmbianceSection !== false && (
          <div className="ambiance-banner">
            <div className="ambiance-banner__media">
              <img
                src={settings.ambianceImageUrl || '/images/ambiente-eskape.jpg'}
                alt={`Interior acogedor de la cafetería ${settings.name} con luz matinal y barra de café de especialidad`}
                className="ambiance-banner__img"
                loading="lazy"
                width="900"
                height="600"
              />
            </div>
            <div className="ambiance-banner__content">
              <span className="section-header__kicker">Nuestro Espacio</span>
              <h2 id="establishment-heading" className="ambiance-banner__title">
                Un rincón pensado para disfrutar sin prisa
              </h2>
              <p className="ambiance-banner__text">{settings.description}</p>
              {settings.serviceNotes && settings.serviceNotes.length > 0 && (
                <ul className="service-notes-list">
                  {settings.serviceNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Aviso claro de datos provisionales */}
        {settings.isProvisional && vis.showProvisionalBanner !== false && (
          <div className="provisional-data-alert" role="note">
            <strong>Información del establecimiento en actualización:</strong>{' '}
            La dirección, horarios, teléfono y enlaces mostrados a continuación son
            datos provisionales de muestra.
          </div>
        )}

        {/* Tarjetas de información del establecimiento */}
        <div className="info-cards-grid" id="contacto">
          {/* 1. Ubicación y Google Maps */}
          <div className="info-card">
            <div className="info-card__icon-wrap">
              <MapPinIcon size={22} />
            </div>
            {settings.isProvisional && (
              <span className="info-card__badge">Provisional</span>
            )}
            <h3 className="info-card__title">Dirección y Ubicación</h3>
            <address className="info-card__address">
              <strong>
                {settings.name} · {settings.tagline}
              </strong>
              <span>{settings.address?.street}</span>
              <span>{settings.address?.city}</span>
              {settings.address?.reference && (
                <small>{settings.address.reference}</small>
              )}
            </address>

            {settings.address?.mapsUrl && (
              <div className="info-card__map-box">
                <a
                  href={settings.address.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--outline btn--full"
                >
                  Abrir ubicación en Google Maps
                </a>
              </div>
            )}
          </div>

          {/* 2. Horarios de apertura */}
          <div className="info-card">
            <div className="info-card__icon-wrap">
              <ClockIcon size={22} />
            </div>
            {settings.isProvisional && (
              <span className="info-card__badge">Provisional</span>
            )}
            <h3 className="info-card__title">Horario de Apertura</h3>
            <ul className="schedule-list">
              {(settings.schedule || []).map((slot, index) => (
                <li key={index} className="schedule-list__item">
                  <div className="schedule-list__row">
                    <span className="schedule-list__days">{slot.days}</span>
                    <strong className="schedule-list__hours">{slot.hours}</strong>
                  </div>
                  {slot.note && (
                    <span className="schedule-list__note">{slot.note}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Contacto directo, Teléfono, WhatsApp y Redes */}
          <div className="info-card">
            <div className="info-card__icon-wrap">
              <PhoneIcon size={22} />
            </div>
            {settings.isProvisional && (
              <span className="info-card__badge">Provisional</span>
            )}
            <h3 className="info-card__title">Contacto y Reservas</h3>
            <p className="info-card__desc">
              ¿Tienes alguna consulta sobre encargos, reservas de mesa o alérgenos? Contáctanos directamente:
            </p>

            <div className="contact-actions">
              {settings.contact?.phoneDisplay && (
                <a
                  href={settings.contact.phoneHref || `tel:${settings.contact.phoneDisplay}`}
                  className="btn btn--secondary btn--full contact-btn"
                >
                  <PhoneIcon size={18} />
                  <span>{settings.contact.phoneDisplay}</span>
                </a>
              )}

              {vis.showWhatsAppButton !== false &&
                settings.contact?.whatsappNumber && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--whatsapp btn--full contact-btn"
                  >
                    <WhatsAppIcon size={19} />
                    <span>Escribir por WhatsApp</span>
                  </a>
                )}
            </div>

            {vis.showSocials !== false &&
              settings.socials &&
              settings.socials.length > 0 && (
                <div className="socials-block">
                  <span className="socials-block__label">Redes sociales:</span>
                  <div className="socials-block__links">
                    {settings.socials.map((soc) => (
                      <a
                        key={soc.id}
                        href={soc.url || '#contacto'}
                        className="social-pill"
                        aria-label={`${soc.label}: ${soc.handle}`}
                      >
                        {soc.id === 'instagram' ? (
                          <InstagramIcon size={16} />
                        ) : (
                          <FacebookIcon size={16} />
                        )}
                        <span>{soc.handle}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Pie final con logotipo original (sin enlace visible a /admin para clientes QR) */}
        <div className="footer-bottom">
          <div className="footer-bottom__brand">
            <div className="footer-bottom__logo-wrap">
              <img
                src={settings.logoUrl || '/logo-eskape.jpg'}
                alt={`Logotipo ${settings.name}`}
                className="footer-bottom__logo"
                width="160"
                height="54"
                loading="lazy"
              />
            </div>
            <p className="footer-bottom__tagline">
              {settings.name} · {settings.tagline} — «{settings.welcomeTitle}»
            </p>
          </div>

          <div className="footer-bottom__legal">
            <p>
              Carta digital optimizada para acceso mediante código QR en mesa · Precios con IVA incluido.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
