// small helper to persist data in localStorage
export const get = (k) => JSON.parse(localStorage.getItem(k));
export const set = (k,v) => localStorage.setItem(k, JSON.stringify(v));

export function saveUser(user){
  set('two_user_'+user.id, user);
  set('two_current', user.id);
}

export function loadCurrentUser(){
  const id = localStorage.getItem('two_current');
  if(!id) return null;
  return get('two_user_'+id);
}

export function listProfiles(){
  // return demo profiles if none
  const keys = Object.keys(localStorage).filter(k=>k.startsWith('two_profile_'));
  if(keys.length===0){
    const demos = [
      {id:'p1',name:'Ravi',about:'Loves cricket and chai. Looking for friendship.',interests:['cricket','chai'],age:26,loc:'Pune'},
      {id:'p2',name:'Meera',about:'Enjoys stories and long walks. Open to marriage.',interests:['stories','walking'],age:29,loc:'Mumbai'}
    ];
    demos.forEach(d => set('two_profile_'+d.id, d));
    return demos;
  }
  return keys.map(k=>get(k));
}

export function getProfile(id){ return get('two_profile_'+id); }
