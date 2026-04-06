import { redirect } from 'next/navigation';

// La página raíz redirige al idioma por defecto.
// El middleware también hace esto, pero esta es una capa de seguridad extra.
export default function RootPage() {
  redirect('/es');
}