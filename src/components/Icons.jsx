/**
 * Iconografía vectorial personalizada y elementos gráficos de marca ESKAPE.
 * Incluye el motivo de onda dorada extraído de la letra "A" del logotipo
 * y los iconos oficiales de alérgenos alimentarios.
 */

export function EskapeWaveDivider({ className = '' }) {
  return (
    <div className={`eskape-divider ${className}`} aria-hidden="true">
      <span className="eskape-divider__line" />
      <svg
        className="eskape-divider__wave"
         width="56"
        height="16"
        viewBox="0 0 56 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 10.5C11.5 3.5 21 3.5 28 8C35 12.5 44.5 12.5 54 5.5"
          stroke="#B58B42"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="eskape-divider__line" />
    </div>
  );
}

export function AllergenIcon({ type, size = 15 }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.9',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  switch (type) {
    case 'gluten':
      return (
        <svg {...props}>
          <path d="M12 21V7" />
          <path d="M12 7c-2.5-2.5-5-1.5-5 1 2.5 2.5 5 1.5 5-1Z" />
          <path d="M12 7c2.5-2.5 5-1.5 5 1-2.5 2.5-5 1.5-5-1Z" />
          <path d="M12 12c-2.5-2.5-5-1.5-5 1 2.5 2.5 5 1.5 5-1Z" />
          <path d="M12 12c2.5-2.5 5-1.5 5 1-2.5 2.5-5 1.5-5-1Z" />
          <path d="M12 17c-2.5-2.5-5-1.5-5 1 2.5 2.5 5 1.5 5-1Z" />
          <path d="M12 17c2.5-2.5 5-1.5 5 1-2.5 2.5-5 1.5-5-1Z" />
        </svg>
      );
    case 'lacteos':
      return (
        <svg {...props}>
          <path d="M8 3h8l1 4.5v11.5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7.5L8 3Z" />
          <path d="M7 8h10" />
          <path d="M10 3v2" />
          <path d="M14 3v2" />
        </svg>
      );
    case 'huevos':
      return (
        <svg {...props}>
          <path d="M12 21c4.2 0 7-3.1 7-7.5C19 8.2 15.5 3 12 3S5 8.2 5 13.5C5 17.9 7.8 21 12 21Z" />
          <circle cx="12" cy="14" r="2.5" />
        </svg>
      );
    case 'pescado':
      return (
        <svg {...props}>
          <path d="M2 16s3-6 10-6 10 6 10 6-3 6-10 6-10-6-10-6Z" transform="translate(0 -4)" />
          <path d="M22 12l-3-3v6l3-3Z" />
          <circle cx="8" cy="11.5" r="1" fill="currentColor" />
        </svg>
      );
    case 'frutos_secos':
      return (
        <svg {...props}>
          <path d="M12 4c-4.5 0-7 3.8-7 8.5C5 17.2 8.2 20 12 20s7-2.8 7-7.5C19 7.8 16.5 4 12 4Z" />
          <path d="M5.5 10.5h13" />
          <path d="M12 4v6.5" />
        </svg>
      );
    case 'sesamo':
      return (
        <svg {...props}>
          <ellipse cx="9" cy="8" rx="2" ry="3.2" transform="rotate(-20 9 8)" />
          <ellipse cx="15" cy="10" rx="2" ry="3.2" transform="rotate(20 15 10)" />
          <ellipse cx="11" cy="16" rx="2" ry="3.2" transform="rotate(-10 11 16)" />
        </svg>
      );
    case 'soja':
      return (
        <svg {...props}>
          <path d="M6 18c3.5 1.5 9.5-.5 12-6 1.5-3.2 1-6.5 0-8-1.5-1-4.8-1.5-8 0-5.5 2.5-7.5 8.5-4 14Z" />
          <circle cx="10.5" cy="13.5" r="1.5" />
          <circle cx="14" cy="10" r="1.5" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      );
  }
}

export function SearchIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7.5" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  );
}

export function CloseIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function MapPinIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function ClockIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}

export function PhoneIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Zm0 0a5 5 0 0 0 5 5m0 0h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 19 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function FacebookIcon({ size = 19 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
