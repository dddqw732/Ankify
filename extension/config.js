// Environment configuration
const ENV = {
    development: {
        API_URL: 'http://localhost:3000',
        SUPABASE_URL: 'https://wskjthllgmigrmmnuhct.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indza2p0aGxsZ21pZ3JtbW51aGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTY5NzAsImV4cCI6MjA4MzAzMjk3MH0.RVpjydaebRIS_fLugj-gxd8mWaRNBGMz7OjKDgsqbio'
    },
    production: {
        API_URL: 'https://ankify-ai.vercel.app',
        SUPABASE_URL: 'https://wskjthllgmigrmmnuhct.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indza2p0aGxsZ21pZ3JtbW51aGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTY5NzAsImV4cCI6MjA4MzAzMjk3MH0.RVpjydaebRIS_fLugj-gxd8mWaRNBGMz7OjKDgsqbio'
    }
};

// Auto-detect environment based on API_URL availability
const getCurrentEnv = () => {
    // Default to production for distributed extension
    return 'production';
};

const currentEnv = getCurrentEnv();
const config = ENV[currentEnv];

// Export configuration
window.ANKIFY_CONFIG = {
    API_URL: config.API_URL,
    SUPABASE_URL: config.SUPABASE_URL,
    SUPABASE_ANON_KEY: config.SUPABASE_ANON_KEY,
    ENV: currentEnv
};
