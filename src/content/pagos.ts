import municipios from "./municipios.json";

// Contenido del sistema de pago en línea de la cuota de fomento ganadero y lechero (CFGL),
// copiado de pagos.fedegan.org.co y de la página de recaudo del portal actual.

export const pagosActual = "https://pagos.fedegan.org.co/login";

export const ley = {
  titulo: "Recaudadores CFGL",
  parrafos: [
    "En cumplimiento de la Ley 89 de 1993 (artículo 6.º, parágrafo): «Los recaudadores de la cuota mantendrán dichos recursos en una cuenta separada y están obligados a depositarlos, dentro de los diez (10) primeros días del mes siguiente al recaudo, en la cuenta especial denominada Fondo Nacional del Ganado».",
    "Para facilitarle el cumplimiento de esta obligación legal, ponemos a su disposición el servicio del Botón de Pagos «PSE – Pagos Seguros en Línea».",
    "Igualmente, le recordamos las fechas límite de pago en el mes siguiente, para cada uno de los meses de causación del recaudo.",
  ],
};

/** Mes de causación → fecha límite de consignación (año 2026). */
export const fechasLimite: { mes: string; limite: string; iso: string }[] = [
  { mes: "Diciembre de 2025", limite: "16 de enero de 2026", iso: "2026-01-16" },
  { mes: "Enero de 2026", limite: "13 de febrero de 2026", iso: "2026-02-13" },
  { mes: "Febrero de 2026", limite: "13 de marzo de 2026", iso: "2026-03-13" },
  { mes: "Marzo de 2026", limite: "16 de abril de 2026", iso: "2026-04-16" },
  { mes: "Abril de 2026", limite: "15 de mayo de 2026", iso: "2026-05-15" },
  { mes: "Mayo de 2026", limite: "16 de junio de 2026", iso: "2026-06-16" },
  { mes: "Junio de 2026", limite: "15 de julio de 2026", iso: "2026-07-15" },
  { mes: "Julio de 2026", limite: "18 de agosto de 2026", iso: "2026-08-18" },
  { mes: "Agosto de 2026", limite: "14 de septiembre de 2026", iso: "2026-09-14" },
  { mes: "Septiembre de 2026", limite: "15 de octubre de 2026", iso: "2026-10-15" },
  { mes: "Octubre de 2026", limite: "17 de noviembre de 2026", iso: "2026-11-17" },
  { mes: "Noviembre de 2026", limite: "15 de diciembre de 2026", iso: "2026-12-15" },
  { mes: "Diciembre de 2026", limite: "18 de enero de 2027", iso: "2027-01-18" },
];

export type Paso = { titulo: string; items: (string | { titulo: string; items: string[] })[] };

const acceso: Paso = {
  titulo: "A. Identificación del recaudador",
  items: [
    "Identificación: ingrese su número de identificación, NIT con dígito de verificación sin guion ni espacio, o cédula de ciudadanía.",
    "Clave de acceso: en su primer ingreso, digite también el NIT con dígito de verificación sin guion ni espacio, o la cédula de ciudadanía.",
    "El sistema le solicitará cambiar la clave. Anótela y guárdela para futuras operaciones.",
  ],
};

const pse: Paso = {
  titulo: "C. PSE Pagos Seguros en Línea",
  items: [
    "Debe estar registrado para realizar esta operación. Si aún no lo está, utilice la opción «Quiero registrarme ahora».",
    "Seleccione el botón «PSE Pagos Seguros en Línea». A continuación se le solicitarán los siguientes datos:",
    "Tipo de cliente: seleccione si es persona natural o jurídica.",
    "Banco: seleccione el banco desde el cual se hará el pago.",
    "Finalice la acción seleccionando el botón «Continuar».",
  ],
};

const banco: Paso = {
  titulo: "D. Entidad bancaria",
  items: ["El sistema lo envía a la página web de la entidad bancaria seleccionada.", "Siga los procesos de pago virtual de su entidad bancaria."],
};

