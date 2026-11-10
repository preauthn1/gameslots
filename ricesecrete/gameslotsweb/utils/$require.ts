const images:Record<string, {default:string}> = import.meta.glob("@/assets/images/*",{eager:true})
export default (imgPath:string ):string=>{
  return images["/assets/images/"+imgPath].default
};