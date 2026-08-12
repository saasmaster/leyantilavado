import { Nota } from '@leyantilavado/ui';
import { RejillaTarjetas, TarjetaMetrica } from '@/components/app/Contenedor';
import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoDatosPersonales } from '@/components/admin/Avisos';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';
import { contar, type Resultado } from '@/lib/app/consultas';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'created_at', titulo: 'Alta', formato: 'fecha_hora' },
  { clave: 'email', titulo: 'Correo' },
  { clave: 'name', titulo: 'Nombre', vacio: 'Sin nombre' },
  { clave: 'source', titulo: 'Origen', formato: 'insignia', vacio: 'Sin origen' },
  { clave: 'confirmed_at', titulo: 'Confirmó', formato: 'fecha_hora', vacio: 'Sin confirmar' },
  { clave: 'unsubscribed_at', titulo: 'Se dio de baja', formato: 'fecha_hora', vacio: 'Activo' },
];

function numero(resultado: Resultado<number>): number | null {
  return resultado.estado === 'ok' ? (resultado.filas[0] ?? 0) : null;
}

function texto(valor: number | null): string {
  return valor === null ? 'Sin datos' : String(valor);
}

/** Resta sólo si las dos lecturas salieron bien: media resta es un número inventado. */
function diferencia(total: number | null, parte: number | null): string {
  return total === null || parte === null ? 'Sin datos' : String(total - parte);
}

export default async function PaginaNewsletter() {
  const [todos, sinConfirmar, sinBaja] = await Promise.all([
    contar('newsletter_subscribers', { incluirEliminados: true }),
    contar('newsletter_subscribers', { filtros: { confirmed_at: null }, incluirEliminados: true }),
    contar('newsletter_subscribers', { filtros: { unsubscribed_at: null }, incluirEliminados: true }),
  ]);

  const total = numero(todos);

  return (
    <RecursoAdmin
      titulo="Newsletter"
      descripcion="Los suscriptores del boletín, con doble confirmación: mientras no exista fecha de confirmación no se le envía nada a esa dirección."
      tabla="newsletter_subscribers"
      columnas={COLUMNAS}
      ordenarPor="created_at"
      incluirEliminados
      entidadRevisiones={null}
      aviso={
        <>
          <AvisoDatosPersonales que="Debajo está la lista completa de direcciones de correo de quienes se suscribieron al boletín." />
          <Nota tono="info" titulo="Doble confirmación y baja">
            <p>
              Un registro sin <code>confirmed_at</code> nunca recibe correo: alguien escribió esa
              dirección pero no confirmó que es suya. Un registro con <code>unsubscribed_at</code>{' '}
              tampoco, y la fila se conserva justamente para poder demostrar que la baja se respetó.
              Ninguno de los dos se debe incluir en un envío &ldquo;porque son pocos&rdquo;.
            </p>
          </Nota>
        </>
      }
      vacioDescripcion="No hay ningún suscriptor registrado. Si el formulario del sitio ya está publicado, comprueba que esté escribiendo en newsletter_subscribers antes de suponer que nadie se ha suscrito."
    >
      <RejillaTarjetas>
        <TarjetaMetrica
          etiqueta="Registros totales"
          valor={texto(total)}
          detalle="Incluye no confirmados y bajas"
        />
        <TarjetaMetrica
          etiqueta="Confirmados"
          valor={diferencia(total, numero(sinConfirmar))}
          detalle="Con doble confirmación completada"
        />
        <TarjetaMetrica
          etiqueta="Sin confirmar"
          valor={texto(numero(sinConfirmar))}
          detalle="No reciben ningún envío"
        />
        <TarjetaMetrica
          etiqueta="Dados de baja"
          valor={diferencia(total, numero(sinBaja))}
          detalle="Se conservan para acreditar la baja"
        />
      </RejillaTarjetas>
    </RecursoAdmin>
  );
}
