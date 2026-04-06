import 'server-only';

const dictionaries = {
    es: () => import('@/dictionaries/es.json').then((module) => module.default),
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
};

export type Dictionary = Awaited<ReturnType<typeof dictionaries.es>>;

export async function getDictionary(lang: string): Promise<Dictionary> {
    // Si el idioma no es soportado, devolvemos el español por defecto
    const loader = dictionaries[lang as keyof typeof dictionaries] || dictionaries.es;
    return loader();
}