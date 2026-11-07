// mammoth no trae tipos para su versión de navegador (mammoth/mammoth.browser). Solo se declara lo que usa la vista previa
// de Word (src/components/legacy/VistaDocumento.tsx). Sin esto el build de Vercel falla al comprobar tipos.
declare module "mammoth/mammoth.browser" {
  type Entrada = { arrayBuffer: ArrayBuffer };
  type Resultado = { value: string; messages: { type: string; message: string }[] };
  export function convertToHtml(entrada: Entrada): Promise<Resultado>;
  const mammoth: { convertToHtml: typeof convertToHtml };
  export default mammoth;
}
