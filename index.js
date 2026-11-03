const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración básica del proxy redireccionador
app.use('/service', createProxyMiddleware({
    target: 'https://google.com', // Base por defecto si falla la petición
    changeOrigin: true,
    router: function(req) {
        try {
            // Decodifica la URL encriptada en Base64 que envía tu frontend
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
    }
}));

app.get('/', (req, res) => {
    res.send('Pincho Engine está activo y funcionando de forma segura.');
});

app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
