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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var express_1 = __importDefault(require("express"));
var utils_1 = require("./utils");
var EmailValidator = __importStar(require("email-validator"));
var prisma = new client_1.PrismaClient();
var app = (0, express_1.default)();
app.use(express_1.default.json());
// --- User
// export type UserCreateInput = {
//   email: string
//   name?: string | null
//   passwordHash: string
//   verified: boolean
//   createdAt?: Date | string
//   videos?: VideoCreateNestedManyWithoutAuthorInput
// }
app.post("/api/register", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, email, password, valid, user, password_hash, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, email = _a.email, password = _a.password;
                valid = EmailValidator.validate(email);
                if (!valid) {
                    return [2 /*return*/, res.json({
                            code: -101,
                            error_message: 'Email is not valid',
                        })];
                }
                user = prisma.user.findFirst({
                    select: email
                });
                return [4 /*yield*/, (0, utils_1.hashPassword)(password)];
            case 1:
                password_hash = _b.sent();
                return [4 /*yield*/, prisma.user.create({
                        data: {
                            name: name,
                            email: email,
                            passwordHash: password_hash.toString(),
                            verified: true,
                            createdAt: new Date(),
                        },
                    })];
            case 2:
                result = _b.sent();
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
app.post("/api/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, email, password, password_hash, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, email = _a.email, password = _a.password;
                return [4 /*yield*/, (0, utils_1.hashPassword)(password)];
            case 1:
                password_hash = _b.sent();
                return [4 /*yield*/, prisma.user.create({
                        data: {
                            name: name,
                            email: email,
                            passwordHash: password_hash.toString(),
                            verified: true,
                            createdAt: new Date(),
                        },
                    })];
            case 2:
                result = _b.sent();
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
// app.post(`/post`, async (req, res) => {
//   const { title, content, authorEmail } = req.body
//   const result = await prisma.post.create({
//     data: {
//       title,
//       content,
//       author: { connect: { email: authorEmail } },
//     },
//   })
//   res.json(result)
// })
// app.put('/post/:id/views', async (req, res) => {
//   const { id } = req.params
//   try {
//     const post = await prisma.post.update({
//       where: { id: Number(id) },
//       data: {
//         viewCount: {
//           increment: 1,
//         },
//       },
//     })
//     res.json(post)
//   } catch (error) {
//     res.json({ error: `Post with ID ${id} does not exist in the database` })
//   }
// })
// app.put('/publish/:id', async (req, res) => {
//   const { id } = req.params
//   try {
//     const postData = await prisma.post.findUnique({
//       where: { id: Number(id) },
//       select: {
//         published: true,
//       },
//     })
//     const updatedPost = await prisma.post.update({
//       where: { id: Number(id) || undefined },
//       data: { published: !postData?.published },
//     })
//     res.json(updatedPost)
//   } catch (error) {
//     res.json({ error: `Post with ID ${id} does not exist in the database` })
//   }
// })
// app.delete(`/post/:id`, async (req, res) => {
//   const { id } = req.params
//   const post = await prisma.post.delete({
//     where: {
//       id: Number(id),
//     },
//   })
//   res.json(post)
// })
// app.get('/users', async (req, res) => {
//   const users = await prisma.user.findMany()
//   res.json(users)
// })
// app.get('/user/:id/drafts', async (req, res) => {
//   const { id } = req.params
//   const drafts = await prisma.user
//     .findUnique({
//       where: {
//         id: Number(id),
//       },
//     })
//     .posts({
//       where: { published: false },
//     })
//   res.json(drafts)
// })
// app.get(`/post/:id`, async (req, res) => {
//   const { id }: { id?: string } = req.params
//   const post = await prisma.post.findUnique({
//     where: { id: Number(id) },
//   })
//   res.json(post)
// })
// app.get('/feed', async (req, res) => {
//   const { searchString, skip, take, orderBy } = req.query
//   const or: Prisma.PostWhereInput = searchString
//     ? {
//       OR: [
//         { title: { contains: searchString as string } },
//         { content: { contains: searchString as string } },
//       ],
//     }
//     : {}
//   const posts = await prisma.post.findMany({
//     where: {
//       published: true,
//       ...or,
//     },
//     include: { author: true },
//     take: Number(take) || undefined,
//     skip: Number(skip) || undefined,
//     orderBy: {
//       updatedAt: orderBy as Prisma.SortOrder,
//     },
//   })
//   res.json(posts)
// })
var server = app.listen(9800, function () {
    return console.log("\n\uD83D\uDE80 Server ready at: http://192.168.0.10:9800");
});
//# sourceMappingURL=index.js.map