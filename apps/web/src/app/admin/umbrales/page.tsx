import { Nota } from '@leyantilavado/ui';
import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';
import { TablaComparativaSemilla } from '@/components/admin/TablaComparativaSemilla';
import { SEMILLA_UMBRALES } from '@/components/admin/semillas';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'id', titulo: 'Identificador' },
  { clave: 'activity_slug', titulo: 'Actividad' },
  { clave: 'subtype', titulo: 'Subtipo', vacio: 'Sin subtipo' },
  { clave: 'periodicity', titulo: 'Periodicidad', formato: 'insignia' },
  { clave: 'valid_from', titulo: 'Vigente desde', formato: 'fecha' },
  { clave: 'valid_to', titulo: 'Vigente hasta', formato: 'fecha', vacio: 'Indefinido' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'verification', titulo: 'Verificación', formato: 'insignia' },
  { clave: 'last_review_at', titulo: 'Última revisión', formato: 'fecha', vacio: 'Nunca' },
  { clave: 'reviewed_by', titulo: 'Revisó', vacio: 'Sin revisor' },
];

export default function PaginaUmbrales() {
  return (
    <RecursoAdmin
      titulo="Umbrales"
      descripcion="El monto a partir del cual nace la obligación de identificar y la de presentar aviso, por actividad y por subtipo. Es la regla que más consultas recibe y la que menos tolera un error."
      tabla="threshold_rules"
      columnas={COLUMNAS}
      ordenarPor="activity_slug"
      ascendente
      incluirEliminados
      aviso={
        <Nota tono="atencion" titulo="Un umbral no siempre es un número">
          <p>
            Las columnas <code>identification_spec</code> y <code>notice_spec</code> guardan JSON,
            no una cifra, y por eso no aparecen en la tabla de arriba: un umbral puede ser un monto
            en UMA, pero también &ldquo;siempre&rdquo;, &ldquo;nunca&rdquo;, &ldquo;por monto o por
            la contraprestación cobrada&rdquo;, un conjunto de supuestos distintos según el acto, o
            un dato pendiente de revisión. Aplanarlos todos a un número es el error clásico de este
            dominio y produce falsos negativos justo en los casos de fe pública.
          </p>
          <p>
            La tabla de abajo sí los desglosa caso por caso, con el comparador incluido: la ley
            distingue entre &ldquo;superior a&rdquo; e &ldquo;igual o superior a&rdquo;, y esa
            diferencia decide la respuesta cuando el monto cae exactamente en el borde.
          </p>
        </Nota>
      }
    >
      <TablaComparativaSemilla
        tabla="threshold_rules"
        clave="id"
        titulo="Umbrales que trae el motor"
        filas={SEMILLA_UMBRALES}
      />
    </RecursoAdmin>
  );
}
