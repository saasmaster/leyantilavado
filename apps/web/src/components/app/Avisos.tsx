import { Nota } from '@leyantilavado/ui';

/**
 * Textos que NO son negociables. Están centralizados para que ninguna pantalla
 * los suavice por su cuenta.
 */

export const TEXTO_NO_ENVIAMOS_AVISOS =
  'LeyAntilavado.org no presenta avisos ante el SAT ni ante la UIF. No existe una integración oficial que lo permita. Aquí preparas, revisas, apruebas y EXPORTAS el contenido del aviso; subirlo al portal SPPLD lo haces tú.';

export function AvisoEnvioManual() {
  return (
    <Nota tono="atencion" titulo="El envío al portal SPPLD lo haces tú">
      <p>{TEXTO_NO_ENVIAMOS_AVISOS}</p>
      <p>
        El flujo de esta sección es <strong>preparar → revisar → aprobar → exportar</strong>. Al
        final obtienes un archivo con los datos capturados para que los cargues en el portal de la
        autoridad y guardes ahí mismo el acuse que te devuelva.
      </p>
    </Nota>
  );
}

export function AvisoFormatoOficial() {
  return (
    <Nota tono="info" titulo="Por qué exportamos CSV y JSON, no el XML oficial">
      <p>
        El esquema XML que exige el portal cambia por actividad y no lo tenemos documentado ni
        probado contra la especificación vigente. Generar un archivo que parezca oficial pero que la
        autoridad rechace sería peor que no generarlo: exportamos los datos en CSV y JSON, que
        puedes revisar a simple vista y capturar o convertir con tu proveedor.
      </p>
    </Nota>
  );
}

export function AvisoEfirma() {
  return (
    <Nota tono="riesgo" titulo="Nunca te pedimos tu e.firma">
      <p>
        Esta plataforma no tiene ningún campo para cargar tu llave privada (<code>.key</code>), tu
        certificado ni tu contraseña de e.firma, y nunca lo tendrá. Si alguna pantalla que dice ser
        nuestra te los pide, no es nuestra.
      </p>
    </Nota>
  );
}

export function AvisoAdaptadorLocal() {
  return (
    <Nota tono="atencion" titulo="Adaptador local: no consulta fuentes externas">
      <p>
        La verificación de personas políticamente expuestas y de listas de riesgo usa un adaptador
        <strong> local</strong>: compara únicamente contra la lista que tu organización cargó en
        esta plataforma. No consulta la lista de la OFAC, la de la ONU, ni ningún padrón oficial de
        PEP, y un resultado &ldquo;sin coincidencias&rdquo; no significa que la persona no esté en
        esas listas.
      </p>
      <p>
        Para una verificación real necesitas contratar a un proveedor de listas y conectarlo. La
        interfaz <code>ProveedorPEP</code> ya está lista para recibirlo.
      </p>
    </Nota>
  );
}

export function AvisoNoEsCumplimiento() {
  return (
    <Nota tono="info" titulo="Esto no declara que cumples">
      <p>
        Ninguna pantalla de esta plataforma afirma que tu organización cumple con la ley. Lo que ves
        es el registro de lo que capturaste, comparado con la regla vigente en la fecha de cada
        operación. La valoración jurídica corresponde a tu responsable de cumplimiento o a un
        profesional que revise el expediente completo.
      </p>
    </Nota>
  );
}
