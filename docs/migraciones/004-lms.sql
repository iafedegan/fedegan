-- Escuela Virtual (LMS): cursos, módulos, lecciones, evaluaciones, inscripciones, progreso y valoraciones. Idempotente.
create extension if not exists pgcrypto;

create table if not exists public.lms_courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  learn_points text not null default '',        -- «Lo que aprenderá», uno por línea
  requirements text not null default '',
  category text not null default 'General',
  level text not null default 'basico' check (level in ('basico','intermedio','avanzado')),
  instructor text not null default '',
  instructor_bio text not null default '',
  cover_image text,
  promo_video text,
  certificate boolean not null default true,
  external_url text,                             -- curso alojado en otra plataforma (p. ej. mpg.fedegan.org.co)
  external_videos int not null default 0,        -- videos del curso externo, solo para mostrar
  publish_on date,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.lms_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  title text not null,
  summary text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lms_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.lms_modules(id) on delete cascade,
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  title text not null,
  kind text not null default 'video' check (kind in ('video','lectura','quiz')),
  video_url text,
  content text not null default '',
  duration_minutes int not null default 0,
  free_preview boolean not null default false,
  resource_url text,
  resource_label text not null default '',
  pass_score int not null default 70,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lms_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lms_lessons(id) on delete cascade,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_index int not null default 0,
  explanation text not null default '',
  sort_order int not null default 0
);

create table if not exists public.lms_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  user_key text not null,
  user_name text not null default '',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  certificate_code text,
  unique (course_id, user_key)
);

create table if not exists public.lms_progress (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  lesson_id uuid not null references public.lms_lessons(id) on delete cascade,
  user_key text not null,
  score int,
  completed_at timestamptz not null default now(),
  unique (user_key, lesson_id)
);

create table if not exists public.lms_reviews (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  user_key text not null,
  user_name text not null default '',
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (course_id, user_key)
);

create index if not exists lms_modules_course on public.lms_modules(course_id, sort_order);
create index if not exists lms_lessons_module on public.lms_lessons(module_id, sort_order);
create index if not exists lms_lessons_course on public.lms_lessons(course_id);
create index if not exists lms_progress_user on public.lms_progress(user_key, course_id);
create index if not exists lms_enroll_user on public.lms_enrollments(user_key);

alter table public.lms_courses enable row level security;
alter table public.lms_modules enable row level security;
alter table public.lms_lessons enable row level security;
alter table public.lms_quiz_questions enable row level security;
alter table public.lms_enrollments enable row level security;
alter table public.lms_progress enable row level security;
alter table public.lms_reviews enable row level security;

-- El público solo lee cursos publicados (y vigentes) con sus módulos y lecciones, y las valoraciones visibles.
-- Evaluaciones, inscripciones y progreso no tienen política pública: solo la clave de servicio del servidor.
drop policy if exists "cursos publicados son publicos" on public.lms_courses;
create policy "cursos publicados son publicos" on public.lms_courses
  for select using (published and (publish_on is null or publish_on <= (now() at time zone 'America/Bogota')::date));

drop policy if exists "modulos de cursos publicados" on public.lms_modules;
create policy "modulos de cursos publicados" on public.lms_modules
  for select using (exists (select 1 from public.lms_courses c where c.id = course_id and c.published and (c.publish_on is null or c.publish_on <= (now() at time zone 'America/Bogota')::date)));

drop policy if exists "lecciones de cursos publicados" on public.lms_lessons;
create policy "lecciones de cursos publicados" on public.lms_lessons
  for select using (exists (select 1 from public.lms_courses c where c.id = course_id and c.published and (c.publish_on is null or c.publish_on <= (now() at time zone 'America/Bogota')::date)));

drop policy if exists "valoraciones visibles" on public.lms_reviews;
create policy "valoraciones visibles" on public.lms_reviews for select using (published);

-- Los 11 cursos del Manual Práctico Ganadero (alojados en mpg.fedegan.org.co hasta cargarlos aquí).
insert into public.lms_courses (slug, title, subtitle, category, level, instructor, cover_image, external_url, external_videos, published, sort_order) values
 ('fundamentos-de-la-ganaderia-colombiana','Fundamentos de la Ganadería Colombiana','Bases históricas, sostenibilidad y cultura sanitaria','Fundamentos','basico','M.V. Esp. Ricardo Arenas Ovalle','/cursos/curso-01.jpg','https://mpg.fedegan.org.co/',8,true,1),
 ('alimentacion-animal-y-manejo-de-praderas','Alimentación Animal y Manejo de Praderas','Praderas, pastoreo, conservación y suplementación','Nutrición y praderas','basico','M.V. Esp. Ricardo Arenas Ovalle','/cursos/curso-02.jpg','https://mpg.fedegan.org.co/',29,true,2),
 ('ganaderia-sostenible-y-medio-ambiente','Ganadería Sostenible y Medio Ambiente','Sistemas silvopastoriles, agua, ecosistemas y energías','Sostenibilidad','basico','M.V. Esp. Ricardo Arenas Ovalle','/cursos/curso-03.jpg','https://mpg.fedegan.org.co/',12,true,3),
 ('salud-animal','Salud Animal','Enfermedades, primeros auxilios y manejo del animal','Sanidad','basico','M.V. Esp. Ricardo Arenas Ovalle','/cursos/curso-04.jpg','https://mpg.fedegan.org.co/',18,true,4),
 ('genetica-y-reproduccion','Genética y Reproducción','Mejoramiento genético, reproducción y biotecnologías','Genética y reproducción','intermedio','M.V. Esp. Ricardo Arenas Ovalle','/cursos/curso-05.jpg','https://mpg.fedegan.org.co/',21,true,5),
 ('etapas-de-la-produccion-ganadera','Etapas de la Producción Ganadera','Cría, levante y ceba del ganado','Producción','basico','M.V. Esp. Ricardo Arenas Ovalle','/cursos/curso-06.jpg','https://mpg.fedegan.org.co/',16,true,6),
 ('productos-de-ganaderia','Productos de Ganadería','Carne, leche, agroindustria cárnica y láctea','Productos','basico','M.V. Esp. Ricardo Arenas Ovalle','/cursos/curso-07.jpg','https://mpg.fedegan.org.co/',24,true,7),
 ('administracion-ganadera','Administración Ganadera','Registros, recurso humano, gremialidad y animales asociados','Administración','intermedio','M.V. Esp. Ricardo Arenas Ovalle','/cursos/curso-08.jpg','https://mpg.fedegan.org.co/',10,true,8),
 ('razas-bovinas','Razas Bovinas','Razas de leche y carne para trópico alto y bajo','Razas','basico','M.V. Esp. Ricardo Arenas Ovalle','/cursos/curso-09.jpg','https://mpg.fedegan.org.co/',4,true,9),
 ('bufalos','Búfalos','Producción, manejo, nutrición y mercados bufaleros','Bufalinos','basico','M.V. Esp. Ricardo Arenas Ovalle','/cursos/curso-10.jpg','https://mpg.fedegan.org.co/',8,true,10),
 ('buenas-practicas-ganaderas-y-sello-ambiental','Buenas Prácticas Ganaderas y Sello Ambiental','BPG, trazabilidad, bienestar animal y sellos NTC-6550','Calidad y certificación','intermedio','M.V. Esp. Ricardo Arenas Ovalle','/cursos/curso-11.jpg','https://mpg.fedegan.org.co/',15,true,11)
on conflict (slug) do nothing;
