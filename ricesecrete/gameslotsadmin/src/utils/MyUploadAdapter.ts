import axios from "axios";
import { baseUrlApi } from "@/utils/http/configUrl";
import { getToken } from "@/utils/auth";

const token2 = getToken();
const token = token2.token;
const token_key = token2.token_key;
/**
 * 自定义上传图片插件
 */
class MyUploadAdapter {
  loader: any;
  constructor(loader) {
    this.loader = loader;
  }

  async upload() {
    const data = new FormData();
    data.append("files[]", await this.loader.file);

    const res = await axios({
      url: baseUrlApi("/upload/upload_img"),
      method: "POST",
      data,
      headers: {
        usertoken: token,
        usertokenkey: token_key
      },
      withCredentials: false // true 为不允许带 token, false 为允许
    });

    // console.log(res.data, res.data.data.file[0]);
    // 方法返回数据格式： {default: "url"}
    const file = res.data.data.file[0] ? res.data.data.file[0] : "";
    return {
      default: file
    };
  }
}

export default MyUploadAdapter;
