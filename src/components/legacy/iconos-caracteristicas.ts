import {
  Award, BadgeCheck, Beef, BookOpen, CalendarDays, Clock, Coins, Download, Droplets, FileCheck, FileText, GraduationCap, Handshake, Heart, Landmark, Lightbulb, Mail,
  MapPin, Milk, Phone, Scale, ShieldCheck, Sprout, Star, Stethoscope, Syringe, Tractor, TrendingUp, Truck, Users, Wheat, Globe,
  type LucideIcon,
} from "lucide-react";

// Los iconos que se pueden elegir en «Características» (los nombres son los de ICONOS_CARACTERISTICAS en src/lib/cms/elementos.ts).
export const ICONOS_CARACT: Record<string, LucideIcon> = {
  check: BadgeCheck, personas: Users, documento: FileText, escudo: ShieldCheck, telefono: Phone, correo: Mail,
  calendario: CalendarDays, ubicacion: MapPin, corazon: Heart, estrella: Star, crecimiento: TrendingUp, premio: Award,
  reloj: Clock, descarga: Download, mundo: Globe, hoja: Sprout, res: Beef, leche: Milk, pasto: Wheat,
  tractor: Tractor, agua: Droplets, vacuna: Syringe, salud: Stethoscope, camion: Truck, balanza: Scale,
  edificio: Landmark, alianza: Handshake, capacitacion: GraduationCap, dinero: Coins, tramite: FileCheck, libro: BookOpen, idea: Lightbulb,
};
