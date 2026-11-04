const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

app.use('/service', createProxyMiddleware({
    target: 'https://google.com',
    changeOrigin: true,
    router: function(req) {
        try {
            const base64Url = req.url.split('/').pop();
            const decodedUrl = Buffer.from(base64Url, 'base64').toString('ascii');
            return new URL(decodedUrl).origin;
        } catch (e) {
            return 'https://google.com';
        }
    },
    pathRewrite: function(path, req) {
        try {
            const base64Url = path.split('/').pop();
            const decodedUrl = Buffer.from(base64Url, 'base64').toString('ascii');
            return new URL(decodedUrl).pathname + new URL(decodedUrl).search;
        } catch (e) {
            return path;
        }
    },
    // INTERCEPTAMOS LA RESPUESTA PARA ELIMINAR LOS BLOQUEOS DE IFRAME
    on: {
        proxyRes: function(proxyRes, req, res) {
            // Eliminamos las reglas de seguridad que bloquean la conexión interna
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
            
            // Permitimos el acceso total desde tu web de Vercel
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('X-Frame-Options', 'ALLOWALL');
        }
    }
}));

app.get('/', (req, res) => {
    res.send('Pincho Engine está activo y rompiendo bloqueos.');
});

app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
