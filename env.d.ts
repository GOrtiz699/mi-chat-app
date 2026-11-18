/*env.d.ts  es un archivo de declaración de tipos para TypeScript , no genera código,
solo le dice al compilador "esto existe y tiene esta forma".
Sin este archivo TypeScript no sabe qué es process en un proyecto Expo/React Native,
, entonces marca error en cualquier línea que use process.env.
*/
declare const process:{
    env: {
        readonly EXPO_PUBLIC_SUPABASE_URL:  string;
        readonly EXPO_PUBLIC_SUPABASE_ANON_KEY:  string;
        readonly [key: string]:  string | undefined;
    };
};