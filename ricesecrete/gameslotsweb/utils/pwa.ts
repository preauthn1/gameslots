interface Window {
  pwa:undefined | {
    prompt:()=>void
  };
}
export const pwa:Ref<Window["pwa"] | null> = ref(null);

if(process.client){
  pwa.value = (window as unknown as Window).pwa
  setInterval(()=>{
    pwa.value = (window as unknown as Window).pwa
  },1000)
}

