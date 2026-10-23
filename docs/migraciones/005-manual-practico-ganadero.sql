-- Contenido del Manual Práctico Ganadero (mpg.fedegan.org.co) cargado como los 11 cursos de la Escuela Virtual.
-- 165 videos de YouTube con título, descripción y duración. Ejecutado una vez en producción; se deja como registro y para repetirlo en otro entorno.
-- Las descripciones que la fuente trae con texto de relleno («En los capítulos X al Y…») se dejan vacías.
-- Bloque 1
delete from public.lms_modules where course_id=(select id from public.lms_courses where slug='fundamentos-de-la-ganaderia-colombiana');
update public.lms_courses set external_url=null, external_videos=0, description=$q$La ganadería moderna, sostenible y rentable tiene en este manual práctico ganadero un gran documento guía que, con lenguaje sencillo pero con total rigurosidad técnica, muestra los conceptos técnicos y las prácticas requeridas en el desarrollo de la ganadería bovina y bufalina tropical.$q$, learn_points=$q$Presentación Proyecto Manual Práctico Ganadero
Importancia Histórica: No nacimos ayer
La Sostenibilidad Ambiental: La naturaleza primero
El Bienestar Animal: Un enfoque productivo
La Cultura Sanitaria: Compromiso y legado
El Concepto de Cadena Láctea: No estamos solos$q$, instructor_bio=$q$Autor del Manual Práctico Ganadero de FEDEGÁN.$q$ where slug='fundamentos-de-la-ganaderia-colombiana';
with m as (insert into public.lms_modules(course_id,title,sort_order) select id,'Videos del bloque',0 from public.lms_courses where slug='fundamentos-de-la-ganaderia-colombiana' returning id,course_id)
insert into public.lms_lessons(module_id,course_id,title,kind,video_url,content,duration_minutes,sort_order)
select m.id,m.course_id,v.t,'video',v.u,v.c,v.d,v.o from m,(values
($q$Presentación Proyecto Manual Práctico Ganadero$q$,$q$https://youtu.be/slD-16BIOag$q$,$q$$q$,8,0),
($q$Importancia Histórica: No nacimos ayer$q$,$q$https://youtu.be/l1woL_jJxOQ$q$,$q$Conozcamos la evolución histórica de la ganadería colombiana y su impacto económico, social y cultural en el desarrollo económico y de la ruralidad del país.$q$,6,1),
($q$La Sostenibilidad Ambiental: La naturaleza primero$q$,$q$https://youtu.be/CPBCqwHPuDI$q$,$q$Descubra la importancia de producir conservando los recursos naturales, integrando rentabilidad, responsabilidad social y equilibrio ambiental.$q$,10,2),
($q$El Bienestar Animal: Un enfoque productivo$q$,$q$https://youtu.be/hTNlNIfotfA$q$,$q$El bienestar animal es piedra angular de la productividad, la calidad y la inocuidad de la producción ganadera, por ello es fundamental conocer las prácticas que reducen el estrés y mejoran el desempeño del hato.$q$,7,3),
($q$La Cultura Sanitaria: Compromiso y legado$q$,$q$https://youtu.be/IezRUDO0Vdw$q$,$q$En este capítulo se enfatiza la prevención, vacunación y bioseguridad como pilares de una ganadería responsable y sostenible.$q$,7,4),
($q$El Concepto de Cadena Láctea: No estamos solos$q$,$q$https://youtu.be/pQlatsxlYYs$q$,$q$No estamos solos, descubra la articulación que debe existir entre productores, industria y consumidores dentro de la cadena de valor láctea.$q$,7,5),
($q$El Concepto de Cadena Cárnica: No estamos solos$q$,$q$https://youtu.be/NFHxK4hj6xQ$q$,$q$No estamos solos, revisemos la integración de los eslabones productivos y comerciales de la cadena cárnica para planificar nuestra producción ganadera.$q$,7,6),
($q$La Gestión del Conocimiento$q$,$q$https://youtu.be/x47G28XtDbk$q$,$q$La gestión del conocimiento con capacitación continua y adopción tecnológica, es la base para mejorar competitividad y sostenibilidad del sector ganadero nacional.$q$,7,7)
) as v(t,u,c,d,o);

-- Bloque 2
delete from public.lms_modules where course_id=(select id from public.lms_courses where slug='alimentacion-animal-y-manejo-de-praderas');
update public.lms_courses set external_url=null, external_videos=0, description=$q$La ganadería moderna, sostenible y rentable tiene en este manual práctico ganadero un gran documento guía que, con lenguaje sencillo pero con total rigurosidad técnica, muestra los conceptos técnicos y las prácticas requeridas en el desarrollo de la ganadería bovina y bufalina tropical.$q$, learn_points=$q$El ganadero agricultor. Alimentación animal
Las praderas y las especies forrajeras
Establecimiento de praderas mejoradas
Análisis de suelos y selección de la especie forrajera
Preparación del terreno
Labranza mínima$q$, instructor_bio=$q$Autor del Manual Práctico Ganadero de FEDEGÁN.$q$ where slug='alimentacion-animal-y-manejo-de-praderas';
with m as (insert into public.lms_modules(course_id,title,sort_order) select id,'Videos del bloque',0 from public.lms_courses where slug='alimentacion-animal-y-manejo-de-praderas' returning id,course_id)
insert into public.lms_lessons(module_id,course_id,title,kind,video_url,content,duration_minutes,sort_order)
select m.id,m.course_id,v.t,'video',v.u,v.c,v.d,v.o from m,(values
($q$El ganadero agricultor. Alimentación animal$q$,$q$https://youtu.be/GHJgPHhDL6I$q$,$q$la ganadería colombiana se basa fundamentalmente en la producción forrajera, por ello siempre debemos ser buenos agricultores para ser buenos ganaderos$q$,4,0),
($q$Las praderas y las especies forrajeras$q$,$q$https://youtu.be/8JiYswXGLxM$q$,$q$Conozcamos las características productivas y nutricionales de gramíneas y leguminosas utilizadas como base alimenticia de nuestra ganadería.$q$,6,1),
($q$Establecimiento de praderas mejoradas$q$,$q$https://youtu.be/dEOPO_TmByI$q$,$q$Conozca los pasos técnicos para implantar praderas de alta productividad.$q$,7,2),
($q$Análisis de suelos y selección de la especie forrajera$q$,$q$https://youtu.be/5ZuWAHHWmDE$q$,$q$En este capítulo se destaca la importancia del diagnóstico de suelos para elegir especies forrajeras adecuadas.$q$,9,3),
($q$Preparación del terreno$q$,$q$https://youtu.be/qmCfxXSGTvY$q$,$q$definamos las labores necesarias para garantizar buena germinación y establecimiento de nuestras praderas.$q$,6,4),
($q$Labranza mínima$q$,$q$https://youtu.be/jLvLMXIQLXI$q$,$q$La conservación del suelo mediante prácticas de mínima intervención con la labranza mínima.$q$,6,5),
($q$Siembra$q$,$q$https://youtu.be/5OOl_S-qQFc$q$,$q$Conozcamos los métodos, densidades y técnicas de establecimiento de praderas para ganadería.$q$,7,6),
($q$Manejo de praderas$q$,$q$https://youtu.be/vd-CHJod2Ek$q$,$q$Las etapas de descanso, recuperación y crecimiento del pasto son diferentes para cada especie de forraje y suelos.$q$,5,7),
($q$División de potreros$q$,$q$https://youtu.be/4dA1XcOahZ0$q$,$q$La importancia de la división para optimizar la rotación y la capacidad de carga animal.$q$,9,8),
($q$Capacidad de carga animal. El aforo$q$,$q$https://youtu.be/Sh8jRUFF6UI$q$,$q$En este capítulo se enseña a calcular la capacidad de carga según disponibilidad forrajera.$q$,6,9),
($q$Modelos de pastoreo$q$,$q$https://youtu.be/ralfjzg843I$q$,$q$Revisemos los diferentes modelos de pastoreo comparando los sistemas continuo, rotacional y racional para seleccionar la mejor opción.$q$,10,10),
($q$Pastos de corte$q$,$q$https://youtu.be/JRI18l9PGiw$q$,$q$Conozcamos las alternativas de forrajes cosechados para suplementación animal, que nos permitan suplementar o complementar la alimentación de los animales en el potrero.$q$,10,11),
($q$Control de plagas y enfermedades$q$,$q$https://youtu.be/xKFhfYGpW0k$q$,$q$Cuidemos nuestras praderas de las diferentes plagas y las enfermedades más comunes$q$,1,12),
($q$Control de malezas$q$,$q$https://youtu.be/6rXizRRytH8$q$,$q$Métodos culturales y químicos para el control de las malezas y arvenses en los cultivos.$q$,11,13),
($q$Plan de fertilización$q$,$q$https://youtu.be/dKdh6MIblyo$q$,$q$En este capítulo se estructura un programa de fertilización técnica y eficiente.$q$,12,14),
($q$Henificación$q$,$q$https://youtu.be/mPNUC5fnc10$q$,$q$La conservación de los forrajes es una estrategia fundamental para utilizar la producción excedentaria en la época de lluvias y utilizarla en las épocas de baja productividad forrajera. Conozcamos la técnica de producción de heno.$q$,8,15),
($q$Ensilaje$q$,$q$https://youtu.be/YOKJF7jqYZA$q$,$q$El ensilaje como una herramienta de conservación de forraje y de suplementación ganadera.$q$,12,16),
($q$Henolaje$q$,$q$https://youtu.be/nW14j6sV8mg$q$,$q$La técnica de producción de henolaje es una herramienta cada día más usada en la alimentación ganadera. Conózcala e impleméntela$q$,8,17),
($q$Relación costo beneficio de la conservación de forrajes$q$,$q$https://youtu.be/Gatw11Ya1XU$q$,$q$Revisemos las ventajas y los requisitos de la conservación de los forrajes.$q$,6,18),
($q$Suplementación para ganado de leche$q$,$q$https://youtu.be/h06NrwythOM$q$,$q$Criterios y usos de la suplementación para las vacas de leche.$q$,17,19),
($q$Suplementación para ganado de carne$q$,$q$https://youtu.be/4wLM-3ldhn4$q$,$q$La suplementación del ganado de carne y su importancia en la ganadería$q$,9,20),
($q$La planificación forrajera. Resumen$q$,$q$https://youtu.be/NTInNPga31g$q$,$q$Repasemos la planificación forrajera como la herramienta que integra los conceptos agronómicos y nutricionales en ganadería$q$,9,21),
($q$Planificación predial$q$,$q$https://youtu.be/NczsmodN4xE$q$,$q$La planificación forrajera permite la organización productiva del predio, optimizando el uso de los recursos en el predio.$q$,12,22),
($q$Fabricación y beneficios de los bloques multinutricionales$q$,$q$https://youtu.be/tWadnECOcqU$q$,$q$Conozcamos la forma correcta de fabricación de bloques multinutricionales como herramienta adicional de nutrición bovina$q$,7,23),
($q$Época de siembra y resiembra de praderas y forrajes$q$,$q$https://youtu.be/t_WFwTVirm4$q$,$q$El momento para establecer o renovar praderas según clima y región es fundamental en el resultado obtenido, conozca las claves de la identificación de las condiciones necesarias para obtener las mejores pasturas.$q$,11,24),
($q$Preparación adecuada de los suelos. Abonamiento y fertilización$q$,$q$https://youtu.be/ZSM4-vgmYaY$q$,$q$La calidad de los suelos y las prácticas de corrección, fertilización y nutrición del suelo son fundamentales$q$,11,25),
($q$Selección de las semillas de pastos y forrajes$q$,$q$https://youtu.be/TMKlX4g66MU$q$,$q$Revisemos como seleccionar las semillas de los pastos y forrajes que debemos sembrar en nuestras fincas ganaderas$q$,6,26),
($q$Mantenimiento de la pradera. Pastoreo y rotación$q$,$q$https://youtu.be/kJG3CnAXZuo$q$,$q$En este capítulo se detalla cómo conservar productividad mediante manejo adecuado del pastoreo.$q$,8,27),
($q$Corte de los forrajes y su utilización$q$,$q$https://youtu.be/kJG3CnAXZuo$q$,$q$Cuale es el momento óptimo de la cosecha del pasto bien sea mediante el pastoreo directo o por corte y suministro.$q$,9,28)
) as v(t,u,c,d,o);

-- Bloque 3
delete from public.lms_modules where course_id=(select id from public.lms_courses where slug='ganaderia-sostenible-y-medio-ambiente');
update public.lms_courses set external_url=null, external_videos=0, description=$q$La ganadería moderna, sostenible y rentable tiene en este manual práctico ganadero un gran documento guía que, con lenguaje sencillo pero con total rigurosidad técnica, muestra los conceptos técnicos y las prácticas requeridas en el desarrollo de la ganadería bovina y bufalina tropical.$q$, learn_points=$q$Sistemas Silvopastoriles. Diseño 1
Sistemas Silvopastoriles. Diseño 2
Uso y cuidado del agua en ganadería
Servicios ecosistémicos en la ganadería
Derribando mitos de la ganadería
Sistemas silvopastoriles al alcance de todos$q$, instructor_bio=$q$Autor del Manual Práctico Ganadero de FEDEGÁN.$q$ where slug='ganaderia-sostenible-y-medio-ambiente';
with m as (insert into public.lms_modules(course_id,title,sort_order) select id,'Videos del bloque',0 from public.lms_courses where slug='ganaderia-sostenible-y-medio-ambiente' returning id,course_id)
insert into public.lms_lessons(module_id,course_id,title,kind,video_url,content,duration_minutes,sort_order)
select m.id,m.course_id,v.t,'video',v.u,v.c,v.d,v.o from m,(values
($q$Sistemas Silvopastoriles. Diseño 1$q$,$q$https://youtu.be/Wp5qbTODkuQ$q$,$q$Aprendamos de ganadería sostenible con base en los sistemas silvopastoriles. Existen diseños diversos que se adaptan a cada finca y ganadero.$q$,10,0),
($q$Sistemas Silvopastoriles. Diseño 2$q$,$q$https://youtu.be/111r1K9diuY$q$,$q$El diseño de sistemas silvopastoriles intensivos nos permite ser más productivos y proteger el medio ambiente.$q$,10,1),
($q$Uso y cuidado del agua en ganadería$q$,$q$https://youtu.be/TzWiV6rO0Yk$q$,$q$Como manejar eficientemente el agua en ganadería$q$,6,2),
($q$Servicios ecosistémicos en la ganadería$q$,$q$https://youtu.be/5zS9swumZSg$q$,$q$Los servicios ecosistémicos que nos brinda la ganadería son cada día más valorados en el mercado. Conozca en que consisten y como acceder a estos mercados.$q$,7,3),
($q$Derribando mitos de la ganadería$q$,$q$https://youtu.be/mAZIJogsi6o$q$,$q$La ganadería ha sido estigmatizada como enemiga del medio ambiente. Conozca como la ganadería sostenible se convierte en una estrategia mundialmente aceptada para revertir y adaptarnos al cambio climático$q$,20,4),
($q$Sistemas silvopastoriles al alcance de todos$q$,$q$https://youtu.be/4bsW-61E7c4$q$,$q$Como implementar un sistema silvopastoril en pequeñas fincas ganaderas$q$,11,5),
($q$Viveros y material vegetal para los sistemas silvopastoriles$q$,$q$https://youtu.be/tnQnSYVQ8HU$q$,$q$Cuál es la importancia y el uso de viveros y material vegetal base en la implementación de sistemas silvopastoriles.$q$,9,6),
($q$Pago por servicios ecosistémicos y mercados de carbono$q$,$q$https://youtu.be/nuTnYJlDMDE$q$,$q$Los mercados de carbono y pagos por servicios ecosistémicos en la producción ganadera.$q$,11,7),
($q$Producción y uso de abonos orgánicos$q$,$q$https://youtu.be/9hZtrOge2Yk$q$,$q$La producción de abonos orgánicos son una estrategia para mejorar la productividad y reducir los costos en la producción ganadera favoreciendo el medio ambiente.$q$,9,8),
($q$Uso de bacterias edáficas en ganadería$q$,$q$https://youtu.be/qxLPwrDmR4A$q$,$q$Como usar las bacterias edáficas en la producción de forrajes en ganadería$q$,7,9),
($q$Uso de lombricultura en ganadería$q$,$q$https://youtu.be/ZchkUWRyPCc$q$,$q$Las lombrices son unos excelentes aliados para el uso de los desechos en beneficio de la producción ganadera.$q$,7,10),
($q$Uso de energías alternativas$q$,$q$https://youtu.be/Ycu0d4IU1qU$q$,$q$La energía solar, la eólica y la producción de gas como estrategias sostenibles en las fincas ganaderas.$q$,11,11)
) as v(t,u,c,d,o);

-- Bloque 4
delete from public.lms_modules where course_id=(select id from public.lms_courses where slug='salud-animal');
update public.lms_courses set external_url=null, external_videos=0, description=$q$La ganadería moderna, sostenible y rentable tiene en este manual práctico ganadero un gran documento guía que, con lenguaje sencillo pero con total rigurosidad técnica, muestra los conceptos técnicos y las prácticas requeridas en el desarrollo de la ganadería bovina y bufalina tropical.$q$, learn_points=$q$Enfermedades de control oficial — Fiebre Aftosa
Enfermedades de control oficial — Brucelosis
Enfermedades de control oficial — Rabia bovina
Enfermedades de control oficial — Tuberculosis bovina
Enfermedades reproductivas
Enfermedades parasitarias. Parásitos internos$q$, instructor_bio=$q$Autor del Manual Práctico Ganadero de FEDEGÁN.$q$ where slug='salud-animal';
with m as (insert into public.lms_modules(course_id,title,sort_order) select id,'Videos del bloque',0 from public.lms_courses where slug='salud-animal' returning id,course_id)
insert into public.lms_lessons(module_id,course_id,title,kind,video_url,content,duration_minutes,sort_order)
select m.id,m.course_id,v.t,'video',v.u,v.c,v.d,v.o from m,(values
($q$Enfermedades de control oficial — Fiebre Aftosa$q$,$q$https://youtu.be/hXfHfzhw64o$q$,$q$La fiebre aftosa es una enfermedad viral de gran impacto en el comercio y la producción ganadera mundial.$q$,13,0),
($q$Enfermedades de control oficial — Brucelosis$q$,$q$https://youtu.be/sCdzISzRnhc$q$,$q$La brucelosis bovina es una enfermedad zoonótica de gran impacto en la producción ganadera. Conozca como se diagnostica y se previene.$q$,12,1),
($q$Enfermedades de control oficial — Rabia bovina$q$,$q$https://youtu.be/2SBSP5nv2xM$q$,$q$la rabia Bovina es otra de las enfermedades de declaración obligatoria en Colombia y que son de alto riesgo sanitario para los bovinos y el humano$q$,10,2),
($q$Enfermedades de control oficial — Tuberculosis bovina$q$,$q$https://youtu.be/8487unbdtMM$q$,$q$La Tuberculosis bovina es una enfermedad zoonótica de gran importancia en nuestra ganadería. Conozca como se diagnostica y las prácticas requeridas para su prevención.$q$,8,3),
($q$Enfermedades reproductivas$q$,$q$https://youtu.be/1GcUerXgx4I$q$,$q$Cuáles son las enfermedades del complejo reproductivo bovino y como prevenirlas$q$,18,4),
($q$Enfermedades parasitarias. Parásitos internos$q$,$q$https://youtu.be/a2HcU-BpVUM$q$,$q$Los parásitos internos en los bovinos como los nematodos reducen la productividad y por consiguiente la rentabilidad ganadera. Aprenda como controlarlos en la ganadería.$q$,16,5),
($q$Enfermedades parasitarias. Parásitos externos$q$,$q$https://youtu.be/cGFMmmlMOTo$q$,$q$Los parásitos externos como las garrapatas, los nuches o las moscas deben controlarse de manera sistemática y constante. Aprenda como hacerlo.$q$,14,6),
($q$Otras enfermedades de importancia en la ganadería nacional$q$,$q$https://youtu.be/76UbWIa99rI$q$,$q$Cuáles son las otras enfermedades que sufren nuestros animales y cómo podemos prevenirlas.$q$,16,7),
($q$Mastitis bovina$q$,$q$https://youtu.be/80wFlFmpVPY$q$,$q$La mastitis bovina es la enfermedad mas costosa de la producción ganadera en el mundo. Aprenda como diagnosticarla y como prevenirla con buenas prácticas de ordeño.$q$,9,8),
($q$Generalidades del animal enfermo$q$,$q$https://youtu.be/kjrVMOFZprg$q$,$q$Como detectar que un bovino está enfermo y sus constantes fisiológicas básicas$q$,9,9),
($q$Primeros auxilios$q$,$q$https://youtu.be/xOml3Lu68Ws$q$,$q$Cuáles son los primeros auxilios que debe tener un animal enfermo$q$,10,10),
($q$El bovino caído$q$,$q$https://youtu.be/bnfhBZan-5c$q$,$q$Al bovino caído se le deteriora rápidamente su salud general. Que debemos hacer en estos casos$q$,9,11),
($q$Diarrea y timpanismo$q$,$q$https://youtu.be/FjoAON9Agb4$q$,$q$La diarrea y el timpanismo son enfermedades comunes en los bovinos, principalmente en animales jóvenes. ¿Que hacer en estos casos?$q$,9,12),
($q$Intoxicaciones y envenenamientos$q$,$q$https://youtu.be/o3DeNzjO8Qs$q$,$q$Que hacer en casos de intoxicaciones y envenenamientos de un bovino.$q$,8,13),
($q$Heridas, mordeduras y traumatismos$q$,$q$https://youtu.be/qufybPJmZhY$q$,$q$En los capítulos 66 al 81 se detallan prácticas de crianza, levante, ceba y manejo productivo por etapas.$q$,5,14),
($q$Manejo del animal. Nudos$q$,$q$https://youtu.be/fPDoELagRbc$q$,$q$Para el correcto manejo de los bovinos es indispensable conocer varios de los nudos que nos permiten sujetarlos y asegurarlos para nuestra seguridad y la de los animales mismos.$q$,6,15),
($q$Manejo del animal — Sujeción y derribe de animales$q$,$q$https://youtu.be/JmHvsIFr4MA$q$,$q$El cuidado animal exige conocer técnicas de manejo, sujeción y derribe de los bovinos.$q$,9,16),
($q$Plan sanitario y buenas prácticas en el uso de medicamentos veterinarios$q$,$q$https://youtu.be/TDT6g6aFN4k$q$,$q$Conozcamos el plan básico sanitario y las normas de un correcto uso de los medicamentos veterinarios$q$,10,17)
) as v(t,u,c,d,o);
-- Bloque 5
delete from public.lms_modules where course_id=(select id from public.lms_courses where slug='genetica-y-reproduccion');
update public.lms_courses set external_url=null, external_videos=0, description=$q$La ganadería moderna, sostenible y rentable tiene en este manual práctico ganadero un gran documento guía que, con lenguaje sencillo pero con total rigurosidad técnica, muestra los conceptos técnicos y las prácticas requeridas en el desarrollo de la ganadería bovina y bufalina tropical.$q$, learn_points=$q$Mejoramiento de nuestra ganadería. Bos indicus y Bos taurus
Diagnóstico genético
Los caracteres genéticos
El biotipo requerido
El cruzamiento
Generalidades y sistemas de reproducción$q$, instructor_bio=$q$Autor del Manual Práctico Ganadero de FEDEGÁN.$q$ where slug='genetica-y-reproduccion';
with m as (insert into public.lms_modules(course_id,title,sort_order) select id,'Videos del bloque',0 from public.lms_courses where slug='genetica-y-reproduccion' returning id,course_id)
insert into public.lms_lessons(module_id,course_id,title,kind,video_url,content,duration_minutes,sort_order)
select m.id,m.course_id,v.t,'video',v.u,v.c,v.d,v.o from m,(values
($q$Mejoramiento de nuestra ganadería. Bos indicus y Bos taurus$q$,$q$https://youtu.be/GbK38_0XpTo$q$,$q$Como implementar un programa de mejoramiento genético en nuestros bovinos, tanto para razas Bos indicus o cebuinas, como Bos taurus o europeas$q$,9,0),
($q$Diagnóstico genético$q$,$q$https://youtu.be/Ux8lvn6gKPY$q$,$q$Como conocer la calidad genética de nuestros animales y realizar un diagnóstico genético adecuado.$q$,8,1),
($q$Los caracteres genéticos$q$,$q$https://youtu.be/oxt-uX_lY_Y$q$,$q$Que son y para qué sirven los caracteres genéticos en los animales$q$,6,2),
($q$El biotipo requerido$q$,$q$https://youtu.be/4CaUjgNkjOo$q$,$q$En la ganadería tropical existe un gran número de ecosistemas; por ello, el ganado debe adaptarse a estos. Conozca cual es el biotipo que se requiere en su finca.$q$,8,3),
($q$El cruzamiento$q$,$q$https://youtu.be/gHc5jf38Pt8$q$,$q$El cruzamiento de animales es la base de todo programa reproductivo y de mejoramiento genético$q$,7,4),
($q$Generalidades y sistemas de reproducción$q$,$q$https://youtu.be/70Q0G2pIT2s$q$,$q$Generalidades de reproducción bovina y los sistemas de reproducción$q$,11,5),
($q$Métodos de detección de celos$q$,$q$https://youtu.be/-blfTgzTfTk$q$,$q$La detección de celos es en muchos casos el talón de Aquiles de los programas reproductivos. Conozcamos los diferentes métodos para su detección$q$,9,6),
($q$Inseminación artificial$q$,$q$https://youtu.be/Tt2D7Ls0XBM$q$,$q$Que es y como implementar un programa de la inseminación artificial en nuestro hato ganadero$q$,9,7),
($q$IATF — Sincronización de celos$q$,$q$https://youtu.be/bCns9Po42x0$q$,$q$Como optimizar los esfuerzos reproductivos mediante técnicas de sincronización de celos e inseminación artificial a término fijo$q$,10,8),
($q$Transferencia de embriones$q$,$q$https://youtu.be/mzREQkz6QRY$q$,$q$En los capítulos 102 al 105 se clasifican razas para trópico alto y bajo en sistemas de leche, carne y doble propósito.$q$,11,9),
($q$El primer servicio: Parámetros a tener en cuenta$q$,$q$https://youtu.be/8QBjtQltEG4$q$,$q$En los capítulos 115 al 122 se desarrollan fundamentos productivos, manejo, nutrición y mercados bufalinos.$q$,7,10),
($q$Diagnóstico de preñez$q$,$q$https://youtu.be/Eswy6SqvFPs$q$,$q$El diagnostico oportuno y adecuado de la preñez, como realizarlo y que beneficios trae para el ganadero.$q$,10,11),
($q$El preparto$q$,$q$https://youtu.be/PR956cbVOYA$q$,$q$Cuáles son los cuidados de la vaca próxima para asegurar un parto adecuado y una lactancia ideal.$q$,9,12),
($q$Problemas durante el parto — Distocias y retención de placenta$q$,$q$https://youtu.be/ffSZjv8wET4$q$,$q$Que es y cómo prevenir las distocias o partos difíciles así como las retenciones de placenta.$q$,9,13),
($q$Problemas durante el parto — Edema e inflamación de ubres$q$,$q$https://youtu.be/EXYTfFn0DOw$q$,$q$El edema posparto parto y la inflamación de la ubre; como prevenirlo y como tratarlo.$q$,1,14),
($q$Monta estacional y época de partos$q$,$q$https://youtu.be/UzHG7ZcPKik$q$,$q$La monta estacional y la época de partos como estrategia de manejo reproductivo$q$,8,15),
($q$La técnica de inseminación artificial e IATF$q$,$q$https://youtu.be/0tPbAYCFyes$q$,$q$Conozca en detalle, la técnica de inseminación artificial y de la IATF$q$,13,16),
($q$La técnica de transferencia de embriones — Embriogan$q$,$q$https://youtu.be/o4uDiSm5KXo$q$,$q$Que es y para qué sirve la transferencia de embriones en un programa de mejoramiento genético. Conozcamos los criterios y prácticas que debemos tener en cuenta$q$,10,17),
($q$Evaluación de la condición corporal del ganado$q$,$q$https://youtu.be/23yUEzIaMp0$q$,$q$La condición corporal y su correcta evaluación es más que un método de evaluar un animal; nos permite desarrollar correctamente un programa reproductivo y de mejoramiento genético$q$,12,18),
($q$Clasificación lineal del ganado. Herramienta de selección$q$,$q$https://youtu.be/E5y2ZpZtFTA$q$,$q$Aprenda como realizar la clasificación lineal en su hato$q$,12,19),
($q$Genotipificación. Qué es y para qué le sirve a los ganaderos$q$,$q$https://youtu.be/gFQz_6_DpMs$q$,$q$La genotipificación y el estudio del genoma como herramienta indispensable en la ganadería moderna$q$,11,20)
) as v(t,u,c,d,o);

-- Bloque 6
delete from public.lms_modules where course_id=(select id from public.lms_courses where slug='etapas-de-la-produccion-ganadera');
update public.lms_courses set external_url=null, external_videos=0, description=$q$La ganadería moderna, sostenible y rentable tiene en este manual práctico ganadero un gran documento guía que, con lenguaje sencillo pero con total rigurosidad técnica, muestra los conceptos técnicos y las prácticas requeridas en el desarrollo de la ganadería bovina y bufalina tropical.$q$, learn_points=$q$Cuidados del recién nacido
Suministro de calostro
Desinfección del ombligo
Pesaje e identificación del recién nacido
La alimentación durante la crianza
El bienestar de las crías. Recomendaciones de manejo$q$, instructor_bio=$q$Autor del Manual Práctico Ganadero de FEDEGÁN.$q$ where slug='etapas-de-la-produccion-ganadera';
with m as (insert into public.lms_modules(course_id,title,sort_order) select id,'Videos del bloque',0 from public.lms_courses where slug='etapas-de-la-produccion-ganadera' returning id,course_id)
insert into public.lms_lessons(module_id,course_id,title,kind,video_url,content,duration_minutes,sort_order)
select m.id,m.course_id,v.t,'video',v.u,v.c,v.d,v.o from m,(values
($q$Cuidados del recién nacido$q$,null,$q$De los cuidados del bovino recién nacido dependen en gran medida la salud del animal durante la lactancia. Aprenda cuales son los cuidados básicos que debemos tener

Video próximamente disponible.$q$,1,0),
($q$Suministro de calostro$q$,$q$https://youtu.be/wA4fMjy6P7w$q$,$q$El calostro es mucho más que una fuente nutricional del recién nacido. Le brinda anticuerpos que le protegen contra muchas enfermedades. Aprendamos como y cuando suministrarlo.$q$,8,1),
($q$Desinfección del ombligo$q$,$q$https://youtu.be/-hsH928Kx18$q$,$q$La desinfección del ombligo es mucho más que una simple curación. Aprendamos todo lo relacionado con esta práctica necesaria para preservar la salud del neonato.$q$,6,2),
($q$Pesaje e identificación del recién nacido$q$,$q$https://youtu.be/J36RZUhWgoU$q$,$q$Porque debemos pesar e identificar los animales recién nacidos. Aprenda las técnicas de identificación mas comunes$q$,9,3),
($q$La alimentación durante la crianza$q$,$q$https://youtu.be/46C8j4Wh1dk$q$,$q$Los requerimientos nutricionales de un animal durante la crianza, varían. En este periodo de transición el animal pasa de ser monogástrico en su fisiología de animal lactante hasta convertirse en un animal rumiante poligástrico y herbívoro.$q$,10,4),
($q$El bienestar de las crías. Recomendaciones de manejo$q$,$q$https://youtu.be/qhtFY9D9oVU$q$,$q$Aprenda las diferentes técnicas de crianza animal$q$,7,5),
($q$Prevención de enfermedades en la crianza$q$,$q$https://youtu.be/k9iyVwCnhfo$q$,$q$Cuáles son las principales enfermedades que sufren los animales en la crianza y como prevenirlas$q$,10,6),
($q$Topizado de los animales$q$,$q$https://youtu.be/skudx1yjI08$q$,$q$Que es el topizado de terneros y que técnicas son las recomendadas para esta práctica$q$,7,7),
($q$Pezones supernumerarios en terneras de reemplazo$q$,$q$https://youtu.be/iVol4q9A3EI$q$,$q$Que son los pezones supernumerarios y qué hacer con nuestras terneras de cría cuando presentan esta condición$q$,5,8),
($q$El destete$q$,$q$https://youtu.be/Jl8VlewrIwY$q$,$q$El destete como proceso de finalización de la lactancia. Cuál es el método correcto para realizarlo.$q$,7,9),
($q$Castración — ¿Por qué no se recomienda hoy? El emasculador$q$,$q$https://youtu.be/x6PfZ9YvCqc$q$,$q$Que se busca con castrar los animales y porque no se recomienda dentro de la ganadería moderna. Como utilizar adecuadamente la emasculación de terneros.$q$,6,10),
($q$Levante de animales de carne$q$,$q$https://youtu.be/cbUwPmtjUf8$q$,$q$La etapa de levante y sus consideraciones en animales destinados a la producción de carne$q$,1,11),
($q$Levante de animales de leche$q$,$q$https://youtu.be/7k6TwyqSqv0$q$,$q$Como realizar el levante de terneras de leche$q$,7,12),
($q$Condición corporal y crecimiento compensatorio$q$,$q$https://youtu.be/WNIrQEEhcAo$q$,$q$Que es el crecimiento compensatorio y como evaluar la condición corporal durante el destete y levante de los animales$q$,7,13),
($q$Ceba y finalización — Un nuevo concepto$q$,$q$https://youtu.be/hVGsOGbJGFs$q$,$q$Cuidados básicos durante la Ceba de animales de carne.$q$,8,14),
($q$Ceba de animales de descarte. Lechería y reproductores viejos$q$,$q$https://youtu.be/A8NJWpEi0sE$q$,$q$Como realizar el engorde de animales de descarte como reproductores viejos.$q$,4,15)
) as v(t,u,c,d,o);

-- Bloque 7
delete from public.lms_modules where course_id=(select id from public.lms_courses where slug='productos-de-ganaderia');
update public.lms_courses set external_url=null, external_videos=0, description=$q$La ganadería moderna, sostenible y rentable tiene en este manual práctico ganadero un gran documento guía que, con lenguaje sencillo pero con total rigurosidad técnica, muestra los conceptos técnicos y las prácticas requeridas en el desarrollo de la ganadería bovina y bufalina tropical.$q$, learn_points=$q$Calidad de la carne
Condiciones de bienestar animal en el transporte y el sacrificio
Ordeño manual, sin apoyo y con apoyo de ternero
Ordeño mecánico, sin apoyo y con apoyo de ternero
Calidad de leche y prácticas adicionales
El establo de ordeño$q$, instructor_bio=$q$Autor del Manual Práctico Ganadero de FEDEGÁN.$q$ where slug='productos-de-ganaderia';
with m as (insert into public.lms_modules(course_id,title,sort_order) select id,'Videos del bloque',0 from public.lms_courses where slug='productos-de-ganaderia' returning id,course_id)
insert into public.lms_lessons(module_id,course_id,title,kind,video_url,content,duration_minutes,sort_order)
select m.id,m.course_id,v.t,'video',v.u,v.c,v.d,v.o from m,(values
($q$Calidad de la carne$q$,$q$https://youtu.be/Uzy2SZ-m2bs$q$,$q$Criterios básicos de calidad de carne que todo ganadero debe saber$q$,9,0),
($q$Condiciones de bienestar animal en el transporte y el sacrificio$q$,$q$https://youtu.be/8I0b-31DMYM$q$,$q$¿Porque el bienestar animal en el transporte de los animales y la correcta técnica de faenado, son determinantes en la calidad de la carne como producto final?$q$,7,1),
($q$Ordeño manual, sin apoyo y con apoyo de ternero$q$,$q$https://youtu.be/1fhkt-xa_vs$q$,$q$El ordeño es el momento de la cosecha de todos los esfuerzos de una finca ganadera de producción de leche. Como realizar un ordeño manual de manera correcta$q$,15,2),
($q$Ordeño mecánico, sin apoyo y con apoyo de ternero$q$,$q$https://youtu.be/JnPDae7Sh8I$q$,$q$El ordeño mecánico  como estrategia exitosa en la cosecha de la leche en la finca ganadera. Conozcamos su uso correcto en las Buenas prácticas de ordeño$q$,17,3),
($q$Calidad de leche y prácticas adicionales$q$,$q$https://youtu.be/prKs2p78JiM$q$,$q$La calidad de la leche es la mayor fortaleza y la ventaja competitiva con que cuentan los productores. Conozcamos a fondo$q$,8,4),
($q$El establo de ordeño$q$,$q$https://youtu.be/bnQxICCIGDI$q$,$q$El sitio de ordeño es fundamental para las buenas practicas de ordeño y la calidad de la leche. Permite las condiciones de bienestar animal y de bienestar de los ordeñadores. Conozcamos cuales son las características que debemos revisar en el establo de ordeño$q$,8,5),
($q$Funcionamiento del equipo de ordeño$q$,$q$https://youtu.be/WkdM-vyVB_w$q$,$q$Como funciona el equipo de ordeño y que debemos tener en cuenta siempre que instalemos y operemos un equipo de ordeño.$q$,10,6),
($q$Mantenimiento del equipo de ordeño$q$,$q$https://youtu.be/SMT2PzVLfFQ$q$,$q$La maquina de ordeño debe tener un programa de mantenimiento para que la salud de la ubre se mantenga y la calidad de la leche sea la mejor. Revisemos ese mantenimiento que requiere nuestro equipo de ordeño$q$,9,7),
($q$Sistematización y robótica$q$,$q$https://youtu.be/lBciV7D3u5o$q$,$q$La innovación y el desarrollo tecnológico ha permitido sistematizar y robotizar muchas de las practicas realizadas en las fincas lecheras. Aquí hay muchas opciones en este sentido.$q$,7,8),
($q$Aseo y desinfección de equipos y utensilios de ordeño$q$,$q$https://youtu.be/7FjX5pitE1U$q$,$q$Descubra la importancia y los principios que debemos asegurar en el aseo y la desinfección de los equipos y utensilios de ordeño para garantizar la calidad de la leche y la salud de la ubre.$q$,9,9),
($q$Almacenamiento y refrigeración de la leche en finca$q$,$q$https://youtu.be/CvwfvQ2ggoY$q$,$q$Aprendamos como almacenar y refrigerar la leche como alternativa de conservación de la calidad$q$,9,10),
($q$Derribando mitos del consumo de carne y leche$q$,$q$https://youtu.be/uC2H6wUu5dE$q$,$q$El consumo de leche y  carne han sido estigmatizados como enemiga del medio ambiente y hasta de la salud humana. Conozca la verdadera calidad nutricional de la carne y la leche como fuentes esenciales de proteína$q$,1,11),
($q$Industria frigorífica. Inocuidad y bienestar animal$q$,$q$https://youtu.be/lhEQPBvIs9o$q$,$q$La industria frigorífica es un aliado fundamental del ganadero. Todo lo que debemos saber los ganaderos sobre esta industria y el bienestar animal$q$,11,12),
($q$Cortes de la carne y asados$q$,$q$https://youtu.be/PEQhEzUHaaQ$q$,$q$Aprendamos los conceptos básicos de los cortes de carne, su preparación y usos y la técnica de un buen asado$q$,10,13),
($q$Embutidos y carnes frías$q$,$q$https://youtu.be/1JqEjDclS8k$q$,$q$Como realizar embutidos y carnes frías como valor agregado de nuestro negocio ganadero$q$,6,14),
($q$Exportación de ganado en pie$q$,$q$https://youtu.be/oMro3r_fV5k$q$,$q$Mitos y realidades del creciente mercado de ganado en pie que se abre para los ganaderos del país.$q$,8,15),
($q$Higienización de la leche$q$,$q$https://youtu.be/669kXIvYn4k$q$,$q$Que es, para que sirve y cuales son los métodos de higienización de la leche$q$,9,16),
($q$Queso campesino y doble crema$q$,$q$https://youtu.be/Q8ZPcqh2B3c$q$,$q$Conozcamos sobre la agroindustria quesera en desarrollo de queso campesino y doble crema. Como es su proceso.$q$,7,17),
($q$Queso costeño y picado salado$q$,$q$https://youtu.be/sYS0asjp_Fw$q$,$q$Como hacer el queso picado salado y el queso costeño.$q$,6,18),
($q$Yogurth y kumis$q$,$q$https://youtu.be/saR15ADfGz8$q$,$q$Como se producen las bebidas lácteas fermentadas; kumis y yogurt como opciones de mercado para el ganadero$q$,5,19),
($q$Quesillo y cuajada$q$,$q$https://youtu.be/QQk4WTkzY6Q$q$,$q$El quesillo y la cuajada son unos derivados muy tradicionales de nuestro sector ganadero. Aqui encuentra el método de su producción$q$,7,20),
($q$Quesos madurados y semimadurados. El queso Paipa$q$,$q$https://youtu.be/0-Taz-5XKys$q$,$q$El queso paipa y en general los quesos semiduros y madurados son una excelente opción para comercializar nuestra leche. Aprendamos de su  proceso de producción$q$,9,21),
($q$Quesería Rural Caqueteña. Modelos de integración$q$,$q$https://youtu.be/2drznH_dwqU$q$,$q$El Pacto Caquetá y el queso Caquetá como modelo de integración. Conózcalo$q$,15,22),
($q$La calidad de la leche en términos ganaderos — Decreto 616 y Resolución 017$q$,$q$https://youtu.be/gfgiIezq3eM$q$,$q$Como medir y controlar la calidad de la leche en términos prácticos.$q$,15,23)
) as v(t,u,c,d,o);

-- Bloque 8
delete from public.lms_modules where course_id=(select id from public.lms_courses where slug='administracion-ganadera');
update public.lms_courses set external_url=null, external_videos=0, description=$q$La ganadería moderna, sostenible y rentable tiene en este manual práctico ganadero un gran documento guía que, con lenguaje sencillo pero con total rigurosidad técnica, muestra los conceptos técnicos y las prácticas requeridas en el desarrollo de la ganadería bovina y bufalina tropical.$q$, learn_points=$q$Registros internos
Registros externos
Sistematización de registros e información
El factor humano y la ganadería
La capacitación y las certificaciones de competencias laborales
La asociatividad y la gremialidad, punto de partida para la sostenibilidad láctea del país$q$, instructor_bio=$q$Autor del Manual Práctico Ganadero de FEDEGÁN.$q$ where slug='administracion-ganadera';
with m as (insert into public.lms_modules(course_id,title,sort_order) select id,'Videos del bloque',0 from public.lms_courses where slug='administracion-ganadera' returning id,course_id)
insert into public.lms_lessons(module_id,course_id,title,kind,video_url,content,duration_minutes,sort_order)
select m.id,m.course_id,v.t,'video',v.u,v.c,v.d,v.o from m,(values
($q$Registros internos$q$,$q$https://youtu.be/YXm81-bNuNg$q$,$q$Implementar registros de información en las fincas ganaderas nos permite medir y mejorar los procesos productivos. Revisemos como funcionan.$q$,12,0),
($q$Registros externos$q$,$q$https://youtu.be/h5lfpVme-q0$q$,$q$La actividad ganadera requiere cumplir unos requisitos y registros externos. Conozca los requisitos y beneficios$q$,9,1),
($q$Sistematización de registros e información$q$,$q$https://youtu.be/U1VNYYtsBK0$q$,$q$La sistematización de la información es fundamental para su mejor análisis. Revisemos cuales son los principales programas ganaderos$q$,10,2),
($q$El factor humano y la ganadería$q$,$q$https://youtu.be/PIH3FreNG1A$q$,$q$Como en toda actividad, la ganadería depende en gran medida de la gestión del talento humano. Revisemos los requisitos y herramientas que tenemos para su correcta administración$q$,10,3),
($q$La capacitación y las certificaciones de competencias laborales$q$,$q$https://youtu.be/gr91L8akJTg$q$,$q$La capacitación del personal de las fincas es un proceso dinámico que debe ser parte integral de nuestra visión de productores. La calidad y profesionalización del talento humano en las fincas es una prioridad$q$,7,4),
($q$La asociatividad y la gremialidad, punto de partida para la sostenibilidad láctea del país$q$,$q$https://youtu.be/mMIkrPjxFNo$q$,$q$La unión hace la fuerza. Descubra como las asociaciones y los gremios aportan al desarrollo ganadero del país$q$,14,5),
($q$Ferias y subastas ganaderas. Su importancia en el desarrollo ganadero$q$,$q$https://youtu.be/BA5mGuQNASM$q$,$q$Las subastas y las ferias ganaderas son mucho mas que puntos de encuentro de ganaderos, son estrategias de comercio, de formación y de alianzas estratégicas que consolidan la ganadería en el país$q$,10,6),
($q$Los equinos$q$,$q$https://youtu.be/fEhjK3RaM3I$q$,$q$Los caballos y la ganadería bovina están y estarán estrechamente ligados, Revisemos el gran aporte de los equinos en el desarrollo ganadero$q$,8,7),
($q$Los caninos$q$,$q$https://youtu.be/U2gxjgx7Jvk$q$,$q$Cual es el papel de los caninos en las fincas ganaderas? Aquí encontraran la respuesta$q$,7,8),
($q$Tecnologías 4G y uso de drones en ganadería$q$,$q$https://youtu.be/nx-9NROv_jY$q$,$q$EL avance tecnológico en tecnologías de punta y el uso de drones también hace parte de la ganadería sostenible y moderna. Aprendamos como utilizar estas nuevas herramientas en beneficio de la producción ganadera$q$,11,9)
) as v(t,u,c,d,o);
-- Bloque 9
delete from public.lms_modules where course_id=(select id from public.lms_courses where slug='razas-bovinas');
update public.lms_courses set external_url=null, external_videos=0, description=$q$La ganadería moderna, sostenible y rentable tiene en este manual práctico ganadero un gran documento guía que, con lenguaje sencillo pero con total rigurosidad técnica, muestra los conceptos técnicos y las prácticas requeridas en el desarrollo de la ganadería bovina y bufalina tropical.$q$, learn_points=$q$Razas de leche para trópico alto
Razas de carne y doble propósito para trópico alto
Razas de leche para trópico bajo
Razas de carne y doble propósito para trópico bajo$q$, instructor_bio=$q$Autor del Manual Práctico Ganadero de FEDEGÁN.$q$ where slug='razas-bovinas';
with m as (insert into public.lms_modules(course_id,title,sort_order) select id,'Videos del bloque',0 from public.lms_courses where slug='razas-bovinas' returning id,course_id)
insert into public.lms_lessons(module_id,course_id,title,kind,video_url,content,duration_minutes,sort_order)
select m.id,m.course_id,v.t,'video',v.u,v.c,v.d,v.o from m,(values
($q$Razas de leche para trópico alto$q$,$q$https://youtu.be/lZ_FRlNKrwU$q$,$q$Conozcamos las ventajas productivas de las diferentes razas de leche europeas adaptadas para nuestra producción Láctea en trópico alto$q$,14,0),
($q$Razas de carne y doble propósito para trópico alto$q$,$q$https://youtu.be/EQ23ut4WVHA$q$,$q$Cuando queremos producir carne o doble propósito en trópico alto debemos conocer que razas se adaptan a estos ecosistemas.$q$,10,1),
($q$Razas de leche para trópico bajo$q$,$q$https://youtu.be/pT2sszQMSOM$q$,$q$Conozcamos las ventajas productivas de las diferentes razas de leche adaptadas al trópico bajo$q$,12,2),
($q$Razas de carne y doble propósito para trópico bajo$q$,$q$https://youtu.be/gPdonwIzcmE$q$,$q$Conozcamos las ventajas productivas de las diferentes razas de leche para nuestra producción Láctea en trópico alto$q$,10,3)
) as v(t,u,c,d,o);

-- Bloque 10
delete from public.lms_modules where course_id=(select id from public.lms_courses where slug='bufalos');
update public.lms_courses set external_url=null, external_videos=0, description=$q$La ganadería moderna, sostenible y rentable tiene en este manual práctico ganadero un gran documento guía que, con lenguaje sencillo pero con total rigurosidad técnica, muestra los conceptos técnicos y las prácticas requeridas en el desarrollo de la ganadería bovina y bufalina tropical.$q$, learn_points=$q$Generalidades de la producción bufalera
Diferencias generales entre búfalos y vacunos
Instalaciones para búfalos
Sanidad y manejo de búfalos
Nutrición y praderas
Reproducción en búfalos$q$, instructor_bio=$q$Autor del Manual Práctico Ganadero de FEDEGÁN.$q$ where slug='bufalos';
with m as (insert into public.lms_modules(course_id,title,sort_order) select id,'Videos del bloque',0 from public.lms_courses where slug='bufalos' returning id,course_id)
insert into public.lms_lessons(module_id,course_id,title,kind,video_url,content,duration_minutes,sort_order)
select m.id,m.course_id,v.t,'video',v.u,v.c,v.d,v.o from m,(values
($q$Generalidades de la producción bufalera$q$,$q$https://youtu.be/ytqPkFT5MM4$q$,$q$La ganadería bovina en Colombia incluye cada vez mas a los bufalinos. Conozcamos las ventajas productivas de estos animales$q$,9,0),
($q$Diferencias generales entre búfalos y vacunos$q$,$q$https://youtu.be/rOVVm0RN9Uk$q$,$q$Aunque son bovinos, los búfalos tienen varias diferencias y requerimientos distintos a los que conocemos tradicionalmente de nuestras vacas.$q$,6,1),
($q$Instalaciones para búfalos$q$,$q$https://youtu.be/DWdroFGZ51o$q$,$q$Por su comportamiento y su tamaño, el búfalo requiere instalaciones que se adapten a sus condiciones productivas. Conozcalas$q$,4,2),
($q$Sanidad y manejo de búfalos$q$,$q$https://youtu.be/F_ue_HAJSvQ$q$,$q$A pesar de ser animales muy resistentes, el manejo sanitario de los búfalos requiere varias condiciones para su adecuado manejo. Aquí las puede encontrar.$q$,7,3),
($q$Nutrición y praderas$q$,$q$https://youtu.be/jlTJTUHmuSA$q$,$q$El manejo de los potreros y las praderas, así como los requerimientos nutricionales en ganadería bufalina es una de las condiciones que varían de nuestro conocimiento tradicional ganadero.$q$,7,4),
($q$Reproducción en búfalos$q$,$q$https://youtu.be/vmqaZeYMMVs$q$,$q$Siendo los búfalos animales muy fértiles, su reproducción debe ser manejada correctamente y atendiendo a sus diferencias con la ganadería vacuna.$q$,9,5),
($q$Mercados de leche de búfala$q$,$q$https://youtu.be/Xw28u1IlQYo$q$,$q$Una de las líneas de producción de la ganadería bufalina es la producción de leche usada principalmente en la industria quesera y de derivados. Aprendamos sobre este renglón de la producción$q$,10,6),
($q$Mercados de carne de búfalos y búfalos de labor$q$,$q$https://youtu.be/WlZOHxv8RtU$q$,$q$La carne de búfalo gana espacios y debemos conocer este mercado para participar de él. Aquí las generalidades del mercado de carne bufalina.$q$,7,7)
) as v(t,u,c,d,o);

-- Bloque 11
delete from public.lms_modules where course_id=(select id from public.lms_courses where slug='buenas-practicas-ganaderas-y-sello-ambiental');
update public.lms_courses set external_url=null, external_videos=0, description=$q$La ganadería moderna, sostenible y rentable tiene en este manual práctico ganadero un gran documento guía que, con lenguaje sencillo pero con total rigurosidad técnica, muestra los conceptos técnicos y las prácticas requeridas en el desarrollo de la ganadería bovina y bufalina tropical.$q$, learn_points=$q$Buenas prácticas ganaderas — Las instalaciones
Buenas prácticas ganaderas — Plan de saneamiento
Buenas prácticas ganaderas — Almacenamiento de insumos
Buenas prácticas ganaderas — Sanidad animal y bioseguridad. Hato libre
Buenas prácticas ganaderas — Trazabilidad
Buenas prácticas ganaderas — BP en uso de medicamentos y BP en alimentación$q$, instructor_bio=$q$Autor del Manual Práctico Ganadero de FEDEGÁN.$q$ where slug='buenas-practicas-ganaderas-y-sello-ambiental';
with m as (insert into public.lms_modules(course_id,title,sort_order) select id,'Videos del bloque',0 from public.lms_courses where slug='buenas-practicas-ganaderas-y-sello-ambiental' returning id,course_id)
insert into public.lms_lessons(module_id,course_id,title,kind,video_url,content,duration_minutes,sort_order)
select m.id,m.course_id,v.t,'video',v.u,v.c,v.d,v.o from m,(values
($q$Buenas prácticas ganaderas — Las instalaciones$q$,$q$https://youtu.be/ItNRzebNwC0$q$,$q$Las Buenas prácticas ganaderas BPG s son una normatividad nacional que nos permite mejorar nuestra producción ganadera y hacerla más sostenible. Empecemos a conocerlas desde las necesidades de las instalaciones ganaderas$q$,12,0),
($q$Buenas prácticas ganaderas — Plan de saneamiento$q$,$q$https://youtu.be/KIICoAIM9Uk$q$,$q$Conozca los requisitos de un plan de saneamiento básico acorde a la norma de Buenas prácticas ganaderas$q$,7,1),
($q$Buenas prácticas ganaderas — Almacenamiento de insumos$q$,$q$https://youtu.be/ClYV9mYJiM4$q$,$q$Conozca los requisitos del almacenamiento de los insumos teniendo en cuenta la norma de Buenas prácticas ganaderas$q$,6,2),
($q$Buenas prácticas ganaderas — Sanidad animal y bioseguridad. Hato libre$q$,$q$https://youtu.be/fyTgJhRvQaQ$q$,$q$Conozca los requisitos de un plan sanitario que preserve la salud de nuestros animales acorde a la norma de Buenas prácticas ganaderas$q$,6,3),
($q$Buenas prácticas ganaderas — Trazabilidad$q$,$q$https://youtu.be/rYvwdvYSR_w$q$,$q$Conozca los requisitos de trazabilidad requeridos en la norma de Buenas prácticas ganaderas$q$,6,4),
($q$Buenas prácticas ganaderas — BP en uso de medicamentos y BP en alimentación$q$,$q$https://youtu.be/JIjhmYok5EY$q$,$q$Conozca los requisitos para usar correctamente los medicamentos y los insumos alimenticios de los animales según la norma de Buenas prácticas ganaderas$q$,7,5),
($q$Buenas prácticas ganaderas — BP en el ordeño$q$,$q$https://youtu.be/UUgAzBA-hsQ$q$,$q$Las Buenas prácticas de ordeño son indispensables para preservar la salud de la ubre y aumentar la productividad$q$,11,6),
($q$Buenas prácticas ganaderas — Bienestar Animal$q$,$q$https://youtu.be/965rBNi0iD4$q$,$q$Conozca los requisitos del cuidado en bienestar animal dentro de la norma de Buenas prácticas ganaderas$q$,9,7),
($q$Buenas prácticas ganaderas — Transporte Animal$q$,$q$https://youtu.be/GejoHwE2tNw$q$,$q$Conozca los requisitos necesarios en el transporte de animales en pie acorde a la norma de Buenas prácticas ganaderas$q$,9,8),
($q$Buenas prácticas ganaderas — Personal y BP$q$,$q$https://youtu.be/r2nJcMIoVh0$q$,$q$Conozca los requisitos del manejo de personal acorde a la norma de Buenas prácticas ganaderas$q$,6,9),
($q$Sellos diferenciadores de nuestra producción. NTC-6550 — RNSC Principio 1$q$,$q$https://youtu.be/QsuCt5bT8Yw$q$,$q$La diferenciación de nuestras fincas y productos es una estrategia cada día más importante para los mercados. Conozca que es el sello ambiental colombiano norma NTC 6550 y como cumplir con cada uno de sus principios. El primero de la norma nos habla de la responsabilidad ambiental y el uso y conservación de los recursos naturales$q$,12,10),
($q$Sellos diferenciadores de nuestra producción. NTC-6550 — RNSC Principio 2$q$,$q$https://youtu.be/QP4c0KlPLbw$q$,$q$Conozca lo que se requiere en la norma técnica del sello ambiental colombiano en relación al principio 2 o del uso de mejores prácticas ganaderas en armonía con el medio ambiente$q$,7,11),
($q$Sellos diferenciadores de nuestra producción. NTC-6550 — RNSC Principio 3$q$,$q$https://youtu.be/XBgMwJDSXXk$q$,$q$Conozca lo que se requiere en la norma técnica del sello ambiental colombiano en relación al tercer principio que desarrolla las buenas prácticas ganaderas y su normativa ante el ICA$q$,7,12),
($q$Sellos diferenciadores de nuestra producción. NTC-6550 — RNSC Principio 4$q$,$q$https://youtu.be/auUyb3edOoI$q$,$q$Conozca lo que se requiere en la norma técnica del sello ambiental colombiano en relación al cuarto principio 2 que se refiere a la responsabilidad de los ganaderos con los trabajadores de la finca y el cumplimiento de la legislación laboral vigente$q$,6,13),
($q$Despedida 2025$q$,$q$https://youtu.be/MSkgXzYoDio$q$,$q$El capítulo de cierre de esta temporada hace un resumen de los temas vistos$q$,6,14)
) as v(t,u,c,d,o);
update public.lms_lessons set content='' where content like 'En los capítulos % al % se %';
update public.lms_lessons set free_preview = (sort_order = 0);
