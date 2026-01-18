"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProvider = void 0;
const user_entity_1 = require("../entity/user.entity");
exports.UserProvider = [
    {
        provide: 'USER_REPOSITORY',
        useValue: user_entity_1.User,
    },
];
//# sourceMappingURL=user.provider.js.map