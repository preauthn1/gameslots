import Request from "@/utils/Request";
const request: Request = new Request();

export const InviteRebate = (data: { id: string | number }) => {
    return request.send({
        url: "team/receiveInviteRebate",
        method: "post",
        body: data,
    })
}

export const popularize = () => {
    return request.send({
        url: "team/popularize",
        method: "post"
    })
}