import type { ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoPatrocinado } from '@/components/admin/Avisos';
import { RecursoAdmin } from '@/components/admin/RecursoAdmin';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'advertiser', titulo: 'Anunciante' },
  { clave: 'provider_id', titulo: 'Proveedor ligado', vacio: 'Sin ficha ligada' },
  { clave: 'placement', titulo: 'Ubicación', formato: 'insignia' },
  { clave: 'target_slug', titulo: 'Destino', vacio: 'Sin destino específico' },
  { clave: 'starts_on', titulo: 'Inicia', formato: 'fecha' },
  { clave: 'ends_on', titulo: 'Termina', formato: 'fecha' },
  { clave: 'amount_cents', titulo: 'Importe', formato: 'dinero' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
];

export default function PaginaPatrocinios() {
  return (
    <RecursoAdmin
      titulo="Patrocinios"
      descripcion="Los espacios pagados del sitio, con su vigencia y su importe. Que exista un patrocinio nunca cambia el contenido de una comparativa ni el orden de un resultado por relevancia: cambia dónde aparece un anuncio etiquetado como tal."
      tabla="sponsorships"
      columnas={COLUMNAS}
      ordenarPor="starts_on"
      incluirEliminados
      entidadRevisiones={null}
      aviso={<AvisoPatrocinado />}
    />
  );
}
