import { Prisma, PrismaClient } from '@prisma/client'
import express from 'express'
import { comparePassword, generateToken, hashPassword, verifyToken } from './utils'
import * as EmailValidator from 'email-validator'
import cookieParser from 'cookie-parser'
import dayjs from 'dayjs'
import * as dotenv from "dotenv"
import cors from 'cors'

const prisma = new PrismaClient()
const app = express()
app.use(cors())
app.use(cookieParser())
app.use(express.json())


dotenv.config();

// --- User
app.post(`/api/register`, async (req, res) => {
  const { name, email, password } = req.body
  if (!(email && password)) {
    res.status(400).send("email and password input is required");
  }
  // Validate:
  // Step 1: email format is valid or not
  const valid = EmailValidator.validate(email);
  if (!valid) {
    return res.status(400).json({
      code: -101,
      error_message: 'email is not valid',
    })
  }
  // Step 2: email is existed or not
  const user = await prisma.user.findFirst({
    where: {
      email: email
    }
  })
  if (user) {
    return res.status(409).send("user is already exist. Please login");
  }
  // Step 3: 
  const password_hash = await hashPassword(password)
  const result = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: password_hash.toString(),
      verified: true,
      createdAt: new Date(),
    },
  })
  res.json(result)
})

app.post(`/api/login`, async (req, res) => {
  console.log(req.cookies);
  const { email, password } = req.body
  const user = await prisma.user.findFirst({
    where: {
      email: email
    }
  })
  const valid = await comparePassword(password, user?.passwordHash as string);
  if (!valid) {
    return res.status(400).json({
      code: -102,
      error_message: 'password and email have mismatch',
    })
  }

  // Generate claim token
  const date = new Date();
  date.setHours(date.getHours() + 6);
  const token = generateToken(email, "6h")
  // Response
  const result = await prisma.authUser.upsert({
    create: {
      email,
      createdAt: new Date(),
      expiredAt: dayjs(date).format('YYYY-MM-DD hh:mm'),
      sessionToken: token
    },
    update: {
      sessionToken: token,
      createdAt: new Date(),
      expiredAt: dayjs(date).format('YYYY-MM-DD hh:mm'),
    },
    where: { email: email }
  })

  res.cookie('token', token, {
    secure: true,
    httpOnly: true,
    expires: date,
    sameSite: 'strict',
  });
  res.json(result)
})

app.post('/api/logout', (req, res) => {
  const authHeader = req.headers['authorization']
  let token = ""
  if (authHeader?.startsWith("Bearer")) {
    token = authHeader?.substring("Bearer ".length)
  }
  console.log('jwt_token11:', token);
  const claim = verifyToken(token)
  console.log('jwt_token:', token, claim)
  res.clearCookie('token');
  res.json({
    code: 0,
    success_message: 'Logout successfully'
  })
});

// -- Videos API
app.get(`/api/videos`, async (req, res) => {
  console.log(req.cookies);
  const params = req.params
  const videos = [
    {
      id: 1,
      url: 'https://www.youtube.com/embed/mzJ4vCjSt28',
      votedup: 0,
      voteddown: 0,
      voted: 0,
      shared_at: '',
      shared_by: 'mr.bichkhe@gmail.com',
      title: 'We are number one csdsfsdfsdfsdfdsfsdf sfdsfsdfsdf',
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s.It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
    },
    {
      id: 2,
      url: 'https://www.youtube.com/embed/09R8_2nJtjg?si=Uzt8W4HpkPPFWFsq',
      votedup: 100,
      voteddown: 10,
      voted: 0,
      shared_at: '',
      shared_by: 'mr.bichkhe@gmail.com',
      title: 'Sugar - Maroon 5',
      description: 'Lorem Ipsum is',
    },
  ]
  res.json(videos)
  // res.send(req.cookies);
})
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

const server = app.listen(9800, () =>
  console.log(`
🚀 Server ready at: http://192.168.0.10:9800`),
)
