import { listar, type Resultado } from '@/lib/app/consultas';

/**
 * Verificación de personas políticamente expuestas y listas de riesgo.
 *
 * La interfaz existe para que un proveedor real (OFAC, ONU, un padrón de PEP
 * contratado) se pueda conectar sin tocar la pantalla. Hoy hay UNA sola
 * implementación y es local: consulta exclusivamente la tabla `customers` de
 * la propia organización. No consulta ninguna fuente externa, y la interfaz lo
 * declara en `esLocal` y en `listasCubiertas` para que la UI no pueda
 * presentarlo como algo que no es.
 */

export interface CoincidenciaPEP {
  /** Identificador de la fila de origen. Con el adaptador local, el cliente. */
  id: string;
  nombre: string;
  /** `true` sólo si alguien lo marcó como PEP en esta plataforma. */
  marcadoPEP: boolean;
  detalle: string | null;
  /** ISO date de la última revisión capturada. */
  revisadoEn: string | null;
  /** Cómo se obtuvo la marca: captura manual, adaptador local, proveedor. */
  origen: string;
}

export interface ProveedorPEP {
  clave: string;
  nombre: string;
  /** `true` = no sale de esta plataforma. La UI está obligada a decirlo. */
  esLocal: boolean;
  descripcion: string;
  /** Listas oficiales que este proveedor cubre. Vacío = ninguna. */
  listasCubiertas: readonly string[];
  /**
   * Busca por nombre dentro del alcance del proveedor.
   * Con el nombre vacío devuelve únicamente las personas ya marcadas como PEP.
   */
  buscar(nombre: string, organizacionId: string | null): Promise<Resultado<CoincidenciaPEP>>;
}

interface FilaCliente {
  id: string;
  full_name: string;
  is_pep: boolean;
  pep_detail: string | null;
  pep_checked_at: string | null;
  pep_source: string;
}

const normalizar = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const proveedorPEPLocal: ProveedorPEP = {
  clave: 'adaptador_local',
  nombre: 'Adaptador local (tu propia base de clientes)',
  esLocal: true,
  descripcion:
    'Compara el nombre contra los clientes que tu organización capturó en esta plataforma y contra la marca de PEP que ustedes mismos registraron. No consulta ningún padrón externo.',
  listasCubiertas: [],

  async buscar(nombre, organizacionId) {
    const resultado = await listar<FilaCliente>('customers', {
      organizacionId,
      columnas: 'id,full_name,is_pep,pep_detail,pep_checked_at,pep_source',
      ordenarPor: 'full_name',
      ascendente: true,
      limite: 500,
    });
    if (resultado.estado !== 'ok') return resultado;

    const buscado = normalizar(nombre);
    const filas = resultado.filas
      .filter((c) => (buscado === '' ? c.is_pep : normalizar(c.full_name).includes(buscado)))
      .map(
        (c): CoincidenciaPEP => ({
          id: c.id,
          nombre: c.full_name,
          marcadoPEP: c.is_pep,
          detalle: c.pep_detail,
          revisadoEn: c.pep_checked_at,
          origen: c.pep_source,
        }),
      );

    return { estado: 'ok', filas };
  },
};

export const ETIQUETA_ORIGEN_PEP: Record<string, string> = {
  adaptador_local: 'Adaptador local',
  captura_manual: 'Captura manual',
  proveedor_externo: 'Proveedor externo',
};
