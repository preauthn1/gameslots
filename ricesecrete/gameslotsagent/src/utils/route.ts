//设置获取
export const getUid = (route, name) => {
  if (route.query.uid) {
    let uid = route.query.uid + '';
    sessionStorage.setItem(name + 'uid', uid)
    return route.query.uid;
  } else {
    let l_uid = sessionStorage.getItem(name + 'uid');
    if (l_uid) {
      return l_uid;
    } else {
      return '';
    }
  }
}
//删除
export const removeUid = (name) => {
  sessionStorage.removeItem(name + 'uid');
}