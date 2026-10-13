// Aplica el tono guardado antes del primer pintado para evitar el parpadeo.
export function ThemeScript() {
  const code = `try{if(localStorage.getItem("fedegan-tema")==="claro")document.documentElement.setAttribute("data-theme","institucional")}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
