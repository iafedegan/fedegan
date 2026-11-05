// Tono del sitio antes del primer pintado (evita el parpadeo):
//  · si la persona eligió un tono con el botón, se respeta en todas las páginas;
//  · si no, la página de inicio es clara y las páginas interiores son oscuras (grafito).
// El panel de administración queda siempre claro. ThemeRoute repite esta regla al navegar sin recargar.
export function ThemeScript() {
  const code = `try{var s=localStorage.getItem("fedegan-tema");var p=location.pathname;var inner=p!=="/"&&p.indexOf("/admin")!==0;var d=s?s==="oscuro":inner;document.documentElement.setAttribute("data-theme",d?"esmeralda":"institucional");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"#141414":"#ffffff")}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
