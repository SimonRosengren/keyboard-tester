import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt'
  ],
  supabase: {
    // You'll get these values from your Supabase dashboard
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/history'],
      cookieOptions: {
        maxAge: 60 * 60 * 8, // 8 hours
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
