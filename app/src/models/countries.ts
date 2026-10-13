// País de los pilotos: código ISO 3166-1 alfa-2 (para la bandera), nombre y alias reconocidos.
// Los alias incluyen gentilicios para que datos cargados como "Española" se muestren como "España".
const COUNTRIES: [string, string, string[]][] = [
  ['ar', 'Argentina', ['argentino', 'argentina']],
  ['au', 'Australia', ['australiano', 'australiana']],
  ['at', 'Austria', ['austriaco', 'austriaca']],
  ['be', 'Bélgica', ['belga']],
  ['br', 'Brasil', ['brasileno', 'brasilena']],
  ['ca', 'Canadá', ['canadiense']],
  ['ch', 'Suiza', ['suizo', 'suiza']],
  ['cl', 'Chile', ['chileno', 'chilena']],
  ['cn', 'China', ['chino', 'china']],
  ['co', 'Colombia', ['colombiano', 'colombiana']],
  ['cz', 'República Checa', ['checo', 'checa', 'chequia']],
  ['de', 'Alemania', ['aleman', 'alemana']],
  ['dk', 'Dinamarca', ['danes', 'danesa']],
  ['ee', 'Estonia', ['estonio', 'estonia']],
  ['es', 'España', ['espanol', 'espanola']],
  ['fi', 'Finlandia', ['finlandes', 'finlandesa']],
  ['fr', 'Francia', ['frances', 'francesa']],
  ['gb', 'Reino Unido', ['britanico', 'britanica', 'ingles', 'inglesa', 'inglaterra', 'gran bretana', 'escocia', 'gales']],
  ['ie', 'Irlanda', ['irlandes', 'irlandesa']],
  ['il', 'Israel', ['israeli']],
  ['in', 'India', ['indio', 'india']],
  ['id', 'Indonesia', ['indonesio', 'indonesia']],
  ['it', 'Italia', ['italiano', 'italiana']],
  ['jp', 'Japón', ['japones', 'japonesa']],
  ['mc', 'Mónaco', ['monegasco', 'monegasca']],
  ['mx', 'México', ['mexicano', 'mexicana']],
  ['my', 'Malasia', ['malasio', 'malasia']],
  ['nl', 'Países Bajos', ['neerlandes', 'neerlandesa', 'holandes', 'holandesa', 'holanda']],
  ['no', 'Noruega', ['noruego', 'noruega']],
  ['nz', 'Nueva Zelanda', ['neozelandes', 'neozelandesa']],
  ['pe', 'Perú', ['peruano', 'peruana']],
  ['pl', 'Polonia', ['polaco', 'polaca']],
  ['pt', 'Portugal', ['portugues', 'portuguesa']],
  ['ru', 'Rusia', ['ruso', 'rusa']],
  ['se', 'Suecia', ['sueco', 'sueca']],
  ['th', 'Tailandia', ['tailandes', 'tailandesa']],
  ['us', 'Estados Unidos', ['estadounidense', 'norteamericano', 'norteamericana', 'eeuu', 'usa']],
  ['uy', 'Uruguay', ['uruguayo', 'uruguaya']],
  ['ve', 'Venezuela', ['venezolano', 'venezolana']],
  ['za', 'Sudáfrica', ['sudafricano', 'sudafricana']],
];

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

const BY_ALIAS: Record<string, { code: string; name: string }> = {};
for (const [code, name, aliases] of COUNTRIES) {
  for (const alias of [name, ...aliases]) BY_ALIAS[normalize(alias)] = { code, name };
}

// Devuelve el país reconocido, o null si el texto no coincide con ninguno
export function findCountry(text: string) {
  return BY_ALIAS[normalize(text)] ?? null;
}

// Nombre del país para mostrar; si no se reconoce, el texto tal cual
export function countryName(text: string) {
  return findCountry(text)?.name ?? text;
}
