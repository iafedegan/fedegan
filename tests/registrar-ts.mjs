// Se carga con --import (ver «npm test»): registra el resolvedor de módulos de resolver-ts.mjs.
import { register } from "node:module";

register("./resolver-ts.mjs", import.meta.url);
