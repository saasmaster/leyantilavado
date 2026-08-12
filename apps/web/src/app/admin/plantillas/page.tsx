import { Nota } from '@leyantilavado/ui';
import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'slug', titulo: 'Ruta' },
  { clave: 'title', titulo: 'Plantilla' },
  { clave: 'kind', titulo: 'Tipo', formato: 'insignia' },
  { clave: 'format', titulo: 'Formato', formato: 'insignia' },
  { clave: 'file_url', titulo: 'Archivo', vacio: 'Sin archivo cargado' },
  { clave: 'requires_account', titulo: 'Pide cuenta', formato: 'booleano' },
  { clave: 'downloads', titulo: 'Descargas', formato: 'numero' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
];

export default function PaginaPlantillas() {
  return (
    <RecursoAdmin
      titulo="Plantillas"
      descripcion="Manuales, matrices de riesgo, expedientes y listas de verificación descargables."
      tabla="templates"
      columnas={COLUMNAS}
      ordenarPor="updated_at"
      aviso={
        <Nota tono="atencion" titulo="Una plantilla es un punto de partida, no un documento válido">
          <p>
            Un manual descargado y firmado sin adaptarlo no acredita nada: la autoridad revisa que
            el documento corresponda a la operación real del sujeto obligado. El texto que acompaña
            cada plantilla en el sitio tiene que decirlo, y ninguna descripción debe sugerir que
            basta con llenar los espacios en blanco.
          </p>
          <p>
            Una plantilla publicada con <code>file_url</code> vacío es un enlace roto para el
            usuario. Revísalo antes de pasarla a publicada.
          </p>
        </Nota>
      }
    />
  );
}
