"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseProviders = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const tablesList_1 = require("../tablesList");
const config_develpoment_1 = require("../config/config.develpoment");
const dotenv = __importStar(require("dotenv"));
const config_production_1 = require("../config/config.production");
dotenv.config({ path: '.env', quiet: true });
const environment = process.env.TYPE ?? 'local';
exports.databaseProviders = [
    {
        provide: 'SEQUELIZE',
        useFactory: () => {
            const sequelize = new sequelize_typescript_1.Sequelize(environment == 'local' ? config_develpoment_1.config_dev.database : config_production_1.config_prod.database);
            sequelize.addModels([...tablesList_1.TableList]);
            return sequelize;
        },
    },
];
//# sourceMappingURL=database.providers.js.map