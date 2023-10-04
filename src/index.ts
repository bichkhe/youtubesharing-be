
import express from 'express'
import { comparePassword, generateToken, hashPassword, verifyToken } from './utils'
import * as EmailValidator from 'email-validator'
import cookieParser from 'cookie-parser'
import dayjs from 'dayjs'
import * as dotenv from "dotenv"
import cors from 'cors'
import { prisma, VoteKind } from './prisma'
import authMiddleware from './middlewars/auth'
import { Video, VideoStatus } from '@prisma/client'
import { IVideo, VideoResponse } from './model'

const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(authMiddleware)


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
    return res.status(409).send(
      {
        code: -101,
        error_message: 'email is already exist. Please login',
      });
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

app.post('/api/logout', async (req, res) => {
  const email = res.locals.email
  const authHeader = req.headers['authorization']
  let token = ""
  if (authHeader?.startsWith("Bearer")) {
    token = authHeader?.substring("Bearer ".length)
  }
  console.log('jwt_token11:', token);
  const claim = verifyToken(token)
  console.log('jwt_token:', token, claim)
  await prisma.authUser.delete({
    where: {
      email: email,
    }
  })
  res.clearCookie('token');
  res.json({
    code: 0,
    success_message: 'Logout successfully'
  })
});

// -- Videos API
app.get(`/api/videos`, async (req, res) => {
  const { page, pageSize } = req.query
  const pageSizeQ = parseInt(pageSize as string) > 0 ? parseInt(pageSize as string) : 10
  const pageQ = page as unknown as number >= 1 ? page : 1
  const skip = ((pageQ as number - 1) * (pageSizeQ as number)) as number;
  const email = res.locals.email
  console.log(pageQ, pageSizeQ, skip)
  let videos = await prisma.video.findMany({
    skip: skip,
    take: pageSizeQ,
    where: {
      published: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
  const user = await prisma.user.findFirst({
    where: {
      email: res.locals.email
    }
  })
  if (!user) {
    return res.status(400).json({
      code: -1111,
      error_message: ""
    })
  }

  let videosIds: number[] = []
  videos.forEach((item) => {
    videosIds.push(item.id)
  })
  // console.log('videos:', videos)
  if (!email) {
    const videoStatusRecords = await prisma.videoStatus.findMany({
      where: {
        userID: user.id,
        videoID: { in: videosIds }
      }
    })

    let videosFinal: IVideo[] = videos
    videosFinal.map((item: IVideo) => {
      const idx = videoStatusRecords.find((it: VideoStatus) => it.videoID == item.id)
      if (idx) {
        item.voted = idx.vote
      }
    })
    console.log('videosFinal:', videosFinal)
    return res.json(
      videosFinal
    )
  }
  res.json(videos)
})

app.post(`/api/videos/sharing`, async (req, res) => {
  const { linkUrl, title, content } = req.body;
  const createdAt = dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  console.log('email:', res.locals.email)
  const user = await prisma.user.findFirst({
    where: {
      email: res.locals.email
    }
  })

  if (!user) {
    return res.status(400).json({
      code: -1111,
      error_message: ""
    })
  }

  let video = {
    createdAt: createdAt,
    linkUrl: linkUrl,
    updatedAt: createdAt,
    title: title,
    content: content,
    viewCount: 0,
    authorId: user.id,
    votedUp: 0,
    votedDown: 0,
    published: true,
    email: user.email,
  }
  const videoCreated = await prisma.video.create({
    data: video
  })
  console.log('videoCreated:', videoCreated, video)
  res.json(videoCreated)
})
app.post(`/api/videos/vote`, async (req, res) => {
  const { vote, id } = req.body;
  console.log('email:', res.locals.email)


  const valid = ["UP", "DOWN"].includes(vote)
  if (!valid) {
    return res.status(400).json({
      code: -1111,
      error_message: "Bad request: vote field must be UP or DOWN"
    })
  }
  const user = await prisma.user.findFirst({
    where: {
      email: res.locals.email
    }
  })
  if (!user) {
    return res.status(400).json({
      code: -1111,
      error_message: ""
    })
  }
  const videoFound = await prisma.video.findFirst({
    where: {
      id: id,
    }
  })
  if (!videoFound) {
    return res.status(400).json({
      code: -1111,
      error_message: "not found video"
    })
  }
  let votedUp = videoFound?.votedUp as number
  let votedDown = videoFound?.votedDown as number
  if (videoFound != null) {
    console.log('up:', votedUp, votedDown);
    // if user has voted
    const userVote = await prisma.videoStatus.findFirst({
      where: {
        videoID: id,
        userID: user.id,
        vote: { in: [VoteKind.UP, VoteKind.DOWN] }
      }
    })

    if (!userVote) {
      if (vote == VoteKind.UP) {
        votedUp++
        console.log('user not vote:', votedUp);
      } else { //down
        votedDown++
      }
    } else {
      if (userVote.vote == VoteKind.UP && vote == VoteKind.UP) {
        //nothing change
      } if (userVote.vote == VoteKind.DOWN && vote == VoteKind.DOWN) {
        //nothing change
      } else if (userVote.vote == VoteKind.UP && vote == VoteKind.DOWN) {
        votedUp--
        votedDown++
      } else if (userVote.vote == VoteKind.DOWN && vote == VoteKind.UP) {
        votedUp++
        votedDown--
      }
    }

    // TODO: Improvement: If voteUp or VoteDown does not change, we don not need to update to db
    const videoUpdated = await prisma.video.update({
      where: {
        id: videoFound?.id,
      },
      data: {
        votedUp: votedUp,
        votedDown: votedDown,
        updatedAt: dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
      }
    })

    console.log('update video:', videoUpdated)
    const voteUpsert = {
      videoID: videoFound.id,
      userID: user.id,
      vote: vote,
      email: user.email,
    }
    const videoStatusCreated = await prisma.videoStatus.upsert({
      create: voteUpsert,
      update: voteUpsert,
      where: {
        videoID_userID: {
          videoID: id,
          userID: user.id
        }
      }
    })

    res.json(videoUpdated)
  }
})

const server = app.listen(9800, () =>
  console.log(`
🚀 Server ready at: http://192.168.0.10:9800`),
)
