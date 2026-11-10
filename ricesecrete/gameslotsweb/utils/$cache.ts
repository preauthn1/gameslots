import fs from "fs";
import path from "path"
export default {
  setData(data:object,name:string){
    if(process.server){
      try {
        if(!fs.existsSync("./cache")){
          fs.mkdirSync("./cache")
        }
        const filePath:string = path.resolve(`./cache/${name}.json`);
        const contentToWrite:string = JSON.stringify(data);
        fs.writeFileSync(filePath, contentToWrite, "utf8");
      } catch (error) {
        console.log("缓存失败")
      }
    }
  },
  async getData(name:string){
    try {
      return await useAsyncData(name,()=>{
        const filePath:string = path.resolve(`./cache/${name}.json`);
        const data:string = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data)
      })
    } catch (error) {
      return null
    }
  }
}




