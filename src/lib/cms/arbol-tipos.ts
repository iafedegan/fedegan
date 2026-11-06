// Tipos del árbol del sitio que comparten el servidor y el panel (/admin/arbol). Sin acceso a datos.

export type ArbolKind = "grupo-raiz" | "nav" | "seccion" | "pagina" | "grupo" | "enlace" | "ruta";

export type ArbolNodo = {
  id: string;
  label: string;
  kind: ArbolKind;
  /** Dirección pública (interna o externa). */
  href?: string;
  external?: boolean;
  /** «nueva» = creada desde el panel; sin valor = copiada del portal actual o propia del sitio. */
  origen?: "nueva";
  editada?: boolean;
  oculta?: boolean;
  /** Dónde se crearían los hijos de este nodo (sin valor = no admite hijos). */
  add?: { section: string; parent: string | null };
  /** Ruta del panel para editar el contenido o los datos del nodo. */
  editHref?: string;
  /** Solo nodos nuevos: id en site_nodes (para mover, ocultar y eliminar). */
  nodeId?: string;
  /** Opción de la barra de navegación (id en nav_items). */
  navId?: string;
  /** Aviso corto junto al nombre (por ejemplo, una sección aún sin contenido). */
  nota?: string;
  /** Cuántos nodos hay por debajo, a cualquier nivel. */
  total: number;
  children: ArbolNodo[];
};
