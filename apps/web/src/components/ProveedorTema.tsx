'use client';

import * as React from 'react';

/**
 * Control del tema.
 *
 * DELIBERADAMENTE no expone el tema actual, sólo la acción de alternarlo.
 *
 * El motivo: el script del `<head>` aplica la clase `oscuro` antes de que
 * React hidrate. Cualquier componente que ramifique su render con
 * `tema === 'oscuro'` producirá un HTML de cliente distinto al del servidor
 * y React lanzará un error de hidratación. Ya pasó una vez con el ícono del
 * interruptor.
 *
 * Para estilos que dependan del tema usa la variante CSS `oscuro:` definida en
 * `globals.css`:
 *
 *     <Moon className="oscuro:hidden" />
 *     <Sun  className="hidden oscuro:block" />
 *     <div  className="bg-white oscuro:bg-slate-900" />
 *
 * El navegador resuelve eso sin JavaScript, sin parpadeo y sin desajuste.
 */
const ContextoTema = React.createContext<{ alternar: () => void } | null>(null);

export function ProveedorTema({ children }: { children: React.ReactNode }) {
  const alternar = React.useCallback(() => {
    const raiz = document.documentElement;
    const seraOscuro = !raiz.classList.contains('oscuro');
    raiz.classList.toggle('oscuro', seraOscuro);
    try {
      localStorage.setItem('tema', seraOscuro ? 'oscuro' : 'claro');
    } catch {
      // Modo privado o almacenamiento bloqueado: el tema sigue funcionando en
      // esta sesión, simplemente no se recuerda en la siguiente.
    }
  }, []);

  const valor = React.useMemo(() => ({ alternar }), [alternar]);

  return <ContextoTema.Provider value={valor}>{children}</ContextoTema.Provider>;
}

export function useTema() {
  const ctx = React.useContext(ContextoTema);
  if (!ctx) throw new Error('useTema debe usarse dentro de ProveedorTema');
  return ctx;
}
