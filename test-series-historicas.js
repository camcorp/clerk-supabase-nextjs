"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarCompania = buscarCompania;
exports.obtenerDatosReporte = obtenerDatosReporte;
var fs = require("fs");
var path = require("path");
// Función para cargar y parsear el archivo JSON
function cargarDatos() {
    try {
        var filePath = path.join(__dirname, 'docs', 'ejemplo.json');
        var data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error al cargar el archivo:', error);
        return [];
    }
}
// Función para buscar una compañía por RUT
function buscarCompania(reportes, rutcia) {
    var _a, _b;
    for (var _i = 0, reportes_1 = reportes; _i < reportes_1.length; _i++) {
        var reporte = reportes_1[_i];
        var companias = ((_b = (_a = reporte.datos_reporte) === null || _a === void 0 ? void 0 : _a.reportData) === null || _b === void 0 ? void 0 : _b.companias) || [];
        var compania = companias.find(function (c) { return c.rutcia === rutcia; });
        if (compania) {
            return compania;
        }
    }
    return null;
}
// Script simple para obtener datos_reporte de la API
function obtenerDatosReporte(rut) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, datosReporte, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    console.log("Obteniendo datos para RUT: ".concat(rut));
                    return [4 /*yield*/, fetch("http://localhost:3000/api/reportes/".concat(rut, "?periodo=202412"))];
                case 1:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("Error ".concat(response.status, ": ").concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _b.sent();
                    datosReporte = data.success ? (_a = data.reporte) === null || _a === void 0 ? void 0 : _a.datos_reporte : data.datos_reporte;
                    console.log('datos_reporte:', JSON.stringify(datosReporte, null, 2));
                    return [2 /*return*/, datosReporte];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error:', error_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Ejecutar con un RUT de ejemplo
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var rut;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rut = '99147000K';
                    return [4 /*yield*/, obtenerDatosReporte(rut)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Ejecutar si es el archivo principal
if (require.main === module) {
    main();
}
