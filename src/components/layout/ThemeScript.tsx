// Tono del sitio antes del primer pintado (evita el parpadeo):
//  · si hay una plantilla activa, ella fija el tono (data-tpl-mode en <html>);
//  · si la persona eligió un tono con el botón, se respeta en todas las páginas;
//  · si no, la página de inicio es clara y las páginas interiores son oscuras (grafito).
// El panel de administración queda siempre claro. ThemeRoute repite esta regla al navegar sin recargar.
export function ThemeScript() {
  const code = `try{var r=document.documentElement;var t=r.getAttribute("data-tpl-mode");var s=localStorage.getItem("fedegan-tema");var p=location.pathname;var adm=p.indexOf("/admin")===0;var inner=p!=="/"&&!adm;var d=t&&!adm?t==="oscuro":(s?s==="oscuro":!adm);r.setAttribute("data-theme",d?"esmeralda":"institucional");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"#0e0e0e":"#0a2a20")}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
