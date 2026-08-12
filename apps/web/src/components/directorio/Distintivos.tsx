import { BadgeCheck, Megaphone } from 'lucide-react';
import type { NivelVerificacionProveedor } from '@leyantilavado/types';
import { ETIQUETA_VERIFICACION, EXPLICACION_VERIFICACION } from '@leyantilavado/types';
import { TONO_VERIFICACION } from '@/lib/directorio/catalogo';
import { EtiquetaExplicada } from './EtiquetaExplicada';

/* ────────────────────────────────────────────────────────────────────────────
 * Los tres distintivos que puede llevar un perfil.
 *
 * Las tres reglas que no se negocian:
 *  1. Nunca se dice "certificado por LeyAntilavado.org". El nivel más alto es
 *     "certificación externa revisada", y la certificación es del tercero.
 *  2. Todo perfil patrocinado lleva su etiqueta visible, en tarjeta y perfil.
 * ────────────────────────────────────────────────────────────────────────── */

/** Qué NO significa cada nivel. Se muestra siempre bajo la explicación. */
const LIMITE_VERIFICACION: Record<NivelVerificacionProveedor, string> = {
  sin_verificar:
    'LeyAntilavado.org no avala a este proveedor. Verifica sus credenciales por tu cuenta antes de contratar.',
  correo_verificado:
    'No comprobamos identidad, credenciales, experiencia ni calidad del servicio. No es un aval.',
  identidad_verificada:
    'No revisamos títulos, certificaciones ni resultados. Que exista quien dice ser no dice nada sobre su trabajo.',
  documentacion_revisada:
    'No es una certificación de LeyAntilavado.org ni un aval. Revisamos que los documentos existan y correspondan al titular; no evaluamos su desempeño.',
  certificacion_externa_revisada:
    'La certificación la emite un tercero, no nosotros. Sólo comprobamos que exista y su vigencia a la fecha señalada.',
};

export function InsigniaVerificacion({
  nivel,
  className,
}: {
  nivel: NivelVerificacionProveedor;
  className?: string;
}) {
  return (
    <EtiquetaExplicada
      etiqueta={ETIQUETA_VERIFICACION[nivel]}
      titulo={`Qué revisamos: ${ETIQUETA_VERIFICACION[nivel].toLocaleLowerCase('es-MX')}`}
      explicacion={EXPLICACION_VERIFICACION[nivel]}
      nota={LIMITE_VERIFICACION[nivel]}
      tono={TONO_VERIFICACION[nivel]}
      icono={<BadgeCheck aria-hidden="true" className="size-3.5" />}
      {...(className ? { className } : {})}
    />
  );
}

export function EtiquetaPatrocinado({ className }: { className?: string }) {
  return (
    <EtiquetaExplicada
      etiqueta="Patrocinado"
      titulo="Este proveedor paga por aparecer aquí"
      explicacion="Contrató un perfil destacado, que le da presencia en un bloque de pago separado de los resultados. Se muestra siempre con esta etiqueta."
      nota="Pagar no mejora su posición dentro de los resultados normales, no cambia su nivel de verificación y no influye en nuestro contenido editorial."
      tono="ambar"
      icono={<Megaphone aria-hidden="true" className="size-3.5" />}
      {...(className ? { className } : {})}
    />
  );
}

