export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidUsername = (name: string) => {
  return name.length >= 5 && name.length <= 20;
};

export const isValidPassword = (password: string) => {
  return password.length >= 8 
};
