import Request from "@/utils/Request";
const request: Request = new Request();
export function game_user_transout_api(tid: number) {
    const data = {
        tid: tid
    }
    return request.send<number>({
        url: '/game/user_transout',
        method: 'post',
        body: data
    })
}