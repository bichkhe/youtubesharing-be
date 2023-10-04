import { Video, VoteKind } from "@prisma/client";

export interface IVideo extends Video {
    // user Reqques
    voted?: VoteKind
}
export interface VideoResponse {
    videos: IVideo[];
}