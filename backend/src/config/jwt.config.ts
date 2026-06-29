export const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: 3600, //1 giờ
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: 604800, //`7 ngày
  },
};
