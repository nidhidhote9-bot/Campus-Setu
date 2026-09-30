"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./config/db");
const apiRoutes_1 = __importDefault(require("./routes/apiRoutes"));
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
// API Routes
exports.app.use('/api/v1', apiRoutes_1.default);
// Serve client static build in production mode if exists
const clientDistPath = path_1.default.join(__dirname, '../../client/dist');
exports.app.use(express_1.default.static(clientDistPath));
exports.app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api'))
        return next();
    res.sendFile(path_1.default.join(clientDistPath, 'index.html'), (err) => {
        if (err) {
            res.status(200).send('CampusSetu API Server Running. Client SPA available at dev server port 5173.');
        }
    });
});
const PORT = process.env.PORT || 5000;
if (require.main === module) {
    (0, db_1.connectDB)().then(() => {
        exports.app.listen(PORT, () => {
            console.log(`[CampusSetu Monolith] Express Server listening on http://localhost:${PORT}`);
        });
    }).catch((err) => {
        console.error('Failed to start server:', err);
    });
}