export const instructivos = {
  leche: {
    titulo: "Leche",
    pasos: [
      acceso,
      {
        titulo: "B. Diligenciamiento de la planilla de recaudo para leche",
        items: [
          {
            titulo: "Datos del recaudo",
            items: [
              "En el menú de opciones seleccione la barra «Recaudo y Consignación mensual concepto Leche».",
              "Seleccione el año de recaudo.",
              "Seleccione el mes a pagar (el de causación del recaudo, es decir, el anterior al del día de pago). Si reporta y paga más de un mes, diligencie una planilla por cada mes.",
              "Seleccione departamento y municipio (de origen de la leche). Ingrese número de litros y el valor recaudado de la leche por cada municipio, y finalice con el botón «Agregar».",
              "Si existen varios municipios de origen, repita la acción para cada uno.",
            ],
          },
          {
            titulo: "Totales",
            items: [
              "En «Total litros leche» digite el total de litros comprados durante el mes de recaudo; debe ser igual a la suma de los orígenes municipales.",
              "En «Valor total compras leche» digite el valor total de las compras de leche durante el mes de recaudo.",
              "Seleccione el botón «Calcular».",
              "En «Subtotal» el sistema calcula el valor del recaudo (sin intereses de mora).",
              "Si consigna fuera de la fecha límite, el sistema liquidará los «Intereses de mora» del mes que reporta y paga.",
              "En «Valor total» el sistema liquida la suma del recaudo y los intereses de mora, si los hay.",
            ],
          },
          "Observaciones: si tiene alguna novedad sobre el valor que reporta y paga, digítela en esta casilla.",
          "Pagar: finalice la planilla con el botón «Pagar», que lo remite al sistema PSE (botón de pago).",
        ],
      },
      pse,
      banco,
    ] as Paso[],
  },
  carne: {
    titulo: "Carne",
    pasos: [
      acceso,
      {
        titulo: "B. Diligenciamiento de la planilla de recaudo para carne",
        items: [
          {
            titulo: "Datos del recaudo",
            items: [
              "En el menú de opciones seleccione la barra «Recaudo y Consignación mensual concepto Carne».",
              "Seleccione el año de recaudo.",
              "Seleccione el mes a pagar (el de causación del recaudo, es decir, el anterior al del día de pago). Si reporta y paga más de un mes, diligencie una planilla por cada mes.",
              "Seleccione departamento y municipio (de origen de las cabezas). Ingrese el número de cabezas por cada municipio y finalice con el botón «Agregar».",
              "Si existen varios municipios de origen, repita la acción para cada uno.",
            ],
          },
          {
            titulo: "Totales",
            items: [
              "En «Cabezas machos» discrimine el número de machos sacrificados durante el mes de recaudo.",
              "En «Cabezas hembras» discrimine el número de hembras sacrificadas durante el mes de recaudo.",
              "El «Total cabezas» discriminado entre machos y hembras debe ser igual a la suma de los orígenes municipales; de lo contrario, el sistema no le permitirá continuar.",
              "Seleccione el botón «Calcular».",
              "En «Subtotal» el sistema calcula el valor del recaudo (sin intereses de mora).",
              "Si consigna fuera de la fecha límite, el sistema liquidará los «Intereses de mora» del mes que reporta y paga.",
              "En «Valor total» el sistema liquida la suma del recaudo y los intereses de mora, si los hay.",
            ],
          },
          "Observaciones: si tiene alguna novedad sobre el valor que reporta y paga, digítela en esta casilla.",
          "Pagar: finalice la planilla con el botón «Pagar», que lo remite al sistema PSE (botón de pago).",
        ],
      },
      { ...pse, titulo: "C. Ingreso a «PSE Pagos Seguros en Línea»" },
      banco,
    ] as Paso[],
  },
};

export const importante = "El proceso por intermedio de PSE – Pagos Seguros en Línea maneja archivos encriptados y, como su nombre lo indica, es 100 % seguro.";

/** División político-administrativa oficial (DIVIPOLA, DANE): departamento → municipios. */
export const municipiosPorDepartamento = municipios as Record<string, string[]>;
export const departamentos = Object.keys(municipiosPorDepartamento);

export const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
