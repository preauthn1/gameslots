import Request from "@/utils/Request";
const request: Request = new Request();

export const singinData = () => {
    return request.send({
        url: "/sign/getSign",
        method: "get"
    })
}
export const singin = (data: { sign_id: number | string, day: number | string }) => {
    return request.send({
        url: "sign/userSign",
        method: "get",
        query: data,
    })
}