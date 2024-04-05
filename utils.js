export function getNewChallenge() {
   return Math.random().toString(36).substring(2);
}

export function getAuthNUsers() {
   const users = localStorage.getItem("authnUsers")? JSON.parse(localStorage.getItem("authnUsers")): [];
   return users;
}