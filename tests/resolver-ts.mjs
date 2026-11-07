// Los módulos de src/ se importan entre sí sin escribir «.ts» (como pide TypeScript y el resto del proyecto), pero Node
// necesita la extensión. Este resolvedor la añade solo cuando la ruta relativa no se encuentra tal cual.
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    const relativa = specifier.startsWith("./") || specifier.startsWith("../");
    if (relativa && !/\.[cm]?[jt]sx?$/.test(specifier)) return nextResolve(`${specifier}.ts`, context);
    throw error;
  }
}
