"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPutRequestDto = void 0;
const class_validator_1 = require("class-validator");
class UserPutRequestDto {
    name;
    mobile;
    email;
    password;
}
exports.UserPutRequestDto = UserPutRequestDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'User name is required' }),
    (0, class_validator_1.IsString)({ message: 'User name must be a string' }),
    __metadata("design:type", String)
], UserPutRequestDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'User mobile is required' }),
    (0, class_validator_1.IsString)({ message: 'User mobile must be a string' }),
    __metadata("design:type", String)
], UserPutRequestDto.prototype, "mobile", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email address is required' }),
    (0, class_validator_1.IsString)({ message: 'Email address must be a string' }),
    __metadata("design:type", String)
], UserPutRequestDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.password !== undefined),
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    __metadata("design:type", String)
], UserPutRequestDto.prototype, "password", void 0);
//# sourceMappingURL=userPutRequest.dto.js.map