// Enlaces para publicar un certificado en LinkedIn (sin cuentas ni claves: son direcciones públicas de LinkedIn).
const ORG = "UCG · Escuela Virtual FEDEGÁN–FNG";

/** «Agregar a Licencias y certificaciones» del perfil, con los datos ya llenos. */
export function linkedinAddUrl({ course, code, date, verifyUrl, demo }: { course: string; code: string; date: string; verifyUrl: string; demo?: boolean }) {
  const d = new Date(date);
  const p = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: demo ? `${course} (demostración)` : course,
    organizationName: ORG,
    issueYear: String(d.getFullYear()),
    issueMonth: String(d.getMonth() + 1),
    certUrl: verifyUrl,
    certId: code,
  });
  return `https://www.linkedin.com/profile/add?${p.toString()}`;
}

/** Compartir el enlace de verificación como publicación. */
export const linkedinShareUrl = (verifyUrl: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
