import { Nota } from '@leyantilavado/ui';
import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'key', titulo: 'Bandera' },
  { clave: 'description', titulo: 'Qué controla', vacio: 'Sin descripción' },
  { clave: 'enabled', titulo: 'Activa', formato: 'booleano' },
  { clave: 'rollout_percent', titulo: 'Porcentaje', formato: 'numero' },
  { clave: 'updated_by', titulo: 'Modificó', vacio: 'Sin registro' },
  { clave: 'updated_at', titulo: 'Modificada', formato: 'fecha_hora' },
];

export default function PaginaBanderas() {
  return (
    <RecursoAdmin
      titulo="Banderas de funcionalidad"
      descripcion="Los interruptores que deciden qué partes del producto están visibles, por organización o por porcentaje de tráfico."
      tabla="feature_flags"
      columnas={COLUMNAS}
      ordenarPor="key"
      ascendente
      incluirEliminados
      entidadRevisiones={null}
      aviso={
        <Nota tono="atencion" titulo="Una bandera no oculta un dato, sólo una pantalla">
          <p>
            Estas banderas se leen desde el sitio público y deciden qué se dibuja. No son un control
            de acceso: quien decide qué filas puede leer una cuenta son las políticas RLS de
            Postgres. Apagar una bandera para &ldquo;esconder&rdquo; información sensible no
            esconde nada.
          </p>
          <p>
            Una bandera sin descripción es una trampa para quien la encuentre dentro de seis meses y
            no sepa si puede apagarla. Descríbelas.
          </p>
        </Nota>
      }
    />
  );
}
