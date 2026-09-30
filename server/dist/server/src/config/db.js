"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDB(uri) {
    const dbUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_setu';
    try {
        const conn = await mongoose_1.default.connect(dbUri);
        console.log(`[Database] MongoDB Connected to ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    }
    catch (error) {
        console.error('[Database] Connection Error:', error);
        throw error;
    }
}
async function disconnectDB() {
    await mongoose_1.default.disconnect();
}
