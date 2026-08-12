import { Nota } from '@leyantilavado/ui';
import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';
import { TablaComparativaSemilla } from '@/components/admin/TablaComparativaSemilla';
import { SEMILLA_SANCIONES } from '@/components/admin/semillas';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'id', titulo: 'Identificador' },
  { clave: 'article', titulo: 'Artículo' },
  { clave: 'fraction', titulo: 'Fracción', vacio: 'Sin fracción' },
  { clave: 'scenario', titulo: 'Supuesto' },
  { clave: 'min_uma', titulo: 'Mínimo en UMA', formato: 'numero' },
  { clave: 'max_uma', titulo: 'Máximo en UMA', formato: 'numero' },
  { clave: 'min_percent', titulo: 'Mínimo %', formato: 'numero', vacio: 'No aplica' },
  { clave: 'max_percent', titulo: 'Máximo %', formato: 'numero', vacio: 'No aplica' },
  { clave: 'severity', titulo: 'Gravedad', formato: 'insignia' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'verification', titulo: 'Verificación', formato: 'insignia' },
];

export default function PaginaSanciones() {
  return (
    <RecursoAdmin
      titulo="Sanciones"
      descripcion="Los rangos de multa de la LFPIORPI, con la alternativa porcentual sobre el valor de la operación cuando la ley la prevé."
      tabla="sanctions"
      columnas={COLUMNAS}
      ordenarPor="article"
      ascendente
      incluirEliminados
      aviso={
        <Nota tono="atencion" titulo="Un rango no es una multa">
          <p>
            Lo que hay aquí son los rangos que fija la ley. La cantidad que impone la autoridad
            depende de circunstancias que esta plataforma no conoce: reincidencia, capacidad
            económica, daño causado y autocorrección. Ninguna pantalla del sitio puede decir
            &ldquo;te van a multar con X&rdquo;, y las herramientas públicas presentan estos números
            como estimación de rango, nunca como resolución.
          </p>
          <p>
            Cuando existe alternativa porcentual, la ley manda aplicar la cantidad{' '}
            <strong>mayor</strong> entre el rango fijo y el porcentaje. Si editas una fila, revisa
            que las dos columnas sigan siendo coherentes.
          </p>
        </Nota>
      }
    >
      <TablaComparativaSemilla
        tabla="sanctions"
        clave="id"
        titulo="Sanciones que trae el motor"
        filas={SEMILLA_SANCIONES}
      />
    </RecursoAdmin>
  );
}
