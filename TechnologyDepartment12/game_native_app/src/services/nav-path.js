let path = '/';

export const setNavPath = (next) => {
  path = next || '/';
};

export const getNavPath = () => path;
