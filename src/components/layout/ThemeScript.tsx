// El sitio es claro (fondo blanco) por defecto; solo se aplica el tono oscuro si la persona lo eligió. Se hace antes del primer pintado para evitar el parpadeo.
export function ThemeScript() {
  const code = `try{if(localStorage.getItem("fedegan-tema")==="oscuro"){document.documentElement.setAttribute("data-theme","esmeralda");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#05100b")}}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
