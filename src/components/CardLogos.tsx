// Accepted payment marks for the footer (Telr requires accepted card logos on the homepage).
// Keep in sync with the methods enabled in the Telr settings on Shopify.
const badge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 38,
  height: 24,
  background: "#fff",
  borderRadius: 3,
  overflow: "hidden",
};

const font = "Arial, Helvetica, sans-serif";

export default function CardLogos() {
  return (
    <span
      style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center", gap: 6, alignItems: "center" }}
      aria-label="We accept Visa, Mastercard, Maestro, American Express, UnionPay and stc pay"
    >
      <span style={badge} title="Visa">
        <svg role="img" aria-label="Visa" viewBox="0 0 24 24" width="28" height="28" fill="#1A1F71">
          <path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z" />
        </svg>
      </span>
      <span style={badge} title="Mastercard">
        <svg role="img" aria-label="Mastercard" viewBox="0 0 32 20" width="28" height="18">
          <circle cx="11" cy="10" r="8" fill="#EB001B" />
          <circle cx="21" cy="10" r="8" fill="#F79E1B" />
          <path d="M16 3.76a8 8 0 0 1 0 12.48 8 8 0 0 1 0-12.48z" fill="#FF5F00" />
        </svg>
      </span>
      <span style={badge} title="Maestro">
        <svg role="img" aria-label="Maestro" viewBox="0 0 32 20" width="28" height="18">
          <circle cx="11" cy="10" r="8" fill="#EB001B" />
          <circle cx="21" cy="10" r="8" fill="#00A2E5" />
          <path d="M16 3.76a8 8 0 0 1 0 12.48 8 8 0 0 1 0-12.48z" fill="#7375CF" />
        </svg>
      </span>
      <span style={{ ...badge, background: "#2E77BC" }} title="American Express">
        <svg role="img" aria-label="American Express" viewBox="0 0 38 24" width="38" height="24">
          <text x="19" y="15.5" textAnchor="middle" fontFamily={font} fontSize="9.5" fontWeight="900" fill="#fff" letterSpacing="0.3">AMEX</text>
        </svg>
      </span>
      <span style={badge} title="UnionPay">
        <svg role="img" aria-label="UnionPay" viewBox="0 0 38 24" width="38" height="24">
          <path d="M6 3h10l-4 18H2z" fill="#E21836" />
          <path d="M15 3h10l-4 18H11z" fill="#00447C" />
          <path d="M24 3h12l-4 18H20z" fill="#007B84" />
          <text x="19" y="14.5" textAnchor="middle" fontFamily={font} fontSize="5.6" fontStyle="italic" fontWeight="700" fill="#fff">UnionPay</text>
        </svg>
      </span>
      <span style={badge} title="stc pay">
        <svg role="img" aria-label="stc pay" viewBox="0 0 38 24" width="38" height="24">
          <text x="4" y="15.5" fontFamily={font} fontSize="10.5" fontWeight="900" fill="#4F008C">stc</text>
          <text x="23" y="11" fontFamily={font} fontSize="6" fontWeight="700" fill="#1CB28E">pay</text>
        </svg>
      </span>
    </span>
  );
}
